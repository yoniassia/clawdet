const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 18789;
const TOKEN = process.env.GATEWAY_TOKEN || '';
const WORKSPACE = process.env.WORKSPACE_DIR || '/app/workspace';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const MODEL = process.env.AI_MODEL || "claude-sonnet-4-5";
const AI_MODEL = process.env.AI_MODEL || 'claude-sonnet-4-5';
const BRAVE_API_KEY = 'BSAi3yMbk-vFhm3Ij-SmOiVMGQ8ESVK';

// === WebClaw: Static file serving from /app/workspace/public/ ===
const MIME_TYPES = {
  '.html': 'text/html', '.htm': 'text/html', '.css': 'text/css',
  '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.json': 'application/json', '.txt': 'text/plain', '.md': 'text/markdown',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.avif': 'image/avif',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.xml': 'application/xml', '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json'
};
const BLOCKED_EXTENSIONS = new Set(['.exe','.dll','.so','.dylib','.sh','.bash','.bat','.cmd','.ps1','.py','.rb','.php','.cgi','.pl','.env','.pem','.key','.cert','.p12','.pfx']);
const PUBLIC_DIR = path.join(WORKSPACE, 'public');
const MAX_SITE_SIZE = 50 * 1024 * 1024;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_COUNT = 500;

function serveSiteFile(req, res) {
  const urlPath = req.url.replace(/^\/site\/?/, '/') || '/';
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.posix.normalize(decoded);
  if (normalized.includes('..') || normalized.includes('\0')) { res.writeHead(403); res.end('Forbidden'); return true; }
  const parts = normalized.split('/').filter(Boolean);
  if (parts.some(p => p.startsWith('.'))) { res.writeHead(403); res.end('Forbidden'); return true; }
  const rel = normalized.replace(/^\/+/, '') || 'index.html';
  let filePath = path.resolve(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end('Forbidden'); return true; }
  try {
    const stat = fs.statSync(filePath);
    if (stat.isSymbolicLink()) { res.writeHead(403); res.end('Forbidden'); return true; }
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return true; }
    }
  } catch {
    if (!filePath.endsWith('.html') && fs.existsSync(filePath + '.html')) filePath = filePath + '.html';
    else { res.writeHead(404); res.end('Not found'); return true; }
  }
  const ext = path.extname(filePath).toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) { res.writeHead(403); res.end('Blocked file type'); return true; }
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime + (mime.startsWith('text/') ? '; charset=utf-8' : ''), 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' });
    res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
  return true;
}
function getSiteSize() { try { const o = execSync('du -sb "' + PUBLIC_DIR + '" 2>/dev/null || echo "0"', {encoding:'utf8'}); return parseInt(o.split('\t')[0])||0; } catch { return 0; } }
function getSiteFileCount() { try { const o = execSync('find "' + PUBLIC_DIR + '" -type f 2>/dev/null | wc -l', {encoding:'utf8'}); return parseInt(o.trim())||0; } catch { return 0; } }


// Per-chat conversation history (in memory, last 20 messages)
const chatHistories = new Map();
const MAX_HISTORY = 20;

function getSystemPrompt() {
  try { return fs.readFileSync(WORKSPACE + '/CLAUDE.md', 'utf8'); } 
  catch { return 'You are a helpful AI assistant.'; }
}

// Tools that agents can use
const TOOLS = [
  {
    name: 'bash',
    description: 'Execute a bash command in the agent workspace. Use for: running scripts, installing packages, processing data, web requests with curl, etc.',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The bash command to execute' },
        timeout: { type: 'number', description: 'Timeout in seconds (default 30, max 120)' }
      },
      required: ['command']
    }
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file from the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to workspace' }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file in the workspace. Creates directories as needed.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to workspace' },
        content: { type: 'string', description: 'Content to write' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'list_files',
    description: 'List files and directories in the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path relative to workspace (default: root)' }
      }
    }
  },
  {
    name: 'web_search',
    description: 'Search the web using curl. Returns text content from URLs or search results.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or URL to fetch' }
      },
      required: ['query']
    }
  },
  {
    name: 'web_search_brave',
    description: 'Search the web using Brave Search API. Returns relevant results with titles, URLs, and snippets.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        count: { type: 'number', description: 'Number of results (default 5, max 10)' }
      },
      required: ['query']
    }
  },
  {
    name: 'generate_image',
    description: 'Generate an image from a text description using AI. Returns the image URL.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Description of the image to generate' },
        size: { type: 'string', description: '1024x1024, 1024x1792, or 1792x1024 (default 1024x1024)' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'news_briefing',
    description: 'Get latest news headlines and summaries. Sources: HackerNews, TechCrunch, general news.',
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Topic to search for (optional, default: top stories)' },
        source: { type: 'string', description: 'Source: hackernews, tech, general (default: hackernews)' }
      }
    }
  },
  {
    name: 'memory_save',
    description: 'Save important information to persistent memory. Use for facts, preferences, decisions worth remembering across conversations.',
    input_schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Short label for this memory (e.g., "user_name", "project_goal")' },
        content: { type: 'string', description: 'The information to remember' }
      },
      required: ['key', 'content']
    }
  },
  {
    name: 'memory_recall',
    description: 'Recall saved memories. Search by key or get all memories.',
    input_schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Search for specific key (optional, omit to get all)' }
      }
    }
  },
  {
    name: 'daily_planner',
    description: 'Manage daily tasks and plans. Add tasks, check off completed ones, view today\'s plan.',
    input_schema: {
      type: 'object',
      properties: {
        action: { type: 'string', description: 'add, complete, list, clear' },
        task: { type: 'string', description: 'Task description (for add/complete)' },
        priority: { type: 'string', description: 'high, medium, low (default: medium)' }
      },
      required: ['action']
    }
  },
  {
    name: 'webclaw_deploy',
    description: 'Write a file to your public website at /site/. Files are instantly live at https://YOUR-SUBDOMAIN.clawdet.com/site/PATH. Supports HTML, CSS, JS, images, JSON. Max 50MB total, 5MB per file, 500 files.',
    input_schema: { type: 'object', properties: { path: { type: 'string', description: 'File path (e.g. "index.html", "css/style.css")' }, content: { type: 'string', description: 'File content' }, encoding: { type: 'string', description: '"utf8" (default) or "base64"' } }, required: ['path', 'content'] }
  },
  {
    name: 'webclaw_status',
    description: 'Check published website status: files, sizes, quota, live URL.',
    input_schema: { type: 'object', properties: { path: { type: 'string', description: 'Subdirectory to list (default: root)' } } }
  },
  {
    name: 'webclaw_delete',
    description: 'Delete a file or "all" files from your published website.',
    input_schema: { type: 'object', properties: { path: { type: 'string', description: 'File to delete, or "all"' } }, required: ['path'] }
  },
];

// Execute a tool call
function executeTool(name, input) {
  try {
    switch (name) {
      case 'bash': {
        const timeout = Math.min(input.timeout || 30, 120) * 1000;
        const result = execSync(input.command, {
          cwd: WORKSPACE,
          timeout,
          encoding: 'utf8',
          maxBuffer: 1024 * 1024,
          env: { ...process.env, HOME: WORKSPACE, PATH: process.env.PATH }
        });
        return result.substring(0, 10000);
      }
      case 'read_file': {
        const filePath = path.resolve(WORKSPACE, input.path);
        if (!filePath.startsWith(WORKSPACE)) return 'Error: path outside workspace';
        return fs.readFileSync(filePath, 'utf8').substring(0, 50000);
      }
      case 'write_file': {
        const filePath = path.resolve(WORKSPACE, input.path);
        if (!filePath.startsWith(WORKSPACE)) return 'Error: path outside workspace';
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, input.content);
        return `Written ${input.content.length} bytes to ${input.path}`;
      }
      case 'list_files': {
        const dirPath = path.resolve(WORKSPACE, input.path || '.');
        if (!dirPath.startsWith(WORKSPACE)) return 'Error: path outside workspace';
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        return entries.map(e => `${e.isDirectory() ? '📁' : '📄'} ${e.name}`).join('\n');
      }
      case 'web_search': {
        const q = input.query;
        if (q.startsWith('http://') || q.startsWith('https://')) {
          return execSync(`curl -sL --max-time 10 "${q}" | head -c 20000`, {
            encoding: 'utf8', timeout: 15000, cwd: WORKSPACE
          });
        }
        const encoded = encodeURIComponent(q);
        return execSync(`curl -sL "https://lite.duckduckgo.com/lite/?q=${encoded}" | sed 's/<[^>]*>//g' | head -c 10000`, {
          encoding: 'utf8', timeout: 15000, cwd: WORKSPACE
        });
      }
      case 'web_search_brave': {
        const count = Math.min(input.count || 5, 10);
        const encoded = encodeURIComponent(input.query);
        const raw = execSync(`curl -s "https://api.search.brave.com/res/v1/web/search?q=${encoded}&count=${count}" -H "Accept: application/json" -H "X-Subscription-Token: ${BRAVE_API_KEY}"`, {
          encoding: 'utf8', timeout: 15000, cwd: WORKSPACE
        });
        try {
          const data = JSON.parse(raw);
          if (data.web && data.web.results) {
            return data.web.results.map((r, i) => `${i+1}. ${r.title}\n   ${r.url}\n   ${r.description || ''}`).join('\n\n');
          }
          return 'No results found.';
        } catch(e) {
          return `Search error: ${raw.substring(0, 500)}`;
        }
      }
      case 'generate_image': {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return 'Image generation requires an OPENAI_API_KEY environment variable. Please set it in your agent configuration.';
        const size = input.size || '1024x1024';
        const promptEscaped = JSON.stringify({ model: 'dall-e-3', prompt: input.prompt, n: 1, size: size });
        const raw = execSync(`curl -s https://api.openai.com/v1/images/generations -H "Content-Type: application/json" -H "Authorization: Bearer ${apiKey}" -d '${promptEscaped.replace(/'/g, "'\\''")}'`, {
          encoding: 'utf8', timeout: 60000, cwd: WORKSPACE
        });
        try {
          const data = JSON.parse(raw);
          if (data.data && data.data[0]) {
            const url = data.data[0].url;
            const revised = data.data[0].revised_prompt || '';
            return `Image generated!\nURL: ${url}${revised ? '\nRevised prompt: ' + revised : ''}`;
          }
          return `Image generation failed: ${raw.substring(0, 500)}`;
        } catch(e) {
          return `Image generation error: ${raw.substring(0, 500)}`;
        }
      }
      case 'news_briefing': {
        const source = input.source || 'hackernews';
        const topic = input.topic || '';
        if (source === 'hackernews') {
          const idsRaw = execSync('curl -s "https://hacker-news.firebaseio.com/v0/topstories.json"', {
            encoding: 'utf8', timeout: 10000, cwd: WORKSPACE
          });
          const ids = JSON.parse(idsRaw).slice(0, 10);
          const stories = ids.map(id => {
            try {
              const item = JSON.parse(execSync(`curl -s "https://hacker-news.firebaseio.com/v0/item/${id}.json"`, {
                encoding: 'utf8', timeout: 5000, cwd: WORKSPACE
              }));
              return `• ${item.title}${item.url ? '\n  ' + item.url : ''} (${item.score} pts)`;
            } catch(e) { return null; }
          }).filter(Boolean);
          return `📰 HackerNews Top Stories:\n\n${stories.join('\n\n')}`;
        } else {
          const q = encodeURIComponent(topic ? topic + ' news' : 'top news today');
          const raw = execSync(`curl -sL "https://lite.duckduckgo.com/lite/?q=${q}&kl=us-en" | sed 's/<[^>]*>//g' | head -c 8000`, {
            encoding: 'utf8', timeout: 15000, cwd: WORKSPACE
          });
          return `📰 News results for "${topic || 'top stories'}":\n\n${raw}`;
        }
      }
      case 'memory_save': {
        const memFile = path.join(WORKSPACE, 'memory.json');
        let mem = { memories: {} };
        try { mem = JSON.parse(fs.readFileSync(memFile, 'utf8')); } catch(e) {}
        mem.memories[input.key] = { content: input.content, saved_at: new Date().toISOString() };
        fs.writeFileSync(memFile, JSON.stringify(mem, null, 2));
        return `Saved memory: "${input.key}"`;
      }
      case 'memory_recall': {
        const memFile = path.join(WORKSPACE, 'memory.json');
        let mem = { memories: {} };
        try { mem = JSON.parse(fs.readFileSync(memFile, 'utf8')); } catch(e) {
          return 'No memories saved yet.';
        }
        if (input.key) {
          const found = mem.memories[input.key];
          if (found) return `🧠 ${input.key}: ${found.content} (saved: ${found.saved_at})`;
          const matches = Object.entries(mem.memories).filter(([k]) => k.toLowerCase().includes(input.key.toLowerCase()));
          if (matches.length) return matches.map(([k, v]) => `🧠 ${k}: ${v.content} (saved: ${v.saved_at})`).join('\n');
          return `No memory found for key: "${input.key}"`;
        }
        const all = Object.entries(mem.memories);
        if (!all.length) return 'No memories saved yet.';
        return `🧠 All memories (${all.length}):\n\n` + all.map(([k, v]) => `• ${k}: ${v.content} (${v.saved_at})`).join('\n');
      }
      case 'daily_planner': {
        const planFile = path.join(WORKSPACE, 'planner.json');
        const today = new Date().toISOString().split('T')[0];
        let plan = { date: today, tasks: [] };
        try {
          plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
          if (plan.date !== today) { plan = { date: today, tasks: [] }; }
        } catch(e) {}

        switch(input.action) {
          case 'add': {
            if (!input.task) return 'Error: task description required';
            plan.tasks.push({ task: input.task, priority: input.priority || 'medium', done: false, added_at: new Date().toISOString() });
            fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
            return `✅ Added task: "${input.task}" (${input.priority || 'medium'} priority)\nTotal tasks today: ${plan.tasks.length}`;
          }
          case 'complete': {
            if (!input.task) return 'Error: task description required';
            const task = plan.tasks.find(t => t.task.toLowerCase().includes(input.task.toLowerCase()) && !t.done);
            if (task) {
              task.done = true;
              fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
              return `✅ Completed: "${task.task}"`;
            }
            return `Task not found: "${input.task}"`;
          }
          case 'list': {
            if (!plan.tasks.length) return `📋 No tasks for today (${today}). Add some with daily_planner!`;
            const tasks = plan.tasks.map((t, i) => `${t.done ? '✅' : '⬜'} ${i+1}. [${t.priority}] ${t.task}`).join('\n');
            const done = plan.tasks.filter(t => t.done).length;
            return `📋 Today's Plan (${today}):\n${tasks}\n\nProgress: ${done}/${plan.tasks.length} complete`;
          }
          case 'clear': {
            plan.tasks = [];
            fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
            return `🗑️ Cleared all tasks for today.`;
          }
          default:
            return `Unknown action: ${input.action}. Use: add, complete, list, clear`;
        }
      }
      case 'webclaw_deploy': {
        const ext = path.extname(input.path).toLowerCase();
        if (BLOCKED_EXTENSIONS.has(ext)) return 'Error: blocked file type: ' + ext;
        if (input.path.includes('..') || input.path.startsWith('/')) return 'Error: invalid path';
        const fparts = input.path.split('/').filter(Boolean);
        if (fparts.some(p => p.startsWith('.'))) return 'Error: dotfiles not allowed';
        if (fparts.length > 10) return 'Error: path too deep (max 10 levels)';
        const fcontent = input.encoding === 'base64' ? Buffer.from(input.content, 'base64') : input.content;
        if (fcontent.length > MAX_FILE_SIZE) return 'Error: file too large (' + (fcontent.length/1024/1024).toFixed(1) + 'MB, max 5MB)';
        const cs = getSiteSize();
        if (cs + fcontent.length > MAX_SITE_SIZE) return 'Error: site quota exceeded (' + (cs/1024/1024).toFixed(1) + 'MB used, max 50MB)';
        if (getSiteFileCount() >= MAX_FILE_COUNT) return 'Error: too many files (max ' + MAX_FILE_COUNT + ')';
        const fp2 = path.resolve(PUBLIC_DIR, input.path);
        if (!fp2.startsWith(PUBLIC_DIR)) return 'Error: path outside public directory';
        fs.mkdirSync(path.dirname(fp2), { recursive: true });
        fs.writeFileSync(fp2, fcontent);
        const hn = process.env.AGENT_SUBDOMAIN || 'your-agent';
        return '✅ Published: ' + input.path + ' (' + fcontent.length + ' bytes)\n🌐 Live at: https://' + hn + '.clawdet.com/site/' + input.path;
      }
      case 'webclaw_status': {
        const sd = path.resolve(PUBLIC_DIR, input.path || '.');
        if (!sd.startsWith(PUBLIC_DIR)) return 'Error: path outside public directory';
        if (!fs.existsSync(PUBLIC_DIR)) return '📁 No website published yet. Use webclaw_deploy to create one!';
        const ts = getSiteSize(); const fc = getSiteFileCount();
        const hn2 = process.env.AGENT_SUBDOMAIN || 'your-agent';
        let listing = '';
        try { const ents = fs.readdirSync(sd, {withFileTypes:true}); listing = ents.map(e => { if(e.isDirectory()) return '📁 '+e.name+'/'; try{const s=fs.statSync(path.join(sd,e.name));return '📄 '+e.name+' ('+(s.size/1024).toFixed(1)+'KB)';}catch{return '📄 '+e.name;} }).join('\n'); } catch { listing = '(empty)'; }
        return '🌐 Website: https://'+hn2+'.clawdet.com/site/\n📊 Size: '+(ts/1024/1024).toFixed(2)+'MB / 50MB\n📁 Files: '+fc+' / '+MAX_FILE_COUNT+'\n\n'+listing;
      }
      case 'webclaw_delete': {
        if (input.path === 'all') { execSync('rm -rf "'+PUBLIC_DIR+'"/*', {cwd:WORKSPACE}); return '🗑️ All site files deleted.'; }
        const dp = path.resolve(PUBLIC_DIR, input.path);
        if (!dp.startsWith(PUBLIC_DIR)) return 'Error: path outside public directory';
        try { const st=fs.statSync(dp); if(st.isDirectory()) execSync('rm -rf "'+dp+'"'); else fs.unlinkSync(dp); return '🗑️ Deleted: '+input.path; } catch { return 'Error: file not found: '+input.path; }
      }
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err) {
    return `Error: ${err.message?.substring(0, 2000) || err}`;
  }
}

// Chat with tool use loop
async function chatWithTools(messages, model) {
  let systemPrompt = 'You are a helpful AI assistant with access to tools.';
  try { systemPrompt = fs.readFileSync(WORKSPACE + '/CLAUDE.md', 'utf8'); } catch(e) {}
  
  systemPrompt += '\n\nYou have access to tools: bash (run commands), read_file, write_file, list_files, web_search (DuckDuckGo), web_search_brave (better search with Brave API), generate_image (DALL-E 3), news_briefing (HackerNews/tech news), memory_save/memory_recall (persistent memory across conversations), daily_planner (task management). Use them proactively to help users.';

  const apiMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role, content: m.content
  }));

  let finalText = '';
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const body = {
      model: model || MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: apiMessages,
      tools: TOOLS
    };

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Anthropic ${resp.status}: ${err.substring(0, 500)}`);
    }

    const data = await resp.json();
    
    let textParts = [];
    let toolUses = [];
    
    for (const block of data.content) {
      if (block.type === 'text') textParts.push(block.text);
      if (block.type === 'tool_use') toolUses.push(block);
    }

    if (textParts.length) finalText += textParts.join('\n');

    if (data.stop_reason !== 'tool_use' || toolUses.length === 0) break;

    apiMessages.push({ role: 'assistant', content: data.content });

    const toolResults = toolUses.map(tu => {
      console.log(`[TOOL] ${tu.name}: ${JSON.stringify(tu.input).substring(0, 200)}`);
      const result = executeTool(tu.name, tu.input);
      console.log(`[TOOL] Result: ${result.substring(0, 200)}`);
      return {
        type: 'tool_result',
        tool_use_id: tu.id,
        content: result
      };
    });

    apiMessages.push({ role: 'user', content: toolResults });
  }

  return finalText || 'Done (tool execution completed)';
}

async function chat(messages) {
  return chatWithTools(messages.map(m => ({role: m.role, content: m.content})));
}

// === HTTP Gateway ===
const CHAT_HTML = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NanoClaw Agent</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0a;color:#e7e9ea;font-family:-apple-system,system-ui,sans-serif;height:100vh;display:flex;flex-direction:column}
.header{padding:12px 16px;border-bottom:1px solid #2f3336;display:flex;align-items:center;gap:8px}
.header h1{font-size:16px;font-weight:700}
.dot{width:8px;height:8px;border-radius:50%}
.green{background:#2EE68A}.red{background:#ff6b6b}
.messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.msg{max-width:85%;padding:10px 14px;border-radius:16px;line-height:1.5;font-size:15px;word-wrap:break-word;white-space:pre-wrap}
.msg.user{background:#1d9bf0;align-self:flex-end;border-bottom-right-radius:4px}
.msg.assistant{background:#2f3336;align-self:flex-start;border-bottom-left-radius:4px}
.msg.system{background:transparent;align-self:center;color:#666;font-size:13px;text-align:center}
.input-bar{padding:12px;border-top:1px solid #2f3336;display:flex;gap:8px;background:#0a0a0a}
input{flex:1;padding:12px 16px;background:#16181c;border:1px solid #2f3336;border-radius:24px;color:#e7e9ea;font-size:16px;outline:none;-webkit-appearance:none}
input:focus{border-color:#2EE68A}
button{width:44px;height:44px;background:#2EE68A;color:#0a0a0a;border:none;border-radius:50%;font-size:18px;font-weight:700;cursor:pointer}
button:disabled{opacity:.4}
.login-prompt{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:16px;padding:20px}
.login-prompt p{color:#8899a6;font-size:15px;text-align:center}
.login-btn{padding:12px 28px;background:#2EE68A;color:#0a0a0a;border:none;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none}
</style></head><body>
<nav style="padding:8px 16px;border-bottom:1px solid #2f3336;display:flex;align-items:center;justify-content:space-between;background:#0a0a0a"><div style="display:flex;align-items:center;gap:8px"><a href="https://clawdet.com" style="color:#e7e9ea;text-decoration:none;font-weight:700;font-size:15px">🐾 Clawdet</a></div><div style="display:flex;gap:16px;align-items:center"><a href="https://clawdet.com/dashboard" style="color:#8899a6;text-decoration:none;font-size:13px">Dashboard</a><a href="https://clawdet.com/nanofleets" style="color:#8899a6;text-decoration:none;font-size:13px">NanoFleets</a><a href="https://clawdet.com/profile" style="color:#8899a6;text-decoration:none;font-size:13px">Profile</a></div></nav>
<div class="header"><span class="dot" id="dot"></span><h1>🐾 NanoClaw Agent</h1></div>
<div id="auth-gate"><div class="login-prompt"><p>🔒 Connecting...</p></div></div>
<div id="chat-ui" style="display:none;flex:1;flex-direction:column">
<div class="messages" id="msgs"></div>
<div class="input-bar">
<input id="inp" placeholder="Message..." autocomplete="off">
<button id="btn" onclick="send()">→</button>
</div></div>
<script>
let token=null,history=[];
const dot=document.getElementById('dot'),gate=document.getElementById('auth-gate'),ui=document.getElementById('chat-ui');
const msgs=document.getElementById('msgs'),inp=document.getElementById('inp'),btn=document.getElementById('btn');
const sub=location.hostname.split('.')[0];
fetch('https://clawdet.com/api/agents/token?subdomain='+sub,{credentials:'include'})
.then(r=>r.json()).then(d=>{
  if(d.token){token=d.token;dot.className='dot green';gate.style.display='none';ui.style.display='flex';inp.focus();
    var w=document.createElement('div');w.className='msg system';
    w.innerHTML='<strong>NanoClaw Agent 🐾</strong><br>I can run commands, search the web, read/write files, and execute code.<br><br>Want Telegram too? Set it up at <a href="https://clawdet.com/dashboard" style="color:#2EE68A">clawdet.com/dashboard</a>';
    msgs.appendChild(w);
  } else if(d.error==='not_authenticated'){dot.className='dot red';gate.innerHTML='<div class="login-prompt"><p>🔒 Log in to access this agent</p><a class="login-btn" href="https://clawdet.com/login">Log In</a></div>';}
  else if(d.error==='not_owner'){dot.className='dot red';gate.innerHTML='<div class="login-prompt"><p>🚫 This agent belongs to another user</p></div>';}
  else{dot.className='dot red';gate.innerHTML='<div class="login-prompt"><p>❌ '+(d.error||'Error')+'</p></div>';}
}).catch(()=>{dot.className='dot red';gate.innerHTML='<div class="login-prompt"><p>⚠️ Could not reach auth server</p><a class="login-btn" href="https://clawdet.com/login">Log In</a></div>';});
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
function addMsg(role,text){var d=document.createElement('div');d.className='msg '+role;d.textContent=text;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d;}
async function send(){if(!token)return;var text=inp.value.trim();if(!text)return;inp.value='';btn.disabled=true;
addMsg('user',text);history.push({role:'user',content:text});
var typing=addMsg('assistant','');typing.style.color='#666';typing.textContent='Working...';
try{var r=await fetch('/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({messages:history})});
var d=await r.json();var reply=d.choices?.[0]?.message?.content||d.error||'No response';
typing.style.color='';typing.textContent=reply;history.push({role:'assistant',content:reply});
}catch(e){typing.textContent='Error: '+e.message;typing.style.color='#ff6b6b';}btn.disabled=false;inp.focus();}
</script></body></html>`;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if ((req.url === '/' || req.url === '/chat') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(CHAT_HTML);
    return;
  }

  if (req.url === '/health' || req.url === '/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', engine: 'nanoclaw', telegram: !!TG_TOKEN, uptime: process.uptime() }));
    return;
  }

  // WebClaw: serve static files from /site/
  if (req.url.startsWith('/site') && req.method === 'GET') {
    if (fs.existsSync(PUBLIC_DIR)) { serveSiteFile(req, res); return; }
    else { res.writeHead(404, {'Content-Type':'text/html'}); res.end('<h1>No site published yet</h1><p>Ask your agent to create one!</p>'); return; }
  }

  const auth = req.headers.authorization;
  if (TOKEN && (!auth || auth !== `Bearer ${TOKEN}`)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  if (req.url === '/v1/chat/completions' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages, model } = JSON.parse(body);
        const reply = await chat(messages);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: 'chatcmpl-' + crypto.randomUUID(),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model || AI_MODEL,
          choices: [{ index: 0, message: { role: 'assistant', content: reply }, finish_reason: 'stop' }]
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`NanoClaw gateway on port ${PORT}`);
  console.log(`Tools: bash, read_file, write_file, list_files, web_search, web_search_brave, generate_image, news_briefing, memory_save, memory_recall, daily_planner`);
});

// === Telegram Bot (long polling) ===
if (TG_TOKEN) {
  const TG_API = `https://api.telegram.org/bot${TG_TOKEN}`;
  let offset = 0;

  async function tgApi(method, body) {
    const resp = await fetch(`${TG_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return resp.json();
  }

  async function sendTyping(chatId) {
    await tgApi('sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => {});
  }

  async function sendMessage(chatId, text, replyTo) {
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
      chunks.push(remaining.substring(0, 4000));
      remaining = remaining.substring(4000);
    }
    for (const chunk of chunks) {
      await tgApi('sendMessage', {
        chat_id: chatId,
        text: chunk,
        reply_to_message_id: replyTo,
        parse_mode: 'Markdown'
      }).catch(async () => {
        await tgApi('sendMessage', { chat_id: chatId, text: chunk, reply_to_message_id: replyTo });
      });
    }
  }

  async function handleUpdate(update) {
    const msg = update.message;
    if (!msg || !msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text;
    const userName = msg.from?.first_name || 'User';

    if (text === '/start') {
      await sendMessage(chatId, `Hey ${userName}! 👋 I'm your NanoClaw AI assistant. Ask me anything!`);
      return;
    }

    if (!chatHistories.has(chatId)) chatHistories.set(chatId, []);
    const history = chatHistories.get(chatId);
    history.push({ role: 'user', content: text });
    
    while (history.length > MAX_HISTORY) history.shift();

    try {
      await sendTyping(chatId);
      const reply = await chat([...history]);
      history.push({ role: 'assistant', content: reply });
      while (history.length > MAX_HISTORY) history.shift();
      await sendMessage(chatId, reply, msg.message_id);
    } catch (err) {
      console.error('Chat error:', err.message);
      await sendMessage(chatId, `⚠️ Error: ${err.message.substring(0, 200)}`);
    }
  }

  async function poll() {
    try {
      const resp = await fetch(`${TG_API}/getUpdates?offset=${offset}&timeout=30&allowed_updates=["message"]`, {
        signal: AbortSignal.timeout(35000)
      });
      const data = await resp.json();
      if (data.ok && data.result?.length) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          handleUpdate(update).catch(e => console.error('Update error:', e));
        }
      }
    } catch (err) {
      if (err.name !== 'TimeoutError') console.error('Poll error:', err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
    poll();
  }

  tgApi('getMe', {}).then(r => {
    if (r.ok) {
      console.log(`Telegram bot: @${r.result.username} (${r.result.first_name})`);
      poll();
    } else {
      console.error('Telegram bot auth failed:', r);
    }
  });
}

# Test-Fresh Web Chat Setup

## Quick Setup (5 minutes)

SSH into test-fresh and run these commands:

```bash
# 1. Create the web chat HTML
cat > /var/www/html/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clawdet Test Chat - Grok 4.2</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 800px;
            height: 600px;
            display: flex;
            flex-direction: column;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 20px 20px 0 0;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }
        .message {
            margin: 10px 0;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 80%;
        }
        .user { background: #667eea; color: white; margin-left: auto; }
        .assistant { background: #f3f4f6; color: #1f2937; }
        .input-area {
            padding: 20px;
            background: #f9fafb;
            border-radius: 0 0 20px 20px;
        }
        .input-form { display: flex; gap: 10px; }
        .input-field {
            flex: 1;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 16px;
        }
        .send-btn {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
        }
        .send-btn:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 Clawdet Test Chat</h1>
            <p>Powered by Grok 4.2 Reasoning</p>
        </div>
        <div class="messages" id="messages">
            <div class="message assistant">
                Welcome! This is a test instance running Grok 4.2 with extended reasoning.
                Ask me anything!
            </div>
        </div>
        <div class="input-area">
            <form class="input-form" id="form">
                <input type="text" class="input-field" id="input" placeholder="Ask anything..." autocomplete="off">
                <button type="submit" class="send-btn">Send</button>
            </form>
        </div>
    </div>
    <script>
        const form = document.getElementById('form');
        const input = document.getElementById('input');
        const messages = document.getElementById('messages');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.textContent = text;
            messages.appendChild(userMsg);
            input.value = '';
            
            // Show typing
            const typing = document.createElement('div');
            typing.className = 'message assistant';
            typing.textContent = 'Thinking...';
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;
            
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                const data = await res.json();
                typing.textContent = data.response || data.error || 'No response';
            } catch (error) {
                typing.textContent = 'Error: ' + error.message;
            }
            
            messages.scrollTop = messages.scrollHeight;
        });
    </script>
</body>
</html>
HTMLEOF

# 2. Create simple chat API
cat > /root/chat-api.js << 'JSEOF'
const http = require('http');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          response: `Echo: ${message}\n\nThis is a demo. To connect to real Grok 4.2, configure OpenClaw gateway integration.`
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(3003, () => console.log('Chat API on :3003'));
JSEOF

# 3. Start the API
pm2 start /root/chat-api.js --name chat-api
pm2 save

# 4. Update Caddy to proxy /api/* to chat API
cat >> /etc/caddy/Caddyfile << 'CADDYEOF'

reverse_proxy /api/* localhost:3003
CADDYEOF

# 5. Reload Caddy
caddy reload --config /etc/caddy/Caddyfile

# 6. Test
curl https://test-fresh.clawdet.com/

echo "✅ Done! Visit https://test-fresh.clawdet.com/"
```

## What This Does

1. **Web Chat UI** - Beautiful responsive chat interface
2. **Chat API** - Simple Node.js API at `/api/chat`
3. **Caddy Proxy** - Routes `/api/*` to the chat API
4. **PM2** - Keeps the chat API running

## Test It

```bash
# Test the API
curl -X POST https://test-fresh.clawdet.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'

# Should return:
# {"response":"Echo: hello..."}
```

## Access

**URL:** https://test-fresh.clawdet.com

You'll see:
- Clean chat interface
- Type messages and get responses
- Currently demo mode (echoes back)

## Next: Connect to Real Grok 4.2

To connect to actual OpenClaw/Grok:

1. Find the OpenClaw gateway WebSocket endpoint
2. Update `chat-api.js` to proxy to gateway
3. Add authentication if needed

Or use Telegram (easier):
- Set up bot with @BotFather
- Configure OpenClaw to use it
- Full Grok 4.2 access via Telegram

---

**Current Status:**
- ✅ Web chat UI ready
- ✅ API endpoint ready
- ⏳ Needs connection to OpenClaw gateway

**ETA:** 5 minutes to set up

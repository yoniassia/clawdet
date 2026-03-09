# WebClaw Research Report — Web Publishing for NanoClaw Agents

**Date:** 2026-03-09  
**Status:** Complete  
**Researcher:** Cladwet (subagent)

---

## Executive Summary

OpenClaw already has a **Canvas Host** system built into its gateway that serves static files from a configurable directory. This is the foundation WebClaw should build on — no need to write a custom static file server. The ecosystem also has 938+ Web & Frontend skills on ClawHub, several of which are directly relevant. The recommended approach: leverage the existing Canvas Host, add a thin `webclaw` skill with guardrails, and ship starter templates.

---

## 1. Skills Found

### Directly Relevant (Deploy/Publish Patterns)

| Skill | Description | Relevance | URL |
|-------|-------------|-----------|-----|
| **agentscale** | Deploy web apps to public URL via `npx agentscale deploy` | High — shows the "one command deploy" UX pattern | `openclaw/skills/jpbonch/agentscale` |
| **appdeploy** | Deploy web apps with backend, DB, auth via HTTP API + curl | High — full deploy lifecycle with status checking | `openclaw/skills/avimak/appdeploy` |
| **anima-design-agent** | Turns ideas into live full-stack apps (prompt→code, URL→clone, Figma→code) | High — shows "idea to live URL" pattern with parallel variants | `openclaw/skills/dannyshmueli/anima-design-agent` |
| **app-builder** | Build + deploy Instant-backed apps using GitHub + Vercel | Medium — external service dependency pattern | `openclaw/skills/stopachka/app-builder` |
| **approvals-ui** | Web dashboard served from workspace via Flask | Medium — shows the "serve from workspace" pattern we want | `openclaw/skills/fizzy2390/approvals-ui` |

### Design & Quality Skills

| Skill | Description | Relevance |
|-------|-------------|-----------|
| **awwwards-design** | Award-winning website patterns (GSAP, ScrollTrigger, animations) | Template quality reference |
| **anti-slop-design** | Prevents generic AI aesthetics (no purple gradients, Inter font) | Should be baked into our templates |
| **ai-labs-builder** | Unified project builder (portfolio, SaaS, blog, dashboard) with style options | Architecture reference for template system |
| **artifacts-builder** | Creates self-contained HTML artifacts with React+Tailwind+shadcn bundled into single files | Single-file pattern ideal for simple sites |
| **agent-analytics** | Web analytics platform agents can query via CLI | Complementary — analytics for published sites |

### Ecosystem Observations

- **938 skills** in Web & Frontend Development category
- **408 skills** in DevOps & Cloud category  
- Most deploy skills rely on **external services** (Vercel, Netlify, Cloudflare, AgentScale)
- **No existing skill** does what we want: "write files to a local directory and serve them from the same container"
- The `approvals-ui` skill is the closest pattern — it runs a Flask server from workspace files
- **Anti-slop-design** is a Korean skill that's actually brilliant — prevents the "AI made this" look

---

## 2. Key Discovery: OpenClaw Canvas Host System

**This is the critical finding.** OpenClaw's gateway already has a built-in static file server called **Canvas Host**. From the source code analysis:

### How Canvas Host Works

```
Path: /__openclaw__/canvas/  (configurable via basePath)
Root: ~/.openclaw/canvas/     (configurable via gateway.canvas.root)
```

**Features already built:**
- Serves static files from a root directory
- `index.html` auto-generation if missing
- Directory index resolution (`/` → `/index.html`)
- Path traversal protection (rejects `..`, validates symlinks)
- MIME type detection (HTML, CSS, JS, images, WebP, etc.)
- **Live reload via WebSocket** — file changes auto-refresh the browser
- Debounced file watching (75ms stability threshold)
- Proper security: `resolveFileWithinRoot()` validates all paths, rejects symlinks outside root

### Also Found: Control UI System

The gateway serves its own React-based Control UI at a configurable base path. This proves the gateway can serve arbitrary static sites alongside its API endpoints.

### Architecture Insight

The gateway uses a routing priority system:
1. Gateway probe paths (health checks, etc.)
2. `/plugins/` routes
3. `/api/` routes  
4. Control UI routes (if enabled)
5. Canvas Host routes

**WebClaw should add a 6th layer** or reconfigure the Canvas Host to serve user content.

---

## 3. Recommended Architecture

### Option A: Use Canvas Host Directly (Fastest)

Configure the existing Canvas Host to point at `/app/workspace/public/`:

```json
{
  "gateway": {
    "canvas": {
      "root": "/app/workspace/public",
      "basePath": "/"
    }
  }
}
```

**Pros:** Zero code changes to gateway. Live reload built-in. Security already handled.  
**Cons:** Conflicts with chat UI at `/`. Need to move chat UI to `/chat` or `/ai`.

### Option B: Add Dedicated Static Route (Recommended)

Add a new route layer in the gateway for `/site/*` or `/app/*` that serves from `/app/workspace/public/`:

```
username.clawdet.com/          → Chat UI (existing)
username.clawdet.com/site/     → User's published website
username.clawdet.com/site/blog → /app/workspace/public/blog/index.html
username.clawdet.com/v1/       → API (existing)
```

**Implementation:** ~30 lines in the gateway's HTTP request handler:
```javascript
// In the HTTP request handler, before Control UI routing:
if (pathname.startsWith('/site/') || pathname === '/site') {
  const publicRoot = path.join(workspaceDir, 'public');
  const result = await resolveFileWithinRoot(publicRoot, pathname.replace(/^\/site/, ''));
  if (result) {
    // Serve with appropriate MIME type, cache headers
    // Reuse existing resolveFileWithinRoot + detectMime
  }
}
```

### Option C: Separate Caddy Route (Simplest, No Gateway Changes)

Configure Caddy to serve `/site/*` directly from the filesystem:

```caddy
@site path /site/*
handle @site {
    root * /app/workspace/public
    uri strip_prefix /site
    file_server {
        index index.html
    }
}
```

**Pros:** Zero gateway code changes. Caddy handles caching, compression, security headers.  
**Cons:** Requires per-container Caddy config. Less dynamic.

### **Recommendation: Option B with Caddy enhancement (Option C) for production**

Use Option B for the MVP (gateway-level routing), then add Caddy-level serving for performance. The gateway's existing `resolveFileWithinRoot()` function provides the security foundation.

---

## 4. Guardrails Spec

### File System Limits

| Guardrail | Limit | Implementation |
|-----------|-------|----------------|
| Max total size | 50 MB per user | Check with `du -sb /app/workspace/public/` before writes |
| Max single file | 5 MB | Validate in skill before writing |
| Max file count | 500 files | `find /app/workspace/public -type f \| wc -l` |
| Max path depth | 10 levels | Reject paths with >10 `/` segments |
| Max filename length | 255 chars | OS-enforced, but validate in skill |

### Content Type Restrictions

**Allowed extensions:**
```
.html .htm .css .js .mjs .json .txt .md
.png .jpg .jpeg .gif .svg .webp .ico .avif
.woff .woff2 .ttf .eot
.xml .rss .atom .sitemap
.webmanifest .manifest
.mp3 .mp4 .webm .ogg (with size limits)
.pdf
```

**Blocked:**
```
.exe .dll .so .dylib .sh .bash .bat .cmd .ps1 .py .rb .php .cgi .pl
.env .pem .key .cert .p12 .pfx
No dotfiles (.*) except .well-known/
No node_modules/
No __pycache__/
```

### Security Measures

1. **No symlinks** — The existing `resolveFileWithinRoot()` already rejects symlinks outside root
2. **No server-side execution** — Static files only; MIME types enforced
3. **No path traversal** — Already handled by gateway's path normalization
4. **CSP headers** — Add `Content-Security-Policy` headers to served files:
   ```
   default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'
   ```
5. **Rate limiting** — Max 60 file writes per minute (prevent abuse)
6. **No hidden files served** — Skip any file/directory starting with `.`

### Content Moderation (Optional, Phase 2)

- HTML content scan for phishing patterns (fake login forms, credential harvesting)
- Check for cryptocurrency mining scripts
- Block iframes to known malicious domains
- This is optional for MVP — the agents are authenticated users

---

## 5. Tool Definitions

### Tool 1: `webclaw_publish`

```json
{
  "name": "webclaw_publish",
  "description": "Write a file to the public website directory. The file will be immediately available at https://USERNAME.clawdet.com/site/PATH. Supports HTML, CSS, JS, images, and other static assets.",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "File path relative to site root (e.g., 'index.html', 'css/style.css', 'blog/post-1.html')"
      },
      "content": {
        "type": "string",
        "description": "File content (text files) or base64-encoded content (binary files)"
      },
      "encoding": {
        "type": "string",
        "enum": ["utf8", "base64"],
        "default": "utf8"
      }
    },
    "required": ["path", "content"]
  }
}
```

### Tool 2: `webclaw_status`

```json
{
  "name": "webclaw_status",
  "description": "Get the status of the published website including file list, total size, and live URL.",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Optional subdirectory to list. Defaults to root.",
        "default": "/"
      }
    }
  }
}
```

**Returns:**
```json
{
  "url": "https://username.clawdet.com/site/",
  "totalSize": "2.3 MB",
  "fileCount": 12,
  "remainingQuota": "47.7 MB",
  "files": [
    {"path": "index.html", "size": "4.2 KB", "modified": "2026-03-09T00:00:00Z"},
    {"path": "css/style.css", "size": "1.8 KB", "modified": "2026-03-09T00:00:00Z"}
  ]
}
```

### Tool 3: `webclaw_delete`

```json
{
  "name": "webclaw_delete",
  "description": "Delete a file or directory from the published website.",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "File or directory path to delete"
      }
    },
    "required": ["path"]
  }
}
```

### Tool 4: `webclaw_screenshot`

```json
{
  "name": "webclaw_screenshot",
  "description": "Take a screenshot of the published website for preview. Requires browser tool.",
  "parameters": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Page path to screenshot (default: '/')",
        "default": "/"
      },
      "width": {
        "type": "number",
        "description": "Viewport width in pixels",
        "default": 1280
      },
      "mobile": {
        "type": "boolean",
        "description": "Use mobile viewport (375px)",
        "default": false
      }
    }
  }
}
```

### Alternative: No Custom Tools Needed (Simpler Approach)

Since agents already have `bash`, `write_file`, and `read_file` — the skill can just be a **SKILL.md** that instructs the agent to:
1. Write files to `/app/workspace/public/`
2. Use `du` to check quota
3. Report the URL `https://USERNAME.clawdet.com/site/`

Custom tools are nice-to-have but not required for MVP.

---

## 6. Starter Templates

### Template 1: Landing Page (`landing`)
Single-page marketing site with hero, features, CTA.
- 1 HTML file, 1 CSS file, inline JS
- Modern design (NOT purple gradient slop)
- Responsive, fast, <50KB total

### Template 2: Portfolio (`portfolio`)
Personal portfolio with projects grid, about section, contact.
- index.html, style.css, projects page
- Image placeholders with instructions
- Clean typography, asymmetric layout

### Template 3: Blog (`blog`)
Simple static blog with post listing and individual post pages.
- index.html (post list), post template
- RSS feed generation
- Minimal CSS, readable typography

### Template 4: Dashboard (`dashboard`)
Data visualization dashboard with charts.
- Uses Chart.js from CDN
- Responsive grid layout
- Dark/light mode toggle
- Fetches data from JSON files in the same directory

### Template 5: Link in Bio (`linktree`)
Simple link aggregation page (like Linktree).
- Single HTML file, <10KB
- Animated, themed
- Perfect "hello world" for WebClaw

### Template 6: Documentation (`docs`)
Multi-page documentation site.
- Sidebar navigation
- Code syntax highlighting (Prism.js from CDN)
- Search (client-side)
- Markdown-friendly structure

---

## 7. Implementation Plan

### Phase 1: MVP (1-2 days)

1. **Create `/app/workspace/public/` directory** in each container
2. **Add static file serving** to the gateway (Option B — `/site/*` route)
   - Reuse existing `resolveFileWithinRoot()` function
   - Add MIME type detection (already exists in codebase)
   - Add basic cache headers (`Cache-Control: public, max-age=300`)
3. **Write the WebClaw SKILL.md** — instructions for the agent on how to create websites
   - File path conventions
   - Quota limits
   - URL structure
   - Template selection
4. **Create the "Link in Bio" template** as proof of concept
5. **Test:** Tell agent "build me a landing page" → verify it appears at `username.clawdet.com/site/`

### Phase 2: Polish (3-5 days)

6. **Add all 6 starter templates** as files in the skill directory
7. **Implement quota checking** (50MB limit, 500 file limit)
8. **Add security headers** (CSP, X-Frame-Options, etc.)
9. **Add `webclaw_status` tool** for quota/URL reporting
10. **Screenshot capability** — use OpenClaw's browser tool to capture previews
11. **Caddy integration** — add Caddy rules for compression and caching

### Phase 3: Advanced (1-2 weeks)

12. **Hot reload** — leverage Canvas Host's built-in WebSocket live reload
13. **Custom domains** — allow users to point their own domains via CNAME
14. **Template gallery** — browsable gallery of templates at `clawdet.com/templates`
15. **Site analytics** — integrate agent-analytics skill
16. **A/B testing** — let agents run experiments on their published sites
17. **Build pipeline** — support Tailwind CSS compilation, minification
18. **Multi-page SPA support** — client-side routing with history API fallback

### Phase 4: Differentiation

19. **"Vibe coding" mode** — agent watches the site, user describes changes in chat, agent updates in real-time
20. **AI-powered SEO** — agent analyzes and optimizes meta tags, content structure
21. **Collaborative editing** — multiple agents can contribute to the same site
22. **Marketplace** — share and remix templates between NanoClaw users

---

## 8. Key Decisions Needed

1. **URL structure:** `/site/` vs `/app/` vs `/web/` vs root `/`?
   - Recommendation: `/site/` — clear, doesn't conflict with anything
   
2. **Should the chat UI move?** If we want the user's site at the root domain:
   - Move chat to `/chat` or `chat.username.clawdet.com`
   - This is a bigger change but better long-term UX
   
3. **Custom tools vs SKILL.md-only?**
   - MVP: SKILL.md only (agent uses existing bash/write_file tools)
   - Phase 2: Add dedicated tools for better UX and guardrails
   
4. **Template storage:** In the skill directory vs fetched from a template repo?
   - MVP: Inline in SKILL.md as code blocks
   - Phase 2: Separate template files in skill directory

---

## 9. Competitive Analysis

| Platform | Approach | Limitations |
|----------|----------|-------------|
| **Replit Agent** | Full IDE + hosting | Heavy, complex, $25/mo |
| **Vercel v0** | AI generates React components | Locked to Vercel ecosystem |
| **Bolt.new** | Browser-based AI coding | Requires browser, not agent-native |
| **Lovable.dev** | AI web app builder | External service, not self-hosted |
| **WebClaw (ours)** | Agent writes files → instant deploy | Zero external deps, instant, free |

**Our differentiator:** "Tell your AI agent to build you a website. It's live in 60 seconds. No accounts, no deploy steps, no external services. Just `username.clawdet.com/site/`."

---

## 10. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Abuse (phishing sites) | High | Content scanning, rate limits, ToS |
| Resource exhaustion (disk) | Medium | 50MB quota, file count limits |
| Path traversal attacks | Low | Already handled by `resolveFileWithinRoot()` |
| XSS between user sites | Medium | CSP headers, separate origins per user |
| Agent generates bad code | Low | Templates as starting points, preview before publish |
| SEO spam | Medium | `noindex` by default, opt-in indexing |

---

*End of report. The key insight is that OpenClaw's Canvas Host already does 80% of what we need. The main work is routing configuration, a good SKILL.md, and quality templates.*

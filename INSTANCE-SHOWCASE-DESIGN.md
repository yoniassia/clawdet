# OpenClaw Instance Showcase - Design Document

**Goal:** Transform each user's subdomain into an interactive demo of OpenClaw's capabilities

**Target:** Username.clawdet.com landing page
**Audience:** Beta users who just got their instance
**Purpose:** Onboarding + feature discovery + "wow" moments

---

## Design Philosophy

**Don't just say what OpenClaw can do. Show it.**

- ✅ Interactive demos you can click and try
- ✅ Real examples with actual results
- ✅ Progressive disclosure (simple → advanced)
- ✅ Visual + functional (not just text)
- ✅ Mobile responsive

---

## Page Structure

### 1. Hero Section (Above the fold)
```
┌─────────────────────────────────────────────────┐
│  🦞 Welcome to Your OpenClaw Instance           │
│                                                  │
│  Hi [USERNAME]! Your AI assistant is running.  │
│                                                  │
│  [🎯 Try a Demo]  [📚 Read Docs]  [⚙️ Settings] │
└─────────────────────────────────────────────────┘
```

**Features:**
- Personalized greeting
- Instance status indicator (🟢 Running / 🟡 Starting / 🔴 Error)
- Quick action buttons
- X-style dark theme (matches clawdet.com)

---

### 2. Interactive Feature Cards

#### Feature Grid (3 columns on desktop, 1 on mobile)

```
┌────────────┬────────────┬────────────┐
│ 🌐 Browser │ 📅 Cron    │ 🤖 Agents  │
│ Automation │ Jobs       │ (Sub)      │
├────────────┼────────────┼────────────┤
│ 🧠 Memory  │ 💻 Code    │ 📁 Files   │
│ System     │ Gen        │ Manager    │
├────────────┼────────────┼────────────┤
│ 🔍 Research│ 🎨 Canvas  │ 👤 Human   │
│ Tools      │ UI         │ Loop       │
└────────────┴────────────┴────────────┘
```

---

### 3. Feature Demos (Expandable Cards)

Each feature card expands to show:
- **What it does** (1-2 sentences)
- **Try it now** (interactive demo)
- **See the result** (live output)
- **Learn more** (link to docs)

---

## Feature Showcase Details

### 🌐 Browser Automation

**Card Preview:**
```
🌐 Browser Automation
Control websites, fill forms, scrape data
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Control Chrome/Firefox from chat.         │
│ Fill forms, click buttons, extract data.  │
│                                            │
│ Try it:                                    │
│ [Run Example: Search Google for "OpenClaw"]│
│                                            │
│ Result:                                    │
│ ┌──────────────────────────────────────┐ │
│ │ ✅ Opened google.com                 │ │
│ │ ✅ Typed "OpenClaw" in search box    │ │
│ │ ✅ Clicked Search button             │ │
│ │ 📊 Found 42,000 results              │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ [View Code] [Learn More →]                │
└──────────────────────────────────────────┘
```

**Example prompts to show:**
- "Screenshot this page"
- "Fill out this form"
- "Monitor this website for changes"

---

### 📅 Cron Jobs

**Card Preview:**
```
📅 Cron Jobs & Scheduling
Set reminders, automate recurring tasks
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Schedule tasks to run at specific times.  │
│ Like reminders, but for anything.         │
│                                            │
│ Try it:                                    │
│ [Create: Remind me in 5 minutes]          │
│                                            │
│ Your Scheduled Jobs:                       │
│ ┌──────────────────────────────────────┐ │
│ │ 🔔 Test Reminder                     │ │
│ │    Next run: in 4m 32s               │ │
│ │    [Edit] [Delete]                   │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ Example uses:                              │
│ • Daily email summaries                    │
│ • Weekly GitHub PR reminders               │
│ • Hourly API health checks                 │
│                                            │
│ [Create Custom Job] [Learn More →]        │
└──────────────────────────────────────────┘
```

---

### 🤖 Sub-Agents

**Card Preview:**
```
🤖 Sub-Agents (Spawn AI Workers)
Delegate tasks to isolated AI sessions
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Spawn separate AI agents for complex      │
│ tasks. They work in parallel and report   │
│ back when done.                            │
│                                            │
│ Try it:                                    │
│ [Run: Research top 5 AI tools & summarize]│
│                                            │
│ Result:                                    │
│ ┌──────────────────────────────────────┐ │
│ │ 🤖 Sub-agent spawned: research-agent │ │
│ │ Status: Running... (est. 2 minutes)  │ │
│ │                                       │ │
│ │ [View Progress] [Cancel]             │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ Why use sub-agents?                        │
│ • Long-running tasks (research, analysis)  │
│ • Parallel execution (speed up work)       │
│ • Isolation (don't clutter main chat)      │
│                                            │
│ [Spawn Custom Agent] [Learn More →]       │
└──────────────────────────────────────────┘
```

---

### 🧠 Memory System

**Card Preview:**
```
🧠 Memory System
Your AI remembers across sessions
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Semantic search across all your notes,    │
│ conversations, and documents.              │
│                                            │
│ Try it:                                    │
│ [Search: "What did I say about APIs?"]    │
│                                            │
│ Your Memory Files:                         │
│ ┌──────────────────────────────────────┐ │
│ │ 📝 MEMORY.md         (3.2 KB)        │ │
│ │ 📅 2026-02-17.md     (8.4 KB)        │ │
│ │ 📅 2026-02-16.md     (6.1 KB)        │ │
│ │ 📂 memory/ (14 files)                │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ How it works:                              │
│ • Daily logs: memory/YYYY-MM-DD.md         │
│ • Long-term: MEMORY.md (curated)           │
│ • Auto-searched when you ask questions     │
│                                            │
│ [View Memory] [Add Entry] [Learn More →]  │
└──────────────────────────────────────────┘
```

---

### 💻 Code Generation

**Card Preview:**
```
💻 Code Generation
Write, debug, and execute code
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Generate code in any language, debug      │
│ errors, run scripts, build apps.           │
│                                            │
│ Try it:                                    │
│ [Run: Write a Python script to count      │
│  words in a file]                          │
│                                            │
│ Result:                                    │
│ ┌──────────────────────────────────────┐ │
│ │ # word_counter.py                    │ │
│ │ def count_words(filename):           │ │
│ │     with open(filename) as f:        │ │
│ │         return len(f.read().split()) │ │
│ │                                       │ │
│ │ ✅ Script created                    │ │
│ │ ✅ Tested with sample file           │ │
│ │ 📊 Result: 1,342 words               │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ Languages supported:                       │
│ Python, JavaScript, TypeScript, Bash,      │
│ Go, Rust, C++, Java, and more             │
│                                            │
│ [Try Another Example] [Learn More →]      │
└──────────────────────────────────────────┘
```

---

### 📁 File Management

**Card Preview:**
```
📁 File Management
Read, write, organize files
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Full access to your workspace files.      │
│ Create, edit, search, organize.            │
│                                            │
│ Try it:                                    │
│ [Run: Create a README.md for my project]  │
│                                            │
│ Your Workspace:                            │
│ ┌──────────────────────────────────────┐ │
│ │ 📂 workspace/                        │ │
│ │   📄 AGENTS.md                       │ │
│ │   📄 USER.md                         │ │
│ │   📄 SOUL.md                         │ │
│ │   📄 MEMORY.md                       │ │
│ │   📂 memory/ (14 files)              │ │
│ │   📂 projects/                       │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ What you can do:                           │
│ • Edit configuration files                 │
│ • Organize project files                   │
│ • Search across all documents              │
│ • Backup important data                    │
│                                            │
│ [Browse Files] [Learn More →]             │
└──────────────────────────────────────────┘
```

---

### 🔍 Research Tools

**Card Preview:**
```
🔍 Research & Web Search
Find information, summarize content
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Search the web, fetch articles, extract   │
│ information, create summaries.             │
│                                            │
│ Try it:                                    │
│ [Run: Summarize recent news about AI]     │
│                                            │
│ Result:                                    │
│ ┌──────────────────────────────────────┐ │
│ │ 🔍 Searched 5 sources                │ │
│ │ 📰 Found 23 recent articles          │ │
│ │ ✍️  Created summary (450 words)      │ │
│ │                                       │ │
│ │ Key findings:                         │ │
│ │ • OpenAI released GPT-5...           │ │
│ │ • Anthropic announced Claude 4...    │ │
│ │ • EU AI Act passed...                │ │
│ │                                       │ │
│ │ [View Full Summary] [Sources]        │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ Powered by:                                │
│ • Brave Search API                         │
│ • Web content extraction                   │
│ • AI summarization                         │
│                                            │
│ [Try Custom Search] [Learn More →]        │
└──────────────────────────────────────────┘
```

---

### 🎨 Canvas UI

**Card Preview:**
```
🎨 Canvas (Visual Output)
Render charts, diagrams, visuals
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ Render visual content like charts,        │
│ diagrams, and interactive UIs.             │
│                                            │
│ Try it:                                    │
│ [Run: Create a bar chart of monthly       │
│  website traffic]                          │
│                                            │
│ Result:                                    │
│ ┌──────────────────────────────────────┐ │
│ │ 📊 Website Traffic (Jan-Jun 2026)   │ │
│ │                                       │ │
│ │ █████████ Jan: 12,450               │ │
│ │ ███████████ Feb: 15,230             │ │
│ │ █████████████ Mar: 18,940           │ │
│ │ ████████████████ Apr: 22,100        │ │
│ │ ███████████████████ May: 26,780     │ │
│ │ ██████████████████████ Jun: 31,450  │ │
│ │                                       │ │
│ │ [Download PNG] [View Data]           │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ Canvas can render:                         │
│ • Charts and graphs                        │
│ • Diagrams and flowcharts                  │
│ • Interactive widgets                      │
│ • Custom HTML/CSS                          │
│                                            │
│ [Try Another Chart] [Learn More →]        │
└──────────────────────────────────────────┘
```

---

### 👤 RentAHuman (Human-in-the-Loop)

**Card Preview:**
```
👤 RentAHuman Integration
Get human help when AI needs it
[Try Demo ▼]
```

**Expanded Demo:**
```
┌──────────────────────────────────────────┐
│ What it does:                             │
│ When AI encounters tough questions or     │
│ needs judgment calls, it can request      │
│ human assistance via RentAHuman.           │
│                                            │
│ How it works:                              │
│ ┌──────────────────────────────────────┐ │
│ │ 1. AI detects complex decision       │ │
│ │ 2. Sends request to human operators  │ │
│ │ 3. Human provides guidance           │ │
│ │ 4. AI continues with human insight   │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ Example scenarios:                         │
│ • Ethical dilemmas                         │
│ • Ambiguous instructions                   │
│ • Creative judgments                       │
│ • Safety verification                      │
│                                            │
│ Your RentAHuman Status:                    │
│ ✅ Enabled                                │
│ 💳 Credits: Unlimited (Beta)              │
│ 📊 Used this month: 0 requests            │
│                                            │
│ [View Documentation] [Learn More →]       │
└──────────────────────────────────────────┘
```

---

## 4. Quick Start Guide

**Visual step-by-step:**

```
┌─────────────────────────────────────────────┐
│ 🚀 Get Started in 3 Steps                   │
│                                              │
│ 1. Connect via Telegram                     │
│    [Show QR Code] or [Link Telegram Bot]   │
│                                              │
│ 2. Try Your First Command                   │
│    Type: "What can you do?"                 │
│                                              │
│ 3. Explore Advanced Features                │
│    [View All Demos ↑]                       │
└─────────────────────────────────────────────┘
```

---

## 5. System Status Dashboard

```
┌─────────────────────────────────────────────┐
│ 🖥️ Instance Status                          │
│                                              │
│ OpenClaw Gateway:  🟢 Running               │
│ Uptime:            2h 34m                    │
│ Memory:            245 MB / 4 GB             │
│ CPU:               12%                       │
│                                              │
│ Last Activity:     2 minutes ago             │
│ Messages Today:    47                        │
│ Cron Jobs:         2 active                  │
│ Sub-agents:        0 running                 │
│                                              │
│ [View Logs] [Service Management →]          │
└─────────────────────────────────────────────┘
```

---

## 6. Resources Section

```
┌─────────────────────────────────────────────┐
│ 📚 Resources & Help                          │
│                                              │
│ 📖 User Guide        [Read →]               │
│ 💬 Community Discord [Join →]               │
│ 🐛 Report Bug        [Submit →]             │
│ 💡 Feature Request   [Suggest →]            │
│ 📧 Support Email     support@clawdet.com    │
│                                              │
│ Your Instance:                               │
│ • URL: https://[username].clawdet.com       │
│ • API: https://[username].clawdet.com/api   │
│ • Docs: /docs                                │
└─────────────────────────────────────────────┘
```

---

## Technical Implementation

### Stack
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Styling:** CSS Modules (X-style dark theme)
- **API:** OpenClaw Gateway REST endpoints
- **Real-time:** WebSocket for live demos
- **Responsive:** Mobile-first design

### File Structure
```
clawdet/
├── app/
│   └── showcase/
│       ├── page.tsx           # Main showcase page
│       ├── layout.tsx          # Layout wrapper
│       └── showcase.module.css # Styles
├── components/
│   └── showcase/
│       ├── FeatureCard.tsx     # Expandable feature card
│       ├── DemoRunner.tsx      # Interactive demo executor
│       ├── StatusDashboard.tsx # System status widget
│       └── QuickStart.tsx      # Onboarding steps
├── lib/
│   └── showcase/
│       ├── demo-scripts.ts     # Pre-built demo scenarios
│       └── gateway-client.ts   # OpenClaw API wrapper
```

### API Endpoints Needed
```typescript
// Execute demo on user's instance
POST /api/showcase/run-demo
{
  feature: 'browser' | 'cron' | 'subagent' | ...,
  demo: 'google-search' | 'create-reminder' | ...
}

// Get instance status
GET /api/showcase/status

// List active cron jobs
GET /api/showcase/cron-jobs

// List sub-agents
GET /api/showcase/sub-agents
```

---

## Demo Scripts (Pre-built)

### Browser Demo
```typescript
const browserDemo = {
  name: 'Google Search',
  steps: [
    { action: 'open', url: 'https://google.com' },
    { action: 'type', selector: 'input[name="q"]', text: 'OpenClaw' },
    { action: 'click', selector: 'input[type="submit"]' },
    { action: 'waitForNavigation' },
    { action: 'screenshot' }
  ],
  duration: '~15 seconds'
};
```

### Cron Demo
```typescript
const cronDemo = {
  name: 'Test Reminder',
  schedule: { kind: 'at', at: new Date(Date.now() + 5 * 60 * 1000) },
  payload: {
    kind: 'systemEvent',
    text: '🔔 Test reminder from showcase demo!'
  }
};
```

### Sub-agent Demo
```typescript
const subagentDemo = {
  name: 'Research Agent',
  task: 'Research the top 5 AI tools released in 2026 and create a summary',
  timeout: 120 // 2 minutes
};
```

---

## Mobile Responsive Breakpoints

```css
/* Desktop: 3-column grid */
@media (min-width: 1024px) {
  .feature-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Tablet: 2-column grid */
@media (min-width: 768px) and (max-width: 1023px) {
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile: Single column */
@media (max-width: 767px) {
  .feature-grid { grid-template-columns: 1fr; }
  .demo-output { font-size: 14px; }
}
```

---

## Security Considerations

1. **Rate Limiting:** Max 5 demo runs per user per hour
2. **Sandbox Demos:** Run in isolated environment
3. **No Sensitive Data:** Demos use fake/placeholder data
4. **Auth Check:** Verify user owns the instance
5. **Timeout Protection:** Max 30s per demo execution

---

## Success Metrics

**User Engagement:**
- % of users who expand at least 3 feature cards
- % of users who run at least 1 demo
- Time spent on showcase page
- Feature demos → actual usage conversion

**Technical:**
- Page load time < 2s
- Demo execution success rate > 95%
- Mobile usability score > 90

---

## Rollout Plan

### Phase 1: Sprint 17 (Tonight)
- Build basic showcase page structure
- Implement 3 core demos (browser, cron, subagent)
- Deploy to test instance

### Phase 2: Sprint 18 (Tomorrow)
- Add remaining feature demos
- Polish UI/UX
- Mobile optimization
- Real data integration

### Phase 3: Sprint 19+ (Post-launch)
- Analytics integration
- A/B testing different demos
- User feedback collection
- Iterative improvements

---

## Future Enhancements

1. **Interactive Tutorials:** Step-by-step guided tours
2. **Custom Demos:** Let users create their own demo scripts
3. **Demo Gallery:** Community-submitted examples
4. **Video Walkthroughs:** Screen recordings of complex features
5. **AI Playground:** Try different models (Grok, Claude, GPT)

---

**Status:** Ready for implementation  
**Target Sprint:** 17 or dedicated Sprint 16.5 (can start immediately)  
**Estimated Dev Time:** 3-4 hours (Sprint 17) or 1.5 hours (basic version)


## 🧠 Memory System

You have persistent memory across conversations. USE IT.

### File Structure
```
/workspace/
├── CLAUDE.md          ← You are here (your instructions)
├── MEMORY.md          ← Long-term memory (curated, important stuff)
├── memory/
│   └── YYYY-MM-DD.md  ← Daily logs (what happened today)
├── knowledge/         ← Reference docs, research, saved info
└── public/            ← WebClaw published files (your website)
```

### Every Conversation
1. **Read MEMORY.md** — this is your long-term memory, check it first
2. **Read today's daily log** (`memory/YYYY-MM-DD.md`) if it exists
3. Use what you learn to personalize your responses

### When to Write Memory
- User says "remember this" → write to MEMORY.md or daily log
- You learn something about the user (name, preferences, job) → MEMORY.md
- Significant conversation happened → daily log
- Research or reference material → knowledge/ directory
- End of a productive session → update daily log with summary

### Memory Tips
- **MEMORY.md** = curated essentials (like long-term memory)
- **Daily logs** = raw notes (what happened, decisions made)
- **knowledge/** = reference material (research, docs, saved articles)
- Keep MEMORY.md concise — distill, don't dump
- Date your entries so you know when things happened
- Don't store secrets unless the user explicitly asks

### 💡 Be Proactive About Memory
If a user mentions their name, job, interests, or preferences — save it without being asked. Build a picture of who they are over time. That's what makes you *their* AI, not just *an* AI.

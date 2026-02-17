# Clawdet Onboarding Guide

Welcome to your personal AI assistant! 🎉

This guide will help you get the most out of your Clawdet instance in the first 24 hours.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Verify Your Instance is Running

Visit your instance URL: **`https://<yourusername>.clawdet.com`**

You should see the OpenClaw web interface. If not:
- Wait 2-3 minutes for DNS to fully propagate
- Try in a private/incognito browser window
- Check your dashboard for provisioning status

### Step 2: Say Hello to Your AI

Try sending a message:
```
Hello! Tell me about yourself and what you can do.
```

Your AI will respond with its capabilities and current configuration.

### Step 3: Explore the Workspace

Your instance comes with pre-configured files:
- **`USER.md`** - Information about you (edit this!)
- **`AGENTS.md`** - Your AI's personality and behavior rules
- **`MEMORY.md`** - Long-term memory storage

Ask your AI:
```
Show me what files are in my workspace
```

---

## 📝 Customization (15 minutes)

### Personalize Your AI

Edit `USER.md` to tell your AI about you:
```markdown
# About Me

- Name: Your Name
- Location: City, Country
- Timezone: America/New_York
- Interests: AI, coding, productivity
- Goals: Automate tasks, learn new skills
- Communication style: Casual and friendly
```

Your AI reads this file at the start of every session.

### Define AI Personality

Edit `AGENTS.md` to customize behavior:
```markdown
# SOUL.md

You are a helpful, proactive assistant with these traits:
- Friendly but professional
- Clear and concise communication
- Ask clarifying questions when needed
- Proactive suggestions
- Technical expertise

## Communication Style

- Use emojis sparingly
- Be direct and actionable
- Explain technical concepts simply
- Celebrate wins!

## Priorities

1. Help the user be more productive
2. Learn from interactions
3. Stay organized and tidy
4. Respect privacy
```

### Set Up Memory

Your AI automatically creates daily memory files in `memory/YYYY-MM-DD.md`.

You can also add important context to `MEMORY.md`:
```markdown
# Important Context

## Projects
- Working on a Python web scraper
- Learning about blockchain

## Preferences
- Prefers VS Code over other editors
- Likes detailed explanations

## Recurring Tasks
- Weekly newsletter on Fridays
- Daily standup at 9 AM
```

---

## 🛠️ Essential Skills (30 minutes)

### 1. File Management

Try these commands:
```
Create a new file called notes.md with my todo list
```

```
Show me all Python files in my workspace
```

```
Search my files for mentions of "API keys"
```

### 2. Web Browsing

Your AI can fetch information:
```
Search the web for the latest Next.js features
```

```
Fetch the contents of https://github.com/trending and summarize it
```

### 3. Code Execution

Run commands directly:
```
Check the disk space on my server
```

```
Install the requests library for Python
```

```
Run a simple Python script to test my setup
```

### 4. Scheduled Tasks (Cron)

Set up recurring tasks:
```
Remind me every Monday at 9 AM to review my goals
```

```
Check for system updates every week
```

```
Send me a weekly summary of my activity every Friday
```

### 5. Memory & Recall

Your AI remembers across sessions:
```
Remember that I prefer TypeScript over JavaScript
```

```
What did we discuss yesterday?
```

```
Search my memory for notes about the API project
```

---

## 🔧 Advanced Configuration (60 minutes)

### SSH Access

Connect to your VPS:
```bash
ssh root@<yourusername>.clawdet.com
```

**Your SSH key**: Check your dashboard for the private key

**Useful directories:**
- OpenClaw config: `/root/.openclaw/`
- Workspace files: `/root/.openclaw/workspace/`
- Logs: `/root/.openclaw/logs/`

### Add Your Own API Keys

Want to use your personal Grok API key or add other AI models?

1. SSH into your instance
2. Edit the config:
   ```bash
   nano /root/.openclaw/config.json
   ```
3. Add your API keys:
   ```json
   {
     "providers": {
       "xai": {
         "apiKey": "your-grok-api-key-here"
       },
       "anthropic": {
         "apiKey": "your-claude-api-key-here"
       }
     }
   }
   ```
4. Restart the gateway:
   ```bash
   openclaw gateway restart
   ```

### Install Additional Software

Your VPS is yours to customize:
```bash
# Install Docker
apt update && apt install docker.io

# Install Python packages
pip install pandas numpy matplotlib

# Install Node.js tools
npm install -g typescript ts-node

# Set up a database
apt install postgresql
```

### Configure Integrations

OpenClaw supports many integrations. See the [Skills documentation](https://openclaw.org/docs/skills) for:
- X/Twitter automation
- GitHub integration
- Email sending
- Slack/Discord bots
- Calendar sync
- And more!

---

## 💡 Usage Tips

### Best Practices

1. **Be specific** - Clear instructions get better results
   - ❌ "Help me with code"
   - ✅ "Write a Python function to parse JSON and extract user emails"

2. **Use memory** - Tell your AI important context
   - "Remember that I'm working on a React project using TypeScript"
   - "Note that our team standup is at 10 AM EST"

3. **Iterate** - Refine your requests
   - "That's close, but can you make it more concise?"
   - "Add error handling to that code"

4. **Organize** - Keep your workspace tidy
   - Create folders for different projects
   - Use descriptive filenames
   - Archive old work

5. **Automate** - Set up recurring tasks
   - Daily reminders
   - Weekly reports
   - Automated backups

### Common Workflows

#### Project Setup
```
Create a new project directory called "my-app"
Set up a basic Express.js server with TypeScript
Add a README with setup instructions
Initialize a Git repository
```

#### Research & Writing
```
Search for the latest research on quantum computing
Summarize the top 5 results
Create an outline for a blog post about quantum computing applications
Write the introduction paragraph
```

#### Productivity
```
What are my todos for today?
Create a meeting agenda for tomorrow's 2 PM call
Send me a summary of what we accomplished this week
Set a reminder to review this project in 2 weeks
```

#### Learning
```
Explain how async/await works in JavaScript
Give me 5 practice problems about Python decorators
Review my solution and provide feedback
```

---

## 🎯 First Week Goals

Use these milestones to get comfortable with your instance:

### Day 1: Setup ✅
- [x] Access your instance
- [x] Complete this onboarding guide
- [x] Edit USER.md and AGENTS.md
- [x] Test basic commands

### Day 2: Exploration
- [ ] Try 10 different types of requests
- [ ] Set up your first cron job
- [ ] Create a project folder structure
- [ ] Connect an integration (X, GitHub, etc.)

### Day 3: Customization
- [ ] SSH into your VPS
- [ ] Add a personal API key
- [ ] Install additional software
- [ ] Customize your AI's personality further

### Day 4: Automation
- [ ] Set up daily/weekly reminders
- [ ] Create a recurring task
- [ ] Build a simple automation workflow
- [ ] Test file management commands

### Day 5: Integration
- [ ] Connect to an external service
- [ ] Set up notifications
- [ ] Try the browser automation feature
- [ ] Explore skill documentation

### Day 6-7: Review & Refine
- [ ] Review your memory files
- [ ] Clean up workspace
- [ ] Update AGENTS.md with learnings
- [ ] Plan your ideal workflows

---

## 🆘 Getting Help

### Built-in Help

Ask your AI directly:
```
What commands can you run?
How do I set up a cron job?
Show me examples of web scraping
What integrations are available?
```

### Documentation

- **Clawdet docs**: Check your dashboard for links
- **OpenClaw docs**: [openclaw.org/docs](https://openclaw.org/docs)
- **Skills reference**: [openclaw.org/docs/skills](https://openclaw.org/docs/skills)

### Support

If you're stuck:
- **Email**: support@clawdet.com
- **X**: @clawdet
- **Community**: Join our Discord (link in dashboard)

We typically respond within 24 hours.

---

## 🎊 You're Ready!

Your Clawdet instance is fully functional and ready to use.

**Next steps:**
1. Start with simple requests to build confidence
2. Gradually explore advanced features
3. Customize your AI's behavior to match your style
4. Set up automations to save time
5. Share feedback with us!

**Remember**: Your AI learns from your interactions. The more you use it, the better it understands your preferences and needs.

Have fun exploring! 🚀

---

## 📊 Quick Reference Card

### Essential Commands

| What you want | Example prompt |
|---------------|----------------|
| Create a file | "Create a file called notes.md with my todo list" |
| List files | "Show me all files in my workspace" |
| Read a file | "Show me the contents of USER.md" |
| Edit a file | "Update AGENTS.md to make my AI more casual" |
| Run a command | "Check disk space" or "Update system packages" |
| Web search | "Search for the latest news about AI" |
| Fetch a webpage | "Get the contents of example.com" |
| Set reminder | "Remind me tomorrow at 9 AM to review this" |
| Recall memory | "What did we discuss about the API project?" |
| Save to memory | "Remember that I prefer Python over JavaScript" |

### Useful Paths

- **Config**: `/root/.openclaw/config.json`
- **Workspace**: `/root/.openclaw/workspace/`
- **Logs**: `/root/.openclaw/logs/`
- **Skills**: `/root/.openclaw/skills/`

### Service Management

```bash
# Check status
openclaw gateway status

# Restart
openclaw gateway restart

# View logs
openclaw gateway logs

# Stop
openclaw gateway stop
```

---

*Welcome aboard! Your AI assistant is ready to help you build, learn, and automate.* 🤖✨

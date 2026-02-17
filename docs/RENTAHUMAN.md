# RentAHuman Integration

ClawDet instances now include **RentAHuman** - a human-in-the-loop service that allows AI assistants to request help from real humans when needed.

## What is RentAHuman?

RentAHuman is an MCP (Model Context Protocol) server that bridges AI and human intelligence. When the AI encounters tasks it cannot complete alone, it can request human assistance.

**Use Cases:**
- **Complex decision-making** - When AI needs human judgment
- **Verification tasks** - Confirm critical information
- **Creative input** - Get human perspective on designs, copy, etc.
- **Domain expertise** - Access specialized human knowledge
- **Quality assurance** - Human review of important outputs

## How It Works

1. **AI detects need** - When uncertain or task requires human touch
2. **Creates request** - Submits task to RentAHuman platform
3. **Human responds** - Real person completes the task
4. **AI continues** - Uses human input to proceed

## Configuration

**Already Configured:**
All ClawDet VPS instances include RentAHuman by default.

**API Key:** `rah_6d79a2f5e0c41cdde9ee210db41e933d`

**MCP Server Config:**
```yaml
mcpServers:
  rentahuman:
    command: npx
    args:
      - "-y"
      - "@anthropic/rentahuman-mcp"
    env:
      RENTAHUMAN_API_KEY: "rah_6d79a2f5e0c41cdde9ee210db41e933d"
```

## Usage Examples

### Example 1: Verify Information
```
User: "Is this article factually accurate?"
AI: *uses RentAHuman to request expert fact-checking*
Human: *reviews article, provides verification*
AI: "A human expert verified 8/10 claims. Here are the 2 that need correction..."
```

### Example 2: Creative Review
```
User: "Does this logo design work?"
AI: *requests human designer feedback*
Human: *provides design critique*
AI: "A designer reviewed it and suggests these 3 improvements..."
```

### Example 3: Complex Decision
```
User: "Should I accept this job offer?"
AI: *recognizes need for human judgment*
Human: *provides perspective based on details*
AI: "A career advisor reviewed your situation and recommends..."
```

## For End Users

**You don't need to do anything!** RentAHuman works seamlessly in the background.

**When does it activate?**
- Your AI assistant automatically uses it when helpful
- You'll be informed when human input is requested
- Results are integrated into your conversation

**Example conversation:**
```
You: "Help me negotiate this contract."
AI: "I'm requesting input from a legal professional to review the terms..."
    [RentAHuman request sent]
    "A contract specialist has reviewed it. Here's their advice..."
```

## For Developers

### Calling RentAHuman (via MCP)

OpenClaw handles MCP communication automatically. The AI can invoke RentAHuman tools when needed.

**Available MCP tools:**
- `request_human_task` - Submit a task for human completion
- `check_task_status` - Check if human has responded
- `get_task_result` - Retrieve completed task

### Manual Testing

Test RentAHuman from command line:
```bash
# Inside provisioned VPS
npx -y @anthropic/rentahuman-mcp \
  --api-key rah_6d79a2f5e0c41cdde9ee210db41e933d
```

### Environment Variables

```bash
# Systemd service automatically sets:
RENTAHUMAN_API_KEY=rah_6d79a2f5e0c41cdde9ee210db41e933d
```

## Cost & Billing

**Pricing:** Pay-per-task (varies by complexity)
**Billing:** Charged to RentAHuman account
**Budget:** Set limits in RentAHuman dashboard

**Typical costs:**
- Simple verification: $2-5
- Expert consultation: $10-50
- Creative work: $20-100
- Specialized tasks: Custom pricing

## When to Use

**Good use cases:**
- ✅ Verification of critical facts
- ✅ Creative feedback (design, writing)
- ✅ Domain expertise (legal, medical, technical)
- ✅ Complex decision-making
- ✅ Quality assurance for important outputs

**Avoid for:**
- ❌ Simple factual lookups (use web search)
- ❌ Basic coding tasks (AI can handle)
- ❌ Routine calculations
- ❌ Information already in AI's knowledge

## Best Practices

### 1. Be Specific
```
❌ "Review this"
✅ "Review this marketing email for tone, grammar, and persuasiveness"
```

### 2. Provide Context
```
❌ "Is this good?"
✅ "Does this logo work for a B2B SaaS company targeting CTOs?"
```

### 3. Set Expectations
```
✅ "I need this verified within 24 hours"
✅ "Budget: $20 max"
```

### 4. Use Appropriately
Don't request humans for tasks AI can handle. Reserve it for genuine need.

## Monitoring

### Check Usage
```bash
# View RentAHuman requests in logs
journalctl -u openclaw-gateway | grep rentahuman

# Or check RentAHuman dashboard
https://rentahuman.com/dashboard
```

### API Limits
- **Rate limit:** 100 requests/hour
- **Concurrent tasks:** 10 max
- **Response time:** Typically 1-24 hours

## Troubleshooting

### MCP Server Not Starting
```bash
# Check systemd logs
journalctl -u openclaw-gateway -n 50

# Test MCP server manually
npx -y @anthropic/rentahuman-mcp --version

# Verify environment
echo $RENTAHUMAN_API_KEY
```

### Tasks Not Completing
1. Check task status on RentAHuman dashboard
2. Verify budget hasn't been exceeded
3. Ensure task is clear and completeable
4. Consider raising budget if task is complex

### API Key Issues
```bash
# Verify key is set
grep RENTAHUMAN_API_KEY /etc/systemd/system/openclaw-gateway.service

# Test key validity
curl https://api.rentahuman.com/v1/tasks \
  -H "Authorization: Bearer rah_6d79a2f5e0c41cdde9ee210db41e933d"
```

## Security

**API Key Protection:**
- ✅ Stored in systemd service (not in files)
- ✅ Only accessible by root user
- ✅ Not exposed in logs
- ✅ Encrypted in transit

**Data Privacy:**
- Human workers sign NDAs
- Tasks are confidential
- No data retention after completion
- GDPR/CCPA compliant

## Disable RentAHuman (Optional)

If you don't want RentAHuman on your instance:

```bash
# SSH into your VPS
ssh root@username.clawdet.com

# Edit gateway config
nano /root/.openclaw/config/gateway.yaml

# Remove mcpServers section or comment it out:
# mcpServers:
#   rentahuman:
#     ...

# Restart service
systemctl restart openclaw-gateway
```

## Support

**RentAHuman Issues:**
- Dashboard: https://rentahuman.com/dashboard
- Support: support@rentahuman.com
- Docs: https://docs.rentahuman.com

**ClawDet Integration:**
- Email: support@clawdet.com
- GitHub: https://github.com/yoniassia/clawdet/issues

---

**Deployed:** 2026-02-17  
**API Key:** rah_6d79a2f5e0c41cdde9ee210db41e933d  
**Included in:** All ClawDet VPS instances (free beta + paid)  
**Status:** ✅ Active

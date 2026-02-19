# Cost Tracker Skill

**Purpose:** Track AI API usage and costs across all providers (Anthropic, OpenAI, xAI, Google).

## What It Does

Logs every AI API call with:
- Provider and model used
- Input/output tokens
- Task type (chat, completion, embedding, etc.)
- Estimated cost per call
- Timestamp

Generates reports:
- Daily cost summary
- Weekly cost breakdown by model
- Monthly totals by provider
- Cost per user (for multi-tenant systems)

## Database Schema

```sql
-- API call logs
CREATE TABLE IF NOT EXISTS api_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    task_type TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_usd REAL,
    user_id TEXT,
    session_id TEXT,
    metadata TEXT
);

CREATE INDEX idx_timestamp ON api_calls(timestamp);
CREATE INDEX idx_provider ON api_calls(provider);
CREATE INDEX idx_user ON api_calls(user_id);
```

## Usage

**Log an API call:**
```bash
openclaw exec -- node skills/cost-tracker/log-call.js \
  --provider anthropic \
  --model claude-opus-4-6 \
  --input-tokens 1000 \
  --output-tokens 500 \
  --cost 0.045
```

**Generate daily report:**
```bash
openclaw exec -- node skills/cost-tracker/daily-report.js
```

**Get cost for date range:**
```bash
openclaw exec -- node skills/cost-tracker/query-cost.js \
  --start 2026-02-01 \
  --end 2026-02-19 \
  --group-by provider
```

## Pricing (as of 2026-02-19)

### Anthropic
- Claude Opus 4.6: $15/M input, $75/M output
- Claude Sonnet 4.5: $3/M input, $15/M output

### OpenAI
- GPT-4o: $2.50/M input, $10/M output
- o1: $15/M input, $60/M output

### xAI
- Grok 2: $2/M input, $10/M output

### Google
- Gemini 2.0: $0.075/M input, $0.30/M output

## Cron Jobs

**Daily cost summary (7am):**
```yaml
schedule: "0 7 * * *"
action: Generate yesterday's cost report and send to Telegram
```

**Weekly report (Monday 9am):**
```yaml
schedule: "0 9 * * 1"
action: Generate last 7 days breakdown by model
```

**Monthly report (1st of month, 9am):**
```yaml
schedule: "0 9 1 * *"
action: Generate full month report by provider
```

## Integration

This skill should be called by the OpenClaw gateway automatically after every API call. For Clawdet platform, log costs per user instance.

## Alerts

- Daily spend > $10: Alert to admin
- User spend > $5/day: Alert to user
- Unusual spike (3x daily average): Immediate alert

## Storage

Database: `~/.openclaw/data/cost-tracker.db`
Logs: JSONL format in `~/.openclaw/logs/api-calls-YYYY-MM-DD.jsonl`

Keep 90 days of detailed logs, then aggregate to monthly summaries.

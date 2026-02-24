# Provisioning E2E Tests

Automated tests for the full Clawdet tenant lifecycle: signup → provision → onboard → chat → deprovision.

## Test Scenarios

| # | Name | What it tests |
|---|------|---------------|
| 1 | Full Provisioning (Alpha) | Signup, provision, health check, subdomain, chat |
| 2 | Onboarding (Beta) | Provision, complete wizard, verify personalization |
| 3 | Multi-Agent Stress (Gamma) | 3 simultaneous agents, stop/restart one |
| 4 | Error Recovery (Delta) | Crash recovery, API failures, ClawQA auto-issues |
| 5 | Deprovisioning (Epsilon) | Clean teardown, verify resources removed |
| 6 | Migration (Zeta) | Move agent between servers, zero downtime |

## Two Modes

- **`TEST_MODE=mock`** (default) — Uses mock Coolify server. Safe for CI. No real infrastructure.
- **`TEST_MODE=real`** — Hits actual Coolify API. For staging/pre-prod validation.

## Run Locally (Mock Mode)

```bash
# With docker-compose (full isolation)
cd tests
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit

# Or directly (needs mock server running)
TEST_MODE=mock npx playwright test --config tests/e2e/provisioning.config.ts
```

## Run Against Staging

```bash
TEST_MODE=real \
COOLIFY_BASE_URL=http://135.181.43.68:8000 \
COOLIFY_API_TOKEN=<token> \
COOLIFY_SERVER_UUID=<uuid> \
COOLIFY_PROJECT_UUID=<uuid> \
CLAWDET_URL=https://staging.clawdet.com \
AGENTMAIL_API_KEY=<key> \
npx playwright test --config tests/e2e/provisioning.config.ts
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TEST_MODE` | No | `mock` (default) or `real` |
| `COOLIFY_BASE_URL` | Real mode | Coolify instance URL |
| `COOLIFY_API_TOKEN` | Real mode | Coolify API bearer token |
| `COOLIFY_SERVER_UUID` | Real mode | Target server UUID |
| `COOLIFY_PROJECT_UUID` | Real mode | Coolify project UUID |
| `COOLIFY_TARGET_SERVER_UUID` | Migration test | Secondary server for migration |
| `CLAWDET_URL` | No | Clawdet web URL (default: https://clawdet.com) |
| `CLAWDET_ADMIN_TOKEN` | Real mode | Admin API token for provisioning |
| `AGENTMAIL_API_KEY` | Email tests | AgentMail API key |
| `CLAWQA_URL` | No | ClawQA API URL |
| `CLAWQA_TOKEN` | No | ClawQA API token |

## Adding New Tests

1. Add a new `test.describe` block in `provisioning.spec.ts`
2. Use `uniqueName('prefix')` for agent names (avoids conflicts)
3. Always deprovision in `afterAll` (even on failure)
4. Support both mock and real modes via `TEST_MODE` checks
5. Use helpers from `tests/helpers/` for common operations

## File Structure

```
tests/
├── README.md
├── docker-compose.test.yml      # Local test environment
├── Dockerfile.mock-coolify      # Mock Coolify server image
├── Dockerfile.test-runner       # Playwright test runner image
├── e2e/
│   ├── provisioning.spec.ts     # Main test suite (6 scenarios)
│   └── provisioning.config.ts   # Playwright config
└── helpers/
    ├── mock-coolify.ts          # Mock Coolify API server
    ├── agentmail-helper.ts      # Test email inbox management
    ├── provisioning-helper.ts   # Provision/deprovision with retry
    └── clawqa-helper.ts         # ClawQA issue verification
```

# Changelog

All notable changes to Clawdet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-02-19

### Fixed
- **Gateway crash-loop** - Removed invalid `providers` key from openclaw.json that caused infinite restart loop
- **WebSocket connection failures** - Corrected WebSocket URL from `wss://host` to `wss://host/gateway/` for proper Caddy routing
- **HTML syntax errors** - Added 18 missing closing braces in CSS @keyframes/@media blocks and JavaScript functions
- **Undefined variable** - Declared `connectNonce` variable in connection logic

### Changed
- Config now uses `env.XAI_API_KEY` instead of nested providers structure
- Instance landing page WebSocket connection path updated to `/gateway/`

### Infrastructure
- Both test instances (test1.clawdet.com, test2.clawdet.com) running stable with 0 restarts since deployment
- Gateway uptime: 13+ minutes without errors
- All 19 automated tests passed (100% pass rate)

### Known Issues
- **P2-002**: Browser cache may show old HTML requiring hard refresh (Cmd/Ctrl+Shift+R)
  - Workaround documented in KNOWN_BUGS.md
  - Affects returning users only

## [2.0.0] - 2026-02-18

### Added
- Multi-agent workflow system with context compaction
- Five-stage development pipeline: Planner → Architect → Implementer → Verifier → Release
- Test gate validation system for code quality, testing, performance, documentation, and release approval
- Automated skill documentation generation

### Documentation
- Complete workflow documentation in docs/WORKFLOW.md
- Test gates specification in docs/TEST_GATES.md
- Known bugs tracking in docs/KNOWN_BUGS.md
- WebSocket fix root cause analysis

## [1.0.0] - 2026-02-17

### Added
- Initial Clawdet infrastructure
- OpenClaw Gateway provisioning system
- Instance landing page with chat interface
- Test instances: test1.clawdet.com, test2.clawdet.com
- Cloudflare routing and SSL certificates
- Systemd service management

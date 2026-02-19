# API Contracts

## Purpose
Formal interface specifications for all APIs (internal and external). Serves as single source of truth for request/response formats.

---

## Contract Format

```typescript
/**
 * @endpoint POST /api/example
 * @auth Required (session cookie)
 * @rate 100/hour per user
 * @version 1.0
 */

// Request
interface ExampleRequest {
  field: string;        // Purpose, validation rules
  optional?: number;    // Default: 0
}

// Response (Success)
interface ExampleResponse {
  success: true;
  data: {
    result: string;
  };
}

// Response (Error)
interface ExampleError {
  success: false;
  error: {
    code: string;       // ERROR_CODE_CONSTANT
    message: string;    // User-friendly message
    details?: object;   // Optional debug info
  };
}

// Examples
// Success: { success: true, data: { result: "Hello" } }
// Error: { success: false, error: { code: "INVALID_INPUT", message: "..." } }
```

---

## Internal APIs (Next.js Routes)

### POST /api/auth/x/login
```typescript
/**
 * Initiates X OAuth flow
 * @auth None (public)
 * @rate 10/hour per IP
 */

// Request
interface XLoginRequest {
  // No body (GET redirect)
}

// Response
// Redirects to: https://twitter.com/i/oauth2/authorize?...
```

### GET /api/auth/x/callback
```typescript
/**
 * X OAuth callback handler
 * @auth None (OAuth flow)
 * @rate 10/hour per IP
 */

// Request (query params)
interface XCallbackRequest {
  code: string;        // OAuth authorization code
  state: string;       // CSRF token
}

// Response (Success)
// Redirects to: /dashboard with session cookie set

// Response (Error)
// Redirects to: /?error=auth_failed
```

### POST /api/trial-chat
```typescript
/**
 * 5-message trial chat (before signup)
 * @auth None (public with rate limit)
 * @rate 5 messages per IP (tracked in memory)
 */

// Request
interface TrialChatRequest {
  message: string;     // Min 1 char, max 500 chars
  sessionId?: string;  // Optional: persist conversation
}

// Response (Success)
interface TrialChatResponse {
  success: true;
  data: {
    response: string;  // AI response text
    messagesLeft: number;  // Remaining trial messages (0-5)
  };
}

// Response (Error)
interface TrialChatError {
  success: false;
  error: {
    code: "RATE_LIMIT" | "INVALID_INPUT" | "API_ERROR";
    message: string;
  };
}
```

### POST /api/provisioning/start
```typescript
/**
 * Start VPS provisioning for authenticated user
 * @auth Required (X OAuth session)
 * @rate 1/day per user
 */

// Request
interface ProvisioningStartRequest {
  // No body (uses session data)
}

// Response (Success)
interface ProvisioningStartResponse {
  success: true;
  data: {
    jobId: string;       // UUID for status polling
    subdomain: string;   // username.clawdet.com
    estimatedTime: number;  // Seconds (typically 420-600)
  };
}

// Response (Error)
interface ProvisioningStartError {
  success: false;
  error: {
    code: "ALREADY_PROVISIONED" | "FREE_BETA_FULL" | "HETZNER_ERROR";
    message: string;
  };
}
```

### GET /api/provisioning/status/:jobId
```typescript
/**
 * Poll provisioning status
 * @auth Required (must own jobId)
 * @rate 60/minute per user (polling endpoint)
 */

// Response (Success - In Progress)
interface ProvisioningStatusInProgress {
  success: true;
  data: {
    status: "queued" | "creating_vps" | "installing" | "configuring";
    progress: number;    // 0-100
    currentStep: string; // Human-readable step
    startedAt: string;   // ISO timestamp
  };
}

// Response (Success - Complete)
interface ProvisioningStatusComplete {
  success: true;
  data: {
    status: "complete";
    progress: 100;
    url: string;         // https://username.clawdet.com
    completedAt: string; // ISO timestamp
  };
}

// Response (Success - Failed)
interface ProvisioningStatusFailed {
  success: true;
  data: {
    status: "failed";
    error: string;       // Error message
    failedAt: string;    // ISO timestamp
  };
}
```

### POST /api/feedback
```typescript
/**
 * Submit user feedback
 * @auth Optional (can be anonymous)
 * @rate 10/hour per IP or user
 */

// Request
interface FeedbackRequest {
  page: string;        // URL or page name
  type: "bug" | "feature" | "general";
  message: string;     // Min 10 chars, max 1000 chars
  email?: string;      // Optional: for follow-up
}

// Response (Success)
interface FeedbackResponse {
  success: true;
  data: {
    id: string;        // Feedback ID (for reference)
  };
}
```

---

## External APIs (Outbound)

### Hetzner Cloud API
```typescript
/**
 * Create VPS instance
 * @endpoint POST https://api.hetzner.cloud/v1/servers
 * @auth Bearer token in header
 * @rate 100/hour per account
 */

// Request
interface HetznerCreateServerRequest {
  name: string;              // Instance name
  server_type: string;       // "cax11" (ARM, €3.29/mo)
  location: string;          // "hel1" (Helsinki)
  image: string;             // "ubuntu-24.04"
  ssh_keys: number[];        // SSH key IDs
  labels?: Record<string, string>;
}

// Response (Success)
interface HetznerCreateServerResponse {
  server: {
    id: number;
    name: string;
    public_net: {
      ipv4: { ip: string };
    };
    created: string;
  };
  action: {
    id: number;
    status: "running";
  };
}
```

### Cloudflare API
```typescript
/**
 * Create DNS A record
 * @endpoint POST https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records
 * @auth Bearer token in header
 * @rate 1200/5min per account
 */

// Request
interface CloudflareCreateDNSRequest {
  type: "A";
  name: string;        // "username.clawdet.com"
  content: string;     // IP address
  ttl: number;         // 120 (2 minutes)
  proxied: boolean;    // true (use Cloudflare proxy)
}

// Response (Success)
interface CloudflareCreateDNSResponse {
  success: true;
  result: {
    id: string;
    name: string;
    content: string;
    proxied: boolean;
  };
}
```

### xAI Grok API
```typescript
/**
 * Chat completion
 * @endpoint POST https://api.x.ai/v1/chat/completions
 * @auth Bearer token in header
 * @rate TBD (check xAI docs)
 */

// Request
interface GrokChatRequest {
  model: "grok-4.2";
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

// Response (Success - Non-streaming)
interface GrokChatResponse {
  choices: Array<{
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop" | "length";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### OpenAI API
```typescript
/**
 * Chat completion
 * @endpoint POST https://api.openai.com/v1/chat/completions
 * @auth Bearer token in header
 * @rate 10,000 RPM (tier dependent)
 */

// Request
interface OpenAIChatRequest {
  model: "gpt-4o" | "o1" | "gpt-4-turbo";
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

// Response (Success)
interface OpenAIChatResponse {
  choices: Array<{
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop" | "length" | "content_filter";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### RentAHuman API
```typescript
/**
 * Request human assistance
 * @endpoint POST https://api.rentahuman.com/v1/tasks
 * @auth Bearer token in header
 * @rate 100/hour per account
 */

// Request
interface RentAHumanRequest {
  task: string;          // Description of what human should do
  urgency: "low" | "normal" | "high";
  context?: string;      // Additional context
  expectedDuration?: number;  // Minutes
}

// Response (Success)
interface RentAHumanResponse {
  taskId: string;
  status: "pending" | "assigned" | "in_progress";
  estimatedCompletion?: string;  // ISO timestamp
}
```

---

## WebSocket Protocol (OpenClaw Gateway)

### Connection Handshake
```typescript
/**
 * WebSocket connection to OpenClaw Gateway
 * @endpoint wss://username.clawdet.com/gateway/
 * @auth Gateway token in connect request
 */

// Client → Server (Connect)
interface GatewayConnectRequest {
  type: "req";
  id: string;          // Unique request ID
  method: "connect";
  params: {
    minProtocol: 3;
    maxProtocol: 3;
    client: {
      id: "openclaw-control-ui";
      version: string;
      platform: string;
      mode: "webchat";
    };
    role: "operator";
    scopes: string[];
    caps: string[];
    auth: {
      token: string;   // Gateway token
    };
    userAgent: string;
    locale: string;
  };
}

// Server → Client (Connect OK)
interface GatewayConnectResponse {
  type: "res";
  id: string;          // Matches request ID
  result: {
    sessionKey: string;
    capabilities: string[];
  };
}

// Server → Client (Error)
interface GatewayConnectError {
  type: "res";
  id: string;
  error: {
    code: number;
    message: string;
  };
}
```

### Chat Message
```typescript
// Client → Server (Send Message)
interface GatewayChatRequest {
  type: "req";
  id: string;
  method: "chat.send";
  params: {
    sessionKey: string;
    message: string;
  };
}

// Server → Client (Message Acknowledgment)
interface GatewayChatAck {
  type: "res";
  id: string;
  result: {
    messageId: string;
  };
}

// Server → Client (AI Response - Streaming)
interface GatewayChatStream {
  type: "event";
  event: "chat.message.delta";
  data: {
    messageId: string;
    delta: string;     // Incremental text
  };
}

// Server → Client (AI Response - Complete)
interface GatewayChatComplete {
  type: "event";
  event: "chat.message.complete";
  data: {
    messageId: string;
    fullText: string;
  };
}
```

---

## Error Codes

### Standard Error Codes (Across All APIs)

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_INPUT` | 400 | Request body validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid auth |
| `FORBIDDEN` | 403 | Valid auth but insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | External API down |

### Domain-Specific Error Codes

| Code | Meaning |
|------|---------|
| `ALREADY_PROVISIONED` | User already has an instance |
| `FREE_BETA_FULL` | All 20 free slots taken |
| `HETZNER_ERROR` | Hetzner API error |
| `CLOUDFLARE_ERROR` | Cloudflare API error |
| `TRIAL_LIMIT` | Used all 5 trial messages |
| `INVALID_SESSION` | Session expired or invalid |
| `GATEWAY_UNREACHABLE` | Cannot connect to user's gateway |

---

## Versioning Strategy

### Current: v1.0 (Implicit)
All APIs are v1.0 with no explicit version in URL.

### Future: Explicit Versioning
When breaking changes are needed:
- New routes: `/api/v2/endpoint`
- Old routes: Keep for 3 months with deprecation warning
- Client header: `X-API-Version: 2` (optional)

### Breaking vs Non-Breaking Changes

**Breaking** (require new version):
- Removing fields from response
- Changing field types
- Renaming fields
- Changing auth requirements
- Removing endpoints

**Non-Breaking** (can deploy without version bump):
- Adding new optional fields
- Adding new endpoints
- Adding new error codes
- Performance improvements
- Bug fixes

---

## Contract Testing (Future)

Add automated contract tests:
```typescript
// Example: Pact/OpenAPI validation
describe('POST /api/trial-chat', () => {
  it('should match contract for success response', async () => {
    const response = await request(app)
      .post('/api/trial-chat')
      .send({ message: 'Hello' });
    
    expect(response.body).toMatchSchema(TrialChatResponse);
  });
});
```

For now: **Manual validation** against this document.

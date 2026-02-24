/**
 * AgentMail Helper — Create/check test email inboxes
 *
 * Uses AgentMail API for disposable test addresses.
 * API key from AGENTMAIL_API_KEY env var.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

function getApiKey(): string {
  if (process.env.AGENTMAIL_API_KEY) return process.env.AGENTMAIL_API_KEY;
  try {
    const envFile = readFileSync(
      resolve(process.env.HOME ?? '~', '.openclaw/workspace/.credentials/agentmail.env'),
      'utf-8'
    );
    const match = envFile.match(/AGENTMAIL_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch { /* not found */ }
  throw new Error('AGENTMAIL_API_KEY not set');
}

const BASE = 'https://api.agentmail.to/v0';

async function apiFetch(path: string, opts: RequestInit = {}): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      ...(opts.headers as Record<string, string> ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AgentMail ${path} ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Create a unique test inbox.
 * Returns the full email address (e.g., alpha-test-1708123456@agentmail.to)
 */
export async function createTestInbox(prefix: string): Promise<string> {
  const username = `${prefix}-${Date.now()}`;
  const data = await apiFetch('/inboxes', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
  return data.address ?? `${username}@agentmail.to`;
}

/**
 * Check inbox for messages.
 */
export async function checkInbox(email: string): Promise<{ messages: any[] }> {
  const username = email.split('@')[0];
  try {
    const data = await apiFetch(`/inboxes/${username}/messages`);
    return { messages: data.messages ?? data ?? [] };
  } catch {
    return { messages: [] };
  }
}

/**
 * Delete test inbox (cleanup).
 */
export async function deleteTestInbox(email: string): Promise<void> {
  const username = email.split('@')[0];
  try {
    await apiFetch(`/inboxes/${username}`, { method: 'DELETE' });
  } catch { /* best-effort */ }
}

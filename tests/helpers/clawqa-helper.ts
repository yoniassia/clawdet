/**
 * ClawQA Helper — Verify auto-created issues on failures
 */

const CLAWQA_URL = process.env.CLAWQA_URL ?? 'https://api.clawqa.ai';
const CLAWQA_TOKEN = process.env.CLAWQA_TOKEN ?? '';

export interface ClawQAIssue {
  id: string;
  flow: string;
  severity: string;
  status: string;
  createdAt: string;
  description: string;
}

export async function checkClawQAIssues(
  flow: string,
  since: Date,
): Promise<ClawQAIssue[]> {
  try {
    const res = await fetch(
      `${CLAWQA_URL}/api/issues?flow=${encodeURIComponent(flow)}&since=${since.toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${CLAWQA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!res.ok) {
      console.warn(`ClawQA API returned ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.issues ?? data ?? [];
  } catch (err) {
    console.warn(`ClawQA check failed: ${err}`);
    return [];
  }
}

export async function createClawQAIssue(
  flow: string,
  description: string,
  severity: 'critical' | 'high' | 'medium' | 'low' = 'high',
): Promise<string | null> {
  try {
    const res = await fetch(`${CLAWQA_URL}/api/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLAWQA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flow, description, severity }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

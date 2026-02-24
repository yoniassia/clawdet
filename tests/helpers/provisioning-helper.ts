/**
 * Provisioning Helper — Provision/deprovision test agents with retry
 */

import type { TenantConfig, ProvisionResult } from '../../scripts/coolify/provision-tenant';

const TEST_MODE = process.env.TEST_MODE ?? 'mock';

export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function provisionTestAgent(
  name: string,
  config?: Partial<TenantConfig>,
): Promise<{ tenantId: string; appUuid: string; url: string; status: string }> {
  const baseDomain = process.env.CLAWDET_DOMAIN ?? 'clawdet.com';

  const tenant: TenantConfig = {
    id: name,
    subdomain: name,
    channels: config?.channels ?? ['web'],
    model: config?.model ?? 'anthropic/claude-sonnet-4-20250514',
    apiKeys: config?.apiKeys ?? {},
    image: config?.image,
    tag: config?.tag,
    memoryLimit: config?.memoryLimit,
  };

  if (TEST_MODE === 'mock') {
    // Use the Coolify client directly (which will hit mock server)
    const { provisionTenant } = await import('../../scripts/coolify/provision-tenant');
    const result = await provisionTenant(tenant);
    return {
      tenantId: result.tenantId,
      appUuid: result.appUuid,
      url: result.url,
      status: result.status,
    };
  }

  // Real mode: call Clawdet API to provision
  const clawdetUrl = process.env.CLAWDET_URL ?? 'https://clawdet.com';
  const res = await fetch(`${clawdetUrl}/api/admin/provision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CLAWDET_ADMIN_TOKEN ?? ''}`,
    },
    body: JSON.stringify(tenant),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Provision failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    tenantId: name,
    appUuid: data.appUuid ?? data.uuid,
    url: data.url ?? `https://${name}.${baseDomain}`,
    status: data.status ?? 'provisioned',
  };
}

export async function deprovisionTestAgent(appUuid: string): Promise<void> {
  if (TEST_MODE === 'mock') {
    const { deprovisionTenant } = await import('../../scripts/coolify/deprovision-tenant');
    await deprovisionTenant('test', appUuid);
    return;
  }

  const clawdetUrl = process.env.CLAWDET_URL ?? 'https://clawdet.com';
  const res = await fetch(`${clawdetUrl}/api/admin/deprovision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CLAWDET_ADMIN_TOKEN ?? ''}`,
    },
    body: JSON.stringify({ appUuid }),
  });

  if (!res.ok) {
    console.warn(`Deprovision warning (${res.status}): ${await res.text()}`);
  }
}

export async function waitForHealthy(
  url: string,
  timeoutMs = 60_000,
): Promise<{ status: number; timeMs: number }> {
  const start = Date.now();
  const interval = 3_000;

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      if (res.status === 200) {
        return { status: 200, timeMs: Date.now() - start };
      }
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error(`Health check timeout after ${timeoutMs}ms for ${url}`);
}

/**
 * Provisioning Helper — Provision/deprovision test agents with retry
 */

interface TenantConfig {
  id: string;
  subdomain: string;
  channels: string[];
  model: string;
  apiKeys: Record<string, string>;
  image?: string;
  tag?: string;
  memoryLimit?: string;
}

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
    // Inline Coolify API calls (avoid ESM import issues)
    const coolifyBase = (process.env.COOLIFY_BASE_URL ?? 'http://localhost:19876').replace(/\/$/, '');
    const apiUrl = `${coolifyBase}/api/v1`;
    const headers = {
      'Authorization': `Bearer ${process.env.COOLIFY_API_TOKEN ?? 'mock-token'}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const baseDomainVal = process.env.CLAWDET_DOMAIN ?? 'clawdet.com';
    const fqdn = `https://${tenant.subdomain}.${baseDomainVal}`;
    const image = tenant.image ?? 'openclaw/openclaw';
    const tag = tenant.tag ?? 'latest';

    // 1. Create Docker image application
    const createRes = await fetch(`${apiUrl}/applications/dockerimage`, {
      method: 'POST', headers,
      body: JSON.stringify({
        server_uuid: process.env.COOLIFY_SERVER_UUID ?? 'mock-server',
        project_uuid: process.env.COOLIFY_PROJECT_UUID ?? 'mock-project',
        environment_name: 'production',
        docker_registry_image_name: image,
        docker_registry_image_tag: tag,
        name: `openclaw-${tenant.id}`,
        description: `Clawdet tenant: ${tenant.id}`,
        domains: fqdn,
        instant_deploy: false,
      }),
    });
    if (!createRes.ok) throw new Error(`Coolify create failed: ${createRes.status}`);
    const app = await createRes.json();

    // 2. Set env vars
    const envVars = [
      { key: 'OPENCLAW_TENANT_ID', value: tenant.id },
      { key: 'OPENCLAW_MODEL', value: tenant.model },
      { key: 'OPENCLAW_CHANNELS', value: tenant.channels.join(',') },
    ];
    await fetch(`${apiUrl}/applications/${app.uuid}/envs/bulk`, {
      method: 'PATCH', headers, body: JSON.stringify(envVars),
    });

    // 3. Configure
    await fetch(`${apiUrl}/applications/${app.uuid}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({
        health_check_enabled: true, health_check_path: '/health',
        health_check_interval: 30, limits_memory: tenant.memoryLimit ?? '512m',
      }),
    });

    // 4. Deploy
    await fetch(`${apiUrl}/applications/${app.uuid}/start`, { method: 'POST', headers });

    return {
      tenantId: tenant.id,
      appUuid: app.uuid,
      url: fqdn,
      status: 'provisioned',
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
    // Inline Coolify API calls (avoid ESM import issues)
    const coolifyBase = (process.env.COOLIFY_BASE_URL ?? 'http://localhost:19876').replace(/\/$/, '');
    const apiUrl = `${coolifyBase}/api/v1`;
    const headers = {
      'Authorization': `Bearer ${process.env.COOLIFY_API_TOKEN ?? 'mock-token'}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    // Stop then delete
    await fetch(`${apiUrl}/applications/${appUuid}/stop`, { method: 'POST', headers });
    await fetch(`${apiUrl}/applications/${appUuid}`, { method: 'DELETE', headers });
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

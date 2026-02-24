/**
 * Tenant Provisioning via Coolify
 *
 * Called by Clawdet when a new user signs up.
 * Creates a Docker image application in Coolify with the tenant's config.
 *
 * Required env vars:
 *   COOLIFY_BASE_URL    — Coolify instance URL
 *   COOLIFY_API_TOKEN   — API token with write+deploy permissions
 *   COOLIFY_SERVER_UUID — Target server UUID in Coolify
 *   COOLIFY_PROJECT_UUID — Project UUID for all tenants
 *   CLAWDET_DOMAIN      — Base domain (default: clawdet.com)
 */

import { CoolifyClient, type EnvVar } from "./coolify-client.js";

export interface TenantConfig {
  id: string;
  subdomain: string;
  channels: string[]; // whatsapp, telegram, discord, etc.
  model: string; // e.g. "anthropic/claude-sonnet-4-20250514"
  apiKeys: Record<string, string>;
  /** Optional: override Docker image (default: openclaw/openclaw:latest) */
  image?: string;
  /** Optional: override image tag */
  tag?: string;
  /** Optional: memory limit e.g. "512m" */
  memoryLimit?: string;
}

export interface ProvisionResult {
  tenantId: string;
  appUuid: string;
  url: string;
  status: "provisioned" | "failed";
  error?: string;
}

function buildEnvVars(tenant: TenantConfig): EnvVar[] {
  const envs: EnvVar[] = [
    { key: "OPENCLAW_TENANT_ID", value: tenant.id },
    { key: "OPENCLAW_MODEL", value: tenant.model },
    { key: "OPENCLAW_CHANNELS", value: tenant.channels.join(",") },
  ];

  // Map API keys
  for (const [key, value] of Object.entries(tenant.apiKeys)) {
    envs.push({
      key: `OPENCLAW_${key.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
      value,
      is_literal: true, // don't interpolate
    });
  }

  return envs;
}

export async function provisionTenant(tenant: TenantConfig): Promise<ProvisionResult> {
  const coolify = new CoolifyClient({
    baseUrl: process.env.COOLIFY_BASE_URL!,
    token: process.env.COOLIFY_API_TOKEN!,
  });

  const serverUuid = process.env.COOLIFY_SERVER_UUID!;
  const projectUuid = process.env.COOLIFY_PROJECT_UUID!;
  const baseDomain = process.env.CLAWDET_DOMAIN ?? "clawdet.com";
  const fqdn = `https://${tenant.subdomain}.${baseDomain}`;
  const image = tenant.image ?? "openclaw/openclaw";
  const tag = tenant.tag ?? "latest";

  console.log(`[provision] Creating tenant ${tenant.id} → ${fqdn}`);

  try {
    // 1. Create Docker image application
    const app = await coolify.createDockerImageApp({
      server_uuid: serverUuid,
      project_uuid: projectUuid,
      environment_name: "production",
      docker_registry_image_name: image,
      docker_registry_image_tag: tag,
      name: `openclaw-${tenant.id}`,
      description: `Clawdet tenant: ${tenant.id} (${tenant.channels.join(", ")})`,
      domains: fqdn,
      instant_deploy: false, // deploy after env vars are set
    });

    console.log(`[provision] App created: ${app.uuid}`);

    // 2. Set environment variables
    const envVars = buildEnvVars(tenant);
    await coolify.bulkUpdateEnvVars(app.uuid, envVars);
    console.log(`[provision] Set ${envVars.length} env vars`);

    // 3. Configure health check and limits
    await coolify.updateApplication(app.uuid, {
      health_check_enabled: true,
      health_check_path: "/health",
      health_check_interval: 30,
      limits_memory: tenant.memoryLimit ?? "512m",
    });

    // 4. Deploy
    await coolify.startApplication(app.uuid);
    console.log(`[provision] Deployment triggered for ${app.uuid}`);

    return {
      tenantId: tenant.id,
      appUuid: app.uuid,
      url: fqdn,
      status: "provisioned",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[provision] Failed for tenant ${tenant.id}: ${message}`);
    return {
      tenantId: tenant.id,
      appUuid: "",
      url: fqdn,
      status: "failed",
      error: message,
    };
  }
}

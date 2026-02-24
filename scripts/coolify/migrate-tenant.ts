/**
 * Tenant Migration — Move a tenant between Coolify servers
 *
 * Strategy: provision on target server → verify health → deprovision from source.
 * Zero-downtime via DNS switch after target is healthy.
 */

import { CoolifyClient } from "./coolify-client.js";
import { provisionTenant, type TenantConfig, type ProvisionResult } from "./provision-tenant.js";
import { deprovisionTenant } from "./deprovision-tenant.js";

export interface MigrateResult {
  tenantId: string;
  sourceAppUuid: string;
  targetAppUuid: string;
  status: "migrated" | "failed" | "rollback";
  error?: string;
}

/**
 * Migrate a tenant from one server to another.
 *
 * @param tenant       - Full tenant config (used to re-provision)
 * @param sourceAppUuid - Current Coolify app UUID
 * @param targetServerUuid - Destination server UUID in Coolify
 * @param healthCheckRetries - How many times to poll health (default 20, ~60s)
 */
export async function migrateTenant(
  tenant: TenantConfig,
  sourceAppUuid: string,
  targetServerUuid: string,
  healthCheckRetries = 20,
): Promise<MigrateResult> {
  const coolify = new CoolifyClient({
    baseUrl: process.env.COOLIFY_BASE_URL!,
    token: process.env.COOLIFY_API_TOKEN!,
  });

  console.log(`[migrate] Starting migration for tenant ${tenant.id} → server ${targetServerUuid}`);

  let targetResult: ProvisionResult | null = null;

  try {
    // 1. Override server UUID for provisioning on target
    const origServer = process.env.COOLIFY_SERVER_UUID;
    process.env.COOLIFY_SERVER_UUID = targetServerUuid;

    // Use a temporary subdomain to avoid DNS conflicts
    const tempTenant = { ...tenant, subdomain: `${tenant.subdomain}-migration` };
    targetResult = await provisionTenant(tempTenant);
    process.env.COOLIFY_SERVER_UUID = origServer;

    if (targetResult.status === "failed") {
      throw new Error(`Target provisioning failed: ${targetResult.error}`);
    }

    // 2. Wait for target to be healthy
    console.log(`[migrate] Waiting for target ${targetResult.appUuid} to be healthy...`);
    let healthy = false;
    for (let i = 0; i < healthCheckRetries; i++) {
      await new Promise((r) => setTimeout(r, 3_000));
      try {
        const app = await coolify.getApplication(targetResult.appUuid);
        if (app.status === "running") {
          healthy = true;
          break;
        }
        console.log(`[migrate] Health check ${i + 1}/${healthCheckRetries}: ${app.status}`);
      } catch {
        console.log(`[migrate] Health check ${i + 1}/${healthCheckRetries}: not ready`);
      }
    }

    if (!healthy) {
      throw new Error("Target application did not become healthy in time");
    }

    // 3. Switch domain to target
    await coolify.updateApplication(targetResult.appUuid, {
      domains: `https://${tenant.subdomain}.${process.env.CLAWDET_DOMAIN ?? "clawdet.com"}`,
    });
    console.log(`[migrate] Domain switched to target`);

    // 4. Deprovision source
    await deprovisionTenant(tenant.id, sourceAppUuid);
    console.log(`[migrate] Source deprovisioned`);

    return {
      tenantId: tenant.id,
      sourceAppUuid,
      targetAppUuid: targetResult.appUuid,
      status: "migrated",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[migrate] Failed: ${message}`);

    // Rollback: clean up target if it was provisioned
    if (targetResult?.appUuid) {
      console.log(`[migrate] Rolling back — removing target ${targetResult.appUuid}`);
      try {
        await deprovisionTenant(tenant.id, targetResult.appUuid);
      } catch (rollbackErr) {
        console.error(`[migrate] Rollback also failed: ${rollbackErr}`);
      }
    }

    return {
      tenantId: tenant.id,
      sourceAppUuid,
      targetAppUuid: targetResult?.appUuid ?? "",
      status: "rollback",
      error: message,
    };
  }
}

/**
 * Tenant Deprovisioning — Clean teardown of a Clawdet tenant
 *
 * Stops the application, removes env vars, then deletes it from Coolify.
 */

import { CoolifyClient } from "./coolify-client.js";

export interface DeprovisionResult {
  tenantId: string;
  appUuid: string;
  status: "deprovisioned" | "failed";
  error?: string;
}

export async function deprovisionTenant(
  tenantId: string,
  appUuid: string,
): Promise<DeprovisionResult> {
  const coolify = new CoolifyClient({
    baseUrl: process.env.COOLIFY_BASE_URL!,
    token: process.env.COOLIFY_API_TOKEN!,
  });

  console.log(`[deprovision] Tearing down tenant ${tenantId} (app ${appUuid})`);

  try {
    // 1. Stop the application gracefully
    try {
      await coolify.stopApplication(appUuid);
      console.log(`[deprovision] Stopped ${appUuid}`);
      // Brief wait for graceful shutdown
      await new Promise((r) => setTimeout(r, 5_000));
    } catch (err) {
      // May already be stopped — continue
      console.warn(`[deprovision] Stop failed (may already be stopped): ${err}`);
    }

    // 2. Delete the application (removes container + volumes)
    await coolify.deleteApplication(appUuid);
    console.log(`[deprovision] Deleted ${appUuid}`);

    return {
      tenantId,
      appUuid,
      status: "deprovisioned",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[deprovision] Failed for tenant ${tenantId}: ${message}`);
    return {
      tenantId,
      appUuid,
      status: "failed",
      error: message,
    };
  }
}

/**
 * Health Check — Monitor all Clawdet tenants via Coolify
 *
 * Polls all applications in the Coolify project and reports status.
 * Can be run as a cron job or called on-demand.
 *
 * Required env vars:
 *   COOLIFY_BASE_URL, COOLIFY_API_TOKEN
 *   HEALTH_WEBHOOK_URL (optional) — POST alerts here
 */

import { CoolifyClient, type ApplicationResponse } from "./coolify-client.js";

export interface TenantHealth {
  appUuid: string;
  name: string;
  fqdn: string;
  status: string;
  healthy: boolean;
  httpStatus?: number;
  responseTimeMs?: number;
  error?: string;
}

export interface HealthReport {
  timestamp: string;
  totalTenants: number;
  healthy: number;
  unhealthy: number;
  tenants: TenantHealth[];
}

async function checkHttpHealth(url: string, timeoutMs = 10_000): Promise<{ status: number; timeMs: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${url}/health`, { signal: controller.signal });
    return { status: res.status, timeMs: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkAllTenants(): Promise<HealthReport> {
  const coolify = new CoolifyClient({
    baseUrl: process.env.COOLIFY_BASE_URL!,
    token: process.env.COOLIFY_API_TOKEN!,
  });

  const apps = await coolify.listApplications();
  // Filter to only openclaw tenant apps
  const tenantApps = apps.filter((a) => a.name?.startsWith("openclaw-"));

  const tenants: TenantHealth[] = await Promise.all(
    tenantApps.map(async (app): Promise<TenantHealth> => {
      const base: TenantHealth = {
        appUuid: app.uuid,
        name: app.name,
        fqdn: app.fqdn ?? "",
        status: app.status ?? "unknown",
        healthy: false,
      };

      // Check Coolify status
      if (app.status !== "running") {
        base.error = `Coolify status: ${app.status}`;
        return base;
      }

      // Check HTTP health endpoint
      if (app.fqdn) {
        try {
          const { status, timeMs } = await checkHttpHealth(app.fqdn);
          base.httpStatus = status;
          base.responseTimeMs = timeMs;
          base.healthy = status >= 200 && status < 300;
          if (!base.healthy) {
            base.error = `HTTP ${status}`;
          }
        } catch (err) {
          base.error = `HTTP check failed: ${err instanceof Error ? err.message : err}`;
        }
      } else {
        base.error = "No FQDN configured";
      }

      return base;
    }),
  );

  const report: HealthReport = {
    timestamp: new Date().toISOString(),
    totalTenants: tenants.length,
    healthy: tenants.filter((t) => t.healthy).length,
    unhealthy: tenants.filter((t) => !t.healthy).length,
    tenants,
  };

  // Alert on unhealthy tenants
  if (report.unhealthy > 0 && process.env.HEALTH_WEBHOOK_URL) {
    const unhealthyList = tenants.filter((t) => !t.healthy);
    try {
      await fetch(process.env.HEALTH_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `⚠️ ${report.unhealthy} unhealthy tenant(s): ${unhealthyList.map((t) => `${t.name} (${t.error})`).join(", ")}`,
          ...report,
        }),
      });
    } catch (err) {
      console.error(`[health] Failed to send webhook: ${err}`);
    }
  }

  console.log(
    `[health] ${report.healthy}/${report.totalTenants} healthy | ${report.unhealthy} unhealthy`,
  );

  return report;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAllTenants()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

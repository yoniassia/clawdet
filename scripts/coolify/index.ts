/**
 * Clawdet ↔ Coolify Integration
 *
 * Main entry point — re-exports all modules.
 *
 * Env vars needed:
 *   COOLIFY_BASE_URL      — e.g. http://135.181.43.68:8000
 *   COOLIFY_API_TOKEN     — Bearer token (Settings > API)
 *   COOLIFY_SERVER_UUID   — Target server UUID
 *   COOLIFY_PROJECT_UUID  — Project UUID for tenants
 *   CLAWDET_DOMAIN        — Base domain (default: clawdet.com)
 *   HEALTH_WEBHOOK_URL    — Optional: webhook for health alerts
 */

export { CoolifyClient } from "./coolify-client.js";
export { provisionTenant, type TenantConfig, type ProvisionResult } from "./provision-tenant.js";
export { deprovisionTenant, type DeprovisionResult } from "./deprovision-tenant.js";
export { migrateTenant, type MigrateResult } from "./migrate-tenant.js";
export { checkAllTenants, type HealthReport, type TenantHealth } from "./health-check.js";

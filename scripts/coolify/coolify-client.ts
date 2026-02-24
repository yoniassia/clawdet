/**
 * Coolify API v1 Client
 *
 * Wraps the Coolify REST API for programmatic server/application management.
 * Based on: https://github.com/coollabsio/coolify/blob/main/routes/api.php
 *
 * Required env vars:
 *   COOLIFY_BASE_URL  — e.g. http://135.181.43.68:8000
 *   COOLIFY_API_TOKEN — Bearer token from Settings > API
 */

export interface CoolifyClientConfig {
  baseUrl: string;
  token: string;
  /** Max retries on 5xx / network errors (default 3) */
  maxRetries?: number;
  /** Request timeout in ms (default 30000) */
  timeoutMs?: number;
}

export interface CreateDockerImageApp {
  server_uuid: string;
  project_uuid: string;
  environment_name?: string; // default "production"
  docker_registry_image_name: string;
  docker_registry_image_tag?: string;
  name?: string;
  description?: string;
  domains?: string;
  ports_mappings?: string; // e.g. "8080:80"
  instant_deploy?: boolean;
}

export interface EnvVar {
  key: string;
  value: string;
  is_preview?: boolean;
  is_build_time?: boolean;
  is_literal?: boolean;
}

export interface ApplicationResponse {
  uuid: string;
  name: string;
  fqdn?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ServerResponse {
  uuid: string;
  name: string;
  ip: string;
  [key: string]: unknown;
}

export interface ProjectResponse {
  uuid: string;
  name: string;
  [key: string]: unknown;
}

export interface DeployResponse {
  message: string;
  deployment_uuid?: string;
  [key: string]: unknown;
}

class CoolifyApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    public endpoint: string,
  ) {
    super(`Coolify API ${endpoint} returned ${status}: ${JSON.stringify(body)}`);
    this.name = "CoolifyApiError";
  }
}

export class CoolifyClient {
  private baseUrl: string;
  private token: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(config: CoolifyClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.token = config.token;
    this.maxRetries = config.maxRetries ?? 3;
    this.timeoutMs = config.timeoutMs ?? 30_000;
  }

  // ── Core HTTP ─────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    attempt = 1,
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status >= 500 && attempt < this.maxRetries) {
          const delay = Math.min(1000 * 2 ** (attempt - 1), 10_000);
          console.warn(`[coolify] ${method} ${path} → ${res.status}, retry ${attempt}/${this.maxRetries} in ${delay}ms`);
          await new Promise((r) => setTimeout(r, delay));
          return this.request<T>(method, path, body, attempt + 1);
        }
        throw new CoolifyApiError(res.status, json, `${method} ${path}`);
      }

      return json as T;
    } catch (err) {
      if ((err as Error).name === "AbortError" && attempt < this.maxRetries) {
        console.warn(`[coolify] ${method} ${path} timeout, retry ${attempt}/${this.maxRetries}`);
        return this.request<T>(method, path, body, attempt + 1);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private get<T>(path: string) {
    return this.request<T>("GET", path);
  }
  private post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }
  private patch<T>(path: string, body: unknown) {
    return this.request<T>("PATCH", path, body);
  }
  private del<T>(path: string) {
    return this.request<T>("DELETE", path);
  }

  // ── Servers ───────────────────────────────────────────────

  async listServers(): Promise<ServerResponse[]> {
    return this.get("/servers");
  }

  async getServer(uuid: string): Promise<ServerResponse> {
    return this.get(`/servers/${uuid}`);
  }

  async getServerResources(uuid: string) {
    return this.get(`/servers/${uuid}/resources`);
  }

  async getServerDomains(uuid: string) {
    return this.get(`/servers/${uuid}/domains`);
  }

  async validateServer(uuid: string) {
    return this.get(`/servers/${uuid}/validate`);
  }

  // ── Projects ──────────────────────────────────────────────

  async listProjects(): Promise<ProjectResponse[]> {
    return this.get("/projects");
  }

  async getProject(uuid: string): Promise<ProjectResponse> {
    return this.get(`/projects/${uuid}`);
  }

  async createProject(name: string, description?: string): Promise<ProjectResponse> {
    return this.post("/projects", { name, description });
  }

  async deleteProject(uuid: string) {
    return this.del(`/projects/${uuid}`);
  }

  async createEnvironment(projectUuid: string, name: string) {
    return this.post(`/projects/${projectUuid}/environments`, { name });
  }

  // ── Applications ──────────────────────────────────────────

  async listApplications(): Promise<ApplicationResponse[]> {
    return this.get("/applications");
  }

  async getApplication(uuid: string): Promise<ApplicationResponse> {
    return this.get(`/applications/${uuid}`);
  }

  /**
   * Create a Docker image-based application.
   * This is the primary method for Clawdet tenant provisioning.
   */
  async createDockerImageApp(config: CreateDockerImageApp): Promise<ApplicationResponse> {
    return this.post("/applications/dockerimage", config);
  }

  async updateApplication(uuid: string, updates: Record<string, unknown>): Promise<ApplicationResponse> {
    return this.patch(`/applications/${uuid}`, updates);
  }

  async deleteApplication(uuid: string) {
    return this.del(`/applications/${uuid}`);
  }

  // ── Application Environment Variables ─────────────────────

  async getEnvVars(appUuid: string): Promise<EnvVar[]> {
    return this.get(`/applications/${appUuid}/envs`);
  }

  async createEnvVar(appUuid: string, env: EnvVar) {
    return this.post(`/applications/${appUuid}/envs`, env);
  }

  async bulkUpdateEnvVars(appUuid: string, envs: EnvVar[]) {
    return this.patch(`/applications/${appUuid}/envs/bulk`, envs);
  }

  async deleteEnvVar(appUuid: string, envUuid: string) {
    return this.del(`/applications/${appUuid}/envs/${envUuid}`);
  }

  // ── Application Lifecycle ─────────────────────────────────

  async startApplication(uuid: string): Promise<DeployResponse> {
    return this.post(`/applications/${uuid}/start`);
  }

  async stopApplication(uuid: string): Promise<DeployResponse> {
    return this.post(`/applications/${uuid}/stop`);
  }

  async restartApplication(uuid: string): Promise<DeployResponse> {
    return this.post(`/applications/${uuid}/restart`);
  }

  async getApplicationLogs(uuid: string): Promise<unknown> {
    return this.get(`/applications/${uuid}/logs`);
  }

  // ── Deployments ───────────────────────────────────────────

  async deploy(params: { uuid?: string; tag?: string; force?: boolean }): Promise<DeployResponse> {
    return this.post("/deploy", params);
  }

  async listDeployments() {
    return this.get("/deployments");
  }

  async getDeployment(uuid: string) {
    return this.get(`/deployments/${uuid}`);
  }

  async cancelDeployment(uuid: string) {
    return this.post(`/deployments/${uuid}/cancel`);
  }

  // ── Services ──────────────────────────────────────────────

  async listServices() {
    return this.get("/services");
  }

  async createService(config: Record<string, unknown>) {
    return this.post("/services", config);
  }

  async getService(uuid: string) {
    return this.get(`/services/${uuid}`);
  }

  async deleteService(uuid: string) {
    return this.del(`/services/${uuid}`);
  }

  // ── Health ────────────────────────────────────────────────

  async health(): Promise<{ status: string }> {
    return this.get("/health");
  }

  async version(): Promise<{ version: string }> {
    return this.get("/version");
  }
}

/**
 * Mock Coolify API Server
 *
 * Intercepts HTTP calls to Coolify for CI/local testing.
 * Tracks all calls for assertions.
 */

import http from 'http';
import { randomUUID } from 'crypto';

interface RecordedCall {
  method: string;
  path: string;
  body: any;
  timestamp: Date;
}

type FailMode = 'all-500' | 'timeout' | null;

export class MockCoolifyServer {
  private server: http.Server | null = null;
  private calls: RecordedCall[] = [];
  private apps: Map<string, any> = new Map();
  private failMode: FailMode = null;

  async start(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer(async (req, res) => {
        // Collect body
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const bodyStr = Buffer.concat(chunks).toString();
        let body: any = {};
        try { body = JSON.parse(bodyStr); } catch { /* not JSON */ }

        const call: RecordedCall = {
          method: req.method ?? 'GET',
          path: req.url ?? '/',
          body,
          timestamp: new Date(),
        };
        this.calls.push(call);

        // Fail modes
        if (this.failMode === 'all-500') {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Mock failure' }));
          return;
        }
        if (this.failMode === 'timeout') {
          // Just hang — let client timeout
          return;
        }

        this.handleRequest(req.method ?? 'GET', req.url ?? '/', body, res);
      });

      this.server.listen(port, () => resolve());
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) this.server.close(() => resolve());
      else resolve();
    });
  }

  setFailMode(mode: FailMode): void {
    this.failMode = mode;
  }

  getCalls(method?: string, pathPrefix?: string): RecordedCall[] {
    return this.calls.filter((c) => {
      if (method && c.method !== method) return false;
      if (pathPrefix && !c.path.startsWith(pathPrefix)) return false;
      return true;
    });
  }

  clearCalls(): void {
    this.calls = [];
  }

  private handleRequest(method: string, path: string, body: any, res: http.ServerResponse): void {
    const json = (data: any, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    // POST /api/v1/applications/dockerimage — Create app
    if (method === 'POST' && path.includes('/applications/dockerimage')) {
      const uuid = randomUUID();
      const app = {
        uuid,
        name: body.name ?? `openclaw-${uuid.slice(0, 8)}`,
        fqdn: body.domains ?? `https://test-${uuid.slice(0, 8)}.clawdet.com`,
        status: 'running',
        docker_registry_image_name: body.docker_registry_image_name,
        docker_registry_image_tag: body.docker_registry_image_tag ?? 'latest',
      };
      this.apps.set(uuid, app);
      return json({ uuid, ...app }, 201);
    }

    // GET /api/v1/applications — List all
    if (method === 'GET' && path === '/api/v1/applications') {
      return json(Array.from(this.apps.values()));
    }

    // Match /api/v1/applications/{uuid}/*
    const appMatch = path.match(/\/api\/v1\/applications\/([^/]+)(\/(.*))?/);
    if (appMatch) {
      const uuid = appMatch[1];
      const action = appMatch[3] ?? '';
      const app = this.apps.get(uuid);

      if (!app && method !== 'POST') {
        return json({ error: 'Not found' }, 404);
      }

      // PATCH /applications/{uuid} — Update
      if (method === 'PATCH' && !action) {
        Object.assign(app, body);
        return json(app);
      }

      // PATCH /applications/{uuid}/envs/bulk — Set env vars
      if (method === 'PATCH' && action === 'envs/bulk') {
        app.envs = body;
        return json({ message: 'ok' });
      }

      // POST /applications/{uuid}/start
      if (method === 'POST' && action === 'start') {
        app.status = 'running';
        return json({ message: 'Deployment started', deployment_uuid: randomUUID() });
      }

      // POST /applications/{uuid}/stop
      if (method === 'POST' && action === 'stop') {
        app.status = 'stopped';
        return json({ message: 'Stopped' });
      }

      // POST /applications/{uuid}/restart
      if (method === 'POST' && action === 'restart') {
        app.status = 'running';
        return json({ message: 'Restarted', deployment_uuid: randomUUID() });
      }

      // GET /applications/{uuid}/logs
      if (method === 'GET' && action === 'logs') {
        return json([
          { timestamp: new Date().toISOString(), message: 'Mock log entry' },
        ]);
      }

      // DELETE /applications/{uuid}
      if (method === 'DELETE' && !action) {
        this.apps.delete(uuid);
        return json({ message: 'Deleted' });
      }

      // GET /applications/{uuid}
      if (method === 'GET' && !action) {
        return json(app);
      }
    }

    // GET /api/v1/servers
    if (method === 'GET' && path.includes('/servers')) {
      return json([
        { uuid: 'server-primary', name: 'Primary', ip: '135.181.43.68' },
        { uuid: 'server-overflow', name: 'Overflow', ip: '188.34.197.212' },
      ]);
    }

    // GET /api/v1/health
    if (method === 'GET' && path.includes('/health')) {
      return json({ status: 'ok' });
    }

    // GET /api/v1/version
    if (method === 'GET' && path.includes('/version')) {
      return json({ version: '4.0.0-mock' });
    }

    // POST /api/v1/deploy
    if (method === 'POST' && path.includes('/deploy')) {
      return json({ message: 'Deployment queued', deployment_uuid: randomUUID() });
    }

    // Fallback
    json({ error: 'Not found' }, 404);
  }
}

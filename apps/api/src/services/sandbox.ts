import Docker from 'dockerode';
import { config } from '../config.js';

export interface SandboxOptions {
  image?: string;
  command?: string[];
  env?: Record<string, string>;
  workdir?: string;
  timeout?: number;
}

export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export class DockerSandbox {
  private docker: Docker;
  private image: string;

  constructor() {
    this.docker = new Docker();
    this.image = config.SANDBOX_IMAGE || 'open-chain-ai/agent-sandbox:latest';
  }

  async execute(
    code: string,
    options: SandboxOptions = {}
  ): Promise<SandboxResult> {
    const container = await this.docker.createContainer({
      Image: options.image || this.image,
      Cmd: options.command || ['sh', '-c', code],
      Env: this.buildEnv(options.env),
      WorkingDir: options.workdir || '/work',
      HostConfig: {
        // ⚠️ SECURITY: Resource Limits
        Memory: this.parseMemory(config.SANDBOX_MEMORY_LIMIT),
        CpuQuota: this.parseCpu(config.SANDBOX_CPU_LIMIT),
        // ⚠️ SECURITY: Read-Only Filesystem
        ReadonlyRootfs: true,
        // ⚠️ SECURITY: Network Isolation
        NetworkMode: 'none',
        // ⚠️ SECURITY: No Privileged Mode
        Privileged: false,
        // ⚠️ SECURITY: Drop All Capabilities
        CapDrop: ['ALL'],
        // ⚠️ SECURITY: Tmpfs for writable areas
        Tmpfs: {
          '/work': 'rw,noexec,nosuid,size=100m',
          '/tmp': 'rw,noexec,nosuid,size=50m',
        },
        // ⚠️ SECURITY: Auto-remove on stop
        AutoRemove: false, // We handle cleanup manually for logging
      },
      // ⚠️ SECURITY: Non-root user
      User: '1000:1000',
      // Label for cleanup
      Labels: {
        'open-chain-ai': 'true',
        'open-chain-ai-task': 'true',
        'open-chain-ai-created': new Date().toISOString(),
      },
    });

    const startTime = Date.now();

    try {
      await container.start();

      // Wait for completion with timeout
      const timeout = options.timeout || 300000; // 5 minutes default
      const result = await this.waitForContainer(container, timeout);

      const duration = Date.now() - startTime;

      // Get logs
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        follow: false,
      });

      const { stdout, stderr } = this.parseLogs(logs);

      return {
        stdout,
        stderr,
        exitCode: result.StatusCode || 0,
        duration,
      };
    } finally {
      // ⚠️ CRITICAL: Always cleanup container
      await this.destroyContainer(container);
    }
  }

  private async waitForContainer(
    container: Docker.Container,
    timeout: number
  ): Promise<{ StatusCode?: number }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Sandbox timeout after ${timeout}ms`));
      }, timeout);

      container.wait()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private async destroyContainer(container: Docker.Container): Promise<void> {
    try {
      // Force kill if still running
      await container.kill().catch(() => {});
    } catch {
      // Container might already be stopped
    }

    try {
      // Remove container and volumes
      await container.remove({ force: true, v: true });
    } catch {
      // Container might already be removed
    }
  }

  private buildEnv(env?: Record<string, string>): string[] {
    const baseEnv = [
      'NODE_ENV=production',
      'HOME=/tmp',
      'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    ];

    if (env) {
      const customEnv = Object.entries(env).map(
        ([key, value]) => `${key}=${value}`
      );
      return [...baseEnv, ...customEnv];
    }

    return baseEnv;
  }

  private parseMemory(limit: string): number {
    // Parse '512m' to bytes
    const match = limit.match(/^(\d+)([mg])$/i);
    if (!match) return 512 * 1024 * 1024; // Default 512MB

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === 'g') return value * 1024 * 1024 * 1024;
    if (unit === 'm') return value * 1024 * 1024;

    return value * 1024 * 1024;
  }

  private parseCpu(limit: string): number {
    // Parse '1' to CPU quota (100000 = 1 CPU)
    const value = parseFloat(limit);
    return Math.round(value * 100000);
  }

  private parseLogs(logs: Buffer): { stdout: string; stderr: string } {
    // Docker logs are prefixed with 8-byte headers
    let stdout = '';
    let stderr = '';

    let offset = 0;
    while (offset < logs.length) {
      const type = logs[offset];
      const length = logs.readUInt32BE(offset + 4);
      const message = logs.slice(offset + 8, offset + 8 + length).toString('utf8');

      if (type === 1) {
        stdout += message;
      } else if (type === 2) {
        stderr += message;
      }

      offset += 8 + length;
    }

    return { stdout, stderr };
  }

  // ⚠️ CRITICAL: Cleanup zombie containers
  async cleanupZombies(): Promise<void> {
    const containers = await this.docker.listContainers({
      all: true,
      filters: JSON.stringify({
        label: ['open-chain-ai=true'],
      }),
    });

    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const containerInfo of containers) {
      try {
        const created = new Date(containerInfo.Created).getTime();
        const age = now - created;

        if (age > maxAge) {
          const container = this.docker.getContainer(containerInfo.Id);
          await container.remove({ force: true, v: true });
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

// Singleton
export const sandbox = new DockerSandbox();

import Docker from 'dockerode';
import { config } from '../config.js';

export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

class DockerSandbox {
  private docker: Docker;
  private imageName: string;

  constructor() {
    // Check if Docker is available
    try {
      this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
      this.imageName = config.SANDBOX_IMAGE;
    } catch {
      console.warn('⚠️ Docker not available - sandbox will use mock mode');
      this.docker = null as any;
      this.imageName = 'mock';
    }
  }

  async execute(code: string, options: { timeout?: number } = {}): Promise<SandboxResult> {
    const timeout = options.timeout || 30000;
    const startTime = Date.now();

    // If Docker is not available, return mock result
    if (!this.docker) {
      return {
        stdout: `Mock execution: ${code.substring(0, 100)}...`,
        stderr: '',
        exitCode: 0,
        duration: 100,
      };
    }

    try {
      // Create container with security constraints
      const container = await this.docker.createContainer({
        Image: this.imageName,
        Cmd: ['node', '-e', code],
        HostConfig: {
          Memory: parseInt(config.SANDBOX_MEMORY_LIMIT) * 1024 * 1024,
          CpuQuota: parseInt(config.SANDBOX_CPU_LIMIT) * 100000,
          NetworkMode: 'none',
          ReadonlyRootfs: true,
          AutoRemove: true,
        },
      });

      await container.start();

      // Wait with timeout
      const timer = setTimeout(async () => {
        try {
          await container.kill();
        } catch {
          // Ignore
        }
      }, timeout);

      const result = await container.wait();
      clearTimeout(timer);

      // Get logs
      const logs = await container.logs({ stdout: true, stderr: true });
      const stdout = logs.toString();

      return {
        stdout,
        stderr: '',
        exitCode: result.StatusCode || 0,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        stdout: '',
        stderr: `Sandbox error: ${error.message}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      };
    }
  }

  async cleanupZombies(): Promise<void> {
    if (!this.docker) return;

    try {
      const containers = await this.docker.listContainers({ all: true });
      const zombies = containers.filter((c) =>
        c.Image === this.imageName && c.State === 'exited'
      );

      for (const zombie of zombies) {
        try {
          const container = this.docker.getContainer(zombie.Id);
          await container.remove({ force: true });
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.docker) return false;

    try {
      await this.docker.ping();
      return true;
    } catch {
      return false;
    }
  }
}

export const sandbox = new DockerSandbox();

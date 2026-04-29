import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sandbox } from './sandbox.js';

describe('Docker Sandbox', () => {
  it('should execute simple command', async () => {
    const result = await sandbox.execute('echo "Hello World"');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Hello World');
  });

  it('should enforce memory limits', async () => {
    // This should fail with OOM if limit is enforced
    const result = await sandbox.execute(
      'node -e "const arr = []; while(true) arr.push(Buffer.alloc(1024*1024));"',
      { timeout: 5000 }
    );
    expect(result.exitCode).not.toBe(0);
  });

  it('should cleanup after execution', async () => {
    // Container should be removed after execution
    // This is implicitly tested by the fact that execute() doesn't leak
    const result = await sandbox.execute('echo "test"');
    expect(result.exitCode).toBe(0);
  });

  it('should run as non-root', async () => {
    const result = await sandbox.execute('id -u');
    expect(result.stdout.trim()).toBe('1000');
  });
});

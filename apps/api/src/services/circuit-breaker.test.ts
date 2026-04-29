import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from './circuit-breaker.js';

describe('CircuitBreaker', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker();
  });

  it('should be defined', () => {
    expect(cb).toBeDefined();
  });

  it('should have maxRevisions', () => {
    expect(cb['maxRevisions']).toBeGreaterThan(0);
  });

  it('checkRevision should return not allowed for non-existent task', async () => {
    const result = await cb.checkRevision('non-existent-id');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('not found');
  });

  it('getState should return null for non-existent task', async () => {
    const state = await cb.getState('non-existent-id');
    expect(state).toBeNull();
  });
});

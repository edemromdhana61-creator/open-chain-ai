import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks } from '../db/schema.js';
import { config } from '../config.js';

export interface CircuitBreakerState {
  taskId: string;
  revisionCount: number;
  maxRevisions: number;
  isBlocked: boolean;
}

export class CircuitBreaker {
  private maxRevisions: number;

  constructor() {
    this.maxRevisions = parseInt(config.CIRCUIT_BREAKER_MAX_REVISIONS, 10);
  }

  async checkRevision(taskId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Get current task
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) {
      return { allowed: false, reason: 'Task not found' };
    }

    // If already blocked, reject immediately
    if (task.status === 'blocked') {
      return {
        allowed: false,
        reason: `Task blocked: Maximum revisions (${this.maxRevisions}) exceeded`,
      };
    }

    // Check revision count
    const currentRevisions = task.revisionCount || 0;

    if (currentRevisions >= this.maxRevisions) {
      // Block the task
      await db
        .update(tasks)
        .set({
          status: 'blocked',
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      return {
        allowed: false,
        reason: `Circuit breaker triggered: Task reached ${this.maxRevisions} revisions. Human intervention required.`,
      };
    }

    return { allowed: true };
  }

  async incrementRevision(taskId: string): Promise<void> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) return;

    const newCount = (task.revisionCount || 0) + 1;

    await db
      .update(tasks)
      .set({
        revisionCount: newCount,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    // Check if we just hit the limit
    if (newCount >= this.maxRevisions) {
      await db
        .update(tasks)
        .set({
          status: 'blocked',
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      // Log the circuit breaker event
      console.warn(`[CIRCUIT BREAKER] Task ${taskId} blocked after ${newCount} revisions`);
    }
  }

  async reset(taskId: string): Promise<void> {
    await db
      .update(tasks)
      .set({
        revisionCount: 0,
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));
  }

  async getState(taskId: string): Promise<CircuitBreakerState | null> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) return null;

    return {
      taskId: task.id,
      revisionCount: task.revisionCount || 0,
      maxRevisions: this.maxRevisions,
      isBlocked: task.status === 'blocked',
    };
  }
}

// Singleton
export const circuitBreaker = new CircuitBreaker();

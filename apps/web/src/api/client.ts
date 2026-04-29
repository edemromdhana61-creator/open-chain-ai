import { useState, useEffect, useCallback } from 'react';

export interface Agent {
  id: string;
  name: string;
  adapterType: string;
  role: string;
  status: 'idle' | 'working' | 'error' | 'paused';
  lastHeartbeat?: string;
  budgetUsed?: string;
  budgetLimit?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
}

export interface DashboardData {
  overview: {
    companies: number;
    agents: number;
    goals: number;
    tasks: number;
  };
  agentStatus: Record<string, number>;
  taskStatus: Record<string, number>;
  budget: {
    total: number;
    used: number;
  };
}

export interface SystemStatus {
  status: string;
  timestamp: string;
  services: {
    api: boolean;
    database: boolean;
    ollama: boolean;
    sandbox: boolean;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Agents API
export async function fetchAgents(): Promise<Agent[]> {
  return apiCall('/api/v1/agents').then((data) => data.agents);
}

export async function createAgent(agent: Partial<Agent>): Promise<Agent> {
  return apiCall('/api/v1/agents', {
    method: 'POST',
    body: JSON.stringify(agent),
  }).then((data) => data.agent);
}

export async function pauseAgent(agentId: string): Promise<void> {
  await apiCall(`/api/v1/agents/${agentId}/pause`, { method: 'POST' });
}

export async function resumeAgent(agentId: string): Promise<void> {
  await apiCall(`/api/v1/agents/${agentId}/resume`, { method: 'POST' });
}

// Tasks API
export async function fetchTasks(): Promise<Task[]> {
  return apiCall('/api/v1/tasks').then((data) => data.tasks);
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  return apiCall('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  }).then((data) => data.task);
}

export async function assignTask(taskId: string, assigneeId: string): Promise<void> {
  await apiCall(`/api/v1/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assigneeId }),
  });
}

export async function completeTask(taskId: string): Promise<void> {
  await apiCall(`/api/v1/tasks/${taskId}/complete`, { method: 'POST' });
}

// Dashboard API
export async function fetchDashboard(): Promise<DashboardData> {
  return apiCall('/api/v1/dashboard');
}

// System Status
export async function checkHealth(): Promise<SystemStatus> {
  return apiCall('/health');
}

// Ollama Models
export async function listOllamaModels(): Promise<string[]> {
  return apiCall('/api/v1/ollama/models').then((data) => data.models);
}

// WebSocket
export function createWebSocket(): WebSocket {
  return new WebSocket(`ws://localhost:3000/api/v1/ws`);
}

// React Hook for live data
export function useApiPolling<T>(
  fetchFn: () => Promise<T>,
  interval = 5000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [refresh, interval]);

  return { data, loading, error, refresh };
}

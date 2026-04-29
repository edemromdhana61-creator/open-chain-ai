const API_URL = 'http://localhost:3000';

export interface Agent {
  id: string;
  name: string;
  adapterType: string;
  role: string;
  status: 'idle' | 'working' | 'error' | 'paused';
  lastHeartbeat?: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
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

// Agents API
export async function fetchAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_URL}/api/v1/agents`);
  if (!response.ok) throw new Error('Failed to fetch agents');
  const data = await response.json();
  return data.agents;
}

export async function createAgent(agent: Partial<Agent>): Promise<Agent> {
  const response = await fetch(`${API_URL}/api/v1/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent),
  });
  if (!response.ok) throw new Error('Failed to create agent');
  const data = await response.json();
  return data.agent;
}

// Tasks API
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/v1/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = await response.json();
  return data.tasks;
}

export async function assignTask(taskId: string, assigneeId: string): Promise<Task> {
  const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigneeId }),
  });
  if (!response.ok) throw new Error('Failed to assign task');
  const data = await response.json();
  return data.task;
}

// Dashboard API
export async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch(`${API_URL}/api/v1/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
}

// Messages API
export async function sendMessage(message: {
  from: string;
  to: string;
  type: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!response.ok) throw new Error('Failed to send message');
}

// Heartbeat API
export async function sendHeartbeat(heartbeat: {
  agentId: string;
  status: string;
  progress?: number;
}): Promise<void> {
  const response = await fetch(`${API_URL}/api/v1/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(heartbeat),
  });
  if (!response.ok) throw new Error('Failed to send heartbeat');
}

// WebSocket
export function createWebSocket(): WebSocket {
  return new WebSocket(`ws://localhost:3000/api/v1/ws`);
}

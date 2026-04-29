import { create } from 'zustand';

export interface Agent {
  id: string;
  name: string;
  adapterType: string;
  role: string;
  status: 'idle' | 'working' | 'error' | 'paused';
  lastHeartbeat?: string;
}

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  fetchAgents: () => Promise<void>;
  selectAgent: (agent: Agent | null) => void;
}

const API_URL = 'http://localhost:3000';

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgent: null,

  fetchAgents: async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/agents`);
      const data = await response.json();
      set({ agents: data.agents });
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  },

  selectAgent: (agent) => set({ selectedAgent: agent }),
}));

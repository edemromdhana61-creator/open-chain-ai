import { useEffect, useState } from 'react';
import { X, Pause, Play, AlertTriangle, Cpu, HardDrive, Activity } from 'lucide-react';
import { fetchAgents } from '../api/client';
import type { Agent } from '../api/client';

interface AgentDetailsProps {
  agentId: string;
  onClose: () => void;
}

export function AgentDetails({ agentId, onClose }: AgentDetailsProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  const loadAgent = async () => {
    try {
      const agents = await fetchAgents();
      const found = agents.find((a) => a.id === agentId);
      setAgent(found || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-gray-900 p-8 text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-gray-900 p-8 text-white">
          <p>Agent nicht gefunden</p>
          <button onClick={onClose} className="mt-4 rounded-lg bg-emerald-400 px-4 py-2 text-gray-900">
            Schließen
          </button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    idle: 'bg-gray-400',
    working: 'bg-emerald-400',
    error: 'bg-red-400',
    paused: 'bg-yellow-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${statusColors[agent.status]} flex items-center justify-center`}>
              <Activity className="h-5 w-5 text-gray-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{agent.name}</h2>
              <p className="text-sm text-gray-400">{agent.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-800 p-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Cpu className="h-4 w-4" />
                <span className="text-sm">Adapter</span>
              </div>
              <p className="mt-1 font-medium">{agent.adapterType}</p>
            </div>

            <div className="rounded-lg bg-gray-800 p-4">
              <div className="flex items-center gap-2 text-gray-400">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm">Status</span>
              </div>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[agent.status]}`}
              >
                {agent.status}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="font-medium">Letzter Heartbeat</h3>
            <p className="mt-1 text-sm text-gray-400">
              {agent.lastHeartbeat
                ? new Date(agent.lastHeartbeat).toLocaleString('de-DE')
                : 'Noch kein Heartbeat'}
            </p>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg bg-yellow-400/10 px-4 py-2 text-yellow-400 hover:bg-yellow-400/20">
              <Pause className="h-4 w-4" />
              Pause
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-emerald-400/10 px-4 py-2 text-emerald-400 hover:bg-emerald-400/20">
              <Play className="h-4 w-4" />
              Resume
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-red-400/10 px-4 py-2 text-red-400 hover:bg-red-400/20">
              <AlertTriangle className="h-4 w-4" />
              Kill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

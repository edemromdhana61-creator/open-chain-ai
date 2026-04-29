import { useAgentStore } from '../store/agents';
import { Circle, Pause, Play, AlertCircle } from 'lucide-react';

interface AgentPanelProps {
  onSelectAgent?: (agentId: string) => void;
}

const statusColors = {
  idle: 'bg-gray-400',
  working: 'bg-emerald-400',
  error: 'bg-red-400',
  paused: 'bg-yellow-400',
};

const statusIcons = {
  idle: Circle,
  working: Play,
  error: AlertCircle,
  paused: Pause,
};

export function AgentPanel({ onSelectAgent }: AgentPanelProps) {
  const { agents, selectedAgent, selectAgent } = useAgentStore();

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="border-b border-gray-800 p-4">
        <h2 className="font-semibold">Agents</h2>
        <p className="text-sm text-gray-400">{agents.length} total</p>
      </div>

      <div className="divide-y divide-gray-800">
        {agents.map((agent) => {
          const StatusIcon = statusIcons[agent.status];
          const isSelected = selectedAgent?.id === agent.id;

          return (
            <button
              key={agent.id}
              onClick={() => {
                selectAgent(isSelected ? null : agent);
                onSelectAgent?.(agent.id);
              }}
              className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${
                isSelected
                  ? 'bg-emerald-400/10'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="relative">
                <StatusIcon className={`h-5 w-5 ${statusColors[agent.status]}`} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-900 ${
                    statusColors[agent.status]
                  }`}
                />
              </div>

              <div className="flex-1">
                <p className="font-medium">{agent.name}</p>
                <p className="text-sm text-gray-400">{agent.role}</p>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                  agent.status === 'working'
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : agent.status === 'error'
                    ? 'bg-red-400/10 text-red-400'
                    : 'bg-gray-400/10 text-gray-400'
                }`}
              >
                {agent.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

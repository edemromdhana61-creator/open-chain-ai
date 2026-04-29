import { useAgentStore } from '../store/agents';
import { Activity, Cpu, HardDrive, Network } from 'lucide-react';
import { AgentStats } from './AgentStats';

export function Dashboard() {
  const { agents } = useAgentStore();

  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.status === 'working').length,
    idle: agents.filter((a) => a.status === 'idle').length,
    error: agents.filter((a) => a.status === 'error').length,
  };

  const cards = [
    {
      title: 'Active Agents',
      value: stats.active,
      total: stats.total,
      icon: Activity,
      color: 'emerald',
    },
    {
      title: 'Idle Agents',
      value: stats.idle,
      total: stats.total,
      icon: Cpu,
      color: 'blue',
    },
    {
      title: 'Errors',
      value: stats.error,
      total: stats.total,
      icon: HardDrive,
      color: 'red',
    },
    {
      title: 'Network',
      value: '99.9%',
      total: null,
      icon: Network,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-white">{card.value}</p>
                {card.total && (
                  <p className="mt-1 text-xs text-gray-500">
                    of {card.total} total
                  </p>
                )}
              </div>
              <div
                className={`rounded-lg bg-${card.color}-400/10 p-3`}
              >
                <card.icon className={`h-6 w-6 text-${card.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AgentStats />
    </div>
  );
}

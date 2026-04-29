import { useApiPolling } from '../api/client';
import { fetchDashboard, checkHealth } from '../api/client';
import { Activity, Cpu, AlertTriangle, CheckCircle, Wifi } from 'lucide-react';

export function Dashboard() {
  const { data: dashboard, loading: dashboardLoading } = useApiPolling(fetchDashboard, 30000);
  const { data: health } = useApiPolling(checkHealth, 10000);

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  const stats = dashboard?.overview || { companies: 0, agents: 0, goals: 0, tasks: 0 };
  const agentStatus = dashboard?.agentStatus || {};
  const taskStatus = dashboard?.taskStatus || {};

  const cards = [
    {
      title: 'Agents',
      value: stats.agents,
      active: agentStatus.working || 0,
      icon: Activity,
      color: 'emerald',
    },
    {
      title: 'Tasks',
      value: stats.tasks,
      active: taskStatus.in_progress || 0,
      icon: Cpu,
      color: 'blue',
    },
    {
      title: 'Errors',
      value: agentStatus.error || 0,
      active: 0,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: 'Done',
      value: taskStatus.done || 0,
      active: 0,
      icon: CheckCircle,
      color: 'emerald',
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
                {card.active > 0 && (
                  <p className="mt-1 text-xs text-emerald-400">
                    {card.active} active
                  </p>
                )}
              </div>
              <card.icon className={`h-8 w-8 text-${card.color}-400`} />
            </div>
          </div>
        ))}
      </div>

      {/* System Status */}
      {health && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2">
            <Wifi className={`h-5 w-5 ${health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="font-medium">System Status: {health.status}</span>
          </div>
          {health.services && (
            <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
              {Object.entries(health.services).map(([name, status]) => (
                <span
                  key={name}
                  className={`rounded px-2 py-1 text-xs ${
                    status ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                  }`}
                >
                  {name}: {status ? 'UP' : 'DOWN'}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

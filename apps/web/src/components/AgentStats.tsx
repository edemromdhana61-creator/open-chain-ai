import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboard } from '../api/client';
import type { DashboardData } from '../api/client';

const mockData = [
  { time: '00:00', agents: 3, tasks: 12 },
  { time: '04:00', agents: 4, tasks: 15 },
  { time: '08:00', agents: 5, tasks: 18 },
  { time: '12:00', agents: 4, tasks: 14 },
  { time: '16:00', agents: 6, tasks: 20 },
  { time: '20:00', agents: 5, tasks: 16 },
];

export function AgentStats() {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dashboard = await fetchDashboard();
      // TODO: Use real data when API is running
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 animate-pulse rounded-xl bg-gray-800">
        <div className="h-full w-full rounded-xl bg-gray-700/50" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <h3 className="mb-4 font-semibold">Agenten Aktivität (24h)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="agents"
            stroke="#34D399"
            strokeWidth={2}
            dot={{ fill: '#34D399' }}
          />
          <Line
            type="monotone"
            dataKey="tasks"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={{ fill: '#60A5FA' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

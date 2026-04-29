import { useState } from 'react';
import { ChevronDown, ChevronRight, User } from 'lucide-react';

interface OrgNode {
  id: string;
  name: string;
  role: string;
  status: string;
  children: OrgNode[];
}

const mockOrgChart: OrgNode = {
  id: '1',
  name: 'OpenClaw',
  role: 'CEO',
  status: 'working',
  children: [
    {
      id: '2',
      name: 'Hermes',
      role: 'CTO',
      status: 'working',
      children: [
        {
          id: '4',
          name: 'Claude',
          role: 'Dev',
          status: 'idle',
          children: [],
        },
      ],
    },
    {
      id: '3',
      name: 'Codex',
      role: 'Design',
      status: 'paused',
      children: [],
    },
  ],
};

function OrgNodeComponent({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  const statusColors: Record<string, string> = {
    idle: 'bg-gray-400',
    working: 'bg-emerald-400',
    error: 'bg-red-400',
    paused: 'bg-yellow-400',
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2"
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        <button
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={`h-5 w-5 ${!hasChildren && 'invisible'}`}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <div className="relative">
          <User className={`h-8 w-8 ${statusColors[node.status]} rounded-full p-1.5`} />
        </div>

        <div>
          <p className="font-medium">{node.name}</p>
          <p className="text-sm text-gray-400">{node.role}</p>
        </div>
      </div>

      {expanded &&
        node.children.map((child) => (
          <OrgNodeComponent key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export function OrgChart() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="border-b border-gray-800 p-4">
        <h2 className="font-semibold">Org Chart</h2>
      </div>

      <div className="p-4">
        <OrgNodeComponent node={mockOrgChart} />
      </div>
    </div>
  );
}

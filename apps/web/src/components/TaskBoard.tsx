import { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, RotateCcw, GripVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
}

const statusConfig = {
  pending: { icon: Circle, color: 'gray', label: 'Pending' },
  in_progress: { icon: Clock, color: 'blue', label: 'In Progress' },
  review: { icon: RotateCcw, color: 'yellow', label: 'Review' },
  done: { icon: CheckCircle2, color: 'emerald', label: 'Done' },
  blocked: { icon: AlertCircle, color: 'red', label: 'Blocked' },
};

const priorityConfig = {
  low: 'bg-gray-400/10 text-gray-400',
  medium: 'bg-blue-400/10 text-blue-400',
  high: 'bg-yellow-400/10 text-yellow-400',
  critical: 'bg-red-400/10 text-red-400',
};

const mockTasks: Task[] = [
  { id: '1', title: 'Design API Schema', status: 'done', priority: 'high', assignee: 'OpenClaw' },
  { id: '2', title: 'Implement Authentication', status: 'in_progress', priority: 'critical', assignee: 'Hermes' },
  { id: '3', title: 'Create Docker Sandbox', status: 'in_progress', priority: 'high', assignee: 'OpenClaw' },
  { id: '4', title: 'Setup Ollama Cloud', status: 'pending', priority: 'medium' },
  { id: '5', title: 'Build React Frontend', status: 'pending', priority: 'medium' },
];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (!draggedTask) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTask.id ? { ...task, status: newStatus } : task
      )
    );
    setDraggedTask(null);
  };

  const columns: Task['status'][] = ['pending', 'in_progress', 'review', 'done', 'blocked'];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Tasks</h2>
          <button className="rounded-lg bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-400/20">
            + New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 p-4">
        {columns.map((status) => {
          const statusInfo = statusConfig[status];
          const columnTasks = tasks.filter((t) => t.status === status);

          return (
            <div
              key={status}
              className="rounded-lg bg-gray-800/50 p-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="mb-3 flex items-center gap-2">
                <statusInfo.icon className={`h-4 w-4 text-${statusInfo.color}-400`} />
                <span className="text-sm font-medium">{statusInfo.label}</span>
                <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="cursor-move rounded-lg bg-gray-700/50 p-3 hover:bg-gray-700"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.assignee && (
                          <p className="mt-1 text-xs text-gray-400">{task.assignee}</p>
                        )}
                        <span
                          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs capitalize ${priorityConfig[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

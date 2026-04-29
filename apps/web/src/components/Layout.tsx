import { ReactNode } from 'react';
import { Zap, Users, MessageSquare, BarChart3, Settings } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-emerald-400" />
            <h1 className="text-xl font-bold">Open Chain AI</h1>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-400">
              Live
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Budget: $120/500</span>
            <span>Tokens: 45K/100K</span>
            <span>Uptime: 99.9%</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}

export function Sidebar() {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', active: true },
    { icon: Users, label: 'Agents', active: false },
    { icon: MessageSquare, label: 'Chat', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <button
          key={item.label}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
            item.active
              ? 'bg-emerald-400/10 text-emerald-400'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

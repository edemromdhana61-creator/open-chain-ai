import { useEffect, useState } from 'react';
import { useAgentStore } from './store/agents';
import { Dashboard } from './components/Dashboard';
import { AgentPanel } from './components/AgentPanel';
import { AgentDetails } from './components/AgentDetails';
import { TaskBoard } from './components/TaskBoard';
import { ChatInterface } from './components/ChatInterface';
import { OrgChart } from './components/OrgChart';
import { Layout, Sidebar } from './components/Layout';

function App() {
  const { agents, fetchAgents } = useAgentStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Sidebar */}
        <div className="col-span-2">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="col-span-7 space-y-6">
          <Dashboard />
          <TaskBoard />
          <OrgChart />
        </div>

        {/* Right Panel */}
        <div className="col-span-3 space-y-6">
          <AgentPanel onSelectAgent={setSelectedAgentId} />
          <ChatInterface />
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgentId && (
        <AgentDetails
          agentId={selectedAgentId}
          onClose={() => setSelectedAgentId(null)}
        />
      )}
    </Layout>
  );
}

export default App;

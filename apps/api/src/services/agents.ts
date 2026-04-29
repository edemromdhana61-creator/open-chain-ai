import { ollama } from './ollama.js';

// ECHTE Agent-Adapter die mit Ollama kommunizieren

export interface AgentAdapter {
  name: string;
  model: string;
  systemPrompt: string;
  execute(task: string): Promise<string>;
}

class BaseAgent implements AgentAdapter {
  name: string;
  model: string;
  systemPrompt: string;

  constructor(name: string, model: string, systemPrompt: string) {
    this.name = name;
    this.model = model;
    this.systemPrompt = systemPrompt;
  }

  async execute(task: string): Promise<string> {
    console.log(`🤖 ${this.name} arbeitet an: ${task.substring(0, 50)}...`);

    try {
      const response = await ollama.chat(this.model, [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: task },
      ]);

      console.log(`✅ ${this.name} fertig`);
      return response;
    } catch (error) {
      console.error(`❌ ${this.name} fehlgeschlagen:`, error);
      return `Fehler: ${error.message}`;
    }
  }
}

// Konkrete Agenten
export const openClawAgent = new BaseAgent(
  'OpenClaw',
  'llama3.2',
  'Du bist OpenClaw, ein Projektmanager KI-Agent. Du koordinierst andere Agenten, weist Aufgaben zu und überwicht den Fortschritt. Du kommunizierst klar und direkt.'
);

export const hermesAgent = new BaseAgent(
  'Hermes',
  'codellama',
  'Du bist Hermes, ein Senior Software Engineer KI-Agent. Du schreibst sauberen, effizienten Code. Du denkst über Architektur nach und implementierst robuste Lösungen.'
);

export const claudeAgent = new BaseAgent(
  'Claude',
  'llama3.2',
  'Du bist Claude, ein Research KI-Agent. Du recherchierst gründlich, analysierst Daten und erstellst detaillierte Reports.'
);

export const codexAgent = new BaseAgent(
  'Codex',
  'codellama',
  'Du bist Codex, ein DevOps KI-Agent. Du automatisierst Deployments, konfigurierst Infrastruktur und optimierst CI/CD Pipelines.'
);

// Agent Registry
export const agents: Record<string, AgentAdapter> = {
  openclaw: openClawAgent,
  hermes: hermesAgent,
  claude: claudeAgent,
  codex: codexAgent,
};

export async function executeAgentTask(agentType: string, task: string): Promise<{ success: boolean; result: string }> {
  const agent = agents[agentType];

  if (!agent) {
    return {
      success: false,
      result: `Unbekannter Agent: ${agentType}. Verfügbar: ${Object.keys(agents).join(', ')}`,
    };
  }

  try {
    const result = await agent.execute(task);
    return { success: true, result };
  } catch (error) {
    return { success: false, result: `Fehler: ${error.message}` };
  }
}

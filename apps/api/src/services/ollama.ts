// ECHTE Ollama API Integration
// Dokumentation: https://docs.ollama.com/api

const OLLAMA_BASE_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

class OllamaAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = OLLAMA_BASE_URL;
  }

  async chat(model: string, messages: OllamaMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      const data: OllamaChatResponse = await response.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('❌ Ollama chat failed:', error);
      return `Error: ${error.message}. Is Ollama running?`;
    }
  }

  async generate(model: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('❌ Ollama generate failed:', error);
      return `Error: ${error.message}. Is Ollama running?`;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }

  async pullModel(model: string): Promise<void> {
    console.log(`📥 Pulling model: ${model}...`);
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      console.log(`✅ Model ${model} ready`);
    } catch (error) {
      console.error(`❌ Failed to pull model ${model}:`, error);
      throw error;
    }
  }
}

export const ollama = new OllamaAdapter();

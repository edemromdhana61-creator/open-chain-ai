import { config } from '../config.js';

interface OllamaResponse {
  message?: {
    content?: string;
  };
  response?: string;
  error?: string;
}

class OllamaCloudAdapter {
  private baseUrl: string;
  private token: string;
  private modelTemps: Record<string, number>;

  constructor() {
    this.baseUrl = config.OLLAMA_HOST;
    this.token = config.OLLAMA_TOKEN;
    this.modelTemps = {
      'kimi.k2.6:cloud': 0.7,
      'glm-5.1:cloud': 0.3,
      'minimax-m2:cloud': 0.5,
    };
  }

  async chat(model: string, messages: { role: string; content: string }[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: this.modelTemps[model] || 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.message?.content || data.response || '';
    } catch (error) {
      console.error('Ollama chat failed:', error);
      return `Error: ${error.message}`;
    }
  }

  async generate(model: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: this.modelTemps[model] || 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Ollama generate failed:', error);
      return `Error: ${error.message}`;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }
}

export const ollama = new OllamaCloudAdapter();

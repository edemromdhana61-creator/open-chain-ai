import { config } from '../config.js';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaCloudAdapter {
  private host: string;
  private token: string;

  constructor() {
    this.host = config.OLLAMA_HOST;
    this.token = config.OLLAMA_TOKEN;
  }

  async chat(messages: OllamaMessage[], model: string): Promise<OllamaResponse> {
    const response = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: this.getTemperature(model),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async generate(prompt: string, model: string): Promise<string> {
    const response = await fetch(`${this.host}/api/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  async listModels(): Promise<Array<{ name: string; size: number }>> {
    const response = await fetch(`${this.host}/api/tags`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.models;
  }

  private getTemperature(model: string): number {
    const temps: Record<string, number> = {
      'glm-5.1:cloud': 0.2,      // Coder: präzise
      'deepseek-v4:cloud': 0.5,   // Planner: kreativ
      'kimi.k2.6:cloud': 0.7,    // General: ausgewogen
    };
    return temps[model] || 0.7;
  }
}

// Singleton
export const ollamaAdapter = new OllamaCloudAdapter();

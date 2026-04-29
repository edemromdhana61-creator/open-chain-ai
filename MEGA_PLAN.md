# OPEN CHAIN AI - MEGA PLAN

**Projekt:** Open Chain AI  
**Vision:** Die ultimative KI-Agenten Orchestration Platform  
**Inspiration:** Paperclip (Kakashi-Style: Techniken kopieren, eigene Jutsu entwickeln)  
**Ziel:** Ein Programm das jeden Vibe-Coder begeistert

---

## ÜBERSICHT

Open Chain AI ist ein **Control Plane** für autonome KI-Agenten-Unternehmen. Es verwaltet, koordiniert und orchestriert Teams von KI-Agenten - vergleichbar mit einem Unternehmens-Management-System, aber für autonome KIs.

**Kern-Philosophie:**
- **Ollama-First:** Cloud-Modelle via Ollama Gateway (keine API-Kosten)
- **Multi-Agent:** OpenClaw, Hermes, Claude Code, Codex, Cursor, etc.
- **Echtzeit:** Agenten sprechen untereinander UND mit dem Menschen
- **Vibe-Coding:** Intuitiv, schön, schnell

---

## ARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────┐
│                    OPEN CHAIN AI                            │
│                  Control Plane                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Agent   │  │  Task    │  │  Budget  │  │  Org     │   │
│  │ Registry │  │ Manager  │  │ Control  │  │  Chart   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│              Communication Bus (WebSocket/SSE)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ OpenClaw│  │  Hermes │  │ Claude  │  │  Codex  │     │
│  │ Adapter │  │ Adapter │  │  Code   │  │         │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
├─────────────────────────────────────────────────────────────┤
│                   Ollama Gateway                            │
│         (Cloud-Modelle ohne API-Keys)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## MODULE

### 1. Control Plane

**Zuständig für:**
- Agent Registrierung & Lifecycle
- Aufgaben-Verteilung & Tracking
- Budget-Management
- Org-Chart Verwaltung
- Heartbeat-Monitoring
- Goal Alignment

**Datenmodell:**
```typescript
interface Agent {
  id: string;
  name: string;
  adapterType: 'openclaw' | 'hermes' | 'claude_code' | 'codex' | 'cursor' | 'custom';
  status: 'idle' | 'working' | 'error' | 'paused';
  role: string;
  supervisorId?: string;
  budget: Budget;
  capabilities: string[];
  lastHeartbeat: Date;
  config: AgentConfig;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  status: 'pending' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  goalId: string;
  parentTaskId?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  cost: number;
  deliverables: Deliverable[];
}

interface Company {
  id: string;
  name: string;
  mission: string;
  goals: Goal[];
  agents: Agent[];
  orgChart: OrgChart;
  budget: Budget;
  createdAt: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  parentGoalId?: string;
  progress: number;
  tasks: Task[];
}
```

### 2. Communication Bus

**Echtzeit-Kommunikation zwischen:**
- Agent ↔ Control Plane
- Agent ↔ Agent
- Mensch ↔ Agent
- Mensch ↔ Control Plane

**Technologie:**
- **WebSocket** für Echtzeit-Updates
- **Server-Sent Events (SSE)** für Status-Streams
- **Event Bus** intern (EventEmitter / Redis)

**Nachrichten-Typen:**
```typescript
interface Message {
  id: string;
  from: string; // agentId or 'user'
  to: string;   // agentId or 'broadcast' or 'user'
  type: 'heartbeat' | 'task_update' | 'question' | 'answer' | 'status' | 'error' | 'deliverable';
  payload: any;
  timestamp: Date;
  threadId?: string;
}
```

### 3. Agent Adapters

Jeder Adapter ist ein Plugin, das einen spezifischen Agent-Typen anbindet.

#### OpenClaw Adapter
```typescript
class OpenClawAdapter implements AgentAdapter {
  async sendTask(task: Task): Promise<void> {
    await fetch('http://localhost:18789/api/tasks', {
      method: 'POST',
      headers: { 'x-openclaw-token': this.token },
      body: JSON.stringify(task)
    });
  }
  
  async getStatus(): Promise<AgentStatus> {
    // Ruft Status von OpenClaw ab
  }
  
  async sendMessage(message: Message): Promise<void> {
    // Sendet Nachricht an OpenClaw
  }
}
```

#### Hermes Adapter
```typescript
class HermesAdapter implements AgentAdapter {
  // Verbindung zu Hermes AI Agent
  // Nutzt Hermes Gateway API
}
```

#### Claude Code Adapter
```typescript
class ClaudeCodeAdapter implements AgentAdapter {
  // Steuert Claude Code Terminal
  // Sendet Befehle und empfängt Output
}
```

#### Generic Adapter (für Custom Agents)
```typescript
class GenericAdapter implements AgentAdapter {
  // HTTP Webhook basiert
  // Jeder Agent kann sich anmelden
}
```

### 4. Ollama Integration

**WICHTIG:** Wir nutzen Ollama als **Gateway zu Cloud-Modellen**, nicht nur lokale Modelle!

**Wie es bei Eddie läuft:**
```
Ollama App (lokal) → Verbindet sich mit Cloud-Modellen → Kein API Key nötig
```

**Modell-Konfiguration:**
```typescript
interface OllamaConfig {
  host: string; // 'http://localhost:11434' (Eddie's Setup)
  models: ModelConfig[];
}

interface ModelConfig {
  name: string; // z.B. 'kimi-k2.6', 'glm-5.1', 'deepseek-v4'
  source: 'local' | 'cloud'; // Wo läuft das Modell?
  role: 'coder' | 'planner' | 'reviewer' | 'general';
  contextWindow: number;
  temperature: number;
}
```

**Beispiel Eddie's Setup:**
```yaml
# ollama-config.yml (Eddie's Config)
models:
  - name: kimi-k2.6
    source: cloud
    role: general
    context_window: 256000
    temperature: 0.7
    
  - name: glm-5.1
    source: cloud
    role: coder
    context_window: 128000
    temperature: 0.2
    
  - name: deepseek-v4
    source: cloud
    role: planner
    context_window: 1000000
    temperature: 0.5
```

**Implementation:**
```typescript
class OllamaService {
  private host: string;
  
  constructor(host: string = 'http://localhost:11434') {
    this.host = host;
  }
  
  async generate(prompt: string, model: string): Promise<string> {
    const response = await fetch(`${this.host}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({ model, prompt, stream: false })
    });
    return response.json().response;
  }
  
  async chat(messages: Message[], model: string): Promise<string> {
    const response = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ model, messages, stream: false })
    });
    return response.json().message.content;
  }
  
  async listModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.host}/api/tags`);
    return response.json().models;
  }
}
```

### 5. GUI (React + TypeScript)

**Dashboard:**
```
┌────────────────────────────────────────────────────────────┐
│ Open Chain AI - Macher GmbH                    [⚡ Live]   │
├────────────┬────────────┬────────────┬─────────────────────┤
│ Org Chart  │ Tasks      │ Agents     │ Chat               │
│            │            │            │                    │
│  CEO       │ ⬜ Design  │ 🟢 OpenClaw│ Eddie: Hey         │
│  ├─ CTO    │ ⬜ Code    │ 🟡 Hermes  │ Agent1: Wie gehts? │
│  ├─ Dev    │ ✅ Review  │ 🔴 Codex   │ Eddie: Gut!        │
│  └─ Design │            │            │ Agent2: Ich hab... │
│            │            │            │                    │
├────────────┴────────────┴────────────┴─────────────────────┤
│ Budget: $120/500 | Tokens: 45K/100K | Uptime: 99.9%         │
└────────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **OrgChartView**: Hierarchische Darstellung der Agenten
- **TaskBoard**: Kanban-Board für Aufgaben
- **AgentPanel**: Status, Logs, Konfiguration pro Agent
- **ChatInterface**: Echtzeit-Chat mit Agenten
- **BudgetMonitor**: Kosten-Tracking in Echtzeit
- **GoalTracker**: Fortschritt der Unternehmensziele

### 6. Heartbeat System

```typescript
interface Heartbeat {
  agentId: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'error';
  currentTask?: string;
  progress: number;
  metrics: {
    tokensUsed: number;
    tokensRemaining: number;
    cpuUsage?: number;
    memoryUsage?: number;
  };
  nextCheckIn: Date;
}
```

**Heartbeat Flow:**
1. Agent sendet Heartbeat alle 30 Sekunden
2. Control Plane prüft Status
3. Bei Ausbleiben: Alert + Escalation
4. Bei Error: Automatischer Restart oder Menschliche Interventio

---

## TECH STACK

### Backend
| Komponente | Technologie |
|------------|-------------|
| API Server | Node.js + Express/Fastify |
| Datenbank | PostgreSQL + Redis |
| Echtzeit | Socket.io / WebSocket |
| Task Queue | BullMQ (Redis) |
| Auth | JWT + API Keys |

### Frontend
| Komponente | Technologie |
|------------|-------------|
| Framework | React 18 + TypeScript |
| State | Zustand / Redux Toolkit |
| UI | TailwindCSS + shadcn/ui |
| Charts | Recharts |
| Echtzeit | Socket.io-client |

### Agenten
| Agent | Adapter | Status |
|-------|---------|--------|
| OpenClaw | ✅ Native | Bereit |
| Hermes | 🔧 In Planung | - |
| Claude Code | 🔧 In Planung | - |
| Codex | 🔧 In Planung | - |
| Cursor | 🔧 In Planung | - |
| Custom | ✅ Generic | HTTP Webhook |

### Ollama
| Modell | Rolle | Status |
|--------|-------|--------|
| kimi-k2.6 | General | ✅ Cloud via Ollama |
| glm-5.1 | Coder | ✅ Cloud via Ollama |
| deepseek-v4 | Planner | ✅ Cloud via Ollama |

---

## DATENBANK-SCHEMA

```sql
-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  mission TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  adapter_type VARCHAR(50) NOT NULL,
  role VARCHAR(100),
  supervisor_id UUID REFERENCES agents(id),
  status VARCHAR(20) DEFAULT 'idle',
  config JSONB,
  budget_limit DECIMAL(12,2),
  budget_used DECIMAL(12,2) DEFAULT 0,
  last_heartbeat TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  parent_goal_id UUID REFERENCES goals(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id),
  assignee_id UUID REFERENCES agents(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  parent_task_id UUID REFERENCES tasks(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cost DECIMAL(12,2) DEFAULT 0,
  deliverables JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id VARCHAR(255), -- 'user' for human
  to_agent_id VARCHAR(255), -- 'broadcast' for all
  type VARCHAR(50) NOT NULL,
  payload JSONB,
  thread_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Heartbeats
CREATE TABLE heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  status VARCHAR(20) NOT NULL,
  current_task_id UUID REFERENCES tasks(id),
  progress INTEGER,
  metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API DESIGN

### Agent Management
```
POST   /api/v1/agents              # Agent erstellen
GET    /api/v1/agents              # Alle Agenten listen
GET    /api/v1/agents/:id          # Agent Details
PUT    /api/v1/agents/:id          # Agent updaten
DELETE /api/v1/agents/:id          # Agent löschen
POST   /api/v1/agents/:id/pause    # Agent pausieren
POST   /api/v1/agents/:id/resume   # Agent fortsetzen
```

### Task Management
```
POST   /api/v1/tasks               # Task erstellen
GET    /api/v1/tasks               # Tasks listen
GET    /api/v1/tasks/:id           # Task Details
PUT    /api/v1/tasks/:id           # Task updaten
POST   /api/v1/tasks/:id/assign    # Task zuweisen
POST   /api/v1/tasks/:id/complete  # Task abschließen
POST   /api/v1/tasks/:id/block     # Task blockieren
```

### Communication
```
POST   /api/v1/messages            # Nachricht senden
GET    /api/v1/messages            # Nachrichten abrufen
GET    /api/v1/messages/stream     # Echtzeit-Stream (SSE)
WS     /api/v1/ws                  # WebSocket Verbindung
```

### Heartbeat
```
POST   /api/v1/heartbeat           # Heartbeat empfangen
GET    /api/v1/heartbeat/:agentId # Heartbeat Status
```

### Dashboard
```
GET    /api/v1/dashboard           # Übersicht
GET    /api/v1/dashboard/agents    # Agenten-Status
GET    /api/v1/dashboard/tasks     # Task-Übersicht
GET    /api/v1/dashboard/budget    # Budget-Übersicht
```

---

## IMPLEMENTATION PHASEN

### Phase 1: MVP (4 Wochen)
- [ ] Control Plane API (Node.js + Express)
- [ ] PostgreSQL Datenbank
- [ ] OpenClaw Adapter
- [ ] Basic GUI (React)
- [ ] Task Assignment
- [ ] Heartbeat System
- [ ] Ollama Integration

### Phase 2: Multi-Agent (2 Wochen)
- [ ] Hermes Adapter
- [ ] Claude Code Adapter
- [ ] Generic HTTP Adapter
- [ ] Agent-to-Agent Kommunikation

### Phase 3: Advanced (2 Wochen)
- [ ] Budget Management
- [ ] Org Chart Visualisierung
- [ ] Mobile GUI
- [ ] Audit Logs
- [ ] Governance Features

### Phase 4: Polish (2 Wochen)
- [ ] Performance Optimierung
- [ ] Tests
- [ ] Dokumentation
- [ ] Deployment

---

## OLLAMA INTEGRATION DETAILS

### Modell-Konfiguration
```yaml
# ollama-config.yml
models:
  - name: kimi-k2.6
    source: cloud
    role: general
    context_window: 256000
    temperature: 0.7
    
  - name: glm-5.1
    source: cloud
    role: coder
    context_window: 128000
    temperature: 0.2
    
  - name: deepseek-v4
    source: cloud
    role: planner
    context_window: 1000000
    temperature: 0.5
```

### Routing-Logik
```typescript
class OllamaRouter {
  async route(task: Task): Promise<string> {
    switch (task.type) {
      case 'coding':
        return 'glm-5.1';
      case 'planning':
        return 'deepseek-v4';
      case 'review':
        return 'kimi-k2.6';
      default:
        return 'kimi-k2.6';
    }
  }
}
```

---

## SICHERHEIT (V3 ERWEITERT)

### Auth & AuthZ
- JWT für User-Auth
- API Keys für Agent-Auth
- Rollen-basierte Zugriffskontrolle (RBAC)

### Execution Sandbox (MUST HAVE)
- Jeder Task läuft in isoliertem Docker-Container
- Kein direkter Host-Zugriff
- Container wird nach Task zerstört
- Resource Limits (CPU/Memory)

### Circuit Breaker (MUST HAVE)
- Max 3 Revisions-Schleifen pro Code-Block
- Bei Blockade: Stop API Calls + Menschliches Eingreifen
- Schützt vor Token-Verschwendung

### Secret Management (Phase 2)
- HashiCorp Vault für temporäre Tokens
- Just-in-Time Access
- Auto-Expire nach Task

### Audit
- Alle Nachrichten werden geloggt
- Task-History ist immutable
- Heartbeat-Logs für Compliance

---

## DEPLOYMENT

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/openchain
      - REDIS_URL=redis://redis:6379
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - db
      - redis
      - ollama

  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama

  ui:
    build: ./ui
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
  ollama_data:
```

---

## PAPERCLIP FEATURES (Kakashi-Style)

### Was wir übernehmen (Kopieren)
| Feature | Status |
|---------|--------|
| ✅ Plugin System | Monorepo Struktur |
| ✅ Skills Manager | Agent Fähigkeiten |
| ✅ Scheduled Routines | Cron Jobs |
| ✅ Better Budgeting | Kostenkontrolle |
| ✅ Agent Reviews | Approval Gates |
| ✅ Multi-Company | Isolation |
| ✅ Heartbeat | Status Checks |
| ✅ Org Chart | Hierarchien |
| ✅ Invite System | Einladungen |
| ✅ Ticket System | Task Tracking |

### Was wir besser machen (Eigene Jutsu)
| Feature | Unser Vorteil |
|---------|---------------|
| 🚀 **Ollama-First** | Keine API-Kosten |
| 🚀 **Echtzeit-Chat** | Agenten sprechen untereinander |
| 🚀 **Smart Prompts** | Automatisch generierte Prompts |
| 🚀 **Vibe Coding** | Intuitive GUI |
| 🚀 **Cloud Modelle** | Via Ollama Gateway |

---

## NÄCHSTE SCHRITTE

1. **Repo erstellen**: `github.com/eddie/open-chain-ai`
2. **Tech Stack initialisieren**: Node.js + React + PostgreSQL
3. **Datenbank aufsetzen**: Schema erstellen
4. **MVP Control Plane**: Basic API
5. **OpenClaw Adapter**: Als erster Agent
6. **Basic GUI**: Dashboard
7. **Ollama**: Modelle testen

---

## ZEITPLAN

| Phase | Dauer | Wochen |
|-------|-------|--------|
| MVP | 4 Wochen | 1-4 |
| Multi-Agent | 2 Wochen | 5-6 |
| Advanced | 2 Wochen | 7-8 |
| Polish | 2 Wochen | 9-10 |
| **GESAMT** | **10 Wochen** | **~2.5 Monate** |

---

**Erstellt:** 2026-04-29
**Status:** MEGA PLAN
**Nächster Schritt:** Implementation starten
**Deadline:** ~2.5 Monate

---

# FERTIG - ZUM ABNEHMEN

Dieser Plan ist bereit für Implementation.  
Alle Module sind definiert.  
Das Tech Stack ist entschieden.  
Die Architektur ist klar.

**Eddie: Abnehmen?** ⚡

# Open Chain AI - Vollständige Spezifikation

## Zusammenfassung für KI-Analyse

Dieses Dokument beschreibt ein neues Open-Source-Projekt namens **Open Chain AI** - eine Orchestration-Plattform für KI-Agenten-Unternehmen, inspiriert von PaperclipAI aber mit eigenem Fokus.

---

## Vision

Open Chain AI ist eine **Open-Source Orchestration Platform** für KI-Agenten-Unternehmen. Sie ermöglicht es, Teams von KI-Agenten zu erstellen, zu verwalten und zu koordinieren - vergleichbar mit einem Task-Management-System, aber für autonome KI-Agenten.

**Kern-Unterschiede zu Paperclip:**
- **Ollama-First**: Nutzt Ollama als Gateway zu Cloud-Modellen (keine API-Kosten)
- **Echtzeit-Kommunikation**: Agenten sprechen untereinander UND mit dem Menschen
- **Status-Übersicht**: Jederzeit sehen wer was macht
- **Modular**: Bring your own agent

---

## Tech Stack

| Komponente | Technologie | Begründung |
|------------|-------------|------------|
| Backend | Node.js + TypeScript | Synergien mit OpenClaw (auch Node.js) |
| Frontend | React 18 + TypeScript | Standard, großes Ökosystem |
| Datenbank | PostgreSQL + Redis | Robust, skalierbar |
| Echtzeit | Socket.io | WebSocket + Fallback |
| Queue | BullMQ (Redis) | Zuverlässig |
| Auth | JWT + API Keys | Standard |

---

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    OPEN CHAIN AI                            │
│                  Control Plane                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │   │
│  │ Registry │  │  Tasks   │  │  Budget  │  │  Org     │   │
│  │          │  │          │  │          │  │  Chart   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Communication Bus                          │
│         (WebSocket / SSE / Internal Events)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ OpenClaw│  │  Hermes │  │ Claude  │  │  Codex  │     │
│  │ Adapter │  │ Adapter │  │  Code   │  │         │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
├─────────────────────────────────────────────────────────────┤
│                     Ollama Layer                            │
│              (Gateway zu Cloud-Modellen)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Module

### 1. Control Plane

**Zuständig für:**
- Agent Registrierung & Lifecycle
- Aufgaben-Verteilung & Tracking
- Budget-Management
- Org-Chart Verwaltung
- Heartbeat-Monitoring

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
```

### 2. Communication Bus

**Echtzeit-Kommunikation zwischen:**
- Agent ↔ Control Plane
- Agent ↔ Agent
- Mensch ↔ Agent
- Mensch ↔ Control Plane

**Nachrichten-Typen:**
```typescript
interface Message {
  id: string;
  from: string;
  to: string;
  type: 'heartbeat' | 'task_update' | 'question' | 'answer' | 'status' | 'error' | 'deliverable';
  payload: any;
  timestamp: Date;
  threadId?: string;
}
```

### 3. Agent Adapters

Jeder Adapter ist ein Plugin:

**OpenClaw Adapter:**
```typescript
class OpenClawAdapter implements AgentAdapter {
  async sendTask(task: Task): Promise<void> {
    await fetch('http://localhost:18789/api/tasks', {
      method: 'POST',
      headers: { 'x-openclaw-token': this.token },
      body: JSON.stringify(task)
    });
  }
}
```

**Generic Adapter:**
```typescript
class GenericAdapter implements AgentAdapter {
  // HTTP Webhook basiert
}
```

### 4. Ollama Integration

**Wichtig:** Ollama ist ein Gateway zu Cloud-Modellen, nicht nur lokale Modelle.

**Beispiel-Config:**
```yaml
models:
  - name: kimi-k2.6
    source: cloud
    role: general
    context_window: 256000
    
  - name: glm-5.1
    source: cloud
    role: coder
    context_window: 128000
```

### 5. GUI

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
  };
  nextCheckIn: Date;
}
```

---

## Features (aus Paperclip ROADMAP)

### ✅ Kern-Features (MVP)
- Plugin System
- OpenClaw / claw-style Agenten
- Import/Export von Organisationen
- Skills Manager
- Scheduled Routines
- Better Budgeting
- Agent Reviews and Approvals
- Multiple Human Users

### ⚪ Erweiterte Features (Zukunft)
- Cloud / Sandbox Agents
- Artifacts & Work Products
- Memory / Knowledge
- Enforced Outcomes
- MAXIMIZER MODE
- Deep Planning
- Work Queues
- Self-Organization
- Automatic Organizational Learning
- CEO Chat
- Cloud Deployments
- Desktop App

---

## API Design

### Agent Management
```
POST   /api/v1/agents
GET    /api/v1/agents
GET    /api/v1/agents/:id
PUT    /api/v1/agents/:id
DELETE /api/v1/agents/:id
POST   /api/v1/agents/:id/pause
POST   /api/v1/agents/:id/resume
```

### Task Management
```
POST   /api/v1/tasks
GET    /api/v1/tasks
GET    /api/v1/tasks/:id
PUT    /api/v1/tasks/:id
POST   /api/v1/tasks/:id/assign
POST   /api/v1/tasks/:id/complete
POST   /api/v1/tasks/:id/block
```

### Communication
```
POST   /api/v1/messages
GET    /api/v1/messages
GET    /api/v1/messages/stream
WS     /api/v1/ws
```

### Heartbeat
```
POST   /api/v1/heartbeat
GET    /api/v1/heartbeat/:agentId
```

### Dashboard
```
GET    /api/v1/dashboard
GET    /api/v1/dashboard/agents
GET    /api/v1/dashboard/tasks
GET    /api/v1/dashboard/budget
```

---

## Datenbank-Schema

```sql
-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  mission TEXT,
  created_at TIMESTAMP DEFAULT NOW()
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
  from_agent_id VARCHAR(255),
  to_agent_id VARCHAR(255),
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

## Implementation Phasen

### Phase 1: MVP (4 Wochen)
- Control Plane API
- PostgreSQL Datenbank
- OpenClaw Adapter
- Basic GUI
- Task Assignment
- Heartbeat System
- Ollama Integration

### Phase 2: Multi-Agent (2 Wochen)
- Hermes Adapter
- Claude Code Adapter
- Generic HTTP Adapter
- Agent-to-Agent Kommunikation

### Phase 3: Advanced (2 Wochen)
- Budget Management
- Org Chart Visualisierung
- Mobile GUI
- Audit Logs
- Governance Features

### Phase 4: Polish (2 Wochen)
- Performance Optimierung
- Tests
- Dokumentation
- Deployment

---

## Sicherheit

- JWT für User-Auth
- API Keys für Agent-Auth
- Rollen-basierte Zugriffskontrolle (RBAC)
- Jede Company ist isoliert
- Budget-Limits erzwingen Hard-Stops
- Alle Nachrichten werden geloggt
- Task-History ist immutable

---

## Deployment

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

volumes:
  postgres_data:
  ollama_data:
```

---

## Unterschiede zu Paperclip

| Feature | Paperclip | Open Chain AI |
|---------|-----------|---------------|
| Ollama-First | ❌ Cloud-APIs | ✅ Ollama Gateway |
| Echtzeit-Chat | ❌ | ✅ |
| Agent-Kommunikation | ❌ | ✅ |
| Open Source | ✅ | ✅ |
| Multi-Agent | ✅ | ✅ |
| GUI | ✅ React | ✅ React |
| Heartbeat | ✅ | ✅ |
| Budget | ✅ | ✅ |
| Multi-Company | ✅ | ✅ |
| Governance | ✅ | ✅ |
| Ticket System | ✅ | ✅ |

---

**Erstellt:** 2026-04-29
**Status:** Spezifikation
**Nächster Schritt:** Implementation

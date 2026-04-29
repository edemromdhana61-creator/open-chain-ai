# OPEN CHAIN AI - MEGA PLAN V3 (FINAL)

**Projekt:** Open Chain AI  
**Vision:** Die ultimative, token-effiziente KI-Agenten Orchestration Platform  
**Setup:** 100% Ollama Cloud API  
**Status:** ✅ FINAL - Bereit für Implementation

---

## 1. ÜBERSICHT & KERN-PHILOSOPHIE

- **Ollama Cloud Only:** Direkte Anbindung an die API als Remote Host. Keine lokale Hardware nötig.
- **Token-Effizienz:** Vektor-Gedächtnis (pgvector) und strikte Circuit-Breaker verhindern das Ausbrennen der 5-Stunden-Limits.
- **Zero-Trust Execution:** Agent-Code läuft streng isoliert in Docker-Sandboxen.
- **Vibe-Coding:** Intuitiv, schnell und mit Echtzeit-Feedback.

---

## 2. ARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────┐
│                    OPEN CHAIN AI                            │
│                  Control Plane                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Agent   │  │  Task    │  │  Limit   │  │  Memory  │   │
│  │ Registry │  │ Manager  │  │ Tracker  │  │(pgvector)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│              Message Broker (NATS / WebSocket)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ OpenClaw│  │  Hermes │  │ Claude  │  │  Custom │     │
│  │ Adapter │  │ Adapter │  │  Code   │  │ Adapter │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
├─────────────────────────────────────────────────────────────┤
│                   Ollama Remote Host API                    │
│           (Authentifiziert via Ollama Cloud Token)         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │kimi.k2.6:cloud│ │ glm-5.1:cloud│ │minimax-m2:cloud│  │
│  └──────────────┘ └──────────────┘ └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. DIE CLOUD-MODELLE (OLLAMA PRO)

| Modell | Rolle | Besonderheit |
|--------|-------|--------------|
| **kimi.k2.6:cloud** | Reviewer & General | Dein Favorit für allgemeine Aufgaben und Code-Reviews |
| **glm-5.1:cloud** | Coder | Flaggschiff für Agentic Engineering. Iteratives Coden, Plant Tests, optimiert über hunderte Tool-Calls |
| **minimax-m2:cloud** | Planner & Tooling | Hocheffizient für Agentic Workflows. Plant komplexe Toolchains und führt sie in Shell/Browser-Umgebungen aus |

---

## 4. KRITISCHE MODULE (SECURITY & EFFIZIENZ)

### A. Ollama Cloud Connection

```typescript
const OLLAMA_HOST = 'https://api.ollama.com'; // Remote Host
const OLLAMA_TOKEN = process.env.OLLAMA_CLOUD_TOKEN;

class OllamaCloudAdapter {
  async chatWithCloudModel(messages: Message[], model: string) {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OLLAMA_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, stream: false })
    });
    return response.json();
  }
}
```

### B. Execution Sandbox (Cyber Security)

- **Docker rootless** - Kein Root-Zugriff
- **Resource Limits** - `--cpus` und `--memory` strikt
- **Netzwerk** - `--network none` ODER strikter Proxy für Registries
- **Read-Only FS** - Nur Arbeitsverzeichnis beschreibbar
- **Container-Crash Handling** - Asynchrone Fehler sauber abfangen
- **Nach Task: Restlose Vernichtung** - Container + Volumes löschen

**⚠️ Docker Zombie-Container:**
Wenn Node.js abstürzt, bleiben Container zurück. Lösung:
```bash
# Cleanup-Job (alle 5 Minuten)
#!/bin/bash
# Killt verwaiste Container älter als 30 Min
docker ps -q --filter "label=open-chain-ai" --filter "exited" | xargs docker rm -f
```

**⚠️ Netzwerk-Isolation vs Dependencies:**
`--network none` blockiert `npm install` / `pip install`. Lösungen:
1. **Vorkonfigurierte Images** (npm, pip, git vorinstalliert)
2. **Strikter Proxy** - Nur vertrauenswürdige Registries erlaubt

### C. Circuit Breaker & Limit Tracker

- **Regel:** Maximal 3 Revisions-Schleifen für denselben Code-Block
- **Aktion:** Wenn Agent A den Code von Agent B zum dritten Mal ablehnt, greift der Breaker. Der Task wird auf `blocked` gesetzt, die API-Calls werden gestoppt und das System fordert menschliches Eingreifen.

### D. Langzeitgedächtnis (pgvector)

```sql
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  content TEXT NOT NULL,
  embedding vector(768), -- ⚠️ NOMIC-EMBED-TEXT (768) - muss zum Ollama Modell passen!
  task_context UUID REFERENCES tasks(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**⚠️ WICHTIG:** Die Embedding-Dimension muss zum Ollama-Modell passen!
| Modell | Dimension |
|--------|-----------|
| nomic-embed-text | 768 |
| mxbai-embed-large | 1024 |
| OpenAI text-embedding-ada-002 | 1536 |

**Empfehlung:** nomic-embed-text (768) - kleiner, schneller, ausreichend.

**Der Effizienz-Boost:** Agenten suchen per Vektor-Suche in alten Tasks. Sie müssen nicht bei jedem Request riesige Projektdateien neu in den Kontext laden, was massiv die API-Nutzung schont.

---

## 5. TECH STACK V3 (FINAL)

| Komponente | Technologie | Begründung |
|------------|-------------|------------|
| **API Server** | **Node.js + Fastify** | 3x schneller als Express |
| **Datenbank** | **PostgreSQL 16 + pgvector** | Vektor-Suche für Memory |
| **Message Broker** | **NATS** | Echter Broker, nicht nur Cache |
| **LLM Backend** | **Ollama Cloud API** | Direkte API Anbindung |
| **Sandbox** | **Docker Engine API** | Isolierte Ausführung |
| **Auth** | **JWT + API Keys** | Standard |

### Frontend
| Komponente | Technologie |
|------------|-------------|
| Framework | React 18 + TypeScript |
| State | Zustand |
| UI | TailwindCSS + shadcn/ui |
| Charts | Recharts |
| Echtzeit | Socket.io-client |

---

## 6. WAS WEG FÄLLT (Phase 2 / Später)

| Feature | Grund |
|---------|-------|
| ~~gVisor~~ | Docker reicht für MVP |
| ~~eBPF~~ | Overkill für erstes Release |
| ~~HashiCorp Vault~~ | Komplexität, später nachrüstbar |
| ~~OpenTelemetry~~ | Nice-to-have |
| ~~MQTT~~ | IoT nicht MVP |
| ~~Firecracker~~ | Docker ist einfacher |

---

## 7. SICHERHEIT

### Auth & AuthZ
- JWT für User-Auth
- API Keys für Agent-Auth
- Rollen-basierte Zugriffskontrolle (RBAC)

### Execution Sandbox (MUST HAVE)
```bash
# Rootless + Limits + Isolation
docker run \
  --user 1000:1000 \
  --cpus=1 --memory=512m \
  --network none \
  --read-only --tmpfs /work \
  open-chain-ai/agent-sandbox

# Cleanup Zombies (alle 5 Min)
docker ps -q --filter "label=open-chain-ai" --filter "exited" | xargs docker rm -f
```

### Dependencies Lösung
```dockerfile
# Vorkonfiguriertes Image
FROM node:20-alpine
RUN apk add --no-cache git python3
# npm, pip, git vorinstalliert → kein Netzwerk nötig
```

### Circuit Breaker
- Max 3 Revisions-Schleifen pro Code-Block
- Bei Blockade: Stop API Calls + Menschliches Eingreifen
- Schützt vor Token-Verschwendung

### Audit
- Alle Nachrichten werden geloggt
- Task-History ist immutable
- Heartbeat-Logs für Compliance

---

## 8. DEPLOYMENT

```yaml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/openchain
      - NATS_URL=nats://nats:4222
      - OLLAMA_HOST=https://api.ollama.com
      - OLLAMA_TOKEN=${OLLAMA_CLOUD_TOKEN}
    depends_on:
      - db
      - nats

  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  nats:
    image: nats:2-alpine

  ui:
    build: ./ui
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

---

## 9. IMPLEMENTATION PHASEN

### Phase 1: MVP (5 Wochen) *Puffer eingerechnet*
- [ ] Control Plane API (Fastify)
- [ ] PostgreSQL + pgvector
- [ ] NATS Message Broker
- [ ] OpenClaw Adapter
- [ ] Basic GUI (React)
- [ ] Task Assignment
- [ ] Heartbeat System
- [ ] Ollama Cloud Integration
- [ ] **Docker Engine API Orchestrierung** *(Haupt-Hürde - Puffer)*
- [ ] Circuit Breaker

**Hinweis:** Die Docker Engine API Orchestrierung (Container hochfahren, Code injizieren, Output abgreifen, zerstören) ist die größte technische Hürde. Hierfür ist Puffer eingeplant.

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

## 10. ZEITPLAN

| Phase | Dauer | Wochen |
|-------|-------|--------|
| MVP | **5 Wochen** (Puffer für Docker API) | 1-5 |
| Multi-Agent | 2 Wochen | 6-7 |
| Advanced | 2 Wochen | 8-9 |
| Polish | 2 Wochen | 10-11 |
| **GESAMT** | **11 Wochen** | **~2.75 Monate** |

---

## 11. ABGENOMMEN

| Feature | Status |
|---------|--------|
| Ollama Cloud Only | ✅ |
| Fastify statt Express | ✅ |
| NATS statt Redis | ✅ |
| PostgreSQL + pgvector | ✅ |
| Docker Sandbox | ✅ |
| Circuit Breaker | ✅ |
| Embedding 768 (nomic) | ✅ |
| Docker Zombie Cleanup | ✅ |
| Dependencies Lösung | ✅ |
| kimi.k2.6:cloud | ✅ |
| glm-5.1:cloud | ✅ |
| minimax-m2:cloud | ✅ |

---

**Erstellt:** 2026-04-29
**Status:** ✅ FINAL ABGENOMMEN
**Nächster Schritt:** Implementation starten
**Deadline:** ~2.75 Monate

---

# ✅ FINAL ABGENOMMEN - IMPLEMENTATION STARTEN

Dieser Plan ist final abgenommen und bereit für Implementation.

**Eddie: Soll ich anfangen zu coden?** ⚡

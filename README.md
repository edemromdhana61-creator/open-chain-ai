# Open Chain AI

Die ultimative KI-Agenten Orchestration Platform.

## Features

- 🤖 **Multi-Agent Support**: OpenClaw, Hermes, Claude Code, Codex, Cursor
- ☁️ **Ollama Cloud Pro**: Direkte API Anbindung (keine lokale Hardware)
- 🔒 **Docker Sandbox**: Isolierte Code-Ausführung mit Resource Limits
- ⚡ **Circuit Breaker**: Schutz vor Endlosschleifen (max 3 Revisions)
- 🧠 **pgvector Memory**: Vektor-Suche für effiziente Context-Wiederverwendung
- 💬 **Echtzeit-Chat**: Agenten sprechen untereinander und mit dir
- 📊 **Dashboard**: Live-Status aller Agenten und Tasks

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| API Server | Fastify + TypeScript |
| Datenbank | PostgreSQL 16 + pgvector |
| Message Broker | NATS |
| Frontend | React 18 + TailwindCSS |
| Sandbox | Docker |

## Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/eddie/open-chain-ai.git
cd open-chain-ai

# 2. Dependencies installieren
pnpm install

# 3. Umgebungsvariablen setzen
cp .env.example .env
# OLLAMA_CLOUD_TOKEN setzen

# 4. Datenbank starten
docker-compose up -d db nats

# 5. Migrationen ausführen
pnpm db:migrate

# 6. Entwicklung starten
pnpm dev
```

## Docker Sandbox

Jeder Task läuft in einem isolierten Container:

```bash
# Rootless
--user 1000:1000

# Resource Limits
--cpus=1 --memory=512m

# Network Isolation
--network none

# Read-Only FS
--read-only --tmpfs /work
```

## Circuit Breaker

- Max 3 Revisions pro Code-Block
- Danach: Task blocked + menschliches Eingreifen
- Schützt vor Token-Verschwendung

## Ollama Cloud Modelle

| Modell | Rolle |
|--------|-------|
| kimi.k2.6:cloud | Reviewer & General |
| glm-5.1:cloud | Coder |
| minimax-m2:cloud | Planner |

## Projekt Struktur

```
open-chain-ai/
├── apps/
│   ├── api/           # Fastify API Server
│   └── web/           # React Frontend
├── packages/
│   ├── shared/        # Gemeinsame Types
│   └── db/            # Datenbank Schema
├── docker-compose.yml
└── README.md
```

## License

MIT

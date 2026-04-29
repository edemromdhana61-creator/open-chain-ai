# Open Chain AI

Die ultimative KI-Agenten Orchestration Platform.

## ⚠️ WICHTIG

Dies ist ein **Work in Progress**. Einige Features sind noch nicht vollständig implementiert.

## Features

- 🤖 **Multi-Agent Support**: OpenClaw, Hermes, Claude Code, Codex, Cursor
- ☁️ **Ollama Cloud Pro**: Direkte API Anbindung (keine lokale Hardware)
- 🔒 **Docker Sandbox**: Isolierte Code-Ausführung mit Resource Limits
- ⚡ **Circuit Breaker**: Schutz vor Endlosschleifen (max 3 Revisions)
- 🧠 **pgvector Memory**: Vektor-Suche für effiziente Context-Wiederverwendung
- 💬 **Echtzeit-Chat**: Agenten sprechen untereinander und mit dir
- 📊 **Dashboard**: Live-Status aller Agenten und Tasks

## Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/YOUR-USERNAME/open-chain-ai.git
cd open-chain-ai

# 2. Automatisches Setup
./scripts/setup.sh

# 3. Ollama Token eintragen
# Bearbeite .env und setze OLLAMA_TOKEN

# 4. Starten
docker-compose up -d
```

## Systemanforderungen

- Docker & Docker Compose
- Node.js 20+
- pnpm
- Ollama Cloud Pro Account

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| API Server | Fastify + TypeScript |
| Datenbank | PostgreSQL 16 + pgvector |
| Message Broker | NATS |
| Frontend | React 19 + TailwindCSS |
| Sandbox | Docker |

## Projekt Struktur

```
open-chain-ai/
├── apps/
│   ├── api/           # Fastify API Server
│   └── web/           # React Frontend
├── docs/              # Dokumentation
├── scripts/           # Setup Scripts
├── docker-compose.yml
└── README.md
```

## API Dokumentation

Siehe [docs/API.md](docs/API.md)

## Deployment

Siehe [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Troubleshooting

Siehe [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## Bekannte Probleme

- ⚠️ Tests benötigen laufende Datenbank
- ⚠️ Sandbox benötigt Docker
- ⚠️ Ollama Cloud Token erforderlich

## Roadmap

- [ ] Vollständige Test-Abdeckung
- [ ] Agent-Adapter Implementierung
- [ ] Production-Ready Deployment
- [ ] Monitoring & Alerting

## License

MIT

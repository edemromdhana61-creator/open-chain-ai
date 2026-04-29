# Open Chain AI

Die ultimative KI-Agenten Orchestration Platform.

## ⚡ Schnellstart (5 Minuten)

```bash
# 1. Repo klonen
git clone https://github.com/YOUR-USERNAME/open-chain-ai.git
cd open-chain-ai

# 2. Setup (installiert Docker, PostgreSQL, etc.)
./setup.sh

# 3. Fertig!
```

**Dashboard:** http://localhost  
**API:** http://localhost:3000

## Was macht das Setup?

Das `setup.sh` Script:
1. ✅ Prüft ob Docker installiert ist
2. ✅ Installiert Docker automatisch wenn nicht
3. ✅ Startet PostgreSQL + pgvector Container
4. ✅ Prüft/installiert Ollama für KI-Modelle
5. ✅ Baut und startet alles

## Features

- 🤖 **Echte KI-Agenten** - Mit Ollama LLMs
- 🎯 **Task Management** - Aufgaben zuweisen und verfolgen
- 💬 **Chat Interface** - Mit Agenten sprechen
- 📊 **Dashboard** - Alles im Blick
- 🔒 **Docker Sandbox** - Isolierte Code-Ausführung
- 🧠 **PostgreSQL + pgvector** - Für Vektor-Suche

## Systemanforderungen

| Komponente | Minimum |
|------------|---------|
| Docker | 24.0+ |
| RAM | 8GB |
| Festplatte | 20GB |

## Manuelle Installation

Falls das Setup nicht funktioniert:

```bash
# 1. Docker installieren
curl -fsSL https://get.docker.com | sh

# 2. Ollama installieren
curl -fsSL https://ollama.com/install.sh | sh

# 3. Projekt starten
docker-compose up -d
```

## API

### Agenten auflisten
```bash
curl http://localhost:3000/api/v1/agents
```

### Task erstellen
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"API bauen","goalId":"..."}'
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Tech Stack

- **Backend**: Fastify + TypeScript
- **Datenbank**: PostgreSQL + pgvector
- **Frontend**: React + TailwindCSS
- **KI**: Ollama
- **Sandbox**: Docker

## Lizenz

MIT

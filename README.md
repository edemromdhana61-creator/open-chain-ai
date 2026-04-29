# Open Chain AI

Die ultimative KI-Agenten Orchestration Platform.

## ⚡ Schnellstart (30 Sekunden)

```bash
# 1. Repo klonen
git clone https://github.com/YOUR-USERNAME/open-chain-ai.git
cd open-chain-ai

# 2. Setup
./setup.sh

# 3. Starten
pnpm dev
```

**Fertig!** Dashboard öffnet sich unter http://localhost:3000

## Systemanforderungen

| Komponente | Minimum |
|------------|---------|
| Node.js | 20+ |
| RAM | 4GB |
| Festplatte | 10GB |

## Installation

### 1. Node.js installieren

```bash
# macOS/Linux
brew install node pnpm

# Windows
# Lade von https://nodejs.org/
# npm install -g pnpm
```

### 2. Ollama installieren (für KI-Modelle)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2
```

### 3. Open Chain AI starten

```bash
git clone https://github.com/YOUR-USERNAME/open-chain-ai.git
cd open-chain-ai
./setup.sh
pnpm dev
```

## Was ist das?

Open Chain AI ist eine **KI-Agenten Orchestration Platform**.

Du hast mehrere KI-Agenten die für dich arbeiten:
- **OpenClaw** - Projektmanager
- **Hermes** - Senior Developer  
- **Claude** - Researcher
- **Codex** - DevOps Engineer

Jeder Agent kann Aufgaben übernehmen, Code schreiben, recherchieren oder deployen.

## Features

- 🤖 **Echte KI-Agenten** - Mit Ollama LLMs
- 🎯 **Task Management** - Aufgaben zuweisen und verfolgen
- 💬 **Chat Interface** - Mit Agenten sprechen
- 📊 **Dashboard** - Alles im Blick
- ⚡ **Einfach** - Setup in 30 Sekunden

## API

### Agenten ausführen

```bash
curl -X POST http://localhost:3000/api/v1/agents/1/execute \
  -H "Content-Type: application/json" \
  -d '{"task": "Erkläre was Docker ist"}'
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Tech Stack

- **Backend**: Fastify + TypeScript + SQLite
- **Frontend**: React + TailwindCSS
- **KI**: Ollama (lokale LLMs)
- **Datenbank**: SQLite (kein Docker nötig!)

## Keine Abhängigkeiten!

✅ Kein Docker nötig  
✅ Keine Cloud-Anbieter  
✅ Keine API Keys  
✅ Läuft komplett lokal  

## Troubleshooting

### "Ollama not found"
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2
```

### "Port 3000 belegt"
```bash
# Port ändern
PORT=3001 pnpm dev
```

## Lizenz

MIT - Mach damit was du willst.

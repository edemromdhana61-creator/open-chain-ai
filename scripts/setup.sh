#!/bin/bash
set -e

echo "🚀 Open Chain AI - Setup"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1 gefunden"
        return 0
    else
        echo -e "${RED}✗${NC} $1 nicht gefunden"
        return 1
    fi
}

echo ""
echo "📋 Prüfe Voraussetzungen..."
echo "-------------------------"

MISSING=0
check_command "docker" || MISSING=1
check_command "docker-compose" || MISSING=1
check_command "node" || MISSING=1
check_command "pnpm" || MISSING=1

if [ $MISSING -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Fehlende Voraussetzungen!${NC}"
    echo ""
    echo "Installiere:"
    echo "  - Docker: https://docs.docker.com/get-docker/"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - pnpm: npm install -g pnpm"
    exit 1
fi

# Check Docker running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker läuft nicht"
    echo "Starte Docker Desktop oder Docker Daemon"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker läuft"

# Environment setup
echo ""
echo "🔧 Environment Setup..."
echo "----------------------"

if [ ! -f .env ]; then
    echo "Erstelle .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️${NC} Bitte OLLAMA_TOKEN in .env eintragen!"
fi

# Check Ollama token
if ! grep -q "OLLAMA_TOKEN=your-ollama-cloud-token-here" .env; then
    echo -e "${GREEN}✓${NC} Ollama Token konfiguriert"
else
    echo -e "${YELLOW}⚠️${NC} Ollama Token ist noch Default!"
    echo "Bearbeite .env und setze deinen Token"
fi

# Install dependencies
echo ""
echo "📦 Installiere Dependencies..."
echo "-----------------------------"

pnpm install

# Start database and NATS
echo ""
echo "🐳 Starte Infrastruktur..."
echo "-------------------------"

docker-compose up -d db nats

# Wait for PostgreSQL
echo "Warte auf PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U openchain >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} PostgreSQL bereit"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗${NC} PostgreSQL Timeout"
        exit 1
    fi
done

# Run migrations
echo ""
echo "🔄 Datenbank Migrationen..."
echo "--------------------------"

# Check if pgvector is available
if ! docker-compose exec -T db psql -U openchain -d openchain -c "SELECT * FROM pg_extension WHERE extname = 'vector';" | grep -q vector; then
    echo "Installiere pgvector..."
    docker-compose exec -T db psql -U openchain -d openchain -c "CREATE EXTENSION IF NOT EXISTS vector;"
fi

# Create schema
echo "Erstelle Schema..."
cd apps/api
pnpm db:generate
cd ../..

# Seed data
echo ""
echo "🌱 Erstelle Beispiel-Daten..."
echo "----------------------------"

node -e "
const fetch = require('node-fetch');

async function seed() {
  try {
    // Create company
    const company = await fetch('http://localhost:3000/api/v1/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Company' })
    });
    
    console.log('✓ Company erstellt');
  } catch(e) {
    console.log('ℹ Company existiert möglicherweise bereits');
  }
}

seed();
"

# Start services
echo ""
echo "🚀 Starte Services..."
echo "---------------------"

docker-compose up -d

echo ""
echo -e "${GREEN}✅ Setup abgeschlossen!${NC}"
echo ""
echo "URLs:"
echo "  Dashboard: http://localhost"
echo "  API:       http://localhost:3000"
echo "  Health:    http://localhost:3000/health"
echo ""
echo "Befehle:"
echo "  docker-compose logs -f    # Logs anzeigen"
echo "  docker-compose ps         # Status"
echo "  pnpm test                 # Tests"
echo ""

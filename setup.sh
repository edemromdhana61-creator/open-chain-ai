#!/bin/bash
set -e

echo "🚀 Open Chain AI - Setup"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helper functions
ask() {
    read -p "$1 (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

echo ""
echo "📋 Prüfe Voraussetzungen..."
echo "---------------------------"

MISSING=0
check_command "docker" || MISSING=1
check_command "docker-compose" || MISSING=1
check_command "git" || MISSING=1

if [ $MISSING -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Einige Tools fehlen!${NC}"
    
    if ! check_command "docker"; then
        echo ""
        echo "Docker wird benötigt für:"
        echo "  • PostgreSQL Datenbank"
        echo "  • Docker Sandbox für Code-Ausführung"
        echo ""
        
        if ask "Docker jetzt installieren?"; then
            echo "Installiere Docker..."
            curl -fsSL https://get.docker.com | sh
            sudo usermod -aG docker $USER
            echo -e "${GREEN}✅ Docker installiert${NC}"
            echo "⚠️  Bitte ausloggen und neu einloggen damit Docker funktioniert"
            exit 0
        else
            echo "Ohne Docker kann das Projekt nicht alle Features nutzen"
            exit 1
        fi
    fi
    
    if ! check_command "docker-compose"; then
        echo "Installiere docker-compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo -e "${GREEN}✅ Docker Compose installiert${NC}"
    fi
    
    if ! check_command "git"; then
        echo "Installiere git..."
        sudo apt-get update && sudo apt-get install -y git
    fi
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker läuft nicht!"
    echo "Starte Docker..."
    sudo systemctl start docker || true
    
    if ! docker info >/dev/null 2>&1; then
        echo "Bitte starte Docker manuell"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Docker läuft"

# Environment setup
echo ""
echo "🔧 Environment Setup..."
echo "---------------------"

if [ ! -f .env ]; then
    echo "Erstelle .env..."
    cat > .env << EOF
# Open Chain AI Configuration
PORT=3000
DATABASE_URL=postgres://openchain:openchain@localhost:5432/openchain
OLLAMA_HOST=http://localhost:11434
JWT_SECRET=$(openssl rand -hex 32)
SANDBOX_CPU_LIMIT=1
SANDBOX_MEMORY_LIMIT=512m
CIRCUIT_BREAKER_MAX_REVISIONS=3
EOF
    echo -e "${GREEN}✓${NC} .env erstellt"
fi

# Start database
echo ""
echo "🐳 Starte Datenbank..."
echo "---------------------"

docker-compose up -d db

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

# Install pgvector extension
docker-compose exec -T db psql -U openchain -d openchain -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null 2>&1 || true

echo -e "${GREEN}✓${NC} pgvector installiert"

# Check Ollama
echo ""
echo "🤖 Prüfe Ollama..."
echo "------------------"

if command -v ollama >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Ollama installiert"
    
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Ollama läuft"
        
        # Check for models
        MODELS=$(ollama list | tail -n +2 | wc -l)
        if [ "$MODELS" -eq 0 ]; then
            echo -e "${YELLOW}⚠️  Keine Modelle gefunden${NC}"
            if ask "llama3.2 installieren?"; then
                ollama pull llama3.2
            fi
        else
            echo -e "${GREEN}✓${NC} $MODELS Modelle verfügbar"
        fi
    else
        echo -e "${YELLOW}⚠️  Ollama nicht gestartet${NC}"
        echo "Starte: ollama serve"
    fi
else
    echo -e "${YELLOW}⚠️  Ollama nicht installiert${NC}"
    echo ""
    echo "Ollama wird benötigt für KI-Agenten"
    echo ""
    if ask "Ollama jetzt installieren?"; then
        curl -fsSL https://ollama.com/install.sh | sh
        echo -e "${GREEN}✅ Ollama installiert${NC}"
        echo "Starte in neuem Terminal: ollama serve"
    fi
fi

# Build and start
echo ""
echo "🏗️  Baue Projekt..."
echo "-------------------"

docker-compose build

echo ""
echo "🚀 Starte Open Chain AI..."
echo "-------------------------"

docker-compose up -d

echo ""
echo -e "${GREEN}✅ Open Chain AI läuft!${NC}"
echo ""
echo "URLs:"
echo "  Dashboard: http://localhost"
echo "  API:       http://localhost:3000"
echo "  Health:    http://localhost:3000/health"
echo ""
echo "Befehle:"
echo "  docker-compose logs -f    # Logs"
echo "  docker-compose ps         # Status"
echo "  docker-compose down       # Stoppen"
echo ""
echo "Weitere Infos: README.md"
echo ""

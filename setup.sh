#!/bin/bash
set -e

echo "🚀 Open Chain AI - Setup"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
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
echo "📋 Checking prerequisites..."
echo "-----------------------------"

MISSING=0
check_command "node" || MISSING=1
check_command "pnpm" || MISSING=1

if [ $MISSING -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Missing prerequisites!${NC}"
    echo ""
    echo "Install:"
    echo "  Node.js: https://nodejs.org/"
    echo "  pnpm:    npm install -g pnpm"
    exit 1
fi

# Check Ollama
if ! check_command "ollama"; then
    echo ""
    echo -e "${YELLOW}⚠️  Ollama not found!${NC}"
    echo "Install: curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    read -p "Install Ollama now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "Please install Ollama manually"
        exit 1
    fi
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Ollama not running!${NC}"
    echo "Start: ollama serve"
    echo ""
    read -p "Start Ollama now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ollama serve &
        sleep 2
    fi
fi

# Pull default model
echo ""
echo "📦 Checking models..."
echo "---------------------"

if ! ollama list | grep -q "llama3.2"; then
    echo "Pulling llama3.2..."
    ollama pull llama3.2
else
    echo -e "${GREEN}✓${NC} llama3.2 available"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "----------------------------"

pnpm install

# Create .env if not exists
if [ ! -f .env ]; then
    echo ""
    echo "🔧 Creating .env..."
    echo "-------------------"
    cat > .env << EOF
# Open Chain AI Configuration
PORT=3000
OLLAMA_HOST=http://localhost:11434
EOF
    echo -e "${GREEN}✓${NC} .env created"
fi

# Create data directory
mkdir -p data

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Start:"
echo "  pnpm dev    # Development"
echo "  pnpm start  # Production"
echo ""
echo "URLs:"
echo "  Dashboard: http://localhost:3000"
echo "  Health:    http://localhost:3000/health"
echo ""

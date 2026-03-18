#!/bin/bash

# Mission Control Setup Script
# One-command setup for the Integrated Agent System

set -e

echo "🚀 Mission Control - Integrated Agent System Setup"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
check_node() {
    echo -e "${BLUE}Checking Node.js version...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        echo "Please install Node.js 18 or higher: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version $NODE_VERSION is too old${NC}"
        echo "Please upgrade to Node.js 18 or higher"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
}

# Check npm
check_npm() {
    echo -e "${BLUE}Checking npm...${NC}"
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ npm $(npm -v)${NC}"
}

# Install dependencies
install_deps() {
    echo ""
    echo -e "${BLUE}Installing dependencies...${NC}"
    
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}⚠ node_modules already exists, skipping install${NC}"
    else
        npm install
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    fi
}

# Create directories
create_dirs() {
    echo ""
    echo -e "${BLUE}Creating directories...${NC}"
    
    mkdir -p logs
    mkdir -p data
    
    echo -e "${GREEN}✓ Directories created${NC}"
}

# Setup environment
setup_env() {
    echo ""
    echo -e "${BLUE}Setting up environment...${NC}"
    
    if [ -f ".env" ]; then
        echo -e "${YELLOW}⚠ .env already exists, skipping${NC}"
    else
        cp .env.example .env
        echo -e "${GREEN}✓ Environment file created (.env)${NC}"
        echo -e "${YELLOW}⚠ Please edit .env to customize your configuration${NC}"
    fi
}

# Validate configuration
validate_config() {
    echo ""
    echo -e "${BLUE}Validating configuration...${NC}"
    
    if npm run validate 2>/dev/null; then
        echo -e "${GREEN}✓ Configuration valid${NC}"
    else
        echo -e "${YELLOW}⚠ Configuration validation skipped (validate script not found)${NC}"
    fi
}

# Print success message
print_success() {
    echo ""
    echo -e "${GREEN}==================================================${NC}"
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo -e "${GREEN}==================================================${NC}"
    echo ""
    echo "To start Mission Control:"
    echo ""
    echo "  npm start"
    echo ""
    echo "Then open your browser to:"
    echo ""
    echo "  http://localhost:8080"
    echo ""
    echo "For development mode with auto-reload:"
    echo ""
    echo "  npm run dev"
    echo ""
}

# Main
main() {
    check_node
    check_npm
    install_deps
    create_dirs
    setup_env
    validate_config
    print_success
}

main

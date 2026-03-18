#!/bin/bash

# OpenClaw Mission Control - Setup Script
# This script sets up the development environment

echo "🌙 Setting up OpenClaw Mission Control..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create necessary directories
mkdir -p logs

echo ""
echo "✨ Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev     - Start in development mode"
echo "  npm start       - Start the application"
echo "  npm run build   - Build for production"
echo ""
echo "For more information, see DEVELOPMENT.md"

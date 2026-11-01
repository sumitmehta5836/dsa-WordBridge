#!/bin/bash

# Ensure we operate in the script's directory (project root)
cd "$(dirname "$0")" || exit 1

# Ensure common paths (Homebrew on Apple Silicon / Intel, standard paths, nvm) are available
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

if [ -d "$HOME/.nvm/versions/node" ]; then
    LATEST_NVM_NODE=$(ls -d "$HOME/.nvm/versions/node"/* 2>/dev/null | sort -V | tail -n 1)
    if [ -n "$LATEST_NVM_NODE" ] && [ -d "$LATEST_NVM_NODE/bin" ]; then
        export PATH="$LATEST_NVM_NODE/bin:$PATH"
    fi
fi

echo "==================================================="
echo "  WordBridge — GUI Browser Game Launcher"
echo "  DSA Project-Based Learning (PBL)"
echo "==================================================="
echo ""

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Error: Node.js is not found in your PATH."
    echo "   Please install Node.js from https://nodejs.org/ or via Homebrew: brew install node"
    echo ""
    read -n 1 -s -r -p "Press any key to close this window..."
    echo ""
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo "🚀 Starting server and opening game in your default browser..."
echo ""
echo "   Server URL: http://localhost:3000"
echo "   Press Ctrl+C in this Terminal to stop the server."
echo "---------------------------------------------------"
echo ""

# Run node server.js (server.js automatically launches http://localhost:3000 in your default browser)
node server.js

# Kept open if stopped or if an error occurred
echo ""
read -n 1 -s -r -p "Press any key to close this window..."
echo ""

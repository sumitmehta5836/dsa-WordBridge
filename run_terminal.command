#!/bin/bash

# Ensure we operate in the script's directory (project root)
cd "$(dirname "$0")" || exit 1

# Ensure common compiler paths (Homebrew, standard paths) are available
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "==================================================="
echo "  WordBridge — Terminal Game Launcher (C Console)"
echo "  DSA Project-Based Learning (PBL)"
echo "==================================================="
echo ""

TARGET_BIN="./wordbridge"
ALT_BIN="./dsa-wordBridge-terminal/wordbridge"

# If binary is not yet compiled, build it automatically
if [ ! -f "$TARGET_BIN" ] && [ ! -f "$ALT_BIN" ]; then
    echo "⚙️  Executable not found. Building WordBridge..."
    if command -v make >/dev/null 2>&1; then
        make || (cd dsa-wordBridge-terminal && make)
    elif command -v gcc >/dev/null 2>&1; then
        gcc -Wall -Wextra -std=c99 -O2 -Iinclude src/*.c -o wordbridge
    elif command -v clang >/dev/null 2>&1; then
        clang -Wall -Wextra -std=c99 -O2 -Iinclude src/*.c -o wordbridge
    else
        echo "❌ Error: Neither make nor gcc/clang was found on this system."
        echo "   Please install Xcode Command Line Tools by running: xcode-select --install"
        echo ""
        read -n 1 -s -r -p "Press any key to close this window..."
        echo ""
        exit 1
    fi
fi

# Run the terminal game
if [ -f "$TARGET_BIN" ]; then
    "$TARGET_BIN"
elif [ -f "$ALT_BIN" ]; then
    cd dsa-wordBridge-terminal && ./wordbridge
else
    echo "❌ Error: Could not locate compiled wordbridge binary."
    echo ""
    read -n 1 -s -r -p "Press any key to close this window..."
    echo ""
    exit 1
fi

echo ""
read -n 1 -s -r -p "Press any key to close this window..."
echo ""

#!/bin/bash

# Exit on error
set -e

echo "🌱 Building Terrarium Theme VSIX with Node.js"

# Change to the script directory
cd "$(dirname "$0")"

# Check if package-scripts.json exists and npm is installed
if [ -f "package-scripts.json" ] && command -v npm &> /dev/null; then
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install --package-lock=false --no-package-lock --no-save
    fi
    
    # Run the Node.js build script
    echo "Running build script..."
    node build-vsix.js
else
    echo "Error: Required files or npm not found"
    exit 1
fi

# Check if the build was successful
if ls terrarium-theme-*.vsix 1> /dev/null 2>&1; then
    echo "✅ Build completed successfully"
    
    # Ask if user wants to install
    echo "Would you like to install the theme now? (y/n)"
    read -r install_response
    
    if [[ "$install_response" =~ ^[Yy]$ ]]; then
        VSIX_FILE=$(ls terrarium-theme-*.vsix | head -n 1)
        echo "Installing: $VSIX_FILE"
        code --install-extension "$VSIX_FILE"
    fi
else
    echo "❌ Build failed"
    exit 1
fi

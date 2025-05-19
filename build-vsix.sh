#!/bin/bash

# Exit on error
set -e

echo "🌱 Building Terrarium Theme VSIX Package"

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "Installing vsce..."
    npm install -g @vscode/vsce
fi

# Package the extension
echo "Creating VSIX package..."
vsce package

# Get the generated vsix file name
VSIX_FILE=$(ls *.vsix | head -n 1)

echo "✅ Package created: $VSIX_FILE"
echo ""
echo "This file can now be uploaded to:"
echo "- Visual Studio Marketplace: https://marketplace.visualstudio.com/manage"
echo "- Open VSX Registry: https://open-vsx.org"
echo ""
echo "Or installed manually with:"
echo "code --install-extension $VSIX_FILE"

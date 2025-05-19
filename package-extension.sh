#!/bin/bash

# Exit on error
set -e

echo "🌱 Packaging Terrarium Theme for VS Code..."

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

echo "📦 Package created: $VSIX_FILE"
echo ""
echo "Would you like to install the theme now? (y/n)"
read -r answer

if [[ "$answer" =~ ^[Yy]$ ]]; then
    echo "Installing theme..."
    code --install-extension "$VSIX_FILE"
    echo "✅ Terrarium Theme installed successfully!"
    echo ""
    echo "To activate the theme:"
    echo "1. Open VS Code"
    echo "2. Press Cmd+K then Cmd+T (or Ctrl+K then Ctrl+T on Windows/Linux)"
    echo "3. Select 'Terrarium (Dark)' or 'Terrarium (Light)'"
else
    echo ""
    echo "To install manually later:"
    echo "code --install-extension $VSIX_FILE"
    echo ""
    echo "Or from VS Code:"
    echo "1. Open VS Code"
    echo "2. Go to Extensions (Cmd+Shift+X or Ctrl+Shift+X)"
    echo "3. Click the '...' menu in the top-right of the Extensions panel"
    echo "4. Select 'Install from VSIX...'"
    echo "5. Choose the file: $VSIX_FILE"
fi

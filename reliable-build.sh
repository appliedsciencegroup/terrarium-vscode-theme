#!/bin/bash

# Exit on error
set -e

echo "🌱 Starting improved reliable build process for Terrarium Theme"

# Change to the script directory
cd "$(dirname "$0")"

# Make sure archiver is installed locally
if ! grep -q "archiver" package-scripts.json 2>/dev/null; then
    echo "Installing archiver locally..."
    npm install archiver --no-save --no-package-lock
fi

# Install vsce locally to avoid permission issues
echo "Installing vsce locally..."
npm install @vscode/vsce --no-save --no-package-lock

# Run the improved build script with error handling
echo "Running build script..."
node build-reliable.js || {
    echo "Node script failed, trying manual packaging..."
    if [ -f "manual-package.sh" ]; then
        chmod +x manual-package.sh
        ./manual-package.sh
    fi
}

# Check if the build was successful
if ls terrarium-theme-*.vsix 1> /dev/null 2>&1; then
    echo "✅ Build completed successfully"
    
    # Show the file and its size
    VSIX_FILE=$(ls -t terrarium-theme-*.vsix | head -n 1)
    FILE_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
    
    echo "📦 Package file: $VSIX_FILE ($FILE_SIZE)"
    echo ""
    echo "This file is ready to upload to the Microsoft Visual Studio Marketplace."
    echo ""
    
    # Ask if user wants to install
    echo "Would you like to install the theme now? (y/n)"
    read -r install_response
    
    if [[ "$install_response" =~ ^[Yy]$ ]]; then
        echo "Installing: $VSIX_FILE"
        code --install-extension "$VSIX_FILE"
        echo "✅ Theme installed successfully!"
    fi
else
    echo "❌ Build failed - no VSIX package was created"
    exit 1
fi

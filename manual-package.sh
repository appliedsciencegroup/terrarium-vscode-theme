#!/bin/bash

# Exit on error
set -e

echo "🌱 Creating Terrarium Theme VSIX Package Manually"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Creating temporary directory: $TEMP_DIR"

# VS Code extensions must have a specific structure
# The package.json must be at the root of the zip file
mkdir -p "$TEMP_DIR/themes"
mkdir -p "$TEMP_DIR/assets/icons"

# Copy files
echo "Copying theme files..."
cp package.json "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp LICENSE "$TEMP_DIR/"
cp icon.png "$TEMP_DIR/"
cp -R themes/* "$TEMP_DIR/themes/"
cp -R assets/icons/* "$TEMP_DIR/assets/icons/"

# Get version from package.json
VERSION=$(grep -oE '"version": "[^"]+"' package.json | cut -d'"' -f4)
echo "Theme version: $VERSION"

# Create VSIX package (which is just a ZIP with a different extension)
echo "Creating VSIX package..."
cd "$TEMP_DIR"
zip -r "../terrarium-theme-$VERSION.vsix" *
cd - > /dev/null

# Move the VSIX to the current directory
cp "$TEMP_DIR/../terrarium-theme-$VERSION.vsix" .

echo "✅ Package created: terrarium-theme-$VERSION.vsix"
echo ""
echo "This file can now be uploaded to:"
echo "- Visual Studio Marketplace: https://marketplace.visualstudio.com/manage"
echo "- Open VSX Registry: https://open-vsx.org"
echo ""
echo "Or installed manually with:"
echo "code --install-extension terrarium-theme-$VERSION.vsix"

# Clean up
rm -rf "$TEMP_DIR"

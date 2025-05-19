#!/bin/bash

# Exit on error
set -e

echo "🌱 Creating Terrarium Theme VSIX Package with proper manifest"

# Get version from package.json
VERSION=$(grep -oE '"version": "[^"]+"' package.json | cut -d'"' -f4)
echo "Theme version: $VERSION"

# Create a temp directory for staging files
TEMP_DIR=$(mktemp -d)
echo "Creating temporary directory: $TEMP_DIR"

# Copy required files to the temp directory
echo "Copying theme files..."
cp package.json "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp LICENSE "$TEMP_DIR/"
cp icon.png "$TEMP_DIR/"

# Create the themes directory and copy theme files
mkdir -p "$TEMP_DIR/themes"
cp -r themes/* "$TEMP_DIR/themes/"

# Create the assets directory and copy assets
if [ -d "assets" ]; then
  mkdir -p "$TEMP_DIR/assets"
  cp -r assets/* "$TEMP_DIR/assets/"
fi

# Create the crucial extension.vsixmanifest file
echo "Creating extension.vsixmanifest..."
PUBLISHER=$(grep -oE '"publisher": "[^"]+"' package.json | cut -d'"' -f4)
NAME=$(grep -oE '"name": "[^"]+"' package.json | cut -d'"' -f4)
DISPLAY_NAME=$(grep -oE '"displayName": "[^"]+"' package.json | cut -d'"' -f4)
DESCRIPTION=$(grep -oE '"description": "[^"]+"' package.json | cut -d'"' -f4)
ENGINE=$(grep -oE '"vscode": "[^"]+"' package.json | cut -d'"' -f4)
KEYWORDS=$(grep -A 10 '"keywords":' package.json | grep -v "keywords" | grep -oE '"[^"]+"' | tr -d '"' | tr '\n' ',' | sed 's/,$//')

cat > "$TEMP_DIR/extension.vsixmanifest" << EOF
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="${NAME}" Version="${VERSION}" Publisher="${PUBLISHER}" />
    <DisplayName>${DISPLAY_NAME}</DisplayName>
    <Description xml:space="preserve">${DESCRIPTION}</Description>
    <Tags>${KEYWORDS}</Tags>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${ENGINE}" />
    </Properties>
    <Icon>icon.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="LICENSE" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="icon.png" Addressable="true" />
  </Assets>
</PackageManifest>
EOF

# Create the VSIX file (which is actually a ZIP file)
echo "Creating VSIX package..."
OUTPUT_FILE="terrarium-theme-${VERSION}.vsix"
cd "$TEMP_DIR"
zip -r "../$OUTPUT_FILE" ./* >/dev/null
cd - > /dev/null

# Move the file to the current directory
mv "$TEMP_DIR/../$OUTPUT_FILE" .
echo "✅ Package created: $OUTPUT_FILE"

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "This file can now be uploaded to:"
echo "- Visual Studio Marketplace: https://marketplace.visualstudio.com/manage"
echo ""
echo "Or installed manually with:"
echo "code --install-extension $OUTPUT_FILE"

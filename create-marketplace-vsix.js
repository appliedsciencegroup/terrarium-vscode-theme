#!/usr/bin/env node

// Script to create a VS Code extension VSIX package with proper marketplace manifest
// Based on Microsoft's requirements

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Create a temporary directory
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-extension-'));
console.log(`Using temporary directory: ${tempDir}`);

// Read the package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const { name, displayName, description, version, publisher, engines, keywords } = packageJson;

// Ensure critical fields exist
if (!name || !version || !publisher) {
  console.error('Error: package.json must contain name, version, and publisher fields');
  process.exit(1);
}

// Create extension.vsixmanifest according to Microsoft's requirements
const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="${name}" Version="${version}" Publisher="${publisher}" />
    <DisplayName>${displayName || name}</DisplayName>
    <Description xml:space="preserve">${description || ''}</Description>
    <Tags>${keywords ? keywords.join(',') : ''}</Tags>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${engines?.vscode || '^1.60.0'}" />
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
</PackageManifest>`;

console.log('Creating extension.vsixmanifest...');
fs.writeFileSync(path.join(tempDir, 'extension.vsixmanifest'), vsixManifest);

// Copy required files
const filesToCopy = ['package.json', 'README.md', 'LICENSE', 'icon.png'];
console.log('Copying required files...');

for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(tempDir, file));
  } else {
    console.warn(`Warning: ${file} not found, but continuing`);
  }
}

// Copy themes directory
if (fs.existsSync('themes')) {
  console.log('Copying themes directory...');
  fs.mkdirSync(path.join(tempDir, 'themes'), { recursive: true });
  
  const files = fs.readdirSync('themes');
  for (const file of files) {
    fs.copyFileSync(
      path.join('themes', file),
      path.join(tempDir, 'themes', file)
    );
  }
} else {
  console.error('Error: themes directory not found!');
  process.exit(1);
}

// Copy assets directory if it exists
if (fs.existsSync('assets')) {
  console.log('Copying assets directory...');
  fs.mkdirSync(path.join(tempDir, 'assets'), { recursive: true });
  
  function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir('assets', path.join(tempDir, 'assets'));
}

// Create VSIX file (using zip)
const outputFile = `${name}-${version}.vsix`;
console.log(`Creating VSIX package: ${outputFile}...`);

const zipCommand = process.platform === 'win32'
  ? `cd "${tempDir}" && powershell Compress-Archive -Path * -DestinationPath ../${outputFile}`
  : `cd "${tempDir}" && zip -r "../${outputFile}" *`;

exec(zipCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error creating VSIX package: ${error.message}`);
    return;
  }
  
  // Move the file to the current directory
  const vsixPath = path.join(path.dirname(tempDir), outputFile);
  if (fs.existsSync(vsixPath)) {
    fs.copyFileSync(vsixPath, outputFile);
    fs.unlinkSync(vsixPath);
    
    console.log(`✅ Package created: ${outputFile}`);
    console.log('');
    console.log('This file can now be uploaded to:');
    console.log('- Visual Studio Marketplace: https://marketplace.visualstudio.com/manage');
    console.log('');
    console.log('Or installed locally with:');
    console.log(`code --install-extension ${outputFile}`);
  } else {
    console.error(`Error: Failed to create VSIX package`);
  }
  
  // Clean up
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.warn(`Warning: Could not remove temporary directory ${tempDir}`);
  }
});

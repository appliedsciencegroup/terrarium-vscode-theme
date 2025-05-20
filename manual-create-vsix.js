#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌱 Manually creating VS Code extension package');

// Read the package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const { name, version, publisher, displayName, description, engines, keywords } = packageJson;

// Create clean temp directory
const tempDir = path.join('temp-vsix-build');
if (fs.existsSync(tempDir)) {
  console.log('Cleaning temp directory...');
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir);

// Copy required files
console.log('Copying theme files...');
fs.mkdirSync(path.join(tempDir, 'themes'), { recursive: true });
fs.readdirSync('themes').forEach(file => {
  fs.copyFileSync(path.join('themes', file), path.join(tempDir, 'themes', file));
});

// Copy assets
if (fs.existsSync('assets')) {
  console.log('Copying assets...');
  fs.mkdirSync(path.join(tempDir, 'assets'), { recursive: true });
  fs.readdirSync('assets').forEach(file => {
    const sourcePath = path.join('assets', file);
    const destPath = path.join(tempDir, 'assets', file);
    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      fs.readdirSync(sourcePath).forEach(subfile => {
        fs.copyFileSync(path.join(sourcePath, subfile), path.join(destPath, subfile));
      });
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

// Copy other required files
['README.md', 'LICENSE', 'package.json'].forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(tempDir, file));
  }
});

// Copy icon if it exists as a standalone file (not in assets)
if (packageJson.icon && !packageJson.icon.startsWith('assets/') && fs.existsSync(packageJson.icon)) {
  fs.copyFileSync(packageJson.icon, path.join(tempDir, packageJson.icon));
}

// Create extension.vsixmanifest
console.log('Creating manifest...');
const manifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="${name}" Version="${version}" Publisher="${publisher}" />
    <DisplayName>${displayName || name}</DisplayName>
    <Description xml:space="preserve">${description || ''}</Description>
    <Tags>${keywords ? keywords.join(',') : ''}</Tags>
    <Categories>Themes</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${engines?.vscode || '^1.60.0'}" />
    </Properties>
    <Icon>${packageJson.icon}</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="LICENSE" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="${packageJson.icon}" Addressable="true" />
  </Assets>
</PackageManifest>`;

fs.writeFileSync(path.join(tempDir, 'extension.vsixmanifest'), manifest);

// Create the VSIX file (ZIP with different extension)
const outputFile = `${name}-${version}.vsix`;
console.log(`Creating package: ${outputFile}...`);

try {
  // Change to temp directory
  process.chdir(tempDir);
  
  // Use zip command to create the VSIX package
  execSync(`zip -r "${outputFile}" *`, { stdio: 'inherit' });
  
  // Move back to original directory
  process.chdir('..');
  
  // Copy the package to the current directory
  fs.copyFileSync(path.join(tempDir, outputFile), outputFile);
  
  // Copy to root directory
  fs.copyFileSync(outputFile, path.join('..', '..', '..', outputFile));
  
  console.log(`✅ Successfully created package: ${outputFile}`);
  console.log(`✅ Package copied to root directory`);
} catch (err) {
  console.error('Error creating package:', err.message);
  process.exit(1);
}

// Clean up
console.log('Cleaning up...');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('Package is ready to be uploaded to Microsoft Marketplace');

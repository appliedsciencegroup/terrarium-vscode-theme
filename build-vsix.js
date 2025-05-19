// This script creates a proper VSIX package for VS Code
// Using Node.js as it better handles the required VSIX format

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Ensure archiver is installed
try {
  require.resolve('archiver');
} catch (e) {
  console.log('Installing archiver package...');
  require('child_process').execSync('npm install archiver');
}

console.log('🌱 Creating Terrarium Theme VSIX Package');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;
console.log(`Theme version: ${version}`);

// Output file
const outputFile = `terrarium-theme-${version}.vsix`;
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive to the file
archive.pipe(output);

// Add the extension.vsixmanifest file
const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="${packageJson.name}" Version="${version}" Publisher="${packageJson.publisher}" />
    <DisplayName>${packageJson.displayName}</DisplayName>
    <Description xml:space="preserve">${packageJson.description}</Description>
    <Tags>${packageJson.keywords.join(',')}</Tags>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${packageJson.engines.vscode}" />
    </Properties>
    <Icon>icon.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/icon.png" Addressable="true" />
  </Assets>
</PackageManifest>`;

archive.append(vsixManifest, { name: 'extension.vsixmanifest' });

// Create a directory for the extension content
fs.mkdirSync('extension', { recursive: true });

// Add files to the archive
console.log('Adding files to package...');
archive.directory('extension/', false);
archive.file('package.json', { name: 'extension/package.json' });
archive.file('README.md', { name: 'extension/README.md' });
archive.file('LICENSE', { name: 'extension/LICENSE' });
archive.file('icon.png', { name: 'extension/icon.png' });
archive.directory('themes/', 'extension/themes');
archive.directory('assets/', 'extension/assets');

// Finalize the archive
archive.finalize();

output.on('close', function() {
  console.log(`✅ Package created: ${outputFile} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
  console.log('');
  console.log('This file can now be uploaded to:');
  console.log('- Visual Studio Marketplace: https://marketplace.visualstudio.com/manage');
  console.log('- Open VSX Registry: https://open-vsx.org');
  console.log('');
  console.log('Or installed manually with:');
  console.log(`code --install-extension ${outputFile}`);

  // Clean up
  fs.rmSync('extension', { recursive: true, force: true });
});

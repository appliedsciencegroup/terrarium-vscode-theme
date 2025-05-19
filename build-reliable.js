// Improved VSIX packaging script that addresses issues in the build process
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

// Install required dependencies
function ensureDependencies() {
  console.log('Ensuring required dependencies are installed...');
  
  // Check for archiver
  try {
    require.resolve('archiver');
    console.log('✓ archiver is already installed');
  } catch (e) {
    console.log('Installing archiver package...');
    childProcess.execSync('npm install archiver', { stdio: 'inherit' });
  }
  
  // Check for vsce - try to use global first, then local if needed
  let vsceInstalled = false;
  try {
    childProcess.execSync('vsce --version', { stdio: 'ignore' });
    console.log('✓ vsce is already installed globally');
    vsceInstalled = true;
  } catch (e) {
    console.log('vsce not found globally, checking locally...');
    
    // Check for local vsce in node_modules
    try {
      childProcess.execSync('npx vsce --version', { stdio: 'ignore' });
      console.log('✓ vsce is already installed locally');
      vsceInstalled = true;
    } catch (e) {
      console.log('Installing vsce locally...');
      try {
        childProcess.execSync('npm install @vscode/vsce --no-save', { stdio: 'inherit' });
        vsceInstalled = true;
      } catch (installError) {
        console.log('Failed to install vsce locally. Will use manual packaging method.');
      }
    }
  }
}

// Get package version
function getPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

// Build VSIX using vsce (preferred method)
function buildWithVSCE() {
  try {
    console.log('Building VSIX package with vsce...');
    // Try global vsce first, fall back to npx
    try {
      childProcess.execSync('vsce package', { stdio: 'inherit' });
    } catch (error) {
      console.log('Global vsce failed, trying with npx...');
      childProcess.execSync('npx vsce package', { stdio: 'inherit' });
    }
    
    const version = getPackageVersion();
    const expectedOutput = `terrarium-theme-${version}.vsix`;
    
    if (fs.existsSync(expectedOutput)) {
      console.log(`✅ Successfully created ${expectedOutput} with vsce`);
      return true;
    }
    
    console.log('VSIX file not found after vsce package command');
    return false;
  } catch (error) {
    console.log('Failed to build with vsce:', error.message);
    return false;
  }
}

// Manual VSIX building as fallback
function buildManually() {
  console.log('Falling back to manual package creation...');
  
  try {
    const archiver = require('archiver');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version;
    const outputFile = `terrarium-theme-${version}.vsix`;
    
    console.log(`Creating ${outputFile} manually...`);
    
    // Create extension directory if it doesn't exist
    if (!fs.existsSync('extension')) {
      fs.mkdirSync('extension', { recursive: true });
    }
    
    // Create a write stream for our output file
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    // Add extension.vsixmanifest
    const vsixManifest = `<?xml version="1.0" encoding="utf-8"?>
    <PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
      <Metadata>
        <Identity Language="en-US" Id="${packageJson.name}" Version="${version}" Publisher="${packageJson.publisher}" />
        <DisplayName>${packageJson.displayName}</DisplayName>
        <Description xml:space="preserve">${packageJson.description}</Description>
        <Tags>${packageJson.keywords ? packageJson.keywords.join(',') : ""}</Tags>
        <GalleryFlags>Public</GalleryFlags>
        <Properties>
          <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${packageJson.engines.vscode}" />
        </Properties>
        <Icon>extension/icon.png</Icon>
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
    
    // Add required files
    const requiredFiles = ['package.json', 'README.md', 'LICENSE', 'icon.png'];
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`Adding ${file} to package...`);
        archive.file(file, { name: `extension/${file}` });
      } else {
        console.warn(`Warning: ${file} not found, but continuing anyway`);
      }
    });
    
    // Add theme files
    if (fs.existsSync('themes')) {
      console.log('Adding themes directory...');
      archive.directory('themes', 'extension/themes');
    } else {
      console.error('Error: themes directory not found!');
      return false;
    }
    
    // Add assets if they exist
    if (fs.existsSync('assets')) {
      console.log('Adding assets directory...');
      archive.directory('assets', 'extension/assets');
    }
    
    // Finalize archive and return promise
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ Package created: ${outputFile} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
        // Clean up extension directory
        if (fs.existsSync('extension')) {
          fs.rmSync('extension', { recursive: true, force: true });
        }
        resolve(true);
      });
      
      archive.finalize();
    });
  } catch (error) {
    console.error('Failed to build manually:', error);
    return Promise.resolve(false);
  }
}

// Main build function
async function buildPackage() {
  console.log('🌱 Building Terrarium Theme VSIX Package');
  console.log(`Theme version: ${getPackageVersion()}`);
  
  // First try VSCE approach (preferred)
  const vsceSuccess = buildWithVSCE();
  
  // If VSCE failed, try manual approach
  if (!vsceSuccess) {
    console.log('VSCE build failed, trying manual build...');
    const manualSuccess = await buildManually();
    
    if (!manualSuccess) {
      console.error('❌ All build methods failed!');
      process.exit(1);
    }
  }
  
  // Final output
  const version = getPackageVersion();
  const outputFile = `terrarium-theme-${version}.vsix`;
  
  console.log('\nThis file can now be uploaded to:');
  console.log('- Visual Studio Marketplace: https://marketplace.visualstudio.com/manage');
  console.log('- Open VSX Registry: https://open-vsx.org');
  console.log('\nOr installed manually with:');
  console.log(`code --install-extension ${outputFile}`);
}

// Run the build process
ensureDependencies();
buildPackage().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

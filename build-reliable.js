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

// Verify and fix VSIX package to ensure it has a proper manifest
function verifyVsixPackage(filePath) {
  console.log(`Verifying VSIX package: ${filePath}`);
  
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }
    
    // Use unzip to check the contents
    const unzipCommand = `unzip -l "${filePath}" | grep -q "extension\\.vsixmanifest"`;
    try {
      childProcess.execSync(unzipCommand, { stdio: 'ignore' });
      console.log('✅ Package contains valid extension.vsixmanifest');
      return true;
    } catch (e) {
      console.log('❌ Package is missing extension.vsixmanifest, rebuilding...');
      return false;
    }
  } catch (error) {
    console.log('Error verifying package:', error.message);
    return false;
  }
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
      // Verify the package has a manifest
      if (verifyVsixPackage(expectedOutput)) {
        return true;
      } else {
        // If verification fails, continue to manual building
        return false;
      }
    }
    
    console.log('VSIX file not found after vsce package command');
    return false;
  } catch (error) {
    console.log('Failed to build with vsce:', error.message);
    return false;
  }
}

// Create a proper extension.vsixmanifest file
function createVsixManifest() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  
  return `<?xml version="1.0" encoding="utf-8"?>
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
    
    // Create a temporary directory for staging files
    const tempDir = fs.mkdtempSync('vscode-theme-');
    console.log(`Created temporary directory: ${tempDir}`);
    
    // Copy required files
    const requiredFiles = ['package.json', 'README.md', 'LICENSE', 'icon.png'];
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`Copying ${file} to staging...`);
        fs.copyFileSync(file, path.join(tempDir, file));
      } else {
        console.warn(`Warning: ${file} not found, but continuing anyway`);
      }
    });
    
    // Copy themes directory
    if (fs.existsSync('themes')) {
      console.log('Copying themes directory...');
      fs.mkdirSync(path.join(tempDir, 'themes'), { recursive: true });
      const themeFiles = fs.readdirSync('themes');
      themeFiles.forEach(file => {
        fs.copyFileSync(
          path.join('themes', file),
          path.join(tempDir, 'themes', file)
        );
      });
    } else {
      console.error('Error: themes directory not found!');
      fs.rmdirSync(tempDir, { recursive: true });
      return false;
    }
    
    // Copy assets directory if it exists
    if (fs.existsSync('assets')) {
      console.log('Copying assets directory...');
      fs.mkdirSync(path.join(tempDir, 'assets'), { recursive: true });
      copyDirRecursive('assets', path.join(tempDir, 'assets'));
    }
    
    // Create extension.vsixmanifest
    console.log('Creating extension.vsixmanifest...');
    fs.writeFileSync(
      path.join(tempDir, 'extension.vsixmanifest'),
      createVsixManifest()
    );
    
    // Create the VSIX package (ZIP file)
    console.log('Creating final VSIX package...');
    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    // Add all files from the temp directory
    archive.directory(tempDir, false);
    
    // Finalize and return promise
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ Package created: ${outputFile} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
        // Clean up temp directory
        fs.rmdirSync(tempDir, { recursive: true });
        resolve(true);
      });
      
      archive.finalize();
    });
  } catch (error) {
    console.error('Failed to build manually:', error);
    return Promise.resolve(false);
  }
}

// Utility to copy directories recursively
function copyDirRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Use fixed manual package script as last resort
function useFixedScript() {
  console.log('Using fixed-manual-package.sh script as last resort...');
  
  try {
    // Make the script executable
    childProcess.execSync('chmod +x fixed-manual-package.sh', { stdio: 'inherit' });
    // Run the script
    childProcess.execSync('./fixed-manual-package.sh', { stdio: 'inherit' });
    
    const version = getPackageVersion();
    const expectedOutput = `terrarium-theme-${version}.vsix`;
    
    if (fs.existsSync(expectedOutput)) {
      console.log(`✅ Successfully created ${expectedOutput} with fixed script`);
      return true;
    }
    
    console.log('VSIX file not found after running fixed script');
    return false;
  } catch (error) {
    console.log('Failed to run fixed script:', error.message);
    return false;
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
    
    // If manual approach failed, try fixed script
    if (!manualSuccess && fs.existsSync('fixed-manual-package.sh')) {
      console.log('Manual build failed, trying fixed script...');
      const fixedSuccess = useFixedScript();
      
      if (!fixedSuccess) {
        console.error('❌ All build methods failed!');
        process.exit(1);
      }
    } else if (!manualSuccess) {
      console.error('❌ Build methods failed and fixed script not found!');
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

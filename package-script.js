// Simple script to package VS Code extension
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Try to install vsce if needed
try {
  console.log('Installing vsce globally...');
  execSync('npm install -g @vscode/vsce', { stdio: 'inherit' });
  console.log('Successfully installed vsce');
} catch (error) {
  console.error('Error installing vsce:', error);
  process.exit(1);
}

// Run vsce package
try {
  console.log('Packaging extension...');
  execSync('vsce package', { stdio: 'inherit' });
  console.log('Successfully packaged extension');
} catch (error) {
  console.error('Error packaging extension:', error);
  process.exit(1);
}

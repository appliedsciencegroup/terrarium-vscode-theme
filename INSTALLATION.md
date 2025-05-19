# Installing the Terrarium Theme

This document provides detailed instructions for installing, testing, and publishing the Terrarium Theme for Visual Studio Code.

## Local Installation Methods

### Method 1: Direct Extension Folder Installation (No Build Required)

1. Copy the `terrarium-theme/vscode` directory to your VS Code extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\terrarium-theme`
   - **macOS**: `~/.vscode/extensions/terrarium-theme`
   - **Linux**: `~/.vscode/extensions/terrarium-theme`

2. Restart VS Code completely

3. Select the theme:
   - Press `Cmd+K` then `Cmd+T` on macOS (or `Ctrl+K` then `Ctrl+T` on Windows/Linux)
   - Choose either "Terrarium (Dark)" or "Terrarium (Light)" from the list

### Method 2: Build and Install VSIX Package

1. Make sure Node.js is installed on your system

2. Install vsce (Visual Studio Code Extension CLI):
   ```bash
   npm install -g @vscode/vsce
   ```

3. Navigate to the theme directory:
   ```bash
   cd path/to/terrarium-theme/vscode
   ```

4. Run the packaging script (or create it if it doesn't exist):
   ```bash
   chmod +x ./package-extension.sh  # Make it executable
   ./package-extension.sh
   ```
   
   Alternatively, run the commands manually:
   ```bash
   vsce package
   ```

5. This will create a `.vsix` file in the current directory

6. Install the extension:
   ```bash
   code --install-extension terrarium-theme-0.3.0.vsix
   ```
   
   Or from VS Code UI:
   - Open VS Code
   - Go to Extensions view (`Cmd+Shift+X` or `Ctrl+Shift+X`)
   - Click the "..." menu in the top-right corner
   - Select "Install from VSIX..."
   - Choose the generated `.vsix` file

## Publishing to VS Code Marketplace

To publish the theme to the VS Code Marketplace:

1. Create a Microsoft account if you don't have one already

2. Create a Personal Access Token (PAT) on Azure DevOps:
   - Visit https://dev.azure.com/
   - Click on your profile icon in the top right
   - Select "Personal access tokens"
   - Click "New Token"
   - Give it a name like "VSCode Marketplace Publishing"
   - Set Organization to "All accessible organizations"
   - Set Expiration as needed
   - Under Scopes, select "Custom defined" and choose "Marketplace > Manage"
   - Click "Create"
   - **Important**: Save the token somewhere secure. You won't be able to see it again.

3. Login to vsce using your PAT:
   ```bash
   vsce login appliedsciencegroup  # Use your publisher name
   ```

4. From the `terrarium-theme/vscode` directory, publish the theme:
   ```bash
   vsce publish
   ```

5. You can also publish a specific version:
   ```bash
   vsce publish minor  # Increments minor version
   vsce publish patch  # Increments patch version
   vsce publish major  # Increments major version
   ```

## Troubleshooting

If you don't see the theme after installation:

1. Check that the extension is installed:
   - Open VS Code
   - Go to Extensions (`Cmd+Shift+X` or `Ctrl+Shift+X`)
   - Type "Terrarium" in the search box
   - The extension should appear in the list

2. Reload the VS Code window:
   - Press `Cmd+Shift+P` or `Ctrl+Shift+P` to open the command palette
   - Type "Reload Window" and select it

3. Verify the extension is in the correct location:
   - Check your extensions directory to confirm the theme is there
   - For direct installation, the folder structure should be:
     ```
     ~/.vscode/extensions/terrarium-theme/
     ├── package.json
     ├── themes/
     │   ├── terrarium-dark.json
     │   └── terrarium-light.json
     └── ...
     ```

4. Check the VS Code Developer Tools for errors:
   - Press `Cmd+Shift+P` or `Ctrl+Shift+P`
   - Type "Developer: Toggle Developer Tools" and select it
   - Check the Console tab for any error messages

## Version Control and Updates

For version control and future updates:

1. Increment the version number in `package.json` before publishing
2. Update the README.md with any new features or changes
3. Create a new Git tag for each release:
   ```bash
   git tag -a v0.3.1 -m "Version 0.3.1"
   git push origin v0.3.1
   ```

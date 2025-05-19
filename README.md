# Terrarium Theme for VS Code

A minimal, elegant theme for Visual Studio Code that uses a greyscale palette with gold and green accents. This theme is part of the Terrarium design system.

*Updated for automatic synchronization testing. Final sync test with improved build workflow.*

## Features

- **Minimal Design**: Clean, distraction-free interface with careful use of color
- **Two Variants**: Includes both dark and light theme options
- **Terrarium Color Palette**: 
  - Primary: Neutral Grey (#4F5252)
  - Accent: Gold (#E0CF8E / #BBA85F)
  - Secondary: Green (#5C7B57 / #3F5A3B)
  - Error: Red (#D83933)
  - Warning: Amber (#E0A030)

## Screenshots

### Dark Theme
*Screenshots coming soon*

### Light Theme
*Screenshots coming soon*

## Installation

### Manual Installation (Recommended for Development/Testing)

#### Method 1: Direct Extension Folder Installation
1. Clone this repository or download the files
2. Copy the entire `terrarium-theme` folder to your VS Code extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **macOS**: `~/.vscode/extensions/`
   - **Linux**: `~/.vscode/extensions/`
3. Restart VS Code
4. Select the theme: 
   - Press `Ctrl+K` then `Ctrl+T` (or `Cmd+K` then `Cmd+T` on macOS)
   - Select either "Terrarium (Dark)" or "Terrarium (Light)"

#### Method 2: Local VSIX Package Installation
1. Clone this repository or download the files
2. Make sure you have Node.js installed on your system
3. In the terminal, navigate to the `terrarium-theme` directory
4. Run the provided packaging script:
   ```bash
   ./package-extension.sh
   ```
   Or manually run:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```
5. This will create a `.vsix` file in the current directory
6. In VS Code:
   - Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
   - Click on the "..." menu in the top-right of the Extensions panel
   - Choose "Install from VSIX..."
   - Select the generated `.vsix` file
7. After installation, select the theme via Preferences > Color Theme

### Marketplace Installation

To install from the Visual Studio Code Marketplace:

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Terrarium Theme"
4. Click Install
5. After installation, select the theme via Preferences > Color Theme

*Note: This theme will be published to the marketplace soon*

## Development and Building

### Building the VSIX Package

To build the VSIX package locally:

```bash
# Make sure the script is executable
chmod +x ./manual-package.sh

# Run the script to create the VSIX
./manual-package.sh
```

This will create a `terrarium-theme-x.y.z.vsix` file in the current directory.

### GitHub Automation

This theme uses GitHub Actions to automate the build process. On every push to the `main` branch:

1. The version number is automatically incremented
2. A new VSIX package is built
3. The VSIX is attached to a GitHub release
4. The VSIX is available as a downloadable artifact

You can also manually trigger a build from the Actions tab in the GitHub repository.

## Recommended Settings

For the most minimal experience, we recommend adding these settings to your `settings.json`:

```json
{
  "editor.minimap.enabled": false,
  "editor.folding": false,
  "editor.renderLineHighlight": "gutter",
  "editor.renderIndentGuides": false,
  "editor.overviewRulerBorder": false,
  "editor.hideCursorInOverviewRuler": true,
  "editor.scrollbar.vertical": "auto",
  "editor.scrollbar.horizontal": "auto",
  "workbench.activityBar.location": "hidden",
  "workbench.editor.showTabs": "single",
  "workbench.statusBar.visible": false
}
```

## Troubleshooting

If you don't see the theme after installation:
1. Make sure you've restarted VS Code completely
2. Check the VS Code extensions directory to confirm the extension is there
3. Run `Developer: Reload Window` from the VS Code command palette

For other issues, please file an issue in the GitHub repository.

## Forking From Min Theme

This theme is forked from [Min Theme](https://github.com/misolori/min-theme) by Miguel Solorio, with the Terrarium color palette applied and a light theme variant added.

## License

MIT License

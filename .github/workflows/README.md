# Setting up GitHub Actions for VS Code Theme

This directory contains the GitHub Actions workflow needed to automatically build and release the VS Code theme extension.

## Installation Instructions

1. Copy the `build.yml` file to your terrarium-vscode-theme repository in the same directory structure (`.github/workflows/build.yml`).

2. Set up the required secrets in your GitHub repository:
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `T_REPO_DISPATCH_TOKEN`: A GitHub personal access token with `repo` scope to access the terrarium-kelevra repository
     - `GITHUB_TOKEN`: This is automatically provided by GitHub, but make sure it has permissions to create releases

3. The workflow can be triggered in two ways:
   - **Manually**: Go to the Actions tab in your repository, select the "Build and Release VS Code Theme" workflow, and click "Run workflow"
   - **Automatically**: The workflow will run when you dispatch a "sync-theme" event to the repository

## Workflow Details

The workflow performs the following steps:

1. Checks out the theme repository
2. Fetches the latest theme files from the terrarium-kelevra repository
3. Sets up Node.js
4. Installs dependencies
5. Builds the extension package using the manual-create-vsix.js script
6. Commits any changes back to the repository
7. Creates a GitHub release with the VSIX package

## Troubleshooting

If you encounter issues with the workflow:

1. Check the workflow logs in the Actions tab
2. Ensure the secret tokens have the correct permissions
3. Verify that the manual-create-vsix.js script exists in your repository
4. Make sure the paths in the workflow file match your repository structure

For issues with the manifest, check that the manual-create-vsix.js script is properly creating the extension.vsixmanifest file with the correct paths for assets and icons.

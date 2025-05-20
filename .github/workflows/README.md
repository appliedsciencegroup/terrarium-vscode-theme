# Setting up GitHub Actions for VS Code Theme

This directory contains the GitHub Actions workflow needed to automatically build and release the VS Code theme extension whenever changes are pushed to the repository or when manually triggered.

## Files Added

1. `.github/workflows/build.yml` - GitHub Actions workflow definition
2. `.github/workflows/README.md` - Documentation for the workflow setup

## How the Workflow Works

The workflow performs the following steps:

1. **Checkout Code**: Checks out the terrarium-vscode-theme repository
2. **Fetch Latest Theme**: Uses the token to access and sync files from the terrarium-kelevra repository
3. **Setup Node.js**: Installs Node.js 20.x
4. **Install Dependencies**: Installs necessary npm packages including archiver
5. **Build Package**: Builds the VSIX package using available build methods in order of preference
6. **Commit Changes**: Commits any changes back to the repository
7. **Create Release**: Creates a GitHub release with the VSIX package attached

## Trigger Methods

The workflow can be triggered in two ways:
- **Manually**: From the GitHub Actions page using the "Run workflow" button
- **Repository Dispatch**: Using the "sync-theme" event type (can be triggered from other workflows)

## Required Secrets

- `SOURCE_REPO_PAT`: A GitHub personal access token with repo scope to access the terrarium-kelevra repository
- `GITHUB_TOKEN`: Automatically provided by GitHub to enable creating releases

## Troubleshooting

If you encounter issues with the workflow:

1. Check the workflow logs in the Actions tab
2. Ensure the secret tokens have the correct permissions
3. Verify that the build scripts exist in your repository
4. Make sure the paths in the workflow file match your repository structure

For issues with the manifest, check that the manual-create-vsix.js script is properly creating the extension.vsixmanifest file with the correct paths for assets and icons.

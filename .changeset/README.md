# Changesets

This is a monorepo using [Changesets](https://github.com/changesets/changesets).

## Adding a changeset

```bash
npm run changeset
```

You will be prompted to:

1. Select which packages to include
2. Select the type of change (major, minor, patch)
3. Write a summary of the change

This will create a new file in the `.changeset` directory. Commit this file to your branch.

## Versioning and Publishing

When ready to release:

1. Merge changes to `main` branch
2. GitHub Actions will create a release PR
3. Review and merge the release PR
4. GitHub Actions will publish to npm and create GitHub releases

## Configuration

- **Base Branch**: `main`
- **Access**: Public
- **Version Updates**: Patch for internal dependencies

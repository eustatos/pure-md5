# Changeset Setup for npm Publishing

## Overview

Set up Changeset for version management and automated npm publishing.

## Current State

- Manual version management
- No changelog generation
- No release notes
- Basic npm publishing workflow

## Benefits of Changeset

### Automated Versioning
- ✅ Automatic version bumping
- ✅ Semantic versioning compliance
- ✅ Release PR creation
- ✅ Changelog generation

### Workflow Improvements
- ✅ Consistent release process
- ✅ Better release notes
- ✅ Team collaboration
- ✅ Audit trail

### Integration
- ✅ GitHub Actions integration
- ✅ npm publishing
- ✅ Release notes on GitHub

## Changeset Setup Steps

### 1. Install Changeset
```bash
npm install --save-dev @changesets/cli
```

### 2. Initialize Changeset
```bash
npx changeset init
```

This creates:
- .changeset folder
- .changeset/config.json
- .changeset/README.md

### 3. Configure Changeset

```json
{
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### 4. Create GitHub Actions Workflow

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          version: npm run version
          publish: npm run publish
          commit: "chore: update versions"
          title: "chore: version packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 5. Add Version Script

```json
{
  "scripts": {
    "version": "changeset version"
  }
}
```

## Changeset Workflow

### For Contributors

1. Create feature branch
2. Make changes
3. Run `npx changeset`
4. Choose version bump (major/minor/patch)
5. Write changelog entry
6. Commit changes
7. Create PR

### For Maintainers

1. Merge PR to main
2. GitHub Actions creates release PR
3. Review release PR
4. Merge release PR
5. GitHub Actions:
   - Updates versions
   - Generates changelog
   - Creates GitHub release
   - Publishes to npm

## Version Bump Types

### Major (Breaking Changes)
- API breaking changes
- Major refactorings

### Minor (New Features)
- New functionality
- New APIs

### Patch (Bug Fixes)
- Bug fixes
- Small improvements

## Changelog Entry Format

```markdown
---
"pure-md5": patch
---

Fixed an issue with stream handling
```

## Benefits for This Project

### Current Pain Points Solved
- ✅ Manual version tracking
- ✅ Inconsistent releases
- ✅ No changelog
- ✅ Manual release notes

### Improved Process
- ✅ Automatic versioning
- ✅ Auto-generated changelog
- ✅ Better release communication
- ✅ Team collaboration

## Migration Steps

1. Install Changeset
2. Initialize Changeset
3. Configure changeset
4. Create initial changeset entry for current version
5. Set up GitHub Actions workflow
6. Test with sample release
7. Update documentation
8. Communicate new workflow to team

## Success Criteria

- [ ] Changeset installed and configured
- [ ] GitHub Actions workflow running
- [ ] Release PRs created automatically
- [ ] Changelog generated correctly
- [ ] npm publishing works
- [ ] GitHub releases created
- [ ] Team trained on new workflow

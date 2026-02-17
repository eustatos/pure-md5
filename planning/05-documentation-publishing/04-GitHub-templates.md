# GitHub Templates Setup

## Overview

Create and configure GitHub templates for issues and pull requests following best practices.

## Current State

- No issue templates
- No pull request templates
- Users create issues from scratch
- PRs lack standard structure

## Benefits of Templates

### For Issues
- ✅ Consistent issue reporting
- ✅ Better triage and prioritization
- ✅ Faster resolution
- ✅ Reduces back-and-forth

### For Pull Requests
- ✅ Consistent PR structure
- ✅ Clear change description
- ✅ Better review process
- ✅ Faster merging

## Templates to Create

### 1. Bug Report

**File:** .github/ISSUE_TEMPLATE/bug_report.md

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: "[BUG] "
labels: bug
assignees: ""

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Code Example**
```javascript
// Code that reproduces the issue
```

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 14, 16, 18]
- Package version: [e.g. 0.1.0]
- Browser (if applicable): [e.g. chrome, safari]

**Additional context**
Add any other context about the problem here.
```

### 2. Feature Request

**File:** .github/ISSUE_TEMPLATE/feature_request.md

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: "[FEATURE] "
labels: enhancement
assignees: ""

---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### 3. Pull Request Template

**File:** .github/PULL_REQUEST_TEMPLATE.md

```markdown
## Description
Please include a summary of the change and which issue is fixed. Please also include relevant motivation and context.

Fixes # (issue)

## Type of change
Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce.

```javascript
// Test code
```

**Test Configuration**:
* Node.js version:
* OS:

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

## Screenshots (if appropriate):
```

### 4. Documentation Update

**File:** .github/ISSUE_TEMPLATE/documentation.md

```markdown
---
name: Documentation Update
about: Improve documentation
title: "[DOCS] "
labels: documentation
assignees: ""

---

**Describe what the documentation should cover:**
A clear and concise description of what topics should be included.

**Current state:**
What is currently documented?

**Proposed changes:**
Describe the improvements to the documentation.

**Additional context:**
Add any other context about the documentation update.
```

## GitHub Actions Integration

### Workflow for Template Management

```yaml
name: Validate Templates

on:
  push:
    paths:
      - '.github/ISSUE_TEMPLATE/**'
      - '.github/PULL_REQUEST_TEMPLATE.md'
    branches:
      - main

jobs:
  validate-templates:
    name: Validate Templates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check Templates Exist
        run: |
          if [ ! -f .github/ISSUE_TEMPLATE/bug_report.md ]; then
            echo "Error: bug_report.md not found"
            exit 1
          fi
          if [ ! -f .github/ISSUE_TEMPLATE/feature_request.md ]; then
            echo "Error: feature_request.md not found"
            exit 1
          fi
          if [ ! -f .github/PULL_REQUEST_TEMPLATE.md ]; then
            echo "Error: PULL_REQUEST_TEMPLATE.md not found"
            exit 1
          fi
          
      - name: Check Templates Content
        run: |
          # Add content validation if needed
          echo "Templates validated successfully"
```

## Best Practices

### Issue Templates
- ✅ Use clear, actionable titles
- ✅ Include reproduction steps
- ✅ Ask for environment details
- ✅ Use checkboxes for status tracking
- ✅ Link to relevant documentation

### Pull Request Templates
- ✅ Require change type
- ✅ Ask for testing instructions
- ✅ Include checklist
- ✅ Ask for related issues
- ✅ Request documentation updates

## Implementation Steps

1. Create .github/ISSUE_TEMPLATE directory
2. Create bug_report.md
3. Create feature_request.md
4. Create documentation.md
5. Create .github/PULL_REQUEST_TEMPLATE.md
6. Test templates in a test repository
7. Update CONTRIBUTING.md with template usage
8. Communicate changes to team

## Success Criteria

- [ ] Bug report template created
- [ ] Feature request template created
- [ ] Documentation template created
- [ ] Pull request template created
- [ ] Templates validated
- [ ] CONTRIBUTING.md updated
- [ ] Team trained on new process

## References

- [GitHub Docs: Issue and PR Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [ProGit: Issue and PR Templates](https://git-scm.com/book/en/v2)
- [Contributing.md Examples](https://github.com/nayafia/contributing-template)

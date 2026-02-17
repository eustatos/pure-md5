# Contributing to pure-md5

Thank you for your interest in contributing to pure-md5! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Creating Changesets](#creating-changesets)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, please include as many details as possible:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, Node.js version, package version)
- Code example that reproduces the issue

### Suggesting Features

Feature requests are welcome! Please provide:

- A clear description of the feature
- The problem it solves
- Any alternative solutions you've considered
- Examples of how the feature would be used

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Create a changeset (`npx changeset`)
6. Push your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js >= 16
- npm >= 8

### Installation

```bash
# Fork the repository first
git clone https://github.com/eustatos/pure-md5.git
cd pure-md5

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build the project |
| `npm run build:watch` | Build in watch mode |
| `npm run build:prod` | Build with minification |
| `npm run dev` | Run in dev mode |
| `npm test` | Run all tests |
| `npm run coverage` | Generate coverage report |
| `npx changeset` | Create a changeset |

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test File

```bash
npm test __tests__/index.test.ts
```

### With Coverage

```bash
npm run coverage
```

### Watch Mode

```bash
npm test -- --watch
```

## Creating Changesets

Changesets are used to manage versioning and changelog generation.

### Creating a Changeset

```bash
npx changeset
```

This will prompt you to:

1. Select the version bump type:
   - `major` - Breaking changes
   - `minor` - New features
   - `patch` - Bug fixes

2. Write a description of your changes

### Example

```
? Which packages would you like to include in this changeset? pure-md5
? Which type of change is this?
  patch     Patch release (bug fixes)
  minor     Minor release (new features)
  major     Major release (breaking changes)
```

## Pull Request Process

1. **Update Documentation**: Update README.md or other docs if needed
2. **Run Tests**: Ensure all tests pass
3. **Code Review**: Wait for review from maintainers
4. **Address Feedback**: Make requested changes
5. **Merge**: Maintainers will merge when approved

### PR Title Format

Use conventional commit format:

```
type: description
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat: add streaming API for large files
fix: handle edge case in MD5 calculation
docs: update installation instructions
refactor: optimize performance
```

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use TypeScript for new code
- Add JSDoc comments for public APIs

### Commit Messages

- Use conventional commits
- Use present tense
- Be descriptive but concise

### File Structure

- Place tests in `__tests__/` directory
- Name test files `<module>.test.ts`
- Keep files focused on single responsibility

## Questions?

Feel free to open an issue or ask in the pull request if you have questions!

## Acknowledgments

Thank you for contributing to pure-md5! 🙏

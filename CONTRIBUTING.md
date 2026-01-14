# Contributing to cc-burn

Thanks for your interest in contributing to cc-burn!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/iam-dev/cc-burn.git
   cd cc-burn
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building

```bash
npm run build
```

### Testing Locally

```bash
node dist/cli.js
node dist/cli.js --statusbar
node dist/cli.js --json
```

### Watch Mode

```bash
npm run dev
```

## Code Style

- Use TypeScript for all source files
- Follow existing code patterns
- Keep functions small and focused
- Add types for all function parameters and return values

## Pull Request Process

1. Ensure your code builds without errors
2. Test your changes locally with real Claude logs
3. Update README.md if you've added new features
4. Create a pull request with a clear description of changes

## Commit Messages

Use clear, descriptive commit messages:

```
Add weekly limit tracking
Fix burn rate calculation for short sessions
Update model limits for claude-opus-4
```

## Feature Ideas

Looking to contribute? Here are some ideas:

- [ ] Historical usage trends
- [ ] Export to CSV
- [ ] Status bar integration
- [ ] Slack/Discord alerts
- [ ] Context size recommendations
- [ ] Team usage aggregation

## Reporting Issues

When reporting issues, please include:

- Your operating system
- Node.js version (`node --version`)
- Steps to reproduce the issue
- Expected vs actual behavior

## Questions?

Open an issue with the `question` label.

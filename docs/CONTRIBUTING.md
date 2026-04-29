# Contributing to Open Chain AI

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies
4. Create a branch
5. Make changes
6. Run tests
7. Submit PR

## Development Setup

```bash
# Clone
git clone https://github.com/eddie/open-chain-ai.git
cd open-chain-ai

# Install
pnpm install

# Start services
docker-compose up -d db nats

# Run dev
pnpm dev
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Semantic versioning

## Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test:sandbox

# Coverage
pnpm test:coverage
```

## PR Requirements

- [ ] Tests pass
- [ ] Coverage maintained
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Reviewed by maintainer

## Commit Messages

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `perf`: Performance
- `chore`: Maintenance

## Release Process

1. Update version
2. Update CHANGELOG
3. Create tag
4. Build images
5. Push to registry
6. Deploy to staging
7. Deploy to production

## Code of Conduct

- Be respectful
- Be constructive
- Be inclusive
- Be professional

## Security

Report security issues to: security@open-chain-ai.com

DO NOT open public issues for security vulnerabilities.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

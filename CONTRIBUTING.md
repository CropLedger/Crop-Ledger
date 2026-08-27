# Contributing to CropLedger Enterprise

Thank you for your interest in contributing to CropLedger Enterprise! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/CropLedger.git`
3. Follow the [Developer Setup Guide](docs/setup.md)
4. Create a feature branch: `git checkout -b feature/your-feature-name`

---

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions/updates

### Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add demand forecasting API
fix: resolve Stellar escrow timeout
docs: update API documentation
refactor: extract user service
test: add contract e2e tests
chore: update dependencies
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

**Example:**
```
feat(forecast): add AI-powered demand forecasting

Implement ML-based demand prediction using historical data,
seasonal factors, and market trends.

Closes #123
```

---

## Coding Standards

### TypeScript (Backend)

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Avoid `any` type - use `unknown` if necessary
- Use `const` assertions for readonly arrays

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
```

### Vue/Nuxt (Frontend)

- Use Composition API with `<script setup>`
- Prefer composables over mixins
- Use TypeScript for components
- Follow Vue 3 style guide
- Use Pinia for state management

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  update: [value: string];
}>();
</script>
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Max line length: 100 characters
- Trailing commas in multi-line arrays/objects

```javascript
// Good
const items = [
  'item1',
  'item2',
  'item3',
];

// Bad
const items = ['item1','item2','item3']
```

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Components**: PascalCase (`UserProfile.vue`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Classes**: PascalCase (`UserService`)
- **Interfaces**: PascalCase with `I` prefix (`IUserRepository`)

### Clean Architecture Principles

- Domain layer must not depend on infrastructure
- Use dependency injection for external services
- Define interfaces in domain, implement in infrastructure
- Keep use cases thin and focused

```typescript
// Domain - Interface
interface IUserRepository {
  findById(id: string): Promise<User>;
}

// Infrastructure - Implementation
class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User> {
    // Prisma implementation
  }
}
```

---

## Testing Guidelines

### Backend Testing

- Unit tests for domain logic
- Integration tests for use cases
- E2E tests for API endpoints
- Minimum 80% code coverage

```typescript
describe('GenerateDemandForecastUseCase', () => {
  it('should generate forecast with valid input', async () => {
    const useCase = new GenerateDemandForecastUseCase(mockService);
    const result = await useCase.execute(input);
    expect(result.predictedDemand).toBeGreaterThan(0);
  });
});
```

### Frontend Testing

- Unit tests for composables
- Component tests with Vitest
- E2E tests with Playwright
- Test user interactions and flows

```typescript
describe('useAuth', () => {
  it('should login with valid credentials', async () => {
    const { login, user } = useAuth();
    await login({ email, password });
    expect(user.value).toBeDefined();
  });
});
```

### Test Organization

```
backend/
├── src/
│   ├── domain/
│   │   └── use-cases/
│   │       └── forecast/
│   │           ├── generate-demand-forecast.use-case.ts
│   │           └── generate-demand-forecast.use-case.spec.ts
├── tests/
│   ├── e2e/
│   │   └── contracts.e2e-spec.ts
```

### Running Tests

```bash
# Backend
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # With coverage

# Frontend
cd frontend
npm run test              # Unit tests
npm run test:e2e          # Playwright E2E
```

---

## Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add/update tests** for your changes
3. **Run linters** and fix issues
4. **Run tests** and ensure they pass
5. **Rebase** your branch on latest `main`

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] PR description clearly explains changes

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
```

### Review Process

1. Automated checks (CI/CD) must pass
2. At least one maintainer approval required
3. Address all review comments
4. Squash commits before merging (optional)

---

## Reporting Issues

### Bug Reports

Use the GitHub issue template:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS:
- Node version:
- Browser:

**Screenshots**
If applicable

**Additional Context**
Logs, error messages, etc.
```

### Feature Requests

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches explored

**Additional Context**
Mockups, examples, etc.
```

---

## Project Structure

```
CropLedger/
├── backend/
│   ├── src/
│   │   ├── domain/          # Business logic
│   │   ├── application/     # Orchestration
│   │   ├── infrastructure/  # External implementations
│   │   └── presentation/    # API layer
│   ├── tests/               # E2E tests
│   └── prisma/              # Database schema
├── frontend/
│   ├── composables/         # Vue composables
│   ├── components/          # Vue components
│   ├── pages/               # Nuxt pages
│   └── tests/               # Tests
├── docs/                    # Documentation
└── scripts/                 # Utility scripts
```

---

## Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our Discord server (link in README)

---

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

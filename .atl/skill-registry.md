# Skill Registry - StudyPlanAI

## Project Skills

This project uses the following AI agent skills:

| Skill | Path | Purpose |
|-------|------|---------|
| sdd-init | `~/.config/opencode/skills/sdd-init/SKILL.md` | Initialize SDD context |
| sdd-explore | `~/.config/opencode/skills/sdd-explore/SKILL.md` | Explore and investigate |
| sdd-propose | `~/.config/opencode/skills/sdd-propose/SKILL.md` | Create change proposals |
| sdd-spec | `~/.config/opencode/skills/sdd-spec/SKILL.md` | Write specifications |
| sdd-design | `~/.config/opencode/skills/sdd-design/SKILL.md` | Create technical design |
| sdd-tasks | `~/.config/opencode/skills/sdd-tasks/SKILL.md` | Break down into tasks |
| sdd-apply | `~/.config/opencode/skills/sdd-apply/SKILL.md` | Implement tasks |
| sdd-verify | `~/.config/opencode/skills/sdd-verify/SKILL.md` | Validate implementation |
| sdd-archive | `~/.config/opencode/skills/sdd-archive/SKILL.md` | Archive completed changes |

## Conventions

### Commit Messages
- Follow Conventional Commits format
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`
- Example: `feat: add AI plan generation`

### Code Style
- TypeScript strict mode
- ESLint + Prettier for formatting
- Component naming: PascalCase
- Utility naming: camelCase

### Project Structure
```
client/   - React frontend
server/   - Node.js backend
docs/     - Documentation (future)
```

### Tech Stack
- Frontend: React 18, Vite, Zustand, TailwindCSS
- Backend: Express, Prisma, PostgreSQL
- AI: OpenRouter API

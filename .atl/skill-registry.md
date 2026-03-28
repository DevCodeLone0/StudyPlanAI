# Skill Registry

**Orchestrator use only.** Read this registry once per session to resolve skill paths, then pass pre-resolved paths directly to each sub-agent's launch prompt. Sub-agents receive the path and load the skill directly — they do NOT read this registry.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When building AI chat features - breaking changes from v4. | ai-sdk-5 | ~/.config/opencode/skills/ai-sdk-5/SKILL.md |
| When writing C# code, .NET APIs, or Entity Framework models. | dotnet | ~/.config/opencode/skills/dotnet/SKILL.md |
| When user asks to release, bump version, update homebrew, or publish a new version. | homebrew-release | ~/.config/opencode/skills/homebrew-release/SKILL.md |
| When user asks to create an epic, large feature, or multi-task initiative. | jira-epic | ~/.config/opencode/skills/jira-epic/SKILL.md |
| When user asks to create a Jira task, ticket, or issue. | jira-task | ~/.config/opencode/skills/jira-task/SKILL.md |
| When working with Next.js - routing, Server Actions, data fetching. | nextjs-15 | ~/.config/opencode/skills/nextjs-15/SKILL.md |
| When writing E2E tests - Page Objects, selectors, MCP workflow. | playwright | ~/.config/opencode/skills/playwright/SKILL.md |
| When user wants to review PRs (even if first asking what's open), analyze issues, or audit PR/issue backlog. Key phrases: "pr review", "revisar pr", "qué PRs hay", "PRs pendientes", "issues abiertos", "sin atención", "hacer review". | pr-review | ~/.config/opencode/skills/pr-review/SKILL.md |
| When writing Python tests - fixtures, mocking, markers. | pytest | ~/.config/opencode/skills/pytest/SKILL.md |
| When writing React components - no useMemo/useCallback needed. | react-19 | ~/.config/opencode/skills/react-19/SKILL.md |
| When writing Angular components, services, templates, or making architectural decisions about component placement. | scope-rule-architect-angular | ~/.config/opencode/skills/angular/SKILL.md |
| When the orchestrator launches you to implement one or more tasks from a change. | sdd-apply | ~/.config/opencode/skills/sdd-apply/SKILL.md |
| When the orchestrator launches you to archive a change after implementation and verification. | sdd-archive | ~/.config/opencode/skills/sdd-archive/SKILL.md |
| When the orchestrator launches you to write or update the technical design for a change. | sdd-design | ~/.config/opencode/skills/sdd-design/SKILL.md |
| When the orchestrator launches you to think through a feature, investigate the codebase, or clarify requirements. | sdd-explore | ~/.config/opencode/skills/sdd-explore/SKILL.md |
| When user wants to initialize SDD in a project, or says "sdd init", "iniciar sdd", "openspec init". | sdd-init | ~/.config/opencode/skills/sdd-init/SKILL.md |
| When the orchestrator launches you to create or update a proposal for a change. | sdd-propose | ~/.config/opencode/skills/sdd-propose/SKILL.md |
| When the orchestrator launches you to write or update specs for a change. | sdd-spec | ~/.config/opencode/skills/sdd-spec/SKILL.md |
| When the orchestrator launches you to create or update the task breakdown for a change. | sdd-tasks | ~/.config/opencode/skills/sdd-tasks/SKILL.md |
| When the orchestrator launches you to verify a completed (or partially completed) change. | sdd-verify | ~/.config/opencode/skills/sdd-verify/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI. | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| When user says "update skills", "skill registry", "actualizar skills", "update registry", or after installing/removing skills. | skill-registry | ~/.config/opencode/skills/skill-registry/SKILL.md |
| When building a presentation, slide deck, course material, stream web, or talk slides. | stream-deck | ~/.config/opencode/skills/stream-deck/SKILL.md |
| When styling with Tailwind - cn(), theme variables, no var() in className. | tailwind-4 | ~/.config/opencode/skills/tailwind-4/SKILL.md |
| When reviewing technical exercises, code assessments, candidate submissions, or take-home tests. | technical-review | ~/.config/opencode/skills/technical-review/SKILL.md |
| When writing TypeScript code - types, interfaces, generics. | typescript | ~/.config/opencode/skills/typescript/SKILL.md |
| When using Zod for validation - breaking changes from v3. | zod-4 | ~/.config/opencode/skills/zod-4/SKILL.md |
| When managing React state with Zustand. | zustand-5 | ~/.config/opencode/skills/zustand-5/SKILL.md |

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/amayadev/Desktop/Proyectos Clonados Github/StudyPlanAI/AGENTS.md | Index — references files below |
| agents.md | /home/amayadev/Desktop/Proyectos Clonados Github/StudyPlanAI/agents.md | Referenced by AGENTS.md |
| .atl/skill-registry.md | /home/amayadev/Desktop/Proyectos Clonados Github/StudyPlanAI/.atl/skill-registry.md |  |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
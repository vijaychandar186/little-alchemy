# Claude Code Setup — Little Alchemy

How this project is configured for Claude Code.

---

## settings.json

Located at `.claude/settings.json`.

```json
{
  "defaultMode": "bypassPermissions",
  "permissions": {
    "allow": ["Agent", "Bash", "Edit", "Glob", "Grep", "Read", "Write", "WebFetch", "WebSearch", "TodoWrite", "Skill", ...]
  }
}
```

- `bypassPermissions` — Claude can run tools without prompting for approval each time
- `allow` list covers all standard tools: file read/write/edit, bash, web, agents, skills, todos

---

## Skills

Skills are project-scoped AI knowledge docs loaded on-demand. Stored in both `.agents/skills/` (multi-agent) and `.claude/skills/` (Claude Code).

| Skill | What it does |
|---|---|
| `little-alchemy` | Project-specific reference: game mechanics, layout, theme system, merge logic |
| `shadcn` | shadcn/ui component patterns, Base UI vs Radix differences, styling rules |
| `next-best-practices` | Next.js 15 patterns: RSC boundaries, image/font, hydration, data fetching |
| `vercel-react-best-practices` | React 19 performance: async patterns, bundle optimization, event listeners |
| `vercel-composition-patterns` | React composition: compound components, context, React 19 API changes |
| `frontend-design` | Production-grade UI design, avoids generic AI aesthetics |
| `web-design-guidelines` | Accessibility and UX audit rules |
| `find-skills` | Discovers and installs new skills |
| `skill-creator` | Creates, evals, and benchmarks new skills |

**Invoke a skill**: `/little-alchemy`, `/shadcn`, `/next-best-practices`, etc.

---

## Plugins

### Caveman (`caveman:caveman`)

Installed via: `claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman`

Makes Claude respond like a caveman — cuts ~75% output tokens with no loss of technical accuracy. Auto-activates every session via `SessionStart` hook.

**Commands:**

| Command | Effect |
|---|---|
| `/caveman` | Activate (default: full mode) |
| `/caveman lite` | Drop filler, keep grammar |
| `/caveman full` | Default — drop articles, fragments OK |
| `/caveman ultra` | Maximum compression, telegraphic |
| `stop caveman` | Turn off |

**Sub-skills:**

| Command | Effect |
|---|---|
| `/caveman-commit` | Terse commit messages (Conventional Commits, ≤50 char subject) |
| `/caveman-review` | One-line PR comments: `L42: bug: user null. Add guard.` |
| `/caveman:compress <file>` | Compress a memory file (CLAUDE.md etc) into caveman-speak to save input tokens each session. Saves `.original.md` backup. |
| `/caveman-help` | Quick reference card |

**Why**: Less token = faster response + lower cost. Technical accuracy unchanged. Caveman make brain small? No. Caveman make mouth small.

---

## File Structure

```
.claude/
├── settings.json      # Permissions, defaultMode
├── skills/            # Claude Code skill docs (same as .agents/skills/)
└── themes.md          # Theme system reference

.agents/
└── skills/            # Multi-agent skill docs (same content as .claude/skills/)

skills-lock.json       # Tracks installed skill versions (like package-lock.json)
```

---

## Useful Workflows

### Start a session
Caveman auto-activates. Jump straight into tasks.

### Before committing
```
/caveman-commit
```
Generates a terse, accurate commit message from staged diff.

### Compress CLAUDE.md to save tokens
```
/caveman:compress CLAUDE.md
```
Rewrites CLAUDE.md into caveman-speak (~46% smaller). Saves `CLAUDE.original.md` as human-readable backup. Run again after significant changes.

### Add a new shadcn component
```
pnpm dlx shadcn add <component>
```
Then invoke `/shadcn` if you need usage guidance.

### Review your UI
```
/web-design-guidelines
```
Audits for accessibility, UX, and best practices.

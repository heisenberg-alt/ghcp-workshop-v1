---
marp: true
theme: default
paginate: true
header: "GitHub Copilot Workshop"
footer: "Module 2 — CLI & VS Code Modes"
style: |
  section { font-family: 'Segoe UI', sans-serif; }
  h1 { color: #0366d6; }
  h2 { color: #24292e; }
  code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; }
  table { font-size: 0.85em; }
---

# Copilot CLI & VS Code Modes

### From the Terminal to the Editor

**Module 2 — Hands-On with Every Interaction Mode**

---

## GitHub Copilot in the CLI

Copilot isn't just for the editor — it lives in your terminal too.

**Install:**

```bash
gh extension install github/gh-copilot
```

**Two commands:**

| Command | Purpose |
|---------|---------|
| `gh copilot suggest` | Get a shell command from natural language |
| `gh copilot explain` | Explain what a command does |

---

## CLI — `gh copilot suggest`

Ask for a command in plain English:

```bash
gh copilot suggest "find all Python files modified in the last 7 days"
```

**Output:**

```
find . -name "*.py" -mtime -7
```

Copilot asks you to choose the shell type (bash, PowerShell, etc.) and lets you **copy, execute, or revise** the suggestion.

---

## CLI — `gh copilot explain`

Paste a command you don't understand:

```bash
gh copilot explain "awk '{print $NF}' access.log | sort | uniq -c | sort -rn | head -20"
```

**Output:**
> This command extracts the last field from each line of `access.log`, counts unique values, sorts them by frequency in descending order, and shows the top 20.

Great for decoding inherited scripts and one-liners.

---

## DEMO: Copilot CLI

> **See `demos/demo-01-cli.md` for the full script**

Live exercises:
1. Suggest a git command to squash the last 3 commits
2. Explain a complex `find` + `xargs` pipeline
3. Suggest a Docker command to clean up dangling images

---

## VS Code — Four Interaction Modes

Copilot in VS Code has evolved into **4 distinct modes**, each optimized for a different workflow:

| Mode | Purpose | Edits Files? |
|------|---------|:------------:|
| **Chat** | Conversational coding assistant | Yes |
| **Ask** | Read-only Q&A and exploration | No |
| **Plan** | Step-by-step implementation plans | No (plans only) |
| **Agent** | Autonomous multi-step execution | Yes + Terminal |

Let's explore each one.

---

## Chat Mode

**The default conversational interface.**

Open: `Ctrl+Shift+I` or click the Copilot icon

**What it does:**
- Answer coding questions with context
- Generate, refactor, and explain code
- Apply changes directly to your files
- Multi-turn conversations with memory

**Key features:**
- `@workspace` — project-wide context
- `#file:path` — reference specific files
- `/fix`, `/explain`, `/tests`, `/doc` — slash commands

---

## Chat Mode — In Practice

```
You: @workspace How does authentication work in this project?

Copilot: Based on the codebase, authentication uses JWT tokens...
  - `src/auth/middleware.ts` handles token validation
  - `src/auth/login.ts` issues tokens on login
  - Tokens expire after 24 hours (configured in `config.ts`)
```

Chat Mode understands your codebase and gives contextual answers. It can also **apply code changes** directly.

---

## Ask Mode

**Read-only exploration — no file edits.**

Switch to Ask Mode in the Copilot Chat panel dropdown.

**When to use it:**
- Exploring an unfamiliar codebase
- Understanding architecture decisions
- Investigating a bug without changing code yet
- Learning how a library or pattern is used

**Key difference from Chat:** Ask Mode will **never propose file edits** — purely informational.

---

## Ask Mode — In Practice

```
You: What design patterns are used in the authentication module?

Copilot: The auth module uses several patterns:
  1. Strategy Pattern — `AuthProvider` interface with OAuth, SAML implementations
  2. Middleware Pattern — Express middleware chain for token validation
  3. Factory Pattern — `createAuthProvider()` returns the right strategy
```

Perfect for onboarding, code reviews, and architecture exploration.

---

## Plan Mode

**Think before coding — structured implementation plans.**

Switch to Plan Mode in the dropdown.

**What it does:**
1. Analyzes your request and the codebase
2. Generates a **step-by-step plan** with file changes
3. You **review and approve** each step
4. Then execute (manually or switch to Agent Mode)

**When to use it:**
- Complex features spanning multiple files
- When you want to review the approach before any code changes
- Architectural changes that need careful planning

---

## Plan Mode — In Practice

```
You: Add rate limiting to all API endpoints

Copilot Plan:
  Step 1: Install `express-rate-limit` package
  Step 2: Create `src/middleware/rateLimiter.ts` with config
  Step 3: Apply middleware in `src/app.ts` router setup
  Step 4: Add rate limit headers to responses
  Step 5: Update tests in `tests/middleware/`

  Files affected: 4 modified, 1 created
```

You review, adjust, and approve before any code is written.

---

## Agent Mode

**Autonomous coding agent — the most powerful mode.**

Switch to Agent Mode in the dropdown or use `Ctrl+Shift+I` → Agent.

**What it does:**
- Reads and writes files autonomously
- Runs terminal commands (build, test, lint)
- Iterates on errors — fixes and retries
- Multi-step task execution with tool use

**When to use it:**
- "Add a login page with form validation"
- "Fix the failing tests in the auth module"
- "Refactor this class to use dependency injection"

---

## Agent Mode — In Practice

```
You: Add unit tests for the UserService class

Agent Mode:
  ✓ Read src/services/UserService.ts
  ✓ Read src/models/User.ts
  ✓ Created tests/services/UserService.test.ts
  ✓ Running: npm test -- UserService
  ✗ 2 tests failed — fixing assertions...
  ✓ Updated test expectations
  ✓ Running: npm test -- UserService
  ✓ All 8 tests passing
```

Agent Mode doesn't just generate code — it **verifies** it works.

---

## Comparison Matrix

| Capability | Chat | Ask | Plan | Agent |
|-----------|:----:|:---:|:----:|:-----:|
| Answer questions | Yes | Yes | — | Yes |
| Read your codebase | Yes | Yes | Yes | Yes |
| Edit files | Yes | No | No | Yes |
| Run terminal commands | No | No | No | Yes |
| Multi-step execution | No | No | No | Yes |
| Generate plans | No | No | Yes | — |
| Self-correct on errors | No | No | No | Yes |

**Rule of thumb:** Start with Ask to explore → Plan to design → Agent to execute.

---

## DEMO: VS Code Modes

> **See `demos/demo-02-vscode-modes.md` for the full script**

Live walkthrough:
1. **Ask Mode** — "How does this project handle errors?"
2. **Chat Mode** — "Add input validation to the signup form"
3. **Plan Mode** — "Add caching to the database queries"
4. **Agent Mode** — "Create a health check endpoint with tests"

---

## What's Next?

**Module 3** — Going deeper:
- What is MCP (Model Context Protocol)?
- How Copilot Extensions use MCP
- Build your own MCP server from scratch

Let's extend Copilot's capabilities!

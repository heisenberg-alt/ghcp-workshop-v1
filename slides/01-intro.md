---
marp: true
theme: default
paginate: true
header: "GitHub Copilot Workshop"
footer: "Module 1 — Introduction"
style: |
  section { font-family: 'Segoe UI', sans-serif; }
  h1 { color: #0366d6; }
  h2 { color: #24292e; }
  code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; }
  table { font-size: 0.85em; }
---

# GitHub Copilot Workshop

### Your AI Pair Programmer

**Module 1 — High-Level Introduction**

---

## What is GitHub Copilot?

- An **AI-powered coding assistant** integrated into your editor
- Trained on billions of lines of public code
- Goes beyond autocomplete — understands **intent** and **context**
- Available in VS Code, JetBrains, Neovim, CLI, and GitHub.com

> "The most widely adopted AI developer tool in the world"

---

## The Evolution of Copilot

```
2021  Copilot Preview      Inline code completions
2023  Copilot Chat          Conversational AI in the editor
2023  Copilot CLI           AI in the terminal
2024  Copilot Extensions    Third-party agents & skills
2024  Agent Mode            Autonomous multi-step coding
2025  MCP Support           Model Context Protocol integration
```

Each generation added a new way to interact with AI — from passive suggestions to active collaboration.

---

## How Does Copilot Work?

```
┌──────────────┐     ┌──────────────────┐     ┌─────────┐
│   Your IDE   │────▶│  Copilot Service  │────▶│   LLM   │
│  (VS Code)   │◀────│  (Context Engine) │◀────│ (Cloud) │
└──────────────┘     └──────────────────┘     └─────────┘
       │                      │
  Open files              Filters &
  Cursor position         post-processing
  Comments & imports
```

The **Context Engine** is the secret sauce — it gathers relevant context from your project to form better prompts.

---

## The Context Engine

What Copilot sees when generating suggestions:

| Signal | Example |
|--------|---------|
| Current file | The code around your cursor |
| Open tabs | Related files you're working with |
| Imports & dependencies | Libraries and frameworks in use |
| Comments & docstrings | Your described intent |
| File path & name | `test_auth.py` → knows it's a test |
| Repository context | `@workspace` indexes your project |

More context = better suggestions.

---

## Supported Environments

**IDEs:**
- VS Code / VS Code Insiders
- JetBrains suite (IntelliJ, PyCharm, WebStorm, etc.)
- Neovim
- Visual Studio
- Xcode

**CLI:** `gh copilot` in any terminal

**Web:** GitHub.com (PR summaries, issue triage, Copilot Chat)

**Languages:** Works with virtually any language — strongest in Python, JavaScript/TypeScript, Go, Java, C#, Ruby

---

## Copilot Plans

| Feature | Individual | Business | Enterprise |
|---------|-----------|----------|------------|
| Code completions | Yes | Yes | Yes |
| Copilot Chat | Yes | Yes | Yes |
| CLI | Yes | Yes | Yes |
| Agent Mode | Yes | Yes | Yes |
| Admin & policy controls | — | Yes | Yes |
| Audit logs | — | Yes | Yes |
| Knowledge bases | — | — | Yes |
| Fine-tuned models | — | — | Yes |
| IP indemnity | — | Yes | Yes |

---

## Key Features at a Glance

1. **Code Completion** — inline ghost text suggestions as you type
2. **Copilot Chat** — ask questions, explain code, generate tests
3. **Copilot CLI** — get shell commands from natural language
4. **Agent Mode** — autonomous multi-step task execution
5. **Extensions** — third-party tools and custom agents
6. **PR Summaries** — auto-generated pull request descriptions
7. **Knowledge Bases** — enterprise doc search (Enterprise only)

---

## Code Completion — How It Works

```python
# Calculate the factorial of a number
def factorial(n):
    # Copilot suggests ↓
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

**Workflow:**
- Type a comment or function signature
- Copilot shows **ghost text** in gray
- Press `Tab` to accept, `Esc` to dismiss
- `Alt+]` / `Alt+[` to cycle through alternatives

---

## Copilot Chat — Conversational AI

Open with `Ctrl+Shift+I` (VS Code)

**Participants:**
- `@workspace` — searches your entire project
- `@vscode` — VS Code settings and commands
- `@terminal` — terminal context

**References:**
- `#file` — attach a specific file
- `#selection` — reference selected code
- `#codebase` — full repository context

**Slash commands:** `/explain`, `/fix`, `/tests`, `/doc`

---

## Copilot Extensions

Third-party agents that extend Copilot's capabilities:

- **@docker** — container management and Dockerfile generation
- **@azure** — Azure resource management
- **@sentry** — error investigation
- **Custom extensions** — build your own with the Extensions API

Extensions run as **server-side agents** that receive Copilot messages and return responses — we'll build one in Module 3.

---

## Responsible AI Considerations

**Copilot is a tool, not a replacement:**
- Always **review** generated code before committing
- Suggestions can contain **bugs, security issues, or outdated patterns**
- It may **hallucinate** APIs or functions that don't exist

**Data privacy:**
- Business/Enterprise: your code is **not used for training**
- Telemetry and suggestions can be controlled via org policies
- IP indemnity available on Business & Enterprise plans

**Best practice:** Treat Copilot output like a code review from a junior developer — helpful, but verify.

---

## Prompt Engineering for Copilot

### Write better prompts, get better code

| Tip | Example |
|-----|---------|
| Be specific | "Parse a CSV file with headers into a list of dicts" |
| Provide context | Add imports and type hints before asking |
| Use comments | Write a comment describing the function before the signature |
| Iterate | Accept partial suggestions, then refine with follow-up prompts |
| Reference files | Use `#file:schema.ts` to give Copilot more context |

The #1 rule: **the more context you provide, the better the output.**

---

## Real-World Impact

- **55%** faster task completion (GitHub research)
- **46%** of new code written by Copilot (across GitHub users)
- **74%** of developers say it helps them focus on more satisfying work
- Adoption by **77,000+ organizations** worldwide

Copilot excels at:
- Boilerplate and repetitive patterns
- Unfamiliar languages and frameworks
- Test generation
- Documentation and explanations

---

## What's Next?

**Module 2** — We'll get hands-on with:
- Copilot CLI (`gh copilot suggest` / `explain`)
- The 4 VS Code interaction modes:
  - Chat Mode
  - Ask Mode
  - Plan Mode
  - Agent Mode

Let's see Copilot in action!

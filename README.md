# GitHub Copilot Workshop

A 2-hour hands-on workshop covering GitHub Copilot features, VS Code modes, MCP servers, and IaC governance.

## Agenda

| Module | Topic | Duration |
|--------|-------|----------|
| 1 | High-Level Introduction to GitHub Copilot | 30 min |
| 2 | Copilot CLI & VS Code Modes (Chat, Ask, Plan, Agent) | 30 min |
| 3 | MCP Basics, Skills & Build Your Own MCP Server | 30 min |
| 4 | Hands-On Demo & Q&A — ghcp-iac-workflow | 30 min |

## Prerequisites

- **GitHub account** with Copilot access (Individual, Business, or Enterprise)
- **VS Code** (latest stable) with the GitHub Copilot extension installed
- **GitHub CLI** (`gh`) installed — [install guide](https://cli.github.com/)
- **Node.js 18+** — needed for the MCP server tutorial in Module 3
- **Go 1.22+** — needed for the hands-on demo in Module 4
- **Make** and **curl** — for building and testing the demo project

## Repository Structure

```
slides/              Marp-compatible slide decks (one per module)
  01-intro.md
  02-cli-and-modes.md
  03-mcp-and-skills.md
  04-hands-on.md
demos/               Step-by-step demo scripts for live coding
  demo-01-cli.md
  demo-02-vscode-modes.md
  demo-03-mcp-server.md
  demo-04-iac-workflow.md
changelog-mcp/       Custom MCP server (git changelog generator)
  index.js
  package.json
.vscode/mcp.json     MCP server registration for VS Code
```

## Running the Slides

Slides are written in [Marp](https://marp.app/) markdown format.

**VS Code:** Install the [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) extension, then open any slide file and click the preview icon.

**CLI export to PDF/PPTX:**

```bash
npx @marp-team/marp-cli slides/01-intro.md --pdf
npx @marp-team/marp-cli slides/01-intro.md --pptx
```

**Build all slides as static HTML (web):**

```bash
npx @marp-team/marp-cli slides/ -o public/ --html
```

This generates self-contained HTML files in `public/` that can be opened in any browser or deployed to GitHub Pages.

**Serve locally with live reload:**

```bash
npx @marp-team/marp-cli slides/ --server
```

Opens a local dev server at `http://localhost:8080` with hot reload on save.

## MCP Server — Git Changelog

The `changelog-mcp/` folder contains a custom MCP server that generates structured changelogs and commit stats from git history. See `demos/demo-03-mcp-server.md` for the full walkthrough.

**Setup:**

```bash
cd changelog-mcp && npm install
```

The server is registered in `.vscode/mcp.json` and exposes two tools to Copilot Chat:

| Tool | Purpose |
|------|---------|
| `generate-changelog` | Structured changelog between two git refs |
| `commit-stats` | Commit statistics over a time period |

## Hands-On Demo Project

Module 4 uses [ghcp-iac-workflow](https://heisenberg-alt.github.io/ghcp-iac-workflow/) — a GitHub Copilot Extension for IaC governance on Azure. See `demos/demo-04-iac-workflow.md` for the full walkthrough.

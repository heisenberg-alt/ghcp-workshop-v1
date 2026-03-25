---
marp: true
theme: default
paginate: true
header: "GitHub Copilot Workshop"
footer: "Module 3 — MCP & Skills"
style: |
  section { font-family: 'Segoe UI', sans-serif; }
  h1 { color: #0366d6; }
  h2 { color: #24292e; }
  code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; }
  table { font-size: 0.85em; }
---

# MCP, Skills & Build Your Own Server

### Extending Copilot's Capabilities

**Module 3 — Model Context Protocol Deep Dive**

---

## The Problem: Tool Silos

Every AI assistant needs to talk to external tools, but integrations are fragmented:

```
         ┌─── Custom Plugin ───▶ Database
AI Tool ─┼─── Another Plugin ──▶ Jira
         └─── Yet Another ─────▶ Slack
```

Each AI tool builds its own integration layer. **N tools x M services = N*M integrations.**

MCP solves this with a universal standard.

---

## What is MCP?

**Model Context Protocol** — an open standard (by Anthropic) for connecting AI models to external tools and data sources.

```
         ┌─── MCP ──▶ Database
AI Tool ─┼─── MCP ──▶ Jira
         └─── MCP ──▶ Slack
```

**One protocol, every integration.** N tools + M services = N+M integrations.

Think of it as **USB-C for AI** — a universal connector.

---

## MCP Architecture

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│    HOST     │     │   CLIENT   │     │   SERVER   │
│  (VS Code)  │────▶│  (Copilot) │────▶│ (Your Tool)│
│             │     │            │     │            │
│ Manages     │     │ Maintains  │     │ Exposes    │
│ lifecycle   │     │ 1:1 conn   │     │ tools &    │
│ & security  │     │ to server  │     │ resources  │
└────────────┘     └────────────┘     └────────────┘
```

- **Host:** The application (VS Code, Claude Desktop)
- **Client:** Protocol handler inside the host
- **Server:** Your code — exposes capabilities

---

## MCP Primitives

MCP servers expose three types of capabilities:

| Primitive | Description | Example |
|-----------|-------------|---------|
| **Tools** | Functions the model can call | `analyze_terraform`, `query_db` |
| **Resources** | Data the model can read | File contents, API responses |
| **Prompts** | Reusable prompt templates | "Analyze this IaC for compliance" |

**Tools** are the most common — they let Copilot call your code.

---

## MCP Transport Types

How host and server communicate:

### stdio (Standard I/O)
```
Host ──stdin──▶ Server
Host ◀─stdout── Server
```
- Server runs as a **local process**
- Simple, fast, no network needed
- Best for local tools and CLI integrations

### HTTP + SSE (Server-Sent Events)
```
Host ──HTTP POST──▶ Server (remote)
Host ◀──SSE stream── Server (remote)
```
- Server runs **remotely** (cloud, container)
- Works across network boundaries
- Best for shared services and team tools

---

## MCP in GitHub Copilot

GitHub Copilot supports MCP servers natively in VS Code:

**Configuration** (`.vscode/mcp.json`):
```json
{
  "servers": {
    "my-tool": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp-server/index.js"]
    }
  }
}
```

Once configured, Copilot **discovers the server's tools** and can invoke them during chat sessions.

---

## Copilot Skills

**Skills** = pre-packaged capabilities for Copilot Extensions.

| Concept | What it is |
|---------|-----------|
| **Extension** | A GitHub App that responds to Copilot Chat messages |
| **Agent** | An extension that can perform actions (server-side) |
| **Skill** | A specific capability an agent exposes (e.g., "analyze IaC") |

An extension can have **multiple skills**, each handling different intents.

Example: The `ghcp-iac-workflow` extension has skills for policy analysis, cost estimation, drift detection, and more.

---

## Built-in & Community MCP Servers

Popular MCP servers you can use today:

| Server | What it provides |
|--------|-----------------|
| `@modelcontextprotocol/server-filesystem` | File read/write/search |
| `@modelcontextprotocol/server-github` | GitHub API access |
| `@modelcontextprotocol/server-postgres` | PostgreSQL queries |
| `@modelcontextprotocol/server-brave-search` | Web search |
| `@modelcontextprotocol/server-memory` | Persistent knowledge graph |

Browse more at [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

---

## Building Your Own MCP Server

### Conceptual Overview

```
1. Define your tools     →  What can the AI call?
2. Implement handlers    →  What happens when it calls?
3. Register & serve      →  Expose via stdio or HTTP
4. Configure in VS Code  →  Tell Copilot about your server
```

Let's build one step by step.

---

## Step 1: Scaffold the Project

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
```

Create `index.js`:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from
  "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});
```

---

## Step 2: Define a Tool

```javascript
import { z } from "zod";

server.tool(
  "analyze-text",
  "Analyze text for word count and reading level",
  { text: z.string().describe("The text to analyze") },
  async ({ text }) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = (words / sentences).toFixed(1);

    return {
      content: [{
        type: "text",
        text: `Words: ${words}, Sentences: ${sentences}, ` +
              `Avg words/sentence: ${avgWordsPerSentence}`
      }]
    };
  }
);
```

---

## Step 3: Connect the Transport

```javascript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch(console.error);
```

That's it — your server reads JSON-RPC from stdin and writes to stdout.

**Full file is ~40 lines of code.**

---

## Step 4: Configure in VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "my-first-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["./my-mcp-server/index.js"]
    }
  }
}
```

Restart Copilot Chat → your tool appears in the tools list.

Test it: *"Use the analyze-text tool on this paragraph..."*

---

## Real-World Example: ghcp-iac-workflow

A production MCP server in Go with **10 agents** and **dual transport**:

```
┌─────────────────────────────────────────────┐
│              Agent Host                      │
│  ┌───────────┐  ┌──────────────────────┐    │
│  │ HTTP/SSE  │  │    MCP stdio         │    │
│  │ Transport │  │    (JSON-RPC 2.0)    │    │
│  └─────┬─────┘  └──────────┬───────────┘    │
│        └────────┬───────────┘                │
│           ┌─────▼──────┐                     │
│           │    Host     │                     │
│           │  Registry   │                     │
│           │  Dispatcher │                     │
│           └─────┬──────┘                     │
│        ┌────────┼────────┐                   │
│     Policy  Security  Compliance  ...        │
└─────────────────────────────────────────────┘
```

---

## ghcp-iac-workflow — Key Patterns

**Multi-agent architecture:**
- `orchestrator` classifies intent → dispatches to specialist agents
- Each agent implements a common `Agent` interface
- Host registry enables dynamic agent discovery

**Dual transport:**
- HTTP/SSE for Copilot Chat extension (`POST /agent`)
- MCP stdio for IDE integration (`make dev-mcp`)
- Same agent logic, different transports

**Analysis engine:** 12 deterministic rules across Policy, Security, and Compliance (CIS, NIST, SOC2)

We'll run this hands-on in Module 4.

---

## What's Next?

**Module 4** — Hands-on with ghcp-iac-workflow:
- Clone, build, and run the project
- Send Terraform snippets for analysis
- See real security and compliance findings
- Try MCP mode in VS Code

Let's build and break things!

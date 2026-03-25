# Demo 03 — Build Your Own MCP Server

**Duration:** ~12 min during Module 3
**Prerequisites:** Node.js 18+, VS Code with Copilot, Git

We'll build a **Git Changelog Generator** MCP server — a real tool every dev team needs. It reads your git history and generates structured release notes, categorizing commits into features, fixes, and breaking changes.

---

## The Problem We're Solving

Every release cycle, someone manually writes changelog entries:
- Scroll through `git log`, copy commit messages
- Categorize them (feat, fix, chore, breaking)
- Format into markdown for the release

Let's automate this. Copilot + our MCP server = *"generate the changelog for v1.2.0"*.

---

## Step 1: Scaffold the Project

```bash
mkdir changelog-mcp && cd changelog-mcp
npm init -y
npm install @modelcontextprotocol/sdk zod
```

Update `package.json` to add `"type": "module"`:

```bash
# Edit package.json and add: "type": "module"
```

**Talking point:** The MCP SDK is the official package from Anthropic. `zod` is used for input validation schemas. That's all we need — git is already on the machine.

---

## Step 2: Create the Server Entry Point

Create `index.js`:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execSync } from "child_process";
import { z } from "zod";

const server = new McpServer({
  name: "git-changelog",
  version: "1.0.0",
});
```

**Talking point:** We import `execSync` from Node's built-in `child_process` — that's how we'll call `git log`. No extra dependencies needed.

---

## Step 3: Define the Changelog Tool

Add below the server initialization:

```javascript
// Tool 1: Generate a changelog between two git refs
server.tool(
  "generate-changelog",
  "Generate a structured changelog from git history between two refs (tags, branches, or commits)",
  {
    from: z.string().describe("Start ref — tag, branch, or commit hash (e.g., 'v1.0.0', 'main~10')"),
    to: z.string().default("HEAD").describe("End ref (default: HEAD)"),
    repo_path: z.string().optional().describe("Path to the git repository (default: current directory)"),
  },
  async ({ from, to, repo_path }) => {
    const cwd = repo_path || process.cwd();

    // Get commits between refs with conventional commit parsing
    const raw = execSync(
      `git log ${from}..${to} --pretty=format:"%h|%s|%an|%ad" --date=short`,
      { cwd, encoding: "utf-8" }
    );

    if (!raw.trim()) {
      return { content: [{ type: "text", text: `No commits found between ${from} and ${to}` }] };
    }

    const commits = raw.trim().split("\n").map(line => {
      const [hash, subject, author, date] = line.split("|");
      return { hash, subject, author, date };
    });

    // Categorize by conventional commit prefix
    const features = [];
    const fixes = [];
    const breaking = [];
    const other = [];

    for (const c of commits) {
      if (c.subject.startsWith("feat")) features.push(c);
      else if (c.subject.startsWith("fix")) fixes.push(c);
      else if (c.subject.includes("BREAKING") || c.subject.startsWith("!")) breaking.push(c);
      else other.push(c);
    }

    // Build markdown changelog
    const lines = [`# Changelog: ${from} → ${to}`, ``, `**${commits.length} commits** by ${[...new Set(commits.map(c => c.author))].join(", ")}`, ``];

    if (breaking.length) {
      lines.push(`## BREAKING CHANGES`, ...breaking.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), ``);
    }
    if (features.length) {
      lines.push(`## Features`, ...features.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), ``);
    }
    if (fixes.length) {
      lines.push(`## Bug Fixes`, ...fixes.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), ``);
    }
    if (other.length) {
      lines.push(`## Other Changes`, ...other.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), ``);
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);
```

**Talking point:** `server.tool()` takes 4 arguments:
1. Tool name — `"generate-changelog"` (what the model calls)
2. Description — helps the model decide *when* to use it
3. Input schema — validated automatically via zod, with defaults and optionals
4. Handler function — the actual logic (here: git + text processing)

---

## Step 4: Add a Commit Stats Tool

A second tool that gives a quick summary — useful for standup reports:

```javascript
// Tool 2: Get commit stats for a time period
server.tool(
  "commit-stats",
  "Get commit statistics for a git repository over a time period — useful for standup reports and sprint reviews",
  {
    since: z.string().default("1 week ago").describe("Time period (e.g., '1 week ago', '2025-01-01', 'last Monday')"),
    repo_path: z.string().optional().describe("Path to the git repository (default: current directory)"),
  },
  async ({ since, repo_path }) => {
    const cwd = repo_path || process.cwd();

    const log = execSync(
      `git log --since="${since}" --pretty=format:"%an" --no-merges`,
      { cwd, encoding: "utf-8" }
    );

    if (!log.trim()) {
      return { content: [{ type: "text", text: `No commits found since ${since}` }] };
    }

    const authors = log.trim().split("\n");
    const total = authors.length;

    // Count per author
    const counts = {};
    for (const a of authors) counts[a] = (counts[a] || 0) + 1;

    // Get file change stats
    const shortstat = execSync(
      `git diff --shortstat "HEAD@{${since}}" HEAD`,
      { cwd, encoding: "utf-8" }
    ).trim();

    const lines = [
      `## Commit Stats (since ${since})`,
      ``,
      `**Total commits:** ${total}`,
      `**${shortstat || "No file changes"}**`,
      ``,
      `### By Author`,
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `- ${name}: ${count} commits`),
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);
```

**Talking point:** Notice how naturally tools compose — one for release changelogs, one for daily stats. The model picks the right one based on the user's question.

---

## Step 5: Connect the Transport and Start

Add at the bottom of `index.js`:

```javascript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Git Changelog MCP server running on stdio");
}

main().catch(console.error);
```

**Talking point:** `console.error` goes to stderr (for logging). `console.log` would go to stdout and interfere with the JSON-RPC protocol. This is a common gotcha.

---

## Complete File

The entire server is ~90 lines:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execSync } from "child_process";
import { z } from "zod";

const server = new McpServer({
  name: "git-changelog",
  version: "1.0.0",
});

server.tool(
  "generate-changelog",
  "Generate a structured changelog from git history between two refs (tags, branches, or commits)",
  {
    from: z.string().describe("Start ref — tag, branch, or commit hash"),
    to: z.string().default("HEAD").describe("End ref (default: HEAD)"),
    repo_path: z.string().optional().describe("Path to the git repo"),
  },
  async ({ from, to, repo_path }) => {
    const cwd = repo_path || process.cwd();
    const raw = execSync(
      `git log ${from}..${to} --pretty=format:"%h|%s|%an|%ad" --date=short`,
      { cwd, encoding: "utf-8" }
    );
    if (!raw.trim()) {
      return { content: [{ type: "text", text: `No commits between ${from}..${to}` }] };
    }
    const commits = raw.trim().split("\n").map(line => {
      const [hash, subject, author, date] = line.split("|");
      return { hash, subject, author, date };
    });
    const features = [], fixes = [], breaking = [], other = [];
    for (const c of commits) {
      if (c.subject.startsWith("feat")) features.push(c);
      else if (c.subject.startsWith("fix")) fixes.push(c);
      else if (c.subject.includes("BREAKING")) breaking.push(c);
      else other.push(c);
    }
    const lines = [`# Changelog: ${from} → ${to}`, "",
      `**${commits.length} commits** by ${[...new Set(commits.map(c => c.author))].join(", ")}`, ""];
    if (breaking.length) lines.push("## BREAKING CHANGES",
      ...breaking.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), "");
    if (features.length) lines.push("## Features",
      ...features.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), "");
    if (fixes.length) lines.push("## Bug Fixes",
      ...fixes.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), "");
    if (other.length) lines.push("## Other Changes",
      ...other.map(c => `- ${c.subject} (\`${c.hash}\` — ${c.author}, ${c.date})`), "");
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

server.tool(
  "commit-stats",
  "Get commit statistics for a git repo over a time period",
  {
    since: z.string().default("1 week ago").describe("Time period"),
    repo_path: z.string().optional().describe("Path to the git repo"),
  },
  async ({ since, repo_path }) => {
    const cwd = repo_path || process.cwd();
    const log = execSync(
      `git log --since="${since}" --pretty=format:"%an" --no-merges`,
      { cwd, encoding: "utf-8" }
    );
    if (!log.trim()) {
      return { content: [{ type: "text", text: `No commits since ${since}` }] };
    }
    const authors = log.trim().split("\n");
    const counts = {};
    for (const a of authors) counts[a] = (counts[a] || 0) + 1;
    const shortstat = execSync(
      `git diff --shortstat "HEAD@{${since}}" HEAD`,
      { cwd, encoding: "utf-8" }
    ).trim();
    const lines = [`## Commit Stats (since ${since})`, "",
      `**Total commits:** ${authors.length}`, `**${shortstat || "No file changes"}**`, "",
      "### By Author",
      ...Object.entries(counts).sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `- ${name}: ${count} commits`)];
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Git Changelog MCP server running on stdio");
}

main().catch(console.error);
```

---

## Step 6: Configure in VS Code

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "git-changelog": {
      "type": "stdio",
      "command": "node",
      "args": ["./changelog-mcp/index.js"]
    }
  }
}
```

**Reload VS Code** (or restart Copilot Chat).

---

## Step 7: Test from Copilot Chat

Open Copilot Chat in any git repo and try these prompts:

### Test 1 — Generate a changelog between tags:
```
Generate a changelog from the last tag to HEAD
```

**Expected output:**
```markdown
# Changelog: v1.2.0 → HEAD

**12 commits** by Alice, Bob, Carol

## Features
- feat: add dark mode toggle (`a1b2c3d` — Alice, 2025-03-20)
- feat: implement user profile page (`d4e5f6a` — Bob, 2025-03-18)

## Bug Fixes
- fix: resolve login redirect loop (`b7c8d9e` — Carol, 2025-03-22)
- fix: handle null avatar URL (`f0a1b2c` — Alice, 2025-03-19)

## Other Changes
- chore: update dependencies (`1234567` — Bob, 2025-03-21)
- docs: update API reference (`89abcde` — Carol, 2025-03-17)
```

### Test 2 — Sprint review stats:
```
What are the commit stats for our repo in the last 2 weeks?
```

**Expected output:**
```markdown
## Commit Stats (since 2 weeks ago)

**Total commits:** 24
**15 files changed, 482 insertions(+), 127 deletions(-)**

### By Author
- Alice: 10 commits
- Bob: 8 commits
- Carol: 6 commits
```

### Test 3 — Natural language (shows tool selection):
```
I need to prepare release notes for the sprint review. We tagged v2.1.0
last Friday. What changed since then, and who contributed the most?
```

**Expected:** Copilot calls *both* tools — `generate-changelog` for the notes and `commit-stats` for author contributions — then combines them into a cohesive answer.

---

## Why This Example Works for the Workshop

1. **Everyone has git** — no API keys, cloud accounts, or external services needed
2. **Instantly testable** — every audience member has repos with real history
3. **Solves a real pain point** — manual changelogs are tedious and error-prone
4. **Shows tool composition** — two tools that Copilot combines intelligently
5. **Bridges to Module 4** — same MCP patterns, just different domain (git vs IaC)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server not appearing in tools list | Restart VS Code / Copilot Chat |
| "Cannot find module" error | Check `"type": "module"` in package.json |
| "Not a git repository" | Ensure repo_path points to a valid git repo |
| `git log` returns empty | Check that the ref names (tags/branches) exist |
| No output from tool | Check stderr in VS Code Output panel → MCP |

---

## Key Takeaways

1. An MCP server is just a program that speaks JSON-RPC over stdio or HTTP
2. The SDK handles all protocol details — you just define tools
3. Zod schemas give you free input validation *and* help the model understand parameters
4. Real utility in ~90 lines — this could ship as a team tool today
5. The same patterns scale to production (ghcp-iac-workflow = same concepts in Go, 10 agents)

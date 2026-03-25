# Demo 03 — Build Your Own MCP Server

**Duration:** ~12 min during Module 3
**Prerequisites:** Node.js 18+, VS Code with Copilot

This demo builds a minimal MCP server from scratch in TypeScript/Node.js, then tests it from Copilot Chat.

---

## Step 1: Scaffold the Project

```bash
mkdir mcp-demo && cd mcp-demo
npm init -y
npm install @modelcontextprotocol/sdk zod
```

Update `package.json` to add `"type": "module"`:

```bash
# Edit package.json and add: "type": "module"
```

**Talking point:** The MCP SDK is the official package from Anthropic. `zod` is used for input validation schemas.

---

## Step 2: Create the Server Entry Point

Create `index.js`:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create the MCP server
const server = new McpServer({
  name: "workshop-demo",
  version: "1.0.0",
});
```

**Talking point:** Every MCP server starts with a name and version. The host (VS Code) uses this to identify the server.

---

## Step 3: Define Your First Tool

Add below the server initialization:

```javascript
// Tool 1: Analyze text for readability metrics
server.tool(
  "analyze-text",
  "Analyze text for word count, sentence count, and reading level",
  {
    text: z.string().describe("The text to analyze"),
  },
  async ({ text }) => {
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const avgWordsPerSentence = sentences > 0
      ? (words / sentences).toFixed(1)
      : "N/A";

    // Simple readability estimate
    let level = "Easy";
    if (words / Math.max(sentences, 1) > 20) level = "Advanced";
    else if (words / Math.max(sentences, 1) > 14) level = "Intermediate";

    return {
      content: [{
        type: "text",
        text: [
          `Words: ${words}`,
          `Sentences: ${sentences}`,
          `Avg words/sentence: ${avgWordsPerSentence}`,
          `Reading level: ${level}`,
        ].join("\n"),
      }],
    };
  }
);
```

**Talking point:** `server.tool()` takes 4 arguments:
1. Tool name (what the model calls)
2. Description (helps the model decide when to use it)
3. Input schema (validated automatically via zod)
4. Handler function (your actual logic)

---

## Step 4: Add a Second Tool (Optional)

```javascript
// Tool 2: Generate a UUID
server.tool(
  "generate-id",
  "Generate a unique identifier with an optional prefix",
  {
    prefix: z.string().optional().describe("Optional prefix for the ID"),
  },
  async ({ prefix }) => {
    const id = crypto.randomUUID();
    const result = prefix ? `${prefix}-${id}` : id;

    return {
      content: [{
        type: "text",
        text: result,
      }],
    };
  }
);
```

**Talking point:** Tools can have optional parameters. The model decides whether to include them based on the user's request.

---

## Step 5: Connect the Transport and Start

Add at the bottom of `index.js`:

```javascript
// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Workshop MCP server running on stdio");
}

main().catch(console.error);
```

**Talking point:** `console.error` goes to stderr (for logging). `console.log` would go to stdout and interfere with the JSON-RPC protocol.

---

## Complete File

The entire server is ~55 lines:

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "workshop-demo",
  version: "1.0.0",
});

server.tool(
  "analyze-text",
  "Analyze text for word count, sentence count, and reading level",
  { text: z.string().describe("The text to analyze") },
  async ({ text }) => {
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const avgWordsPerSentence = sentences > 0
      ? (words / sentences).toFixed(1) : "N/A";
    let level = "Easy";
    if (words / Math.max(sentences, 1) > 20) level = "Advanced";
    else if (words / Math.max(sentences, 1) > 14) level = "Intermediate";
    return {
      content: [{ type: "text", text:
        `Words: ${words}\nSentences: ${sentences}\n` +
        `Avg words/sentence: ${avgWordsPerSentence}\nReading level: ${level}`
      }],
    };
  }
);

server.tool(
  "generate-id",
  "Generate a unique identifier with an optional prefix",
  { prefix: z.string().optional().describe("Optional prefix for the ID") },
  async ({ prefix }) => {
    const id = crypto.randomUUID();
    return {
      content: [{ type: "text", text: prefix ? `${prefix}-${id}` : id }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Workshop MCP server running on stdio");
}

main().catch(console.error);
```

---

## Step 6: Configure in VS Code

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "workshop-demo": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp-demo/index.js"]
    }
  }
}
```

**Reload VS Code** (or restart Copilot Chat).

---

## Step 7: Test from Copilot Chat

Open Copilot Chat and try these prompts:

### Test 1 — Analyze text:
```
Use the analyze-text tool to analyze this paragraph:
"The quick brown fox jumps over the lazy dog. This sentence is a pangram.
It contains every letter of the English alphabet at least once."
```

**Expected output:**
```
Words: 27
Sentences: 3
Avg words/sentence: 9.0
Reading level: Easy
```

### Test 2 — Generate ID:
```
Generate a unique ID with the prefix "user"
```

**Expected output:**
```
user-a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Test 3 — Combined (shows tool selection):
```
Analyze the readability of my README file and generate an ID I can
use to track this analysis
```

**Expected:** Copilot calls both tools and combines the results.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server not appearing in tools list | Restart VS Code / Copilot Chat |
| "Cannot find module" error | Check `"type": "module"` in package.json |
| No output from tool | Check stderr in Output panel → MCP |
| Tool errors silently | Add try/catch in handler, log to stderr |

---

## Key Takeaways

1. An MCP server is just a program that speaks JSON-RPC over stdio or HTTP
2. The SDK handles all protocol details — you just define tools
3. Zod schemas give you free input validation and help the model understand parameters
4. Total code: ~55 lines for a working, multi-tool MCP server
5. The same patterns scale to production (ghcp-iac-workflow = same concepts in Go)

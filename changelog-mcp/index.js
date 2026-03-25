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

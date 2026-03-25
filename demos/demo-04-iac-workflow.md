# Demo 04 — ghcp-iac-workflow Hands-On

**Duration:** ~20 min during Module 4
**Prerequisites:** Git, Go 1.22+, Make, curl

---

## Part 1: Setup (5 min)

### Clone and Build

```bash
git clone https://github.com/heisenberg-alt/ghcp-iac-workflow.git
cd ghcp-iac-workflow
```

```bash
make build
```

**Expected:** Compiles the `ghcp-iac` binary in the project root.

### Start the Server

```bash
make dev
```

**Expected output:**
```
Starting ghcp-iac agent host on :8080
Environment: dev
LLM: enabled (gpt-4.1-mini)
Loaded 10 agents
```

### Verify Health

In a new terminal:

```bash
curl http://localhost:8080/health | jq .
```

**Expected:**
```json
{
  "service": "ghcp-iac",
  "agents": 10,
  "status": "healthy"
}
```

**Talking point:** 10 agents loaded — Policy, Security, Compliance, Cost, Impact, Drift, Deploy, Notification, Module, Orchestrator.

---

## Part 2: Security Analysis (8 min)

### Scenario: Misconfigured Storage Account

Send a deliberately insecure Terraform resource:

```bash
curl -X POST http://localhost:8080/agent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "analyze this terraform:\nresource \"azurerm_storage_account\" \"bad_example\" {\n  name                     = \"badstorage123\"\n  resource_group_name      = \"rg-prod\"\n  location                 = \"eastus\"\n  account_tier             = \"Standard\"\n  account_replication_type = \"LRS\"\n  enable_https_traffic_only     = false\n  allow_nested_items_to_be_public = true\n  min_tls_version          = \"TLS1_0\"\n}"
    }]
  }'
```

### Walk Through the Output

The response streams via SSE. Key findings to explain:

| Rule | Severity | What it means |
|------|----------|--------------|
| SEC-001 | CRITICAL | Possible hardcoded secrets detected |
| POL-001 | HIGH | HTTPS not enforced — data in transit is unencrypted |
| POL-003 | HIGH | Public blob access enabled — anyone on the internet can read |
| POL-004 | MEDIUM | TLS 1.0 allowed — known vulnerabilities |
| NIST-SC7 | MEDIUM | No network rules — no perimeter control |
| NIST-SC28 | MEDIUM | Encryption at rest not explicitly configured |

**Blast Radius Score: HIGH (~14)**
- Storage accounts are high-impact resources
- Multiple misconfigurations compound the risk

**Talking point:** A single resource triggered 6 findings across 3 frameworks. This is what "shift left" looks like — catching these before `terraform apply`.

---

### Scenario: Secure Storage Account

Now send a properly configured resource:

```bash
curl -X POST http://localhost:8080/agent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "analyze this terraform:\nresource \"azurerm_storage_account\" \"good_example\" {\n  name                     = \"goodstorage123\"\n  resource_group_name      = \"rg-prod\"\n  location                 = \"eastus\"\n  account_tier             = \"Standard\"\n  account_replication_type = \"GRS\"\n  enable_https_traffic_only     = true\n  allow_nested_items_to_be_public = false\n  min_tls_version          = \"TLS1_2\"\n\n  network_rules {\n    default_action = \"Deny\"\n    bypass         = [\"AzureServices\"]\n  }\n\n  blob_properties {\n    delete_retention_policy {\n      days = 30\n    }\n  }\n}"
    }]
  }'
```

**Expected:** Fewer or no findings. Show the contrast.

**Talking point:** This is the same resource type, but properly configured. The difference is clear, actionable, and caught before deployment.

---

## Part 3: Cost Estimation (3 min)

```bash
curl -X POST http://localhost:8080/agent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "estimate cost for:\nresource \"azurerm_storage_account\" \"main\" {\n  name                     = \"mainstorage\"\n  account_tier             = \"Standard\"\n  account_replication_type = \"GRS\"\n  location                 = \"eastus\"\n}\n\nresource \"azurerm_linux_virtual_machine\" \"web\" {\n  name = \"web-vm\"\n  size = \"Standard_D2s_v3\"\n  location = \"eastus\"\n}"
    }]
  }'
```

**Expected:** Per-resource monthly cost breakdown using Azure Retail Prices API (or static fallback tables).

**Talking point:** Cost visibility at plan time prevents surprise bills. This uses the live Azure Retail Prices API.

---

## Part 4: MCP Mode (2 min)

Stop the HTTP server (`Ctrl+C`), then start in MCP mode:

```bash
make dev-mcp
```

This runs the same agent host over JSON-RPC 2.0 stdin/stdout — exactly the MCP protocol we learned about in Module 3.

### Configure in VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "ghcp-iac": {
      "type": "stdio",
      "command": "./ghcp-iac",
      "args": ["--mcp"]
    }
  }
}
```

### Test from Copilot Chat

```
Analyze my main.tf file for security and compliance issues
```

Copilot Chat calls the ghcp-iac MCP server, which analyzes the file using the same 12 rules.

---

## Part 5: Explore the Code (2 min)

Quick tour of the project structure:

```
agents/
  orchestrator/   ← Intent classification, routes to specialists
  policy/         ← 6 policy rules (HTTPS, RBAC, TLS, etc.)
  security/       ← 4 security rules (secrets, encryption, etc.)
  compliance/     ← 2 NIST rules (SC-7, SC-28)
  cost/           ← Azure pricing integration
  impact/         ← Blast radius scoring

internal/
  analyzer/       ← The 12 deterministic analysis rules
  transport/
    mcpstdio/     ← MCP stdio adapter
  host/           ← Agent registry and dispatcher
  parser/         ← Terraform HCL & Bicep parser
```

**Talking point:** Each agent is self-contained. The orchestrator classifies intent and dispatches to the right specialist. Same pattern works for any domain.

---

## Discussion Prompts for Q&A

1. "What IaC misconfigurations have bitten you in production?"
2. "Would you add custom rules for your organization's policies?"
3. "How would you integrate this into your CI/CD pipeline?"
4. "What other tools would you want as MCP servers?"
5. "Where do you see AI-assisted governance heading?"

---

## Cleanup

```bash
# Stop the server (Ctrl+C)
# Optional: remove the clone
cd .. && rm -rf ghcp-iac-workflow
```

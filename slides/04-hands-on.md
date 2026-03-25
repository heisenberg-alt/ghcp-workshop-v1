---
marp: true
theme: default
paginate: true
header: "GitHub Copilot Workshop"
footer: "Module 4 — Hands-On Demo & Q&A"
style: |
  section { font-family: 'Segoe UI', sans-serif; }
  h1 { color: #0366d6; }
  h2 { color: #24292e; }
  code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; }
  table { font-size: 0.85em; }
---

# Hands-On Demo & Q&A

### IaC Governance with GitHub Copilot

**Module 4 — ghcp-iac-workflow in Action**

---

## What We're Building

**ghcp-iac-workflow** — a GitHub Copilot Extension for Infrastructure as Code governance on Azure.

| Capability | Details |
|-----------|---------|
| IaC Analysis | 12 rules across Policy, Security, Compliance |
| Cost Estimation | Azure Retail Prices API integration |
| Blast Radius | Risk-weighted impact scoring |
| Drift Detection | Infrastructure state comparison |
| Frameworks | CIS, NIST SC-7/SC-28, SOC2 |
| Languages | Terraform (HCL) and Bicep |

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│                Agent Host                     │
│                                               │
│  Transports:   HTTP/SSE  |  MCP stdio         │
│                    │            │              │
│              ┌─────▼────────────▼─────┐       │
│              │   Orchestrator Agent    │       │
│              │   (Intent Classifier)   │       │
│              └───────────┬────────────┘       │
│     ┌───────┬────────┬───┴───┬────────┐      │
│  Policy  Security  Compliance Cost  Impact    │
│  (6 rules) (4 rules) (2 rules)               │
│                                               │
│  + Drift | Deploy | Notification | Module     │
└──────────────────────────────────────────────┘
```

10 specialized agents, all behind a single entry point.

---

## Setup — Let's Go

**Prerequisites:** Git, Go 1.22+, Make, curl

```bash
# 1. Clone the repository
git clone https://github.com/heisenberg-alt/ghcp-iac-workflow.git
cd ghcp-iac-workflow

# 2. Build the binary
make build

# 3. Start the server
make dev

# 4. Verify it's running
curl http://localhost:8080/health
```

Expected output: `{"service":"ghcp-iac","agents":10,"status":"healthy"}`

---

## Send Your First Analysis

POST a misconfigured Terraform resource:

```bash
curl -X POST http://localhost:8080/agent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "analyze this:\nresource \"azurerm_storage_account\" \"bad\" {\n  name = \"badstorage\"\n  enable_https_traffic_only = false\n  allow_nested_items_to_be_public = true\n}"
    }]
  }'
```

Watch the analysis stream back in real-time via SSE.

---

## Understanding the Output

```
SEC-001  Hardcoded secrets detected          CRITICAL
POL-001  HTTPS not enforced                  HIGH
POL-003  Public blob access enabled          HIGH
NIST-SC7   No network rules configured       MEDIUM
NIST-SC28  Encryption at rest not explicit   MEDIUM

Blast Radius Score: 14 (HIGH)
```

**Rule categories:**
- `SEC-*` — Security rules (secrets, encryption, public access)
- `POL-*` — Policy rules (HTTPS, RBAC, TLS, soft-delete)
- `NIST-*` — Compliance rules (SC-7 network, SC-28 encryption)

---

## Try More Scenarios

**Secure resource (should pass):**
```hcl
resource "azurerm_storage_account" "good" {
  name                      = "goodstorage"
  enable_https_traffic_only = true
  min_tls_version           = "TLS1_2"
  public_network_access_enabled = false
}
```

**Bicep resource:**
```bicep
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'mybicepstorage'
  properties: {
    supportsHttpsTrafficOnly: false
  }
}
```

---

## MCP Mode

Run the same agent host as an MCP server for IDE integration:

```bash
make dev-mcp
```

Configure in VS Code (`.vscode/mcp.json`):

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

Now use it directly from Copilot Chat: *"Analyze my main.tf for security issues"*

---

## Extending It — Add Your Own Rule

The analysis engine is pattern-based. To add a new rule:

1. Define the rule in the relevant agent (`agents/policy/`, `agents/security/`, etc.)
2. Add the pattern match logic
3. Register it in the agent's rule set
4. Run `make test` to verify

Example: add a rule to flag storage accounts without soft-delete:

```go
// POL-005: Soft-delete not enabled
if !hasProperty(resource, "blob_properties.delete_retention_policy") {
    findings = append(findings, Finding{
        RuleID:   "POL-005",
        Severity: "MEDIUM",
        Message:  "Soft-delete not configured",
    })
}
```

---

## Q&A Topics

Let's discuss:

- How do you see Copilot fitting into your workflow?
- What compliance frameworks matter to your organization?
- Interest in building custom Copilot Extensions?
- How to evaluate AI coding tools for your team?

---

## Resources

| Resource | Link |
|----------|------|
| ghcp-iac-workflow | `heisenberg-alt.github.io/ghcp-iac-workflow` |
| GitHub Copilot Docs | `docs.github.com/copilot` |
| MCP Specification | `modelcontextprotocol.io` |
| MCP Server Registry | `github.com/modelcontextprotocol/servers` |
| Copilot Extensions | `docs.github.com/copilot/building-copilot-extensions` |
| This Workshop | `github.com/heisenberg-alt/ghcp-workshop-v1` |

**Thank you!**

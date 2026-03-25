# Demo 01 — GitHub Copilot CLI

**Duration:** ~5 min during Module 2
**Prerequisites:** `gh` CLI installed with Copilot extension

## Setup

```bash
# Verify installation
gh copilot --version

# If not installed:
gh extension install github/gh-copilot
```

---

## Exercise 1: Suggest a Git Command

**Scenario:** You want to squash the last 3 commits into one.

```bash
gh copilot suggest "squash the last 3 git commits into one"
```

**Expected behavior:**
- Copilot asks to confirm the shell type (bash)
- Suggests something like: `git rebase -i HEAD~3`
- Options: Copy to clipboard / Execute / Revise

**Talking point:** Notice it didn't just give you the command — it chose the right approach (interactive rebase) for the task.

---

## Exercise 2: Explain a Complex Command

**Scenario:** You found this in a deployment script and need to understand it.

```bash
gh copilot explain "find /var/log -name '*.log' -mtime +30 -exec gzip {} \; && find /var/log -name '*.gz' -mtime +90 -delete"
```

**Expected output:** A plain-English breakdown:
- Finds log files older than 30 days and compresses them with gzip
- Finds compressed logs older than 90 days and deletes them
- The `&&` ensures deletion only runs if compression succeeds

**Talking point:** Great for onboarding — paste that mysterious cron job and get an instant explanation.

---

## Exercise 3: Suggest a Docker Command

**Scenario:** Clean up all stopped containers and dangling images.

```bash
gh copilot suggest "remove all stopped docker containers and dangling images"
```

**Expected suggestion:**
```bash
docker system prune -f
```

**Follow-up:** Ask Copilot to explain the difference between `docker system prune` and `docker system prune -a`.

```bash
gh copilot explain "docker system prune -a --volumes"
```

---

## Bonus: Interactive Conversation

Copilot CLI supports follow-up revisions:

```bash
gh copilot suggest "list all running kubernetes pods sorted by CPU usage"
```

If the suggestion isn't quite right, choose **Revise** and add:
> "but only in the production namespace"

This shows the conversational nature of the CLI tool.

---

## Key Takeaways

- `suggest` = "give me a command for this task"
- `explain` = "what does this command do?"
- Both support follow-up refinement
- Safe by default: commands are suggested, not auto-executed

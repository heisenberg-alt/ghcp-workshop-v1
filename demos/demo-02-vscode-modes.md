# Demo 02 — VS Code Copilot Modes

**Duration:** ~10 min during Module 2
**Prerequisites:** VS Code with GitHub Copilot extension, a sample project open

## Setup

Open any project in VS Code (a simple Express.js or Python Flask app works well). Make sure Copilot is active (check the status bar icon).

---

## Demo 1: Ask Mode (Read-Only Exploration)

**Switch to Ask Mode** in the Copilot Chat panel dropdown.

### Prompt 1 — Architecture question:
```
How is error handling implemented in this project?
What patterns are used?
```

**Expected:** Copilot reads through the codebase and explains the patterns — middleware, try/catch, error classes — without proposing any edits.

### Prompt 2 — Dependency analysis:
```
@workspace What external dependencies does this project use
and what is each one for?
```

**Expected:** A summary of `package.json` / `requirements.txt` dependencies with explanations.

**Key point to highlight:** Notice the response is purely informational. If you ask it to "fix the error handling," it will explain *how* but won't offer to edit files.

---

## Demo 2: Chat Mode (Conversational Coding)

**Switch to Chat Mode** in the dropdown.

### Prompt — Add input validation:
```
Add email validation to the signup form in #file:src/routes/auth.ts.
Use a regex pattern and return a 400 error for invalid emails.
```

**Expected:** Copilot suggests specific code changes with a diff view. You can:
- Click **Apply** to accept changes
- Click **Discard** to reject
- Ask follow-up questions in the same thread

### Follow-up prompt:
```
Also add validation for the password — minimum 8 characters,
at least one number and one special character.
```

**Key point to highlight:** Chat Mode maintains conversation context. The follow-up knows you're still talking about the signup form.

---

## Demo 3: Plan Mode (Strategic Planning)

**Switch to Plan Mode** in the dropdown.

### Prompt — Multi-file feature:
```
Add Redis caching to the database query layer. Cache GET requests
for 5 minutes and invalidate on POST/PUT/DELETE operations.
```

**Expected output — a structured plan:**
```
Plan:
1. Install redis package and add to dependencies
2. Create src/cache/redisClient.ts — connection setup
3. Create src/cache/cacheMiddleware.ts — request cache logic
4. Modify src/db/queries.ts — wrap queries with cache check
5. Modify src/routes/api.ts — add cache invalidation on writes
6. Add cache configuration to src/config.ts
7. Update tests to mock Redis

Files affected: 5 modified, 2 created
```

**Key point to highlight:** No code was written yet. This is a *plan* — you review it, adjust if needed, and then execute (manually or via Agent Mode).

### Interactive moment:
Ask the audience: "Would you change anything about this plan? Maybe a different caching strategy?"

---

## Demo 4: Agent Mode (Autonomous Execution)

**Switch to Agent Mode** in the dropdown.

### Prompt — End-to-end task:
```
Create a /health endpoint that returns the app version from package.json,
current uptime, and database connection status. Include unit tests.
```

**Watch Agent Mode work:**

```
✓ Reading package.json for version info
✓ Reading src/app.ts for route patterns
✓ Reading src/db/connection.ts for DB health check pattern
✓ Creating src/routes/health.ts
✓ Modifying src/app.ts to register new route
✓ Creating tests/routes/health.test.ts
✓ Running: npm test -- health
✗ Test failed: Cannot find module '../src/routes/health'
✓ Fixing import path in test file
✓ Running: npm test -- health
✓ All 3 tests passing
```

**Key points to highlight:**
1. It read existing code first to match patterns
2. It created files AND registered the route
3. It ran tests, hit an error, and **fixed it autonomously**
4. The loop: write → test → fix → test → pass

### Follow-up prompt:
```
Add a response time metric to the health endpoint
```

Agent Mode continues in context, modifying the files it just created.

---

## Summary Comparison (show on screen)

| What I need | Use this mode |
|-------------|---------------|
| Understand code I didn't write | **Ask** |
| Quick code edits with context | **Chat** |
| Plan a big feature before coding | **Plan** |
| Execute a task end-to-end | **Agent** |

**Rule of thumb:** Match the mode to your confidence level:
- Low confidence → Ask/Plan first
- High confidence → Chat/Agent directly

# Agent Protocol & Activation Guide

> **Quick Reference for Developer:** This protocol explains how to activate, direct, and collaborate with AI agents in this project. Whenever you start a new coding session or forget how to trigger specific agent modes, refer to this guide.

---

## 1. How the Agent Operates (Core Concept)

* **No Boot Command Needed:** You do not need to run a Python script or start a local server to talk to the AI.
* **Always Active:** Any message sent in this chat panel is directly processed by the agent.
* **Automatic Context Loading:** The agent automatically inspects your repository and silently reads:
  * Master rules: `.agents/instructions.md`
  * Expo guidelines: `mobile/AGENTS.md`
  * Database schema: `database/schema.sql`

---

## 2. Using `/agents`, `/teamwork`, and Subagents

### What is `/agents` / `/teamwork`?
When you want to run multiple specialized agents at once or assign distinct roles (Researcher, Implementer, QA/Checker), you can use agent orchestration:

1. **The Slash Command (`/teamwork` / `/agents`):**
   * Typing `/teamwork` in the chat launches the multi-agent orchestration mode.
   * Use this when a task is large (e.g., building an entire new flow with screens + database + testing) and needs a team of agents working together autonomously.

2. **Spawning Specific Subagents Directly in Chat:**
   You don't have to wait for a command menu—you can summon dedicated subagents simply by asking:
   * **Researcher Agent:**  
     > *"Launch a research subagent to check Expo SDK 51 documentation for hardware overlay APIs."*
   * **Implementer Agent:**  
     > *"Have an implementer agent build the UI in `src/screens/ParentDashboard.tsx`."*
   * **QA / Checker Agent:**  
     > *"Spawn a checker subagent to run `npx tsc --noEmit` and verify our TypeScript types."*

3. **How Subagents Work Behind the Scenes:**
   * Each subagent runs independently in the background.
   * You can see active agents and their logs in the **Auxiliary Pane / Subagents tab** in the IDE sidebar.
   * Once a subagent finishes its job, it posts its summary and code changes back to the main chat.

---

## 3. Quick-Trigger Cheatsheet

### A. Everyday Development Prompts
Always mention the **exact file** or **screen** you want the agent to work on:

| Action | Example Prompt |
| :--- | :--- |
| **Build a Screen** | *"Implement the pairing screen in `src/screens/PairingScreen.tsx` using our design tokens."* |
| **Create a Service** | *"Write a function in `src/services/choreService.ts` to fetch pending chores from Supabase."* |
| **Fix an Error** | *"I'm getting this error in terminal: `[paste error]`. Diagnose and fix it."* |
| **Refactor / Style** | *"Update `Button.tsx` to use the Sky Blue `#38BDF8` token for the primary button."* |

---

### B. Slash Commands (`/`) Summary

| Slash Command | Purpose | When to Use |
| :--- | :--- | :--- |
| **/teamwork** | Launches a team of autonomous agents working in parallel. | When building complex multi-file features. |
| **/plan** | Forces the agent to think and draft a step-by-step blueprint. | Before touching or modifying existing core code. |
| **/goal** | Autonomous long-running mode that won't stop until done. | For large chores (e.g., building out full test coverage). |
| **/compact** | Summarizes earlier chat history to free context tokens. | When the conversation becomes slow or very long. |
| **/browser** | Enables web browsing and live documentation search. | When checking external APIs or latest library releases. |

---

### C. Context Mentions (`@`)
Type `@` in the chat input box to attach specific context directly into your message:
* `@file` or `@folder` — e.g., `@schema.sql`, `@AuthScreen.tsx`, `@mobile/src/services/`
* `@.agents` — references the agent configuration directory and rules.
* This guarantees the agent inspects the exact files you care about without guessing.

---

## 4. Project Structure & Architecture Map

Refer to this layout when directing the agent to specific files:

```text
chorpy/
├── .agents/                    # Agent rules, instructions, and modular skills
│   ├── instructions.md         # Master rules, architecture, and screen registry
│   └── agentProtocol.md        # Agent activation and command cheat sheet
├── database/                   # SQL schemas, RLS policies, and database migrations
│   └── schema.sql              # Supabase table definitions, triggers, and realtime publications
├── mobile/                     # React Native / Expo application
│   ├── assets/                 # Images, icons, and static fonts
│   ├── src/
│   │   ├── components/         # Reusable UI components (Button.tsx, Card.tsx)
│   │   ├── context/            # React Context providers (AuthContext.tsx)
│   │   ├── hooks/              # Custom hooks (useAuth.ts, useChores.ts, useDeviceLock.ts)
│   │   ├── lib/                # Supabase client (supabase.ts)
│   │   ├── screens/            # Core Screen Registry
│   │   │   ├── AuthScreen.tsx       # Registration & login form
│   │   │   ├── ChildLockScreen.tsx  # Non-dismissible lock & photo proof trigger
│   │   │   ├── ParentDashboard.tsx  # Guardian dashboard, approvals & device status
│   │   │   └── RoleScreen.tsx       # Role selector & 6-digit PIN circle pairing
│   │   ├── services/           # Supabase API services (choreService, authService, etc.)
│   │   ├── theme/              # Central design tokens (Colors, Typography, Spacing)
│   │   └── types/              # TypeScript types (index.ts)
│   ├── App.tsx                 # Root application entry & preview navigator
│   ├── app.json                # Expo configuration and native plugins
│   └── package.json
└── server/                     # Backend microservices (if applicable)
```

---

## 5. Recommended 4-Step Feature Workflow

Follow this loop for building features smoothly:

```text
[Step 1: Plan]       --> Type "/plan [describe feature]" to agree on the approach.
[Step 2: Build]      --> Instruct the agent to build the service and screens.
[Step 3: Verify]     --> Instruct the agent to run "npx tsc --noEmit" to check for type errors.
[Step 4: Test]       --> Test on your local emulator or device ("npx expo start").
```

---

## 5. Emergency / Sanity Check Commands
If anything feels out of sync or broken, run these prompts:

1. *"Run typecheck to see if any TypeScript types are broken."*  
   (`cd mobile && npx tsc --noEmit`)
2. *"Run expo-doctor to diagnose any dependency or configuration mismatches."*  
   (`cd mobile && npx expo-doctor`)
3. *"Check git status to show what files were modified."*

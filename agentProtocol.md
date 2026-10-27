# Agent Protocol & Activation Guide

> **Quick Reference for Developer:** This protocol explains how to activate, direct, and collaborate with AI agents in this project. Whenever you start a new coding session or forget how to trigger specific agent modes, refer to this guide.

---

## 1. How the Agent Operates (Core Concept)

* **No Boot Command Needed:** You do not need to run `python`, start a server, or type `/agent` to activate the AI.
* **Always Active:** Any message sent in this chat window is directly processed by the Antigravity agent.
* **Automatic Context Loading:** The agent automatically inspects your repository and silently reads:
  * Master rules: `.agents/instructions.md`
  * Expo guidelines: `mobile/AGENTS.md`
  * Database schema: `database/schema.sql`

---

## 2. Quick-Trigger Cheatsheet

### A. General Development (Everyday Tasks)
Just use plain English. Always be specific about **which file** or **which screen** you want to work on:

| Action | Example Prompt |
| :--- | :--- |
| **Build a Screen** | *"Implement the pairing screen in `src/screens/PairingScreen.tsx` using our design tokens."* |
| **Create a Service** | *"Write a function in `src/services/choreService.ts` to fetch pending chores for a child."* |
| **Fix an Error** | *"I'm getting this error in the terminal: `[paste error]`. Please diagnose and fix it."* |
| **Refactor / Style** | *"Update `Button.tsx` to support primary and secondary variant styles."* |

---

### B. Slash Commands (`/`) for Special Modes
Type `/` at the beginning of your message in the chat input to activate special modes:

* **/plan**  
  * **When to use:** Before building a complex feature.  
  * **What it does:** Forces the agent to create a clear step-by-step blueprint and ask for your approval *before* editing any code.
* **/goal**  
  * **When to use:** For large, multi-step tasks.  
  * **What it does:** Tells the agent to work autonomously without stopping until the objective is 100% complete.
* **/teamwork**  
  * **When to use:** When you have a massive task that benefits from multiple agents working together.
* **/compact**  
  * **When to use:** When the chat conversation gets very long.  
  * **What it does:** Summarizes earlier steps to clear up context memory.
* **/browser**  
  * **When to use:** When you need the agent to browse official live documentation.

---

### C. Context Mentions (`@`)
Type `@` in the chat input box to attach specific context directly to your message:
* `@file` or `@folder` — e.g., `@schema.sql`, `@AuthScreen.tsx`, `@mobile/src/services/`
* This guarantees the agent focuses on the exact files you care about.

---

### D. Triggering Multiple Agents / Subagents
You can run background subagents concurrently by asking for them in chat:

* **Research Agent:**  
  > *"Spawn a research subagent to check how Android's `SYSTEM_ALERT_WINDOW` works in Expo SDK 51 development builds."*
* **Verification / QA Agent:**  
  > *"Launch a subagent to run `npx tsc --noEmit` and review all recent file edits for missing imports."*
* **Parallel Work:**  
  > *"Spawn one subagent to work on the Supabase SQL policies while you build the UI components in `src/components/`."*

---

## 3. Recommended 4-Step Feature Workflow

Follow this loop for building features smoothly:

```text
[Step 1: Plan]       --> Type "/plan [describe feature]" to agree on the approach.
[Step 2: Build]      --> Instruct the agent to build the service and screens.
[Step 3: Verify]     --> Instruct the agent to run "npx tsc --noEmit" to check for type errors.
[Step 4: Test]       --> Test on your local emulator or device ("npx expo start").
```

---

## 4. Emergency / Sanity Check Commands
If anything feels out of sync, tell the agent:

1. *"Run typecheck to see if any TypeScript types are broken."*  
   (`cd mobile && npx tsc --noEmit`)
2. *"Run expo-doctor to diagnose any dependency or configuration mismatches."*  
   (`cd mobile && npx expo-doctor`)
3. *"Check git status to show what files were modified."*

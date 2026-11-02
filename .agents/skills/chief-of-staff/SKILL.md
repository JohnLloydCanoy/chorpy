---
name: chief-of-staff
description: >-
  Use this skill to orchestrate multi-agent development cycles, prioritize engineering tasks,
  coordinate subagents (Researcher, Implementer, QA), track daily milestone progress, and ensure
  strict adherence to project guardrails and definition of done.
---

# Chief of Staff Skill

> **Role & Philosophy:** The Chief of Staff (CoS) operates as the project orchestrator and strategic coordinator. Rather than writing ad-hoc code directly, the CoS breaks down high-level user goals into structured phases, delegates tasks to specialized subagents or focused implementation steps, monitors execution quality, and ensures delivery against milestones.

---

## 1. When to Activate This Skill

Activate or invoke this skill when:
- Kicking off complex, multi-component features (e.g., full-stack flows spanning UI, database schemas, and background services).
- Orchestrating multi-agent teams using `/teamwork` or subagents (`Researcher`, `Implementer`, `QA`).
- Prioritizing daily sprints, resolving technical bottlenecks, or triaging scope.
- Enforcing verification gates and project guardrails before declaring tasks complete.

---

## 2. Core Operational Workflow

```
   [User Goal / Epic]
           │
           ▼
┌───────────────────────┐
│  1. Triage & Decompose│ ◄── Assess complexity, dependencies, and risks
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  2. Delegate & Direct │ ──► Researcher (API / Architecture fact-checks)
└──────────┬────────────┘ ──► Implementer (Focused feature coding)
           │
           ▼
┌───────────────────────┐
│  3. Gatekeep & Verify │ ◄── QA / Static Typecheck & Linting
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  4. Synthesize & Report│ ──► Structured update & next milestone to User
└───────────────────────┘
```

---

## 3. Delegation Matrix

When managing tasks, delegate or structure activities using this matrix:

| Agent / Phase | Primary Responsibilities | Hand-off Criteria |
| :--- | :--- | :--- |
| **Researcher** | • Fact-checks library APIs (Expo SDK docs, Supabase Realtime).<br>• Identifies architectural constraints and edge cases.<br>• Validates zero-hallucination assumptions. | Summary report with exact API signatures, URLs, or schema definitions. |
| **Implementer** | • Implements clean, typed code adhering to design tokens.<br>• Keeps logic isolated in `src/services/` and `src/hooks/`.<br>• Follows UI/UX standards (no placeholder slop, 48dp touch targets). | Modified files ready for linting and typechecking. |
| **Quality Assurance (QA)** | • Executes automated verification (`tsc --noEmit`, `expo lint`).<br>• Audits database RLS and security boundaries.<br>• Tests happy and edge paths (empty states, offline, loading). | Clean exit code `0` on all checks and passed verification gates. |

---

## 4. Execution Protocol & Checklist

### Phase 1: Planning & Scope Triage
- [ ] Read relevant documentation (`.agents/instructions.md`, `database/schema.sql`, and `mobile/AGENTS.md`).
- [ ] Determine if the task touches database schemas, UI screens, native modules, or services.
- [ ] Formulate a numbered execution plan before modifying code.

### Phase 2: Orchestration & Delegation
- [ ] Ensure implementers strictly respect brand design tokens (`src/theme/index.ts`).
- [ ] For Expo-specific dependencies, enforce `npx expo install <package>` (never raw `npm install`).
- [ ] Prevent direct edits to native directories (`android/` or `ios/`); require Expo config plugins instead.

### Phase 3: Gatekeeping & Verification
Before accepting work as complete, run the mandatory verification gate:
1. **TypeScript Typecheck:**
   ```bash
   cd mobile && npx tsc --noEmit
   ```
2. **Lint & Syntax Audit:**
   ```bash
   cd mobile && npx expo lint
   ```
3. **Database Security Check:**
   - Confirm all tables have Row Level Security (`alter table ... enable row level security;`).

### Phase 4: Executive Status Reporting
Deliver concise status updates using this format:
- **Completed:** What was built and verified.
- **Verification Evidence:** Proof of passing typecheck/lint.
- **Current Blockers / Decisions Needed:** Any open questions for the developer.
- **Next Immediate Action:** The next concrete step in the roadmap.

---

## 5. Escalation Rules

- **Never bypass access controls or security:** If an RLS policy or permission boundary is blocking progress, report the root cause and propose a compliant resolution.
- **Preserve existing code:** Never delete existing functional code or comments without explicit instructions.
- **Scope creep prevention:** If a task requires changes beyond the current milestone, log it as a follow-up and keep the current deliverable focused.

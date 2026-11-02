# Universal Agent Constitution & Global Guardrails

> **Target Audience:** All AI agents, subagents, and human contributors operating within this repository.  
> **Status:** Mandatory & Non-Negotiable.  
> **Precedence:** Highest authority across all prompt contexts, subagent workflows, and automation scripts.

---

## Preamble

This Constitution establishes the foundational operational rules for any autonomous or semi-autonomous AI agent operating in the **Chorpy** codebase. All interactions, code generations, file modifications, and architecture designs must adhere strictly to the directives below. If a lower-level instruction conflicts with these directives, this Constitution supersedes it.

---

## Core Directives

### Directive 1: Zero-Assumption & Verification First
1. **Never Assume — Always Inspect:** Before generating code, proposing modifications, or answering structural questions, inspect the real repository state:
   - Read schema definitions in `database/schema.sql`.
   - Inspect active dependencies in `mobile/package.json`.
   - Verify directory paths against the project structure.
2. **Read Before Writing:** Always read target files and their immediate dependencies before modifying them.
3. **Environment Grounding:** Ground all technical decisions in the real project context:
   - Framework: React Native with Expo (SDK 58).
   - Language: TypeScript with strict mode.
   - Backend: Supabase Cloud (PostgreSQL, Realtime WebSockets, Storage).

---

### Directive 2: Anti-Hallucination & Safe Dependency Management
1. **No Phantom Packages:** Never invent, assume, or import npm packages, third-party libraries, or native modules that are not declared in `mobile/package.json`.
2. **Safe Installation Protocol:** When new dependencies are genuinely required:
   - ALWAYS install via `npx expo install <package-name>` inside the `mobile/` directory.
   - NEVER use raw `npm install`, `yarn add`, or `pnpm add` for Expo-managed modules.
   - Check compatibility with the installed Expo SDK version.
3. **No Hallucinated APIs:** Do not call deprecated, obsolete, or imaginary APIs. Verify Expo SDK 58 and React Native 0.88 APIs via project conventions or live documentation.

---

### Directive 3: Non-Destructive Editing & Preservation
1. **Surgical Precision:** Favor precise, targeted edits over indiscriminate full-file overwrites.
2. **Preserve Context & Documentation:** Never delete, strip, or alter:
   - Working functional logic unrelated to the user's explicit request.
   - Architectural docstrings, type definitions, or inline explanatory comments.
   - Existing guardrails, linter exceptions, or configuration flags.
3. **Refactoring Discipline:** Do not rewrite adjacent code or reformat unrelated files "for style" unless specifically tasked with refactoring.

---

### Directive 4: Zero Hardcoded Secrets & Credential Isolation
1. **No Plaintext Secrets:** Absolutely no API keys, private passwords, tokens, or credentials may be hardcoded into source code, comments, or test fixtures.
2. **Supabase Key Classification:**
   - **Allowed in client:** `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (public, subject to RLS).
   - **STRICTLY FORBIDDEN in client/repo:** `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS; server-only, never commit).
3. **Environment Hygiene:** Never commit `.env`, `.env.local`, or credential dumps. Ensure all secrets are resolved via environment variables or secure storage mechanisms (`expo-secure-store`).

---

### Directive 5: Fail-Closed Security Boundaries
1. **Never Bypass Access Controls:** Never weaken, bypass, or mock out security controls, permission checks, authentication guards, or Row Level Security (RLS) policies to make a test pass or a feature work.
2. **Fail-Closed Principle:** When a permission check, database query, or security policy fails:
   - Deny access by default.
   - Log the diagnostic root cause cleanly without exposing sensitive payload data.
   - Halt execution and escalate the issue to the developer rather than silently continuing.
3. **Zero Client-Trust:** Never rely solely on client-side state or UI flags for security enforcement. All authorization rules must be backed by database RLS or cryptographic proof.

---

### Directive 6: Continuous Native Generation (CNG) Discipline
1. **No Direct Native Edits:** Never manually edit, create, or commit files within the `android/` or `ios/` directories.
2. **Config Plugins as Single Source of Truth:** All native capabilities, permissions, and manifest configurations must be defined in `mobile/app.json` using Expo Config Plugins:
   - Android Permissions: `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE`, `CAMERA`.
   - Intent filters, notification channels, and hardware overlays.
3. **Reproducibility:** Native folders must remain purely ephemeral and fully regenerable via `npx expo prebuild --clean`.

---

### Directive 7: Progressive Disclosure & Modular Governance
1. **Domain Isolation:** Agents must consume only the context necessary for their immediate task:
   - UI styling and layout $\rightarrow$ load `.agents/rules/ui.md` & `.agents/skills/design/SKILL.md`.
   - Interaction states and accessibility $\rightarrow$ load `.agents/rules/ux.md`.
   - Security, authentication, and RLS $\rightarrow$ load `.agents/rules/security.md`.
   - Verification and release readiness $\rightarrow$ load `.agents/rules/testing-quality.md`.
2. **Context Economy:** Avoid polluting the prompt context with irrelevant skills or voluminous logs.

---

### Directive 8: Universal Definition of Done (DoD)
No coding task, subagent assignment, or PR is complete until it satisfies the 4-Tier Verification Gate:
1. **Type Safety:** `cd mobile && npx tsc --noEmit` exits with 0 errors.
2. **Standards & Lag Audit:** `node .agents/skills/chief-of-staff/scripts/audit-rn-standards.js` exits with 0 errors.
3. **Expo Lint:** `cd mobile && npx expo lint` exits cleanly.
4. **Security Verification:** All new or updated database tables possess active RLS policies.

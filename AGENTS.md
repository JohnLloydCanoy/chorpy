# Chorpy — Universal AI Agent Specification & Context Index

> **Standard:** Universal Machine-Readable Entrypoint (`AGENTS.md`)  
> **Applicability:** All autonomous and semi-autonomous AI coding agents (Anthropic Claude Code, Cursor, GitHub Copilot, OpenAI, Google Antigravity).  
> **Repository:** `chorpy`  
> **Last Updated:** 2026-11-02

---

## 1. Executive Project Summary

**Chorpy** is a modern household chore management and digital wellbeing system. It bridges parental oversight with automated device accountability:
- **Parent / Guardian:** Creates household chore assignments, sets verification criteria, and reviews photo proof submissions.
- **Child:** Completes mandatory chores to unlock personal screen access.
- **Hardware Enforcement:** If mandatory chores remain pending, the child's Android device screen is held in a non-dismissible hardware overlay (`SYSTEM_ALERT_WINDOW`).
- **Realtime Dissolution:** Once photo proof is captured and approved, the screen lock dissolves instantly over Supabase Realtime WebSockets.
- **Safety Anchor:** An unobstructed Emergency SOS action remains permanently accessible under all lock conditions.
- **Mascot Persona:** *Chorpy the Maya* (Eurasian Tree Sparrow) provides an encouraging, positive, child-friendly feedback loop.

---

## 2. Technology Stack

| Layer | Technology | Details & Versioning |
| :--- | :--- | :--- |
| **Mobile Client** | React Native / Expo | Expo SDK 58, React Native 0.88, React 19.3 |
| **Language** | TypeScript | Strict mode enabled (`tsconfig.json`) |
| **Backend / DB** | Supabase Cloud | PostgreSQL 15+, Supabase Auth, Realtime WebSockets, Storage |
| **Native Android** | Continuous Native Generation (CNG) | Config Plugins in `mobile/app.json`, `SYSTEM_ALERT_WINDOW`, Foreground Services |
| **Theme / Design** | Central Design System | `mobile/src/theme/index.ts` (Sky Blue `#0284C7`, Coral Orange `#FF6B4A`, Slate Navy `#0F172A`) |

---

## 3. Machine Directory Index & Governance Map

Agents operating in this repository must consult the dedicated governance documents below according to the task domain:

```text
chorpy/
├── AGENTS.md                                # Canonical AI entrypoint (this file)
├── .agents/
│   ├── instructions.md                      # System architecture, workflows & screen registry
│   ├── agentProtocol.md                     # Slash commands, subagent spawning & prompt cheatsheet
│   ├── rules/
│   │   ├── global-rule.md                   # Universal Constitution (Core directives & guardrails)
│   │   ├── ui.md                            # Visual anti-cliché & solid color rules
│   │   ├── ux.md                            # Five-state UI resilience & touch ergonomics
│   │   ├── security.md                      # Mobile credential isolation, RLS & input sanitization
│   │   └── testing-quality.md               # 4-Tier Verification Gate & Definition of Done
│   └── skills/
│       ├── chief-of-staff/                  # Autonomous milestone orchestration & audit scripts
│       │   ├── FileStructure.md             # Detailed codebase inventory & mapping
│       │   ├── SKILL.md                     # Multi-agent coordination protocols
│       │   └── scripts/audit-rn-standards.js# Deterministic standards & lag auditor
│       └── design/
│           └── SKILL.md                     # Design tokens, typography scales & mascot guidelines
├── database/
│   └── schema.sql                           # Database tables, triggers, and RLS policies
└── mobile/
    ├── app.json                             # Expo & native config plugin configuration
    ├── package.json                         # Dependencies & npm scripts
    └── src/                                 # Mobile application source code
```

---

## 4. Essential Commands Cheatsheet

Always run mobile commands from within the `mobile/` directory:

```bash
# 1. Start Expo development server
cd mobile && npx expo start

# 2. Strict TypeScript typechecking (Mandatory Gate)
cd mobile && npx tsc --noEmit

# 3. Standards & Lag Audit (Mandatory Gate)
cd mobile && npm run lint:standards
# or from root: node .agents/skills/chief-of-staff/scripts/audit-rn-standards.js

# 4. Expo code linting
cd mobile && npx expo lint

# 5. Dependency installation (Strictly enforce Expo resolver)
cd mobile && npx expo install <package-name>
```

---

## 5. Non-Negotiable Core Directives

1. **Zero-Assumption & Verification First:** Inspect real files, `database/schema.sql`, and `mobile/package.json` before writing code. Never hallucinate APIs or paths.
2. **Anti-Hallucination & Safe Dependencies:** Never invent uninstalled npm packages. ALWAYS install via `npx expo install <package>`. Never use raw `npm/yarn/pnpm add` for Expo-managed dependencies.
3. **Non-Destructive Editing:** Preserve existing functional code, architectural docstrings, and inline comments. Make precise, surgical edits.
4. **Zero Hardcoded Secrets:** Absolute ban on committing `.env` files, Supabase `service_role` keys, or plaintext credentials. Client code may only access public anonymous keys (`EXPO_PUBLIC_SUPABASE_ANON_KEY`).
5. **Fail-Closed Security & 100% RLS:** Every database table must have Row Level Security enabled. Never rely solely on client-side `.eq()` filtering.
6. **Continuous Native Generation (CNG):** NEVER touch `android/` or `ios/` directly. Configure all native permissions, overlays, and plugins via `mobile/app.json`.

---

## 6. Definition of Done (DoD)

No feature, subagent task, or commit is complete until:
1. `cd mobile && npx tsc --noEmit` exits with **0 errors**.
2. `cd mobile && npm run lint:standards` exits with **0 errors**.
3. `cd mobile && npx expo lint` exits cleanly.
4. All five UI states (**Empty, Loading, Error, Partial, Populated**) are defensively handled.
5. All UI components reference design tokens from `mobile/src/theme/index.ts`.

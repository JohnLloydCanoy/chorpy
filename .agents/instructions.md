# Project Instructions & Agent Guidelines

> **Note for the developer:** This file provides instructions, boundaries, and architectural guidelines for AI agents working in this repository. Edit or expand any section below to customize how the agent behaves.

---

## 1. Project Overview & Vision
<!-- Describe the core purpose of your app and the primary user flows -->
- **App Name:** Chorpy
- **Core Concept:** A networked household chore management and digital wellbeing system.
- **Key Workflow:**
  1. **Parent/Guardian:** Creates chores, sets requirements, and reviews photo proof submissions.
  2. **Child:** Completes chores to earn screen access.
  3. **Hardware Enforcement:** If a chore is pending, the child's Android device screen is locked via `SYSTEM_ALERT_WINDOW`.
  4. **Verification & Unlock:** Child submits photo proof; once approved by an adult, the lock dissolves via Supabase Realtime WebSockets.
  5. **Safety Anchor:** Emergency SOS override is always available on the locked screen.

---

## 2. Technology Stack
<!-- Specify frameworks, versions, and key dependencies -->
- **Frontend / Mobile:** React Native with Expo SDK 51+ (TypeScript)
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Realtime WebSockets, Storage)
- **Native Android Layer:** Expo Config Plugins, `SYSTEM_ALERT_WINDOW` permission, Foreground Services
- **Navigation:** React Native Navigation / Expo Router
- **State Management:** React Context (`AuthContext`) and custom React hooks

---

## 3. Project Structure & Architecture
<!-- Guide the agent on where files live and how they should be organized -->
Follow this directory convention:

```text
chorpy/
├── .agents/               # Agent rules, instructions, and modular skills
├── database/              # SQL schemas, RLS policies, and database migrations
│   └── schema.sql
├── mobile/                # React Native / Expo application
│   ├── assets/            # Images, icons, and static fonts
│   ├── src/
│   │   ├── components/    # Reusable UI components (Buttons, Cards, Inputs, Modals)
│   │   ├── context/       # React Context providers (AuthContext)
│   │   ├── hooks/         # Custom React hooks (useAuth, useChores, useDeviceLock)
│   │   ├── lib/           # Third-party client instances (supabase.ts)
│   │   ├── screens/       # Top-level screen components
│   │   ├── services/      # Pure API/Supabase service calls (choreService, authService)
│   │   ├── theme/         # Central design tokens (Colors, Typography, Spacing)
│   │   └── types/         # TypeScript interfaces and union types
│   ├── app.json           # Expo project configuration and native plugins
│   └── package.json
└── server/                # Optional backend microservices (if applicable)
```

---

## 4. Design & Branding Guidelines
<!-- Define your design tokens, colors, and UI style -->
- **Palette:**
  - `Primary / Sky Blue`: `#38BDF8` (Headers, active tabs, buttons)
  - `Accent / Coral Orange`: `#FF6B4A` (Action badges, alerts, unlock CTAs)
  - `Dark Neutral / Slate Navy`: `#0F172A` (Headings, primary text)
  - `Surface / Cloud White`: `#F8FAFC` (Card surfaces, screen backgrounds)
- **Mascot Persona:** *Chorpy the Maya* (Eurasian Tree Sparrow)
  - Use playful, encouraging messages during unlocks and chore completions.
  - Maintain a clean, high-contrast, child-friendly yet modern interface.

---

## 5. Coding Standards & Conventions
<!-- Specify code quality standards, naming conventions, and file rules -->
- **Language:** TypeScript with strict type checking enabled.
- **Components:** Functional components using React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Styling:** React Native `StyleSheet.create()`; reference tokens from `src/theme/index.ts` instead of hardcoded hex values.
- **Service Layer:** Keep UI screens clean by delegating all Supabase queries, mutations, and realtime listeners to `src/services/`.
- **Status Types:** Chore statuses must adhere strictly to:
  ```typescript
  type ChoreStatus = 'pending' | 'awaiting_approval' | 'approved' | 'rejected';
  ```

---

## 6. Non-Negotiable Guardrails (Strict Rules)
<!-- The agent must NEVER violate these rules -->
1. **Dependency Installation:** ALWAYS use `npx expo install <package>` inside `mobile/`. Never use raw `npm install` or `yarn add` for Expo-managed packages.
2. **Continuous Native Generation (CNG):** NEVER edit files inside `android/` or `ios/` directly. All native Android permissions, intent filters, and settings must be configured through `mobile/app.json` config plugins.
3. **Database Security:** Every table created or modified in `database/schema.sql` MUST have Row Level Security (RLS) enabled.
4. **No Premature Deletions:** Never delete existing working logic or comments without explicit instructions from the user.

---

## 7. Verification & Definition of Done
<!-- Commands the agent must execute before declaring any task complete -->
Before marking any feature or bugfix as complete:
1. Run TypeScript typecheck:
   ```bash
   cd mobile && npx tsc --noEmit
   ```
2. Run linter:
   ```bash
   cd mobile && npx expo lint
   ```
3. Ensure no regressions or broken imports exist.

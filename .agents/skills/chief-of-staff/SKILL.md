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
│  3. Gatekeep & Verify │ ◄── QA / Static Typecheck, Standards Audit & Linting
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
| **Researcher** | • Fact-checks library APIs (Expo SDK docs, Supabase Realtime).<br>• Investigates native UI/JS thread performance patterns (Reanimated worklets, Gesture Handler).<br>• Validates Expo CNG config plugin requirements, native permissions, and asset preloading.<br>• Identifies architectural constraints and edge cases with zero-hallucination assumptions. | Summary report with exact API signatures, documentation URLs, and architecture decisions. |
| **Implementer** | • Implements clean, typed code adhering strictly to design tokens (`src/theme/`).<br>• Keeps modules under 200–250 lines with typed interfaces and clean prop destructuring.<br>• Prevents UI thread lag: mandates `react-native-gesture-handler` (zero `PanResponder`), hoists styles (no inline `style={{ ... }}` in `.map`), uses pure renders (`React.memo`, `useCallback`), and implements list virtualization (`FlatList`/`FlashList`).<br>• Enforces Continuous Native Generation (CNG): zero direct edits to `android/` or `ios/`; uses `npx expo install`.<br>• Isolates business logic into `src/services/` and `src/hooks/`; wraps fatal flows with `ErrorBoundary`. | Modified files ready for typechecking, standards audit, and linting. |
| **Quality Assurance (QA)** | • Executes automated verification (`tsc --noEmit`, `expo lint`).<br>• Executes automated Expo/RN standards audit (`node .agents/skills/chief-of-staff/scripts/audit-rn-standards.js`).<br>• Audits Continuous Native Generation (CNG) compliance (no committed/unmanaged native directories).<br>• Audits database RLS, security boundaries, and touch target accessibility (min 48dp).<br>• Verifies release build profiling readiness (`--no-dev`) and handles edge cases (empty states, offline, loading). | Clean exit code `0` on all checks and passed verification gates. |

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
- [ ] Guarantee 60/120 FPS performance by keeping the JS thread unblocked and using native gesture handlers.

### Phase 3: Gatekeeping & Verification
Before accepting work as complete, run the mandatory verification gate:
1. **TypeScript Typecheck:**
   ```bash
   cd mobile && npx tsc --noEmit
   ```
2. **Expo & React Native Standards & Lag Audit:**
   ```bash
   node .agents/skills/chief-of-staff/scripts/audit-rn-standards.js
   # or from mobile directory:
   cd mobile && npm run lint:standards
   ```
3. **Lint & Syntax Audit:**
   ```bash
   cd mobile && npx expo lint
   ```
4. **Database Security Check:**
   - Confirm all tables have Row Level Security (`alter table ... enable row level security;`).

### Phase 4: Executive Status Reporting
Deliver concise status updates using this format:
- **Completed:** What was built and verified.
- **Verification Evidence:** Proof of passing typecheck, standards audit, and lint.
- **Current Blockers / Decisions Needed:** Any open questions for the developer.
- **Next Immediate Action:** The next concrete step in the roadmap.

---

## 5. Escalation Rules

- **Never bypass access controls or security:** If an RLS policy or permission boundary is blocking progress, report the root cause and propose a compliant resolution.
- **Preserve existing code:** Never delete existing functional code or comments without explicit instructions.
- **Scope creep prevention:** If a task requires changes beyond the current milestone, log it as a follow-up and keep the current deliverable focused.

---

## 6. Expo & React Native Engineering Guardrails (Lag Prevention & Clean Code)

The Chief of Staff enforces strict engineering guardrails synthesized from authoritative industry standards:
- **Expo Guides Overview:** [https://docs.expo.dev/guides/overview/](https://docs.expo.dev/guides/overview/)
- **React Native Code Practices (Neha Sharma):** [https://dev.to/hellonehha/react-native-code-practices-6dl](https://dev.to/hellonehha/react-native-code-practices-6dl)
- **Reducing Lag in Expo Apps:** [https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps](https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps)

### 6.1 Continuous Native Generation (CNG) & Ecosystem Architecture
1. **Config Plugins Over Manual Native Edits:**
   - Never manually edit files inside `android/` or `ios/`.
   - All native permissions (Camera, Foreground Services, Notifications, Device Admin), splash screens, package identifiers, and build variants must be configured in `app.json` or through custom Expo config plugins.
   - Native folders are ephemeral artifacts generated on-demand via `npx expo prebuild` and must remain in `.gitignore`.
2. **Dependency Hygiene (`npx expo install`):**
   - Always install Expo and React Native packages via `npx expo install <package>`. This guarantees version alignment with the tested Expo SDK matrix and avoids native runtime crashes.
3. **Asset Preloading & Splash Screen Management:**
   - Keep the native splash screen visible using `expo-splash-screen` until all critical fonts, authentication credentials, and theme tokens are loaded via `expo-asset` / `expo-font`.
   - Prevent layout shifts and blank/white screen flickers during initial mount.
4. **Native Module Priority:**
   - Prefer official Expo SDK modules and maintained TurboModules over unmaintained or legacy third-party native libraries.

### 6.2 React Native Code Cleanliness & Maintainability
1. **Modular Architecture & Folder Structure:**
   - Structure code into clear domains:
     - `src/components/`: Reusable, atomic presentational components.
     - `src/screens/`: Screen-level layouts coordinating business hooks.
     - `src/services/`: Isolated network requests, Supabase clients, and device APIs.
     - `src/hooks/`: Reusable state logic and reactive data subscriptions.
     - `src/context/`: Scoped context providers for app-wide state.
     - `src/theme/`: Single source of truth for colors, typography, spacing, and shadows.
     - `src/types/`: Central TypeScript interfaces and data contracts.
2. **Typed Interfaces & Prop Destructuring:**
   - Explicitly type all component props using TypeScript interfaces (`interface Props { ... }`).
   - Cleanly destructure props at function headers; never pass untyped `any` or ambiguous object bags.
3. **Sub-200 to 250 Line Modules:**
   - Maintain small, cohesive modules. If a screen or component exceeds 250 lines, decompose it into smaller subcomponents, extract business logic into custom hooks, or extract data operations into service modules.
4. **Zero Production `console.log`:**
   - Remove `console.log` and `console.debug` statements before committing. Synchronous bridge logging degrades JS thread performance and leaks sensitive debug payloads.
   - In development, use `__DEV__` conditionals or a dedicated logger utility.
5. **Runtime Crash Protection (`ErrorBoundary`):**
   - Wrap high-level screens and navigation stacks in React `ErrorBoundary` components to catch unexpected rendering faults without terminating the entire application process.

### 6.3 Thread Performance & Lag Elimination
1. **UI Thread vs. JS Thread Separation:**
   - React Native executes JavaScript logic on the JS thread and rendering/compositing on the native UI thread.
   - Long-running JavaScript computations or unmemoized renders saturate the JS thread, causing touch delays, choppy animations, and dropped frames (sub-60 FPS).
2. **Gesture Handler & Reanimated Worklets:**
   - **Strictly prohibit `PanResponder`:** `PanResponder` pipes every touch gesture over the bridge to the JS thread, creating lag.
   - Always use `react-native-gesture-handler` paired with `react-native-reanimated`.
   - Run animation and gesture calculations directly on the UI thread using Reanimated worklets (`'worklet';`) to achieve lag-free 60/120 FPS interactions even when the JS thread is busy.
3. **Render Referential Stability & Pure Renders:**
   - Prevent unnecessary component re-renders by wrapping heavy subcomponents in `React.memo`.
   - Use `useCallback` for event handler functions and `useMemo` for expensive derived calculations.
4. **Avoid Inline Style Objects in Loops:**
   - Never construct inline style objects (`style={{ ... }}`) inside `.map()` render loops or rapid render cycles.
   - Inline objects allocate new memory on every frame, causing garbage collection spikes. Hoist static styles using `StyleSheet.create(...)` outside the component.
5. **Context Splitting to Prevent Tree Re-renders:**
   - Avoid monolithic contexts that combine frequently changing state with static configuration.
   - Split contexts into distinct, granular providers (e.g. `AuthContext`, `ChoreContext`, `DeviceLockContext`) so that updates to one slice do not re-render unaffected component trees.
6. **List Virtualization (`FlatList` / `FlashList`):**
   - Never render dynamic or unbounded datasets using array `.map()`. Unbounded `.map()` creates and mounts all views simultaneously, causing memory bloat and scroll stutter.
   - Use virtualized list containers (`FlatList` or `@shopify/flash-list`) with `keyExtractor` and `getItemLayout` for fixed-height items to enable instantaneous scroll calculation and windowed rendering.
7. **Release Build Profiling:**
   - Always test and profile animation performance in release mode (`expo run:android --variant release` or `expo start --no-dev`) with the Hermes JavaScript engine enabled. Development mode adds debug overhead that obscures real-world frame rates.

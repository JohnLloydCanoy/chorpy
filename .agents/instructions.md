# Project Instructions & Agent Guidelines

> **Note for the developer:** This file provides instructions, boundaries, and architectural guidelines for AI agents working in this repository. Edit or expand any section below to customize how the agent behaves.

---

## 1. Project Overview & Vision
- **App Name:** Chorpy
- **Core Concept:** A networked household chore management and digital wellbeing system.
- **Key Workflow:**
  1. **Parent/Guardian:** Creates chores, sets requirements, and reviews photo proof submissions.
  2. **Child:** Completes chores to earn screen access.
  3. **Hardware Enforcement:** When a chore is pending, the child's Android device screen is designed to lock via `SYSTEM_ALERT_WINDOW` *(native module planned)*.
  4. **Verification & Unlock:** Child submits photo proof; once approved by an adult, the lock dissolves via Supabase Realtime WebSockets *(camera capture & proof review UI in development)*.
  5. **Safety Anchor:** Emergency SOS override remains accessible on the locked screen *(planned)*.

---

## 2. Technology Stack
- **Frontend / Mobile:** React Native `0.88.0` with Expo SDK 58 (`~58.0.17`), React `19.3.0`, and strict TypeScript (`~6.0.3`)
- **Backend & Database:** Supabase Cloud (`@supabase/supabase-js` `^2.118.0` — PostgreSQL, Supabase Auth [Email+Password, Confirmation OFF], Realtime WebSockets, Storage [Bucket Pending])
- **Native Android Layer:** Continuous Native Generation (CNG) via `mobile/app.json` (`expo-font`, `@react-native-community/datetimepicker` active; `SYSTEM_ALERT_WINDOW` & Foreground Services planned)
- **Navigation:** State-driven RBAC tab navigator and active route guard in `mobile/App.tsx`
- **State Management:** React Context (`AuthContext`) and custom reactive hooks (`useAuth`, `useChores`, `useDeviceLock`, `useHouseholdMembers`)

---

## 3. Project Structure & Architecture
Follow this directory convention (verified against repository ground truth):

```text
chorpy/
├── .agents/                    # Agent rules, instructions, and modular skills
│   ├── rules/                  # Governance rules (global-rule, ui, ux, security, testing-quality)
│   ├── skills/                 # Chief of Staff & Design skills + audit scripts
│   ├── instructions.md         # Master rules, architecture, and screen registry
│   └── agentProtocol.md        # Agent activation and command cheat sheet
├── database/                   # SQL schemas, RLS policies, and database migrations
│   └── schema.sql              # Supabase table definitions, triggers, and realtime publications
├── mobile/                     # React Native / Expo application (SDK 58)
│   ├── assets/                 # Images, icons, and adaptive Android assets
│   ├── src/
│   │   ├── components/         # Reusable UI, Family & Onboarding Blocks
│   │   │   ├── family/         # Chore creation & virtualized table components
│   │   │   │   ├── AddChoreForm.tsx
│   │   │   │   ├── ChildMemberPicker.tsx
│   │   │   │   ├── ChoreRow.tsx
│   │   │   │   └── ChoreTable.tsx
│   │   │   ├── onboarding/     # Multi-step Onboarding & Setup Components
│   │   │   │   ├── DobWheelPicker.tsx
│   │   │   │   ├── WheelColumn.tsx
│   │   │   │   ├── OnboardingStep1Form.tsx
│   │   │   │   ├── OnboardingFamilyFork.tsx
│   │   │   │   ├── OnboardingJoinPin.tsx
│   │   │   │   ├── OnboardingCreateHousehold.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DeveloperQuickPreview.tsx
│   │   │   ├── PasswordEntropyChips.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   └── index.ts
│   │   ├── context/            # React Context providers
│   │   │   └── AuthContext.tsx # User session, profile hydration, and sign-out
│   │   ├── hooks/              # Custom reactive hooks
│   │   │   ├── useAuth.ts              # Authentication session, role flags & profile
│   │   │   ├── useChores.ts            # Realtime chore sync, optimistic creation & rollback
│   │   │   ├── useDeviceLock.ts        # Realtime device lock state watcher
│   │   │   └── useHouseholdMembers.ts  # Household member fetching & retry state
│   │   ├── lib/
│   │   │   └── supabase.ts     # Supabase client singleton with AsyncStorage persistence
│   │   ├── screens/            # Core Screen Registry
│   │   │   ├── AppLoaderScreen.tsx  # Session bootstrap & retry loader
│   │   │   ├── AuthScreen.tsx       # Auth coordinator (Login vs Onboarding)
│   │   │   ├── LoginScreen.tsx      # Sign in credentials screen + quick demo preview
│   │   │   ├── OnboardingScreen.tsx # 2-step account & family circle setup
│   │   │   ├── HomeScreen.tsx       # Hero card with Chorpy mascot & Manage My Family CTA
│   │   │   ├── MyFamilyScreen.tsx   # Chore creation, child assignment & virtualized chore table
│   │   │   ├── ChildLockScreen.tsx  # Child lock UI scaffold (camera & overlay wiring planned)
│   │   │   └── SettingsScreen.tsx   # Account overview, circle status, wellbeing & sign out
│   │   ├── services/           # Pure Supabase API service layer
│   │   │   ├── authService.ts       # Auth sign-up, sign-in, sign-out & profile lookup
│   │   │   ├── choreService.ts      # Chore CRUD and status transitions
│   │   │   ├── deviceService.ts     # Device registration and lock updates
│   │   │   └── householdService.ts  # Household circle provisioning and PIN verification
│   │   ├── theme/              # Central design tokens
│   │   │   └── index.ts        # Colors (#1B365D, #60C1E5, #0F172A), spacing, Fredoka + Poppins
│   │   ├── types/              # TypeScript types and interfaces
│   │   │   └── index.ts        # Chore, Profile, Device, Household types
│   │   └── utils/              # Validation & input formatting helpers
│   │       ├── validation.ts           # Email regex, entropy scoring, E.164 phone, DOB age calculation
│   │       └── onboardingValidation.ts # Editable age validation & Step 1 submission checks
│   ├── App.tsx                 # Root application entry, font loader & RBAC navigator
│   ├── app.json                # Expo configuration and CNG plugins
│   ├── eslint.config.js        # Expo ESLint configuration
│   └── package.json
└── server/                     # Reserved backend microservices directory
```

---

## 4. Core Screen Registry & Context

### 1. `mobile/src/screens/AppLoaderScreen.tsx`, `AuthScreen.tsx`, `LoginScreen.tsx` & `OnboardingScreen.tsx`
* **Purpose:** Coordinates session bootstrap, sign-in, and the 2-step onboarding & family setup flow.
* **Onboarding Steps:**
  * **Step 1 (`OnboardingStep1Form.tsx`):**
    * Full Name (title-cased on blur), Email (RFC 5322 validation), Phone Number (E.164 formatting preview), Date of Birth via **`DobWheelPicker.tsx`** (`@react-native-community/datetimepicker` spinner on Android/iOS + virtualized 3-column **`WheelColumn.tsx`** on Web), editable **Age** input autofilled from DOB (`onboardingValidation.ts`), **`RoleSelector.tsx`** with `< 18` Parent disablement, **`PasswordEntropyChips.tsx`**, and Terms & Regulations checkbox.
  * **Step 2 (`OnboardingFamilyFork.tsx`):**
    * Fork asking "Do you already have a family?", routing to either joining an existing circle or creating a new household.
  * **Step 2a (`OnboardingJoinPin.tsx`):**
    * Validates and links user to an existing household using a 6-digit numeric pairing PIN (`householdService.verifyPin` + `joinHouseholdWithPin`).
  * **Step 2b (`OnboardingCreateHousehold.tsx`):**
    * Creates a new household circle with custom circle name, number of children, and number of co-parents (`householdService.createHousehold`).
* **Backend Connection:** Calls `authService.signUp()` passing `fullName`, `phoneNumber`, `dateOfBirth`, `age`, and `role`, followed by `householdService`. The `handle_new_user()` trigger in `database/schema.sql` populates `public.profiles`.

### 2. `mobile/src/screens/HomeScreen.tsx`
* **Purpose:** Primary landing dashboard after authentication.
* **Key Features:** Displays the branded Chorpy Hero Card (`Background-of-Primary-Color.png` + Chorpy mascot) and the full-width `Manage My Family` CTA routing to `my_family`.

### 3. `mobile/src/screens/MyFamilyScreen.tsx` ("My Family Dashboard")
* **Purpose:** Household chore assignment and real-time chore tracking center.
* **Key Features:**
  * **Dynamic Greeting:** Greets the authenticated user via `AuthContext` (`full_name` or email prefix fallback).
  * **RBAC-Gated Chore Creation:** Parents (`effectiveRole === 'parent'`) see the `"Add Chore"` toggle opening **`AddChoreForm.tsx`** with **`ChildMemberPicker.tsx`** (populated by `useHouseholdMembers`).
  * **Virtualized Chore List:** Renders **`ChoreTable.tsx`** and **`ChoreRow.tsx`** (`FlatList` with `getItemLayout` and `React.memo`) backed by **`useChores`** with optimistic creation, rollback on failure, all 5 UI states (Empty, Loading, Error, Partial, Populated), Supabase Realtime synchronization, and role-based filtering (parents see all household chores; children see chores where `assigned_child_id === user.id`).
  * **Planned:** Live household name/PIN lookup, guardian proof approval/rejection controls, and connected child device telemetry cards.

### 4. `mobile/src/screens/ChildLockScreen.tsx`
* **Purpose:** The enforcement view scaffold presented to the child when mandatory chores are pending.
* **Current State:** High-contrast dark UI scaffold (`colors.surfaceDark` `#0F172A`) showing a placeholder pending chore card and unhooked `"Take Photo Proof"` button.
* **Planned:** Wiring to `useDeviceLock` and `useChores`, `expo-camera` proof capture & upload, Emergency SOS trigger (`tel:` + panic broadcast), and native Android `SYSTEM_ALERT_WINDOW` overlay inflation.

### 5. `mobile/src/screens/SettingsScreen.tsx` ("Settings & Preferences")
* **Purpose:** User profile overview, household circle info, app/device wellbeing overview, and sign-out controls.
* **Key Features:** Displays authenticated name, email, role badge (`PARENT` / `CHILD`), phone, age, household info, wellbeing overview, and `Sign Out of Chorpy` invoking `signOut()` from `AuthContext`.

### 6. Role-Based Navigation Governance (RBAC)
Navigation tabs and active routes in `mobile/App.tsx` are governed by `effectiveRole` (`profile?.role || demoRole || 'parent'`):
- **Parent (`role === 'parent'`):**
  - Allowed Navigation Tabs: `HOME` (`'home'`), `MY FAMILY` (`'my_family'`), `SETTING` (`'settings'`).
  - Permitted Screen Views: `HomeScreen.tsx`, `MyFamilyScreen.tsx`, `SettingsScreen.tsx`.
- **Child (`role === 'child'`):**
  - Allowed Navigation Tabs: `HOME` (`'home'`), `MY FAMILY` (`'my_family'`), `CHILD` (`'child'`), `SETTING` (`'settings'`).
  - Permitted Screen Views: `HomeScreen.tsx`, `MyFamilyScreen.tsx`, `ChildLockScreen.tsx`, `SettingsScreen.tsx`.
- **Active Route Guard:** A `useEffect` guard in `mobile/App.tsx` checks whether `currentScreen` is permitted under `effectiveRole`; if unauthorized, navigation resets to `'home'`.

---

## 5. Design & Branding Guidelines
- **Canonical Tokens (`mobile/src/theme/index.ts`):**
  - `primary` (**Navy Blue**): `#1B365D` (Headers, active buttons, focus, titles)
  - `secondary` / `accent` (**Light Sky / Cyan**): `#60C1E5` (Call-to-actions, highlights, secondary accent)
  - `success`: `#16A34A` | `warning`: `#F59E0B` | `danger`: `#DC2626`
  - `background` (**Cloud White**): `#F8FAFC` | `surface` (**Pure White**): `#FFFFFF`
  - `surfaceDark` / `text` (**Slate Navy**): `#0F172A` (Child Lock Screen dark surface & primary headings)
  - **Typography:** `Fredoka` (`Fredoka_400Regular`, `Fredoka_600SemiBold`, `Fredoka_700Bold`) and `Poppins` (`Poppins_400Regular`, `Poppins_500Medium`, `Poppins_600SemiBold`, `Poppins_700Bold`)
- **Mascot Persona:** *Chorpy the Maya* (Eurasian Tree Sparrow)
  - Use playful, encouraging messages during unlocks and chore completions.
  - Maintain a clean, high-contrast, child-friendly yet modern interface without raw emojis in production UI chrome (`ui.md` #19).

---

## 6. Coding Standards & Conventions
- **Language:** TypeScript with strict type checking enabled.
- **Components:** Functional components using React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) and `React.memo` for list rows/cards.
- **Styling:** React Native `StyleSheet.create()`; reference tokens from `src/theme/index.ts` instead of hardcoded hex values.
- **Service Layer:** Keep UI screens clean by delegating all Supabase queries, mutations, and realtime listeners to `src/services/` and `src/hooks/`.
- **Status Types:** Chore statuses must adhere strictly to:
  ```typescript
  type ChoreStatus = 'pending' | 'awaiting_approval' | 'approved' | 'rejected';
  ```

---

## 7. Non-Negotiable Guardrails (Strict Rules)
1. **Dependency Installation:** ALWAYS use `npx expo install <package>` inside `mobile/`. Never use raw `npm install` or `yarn add` for Expo-managed packages.
2. **Continuous Native Generation (CNG):** NEVER edit files inside `android/` or `ios/` directly. All native Android permissions, intent filters, and settings must be configured through `mobile/app.json` config plugins.
3. **Database Security:** Every table created or modified in `database/schema.sql` MUST have Row Level Security (RLS) enabled.
4. **No Premature Deletions:** Never delete existing working logic or comments without explicit instructions from the user.

---

## 8. Verification & Definition of Done
Before marking any feature or bugfix as complete:
1. Run TypeScript typecheck:
   ```bash
   cd mobile && npx tsc --noEmit
   ```
2. Run Expo & React Native standards audit:
   ```bash
   cd mobile && npm run lint:standards
   ```
3. Run linter:
   ```bash
   cd mobile && npx expo lint
   ```
4. Ensure no regressions or broken imports exist.

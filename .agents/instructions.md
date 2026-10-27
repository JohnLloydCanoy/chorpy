# Project Instructions & Agent Guidelines

> **Note for the developer:** This file provides instructions, boundaries, and architectural guidelines for AI agents working in this repository. Edit or expand any section below to customize how the agent behaves.

---

## 1. Project Overview & Vision
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
- **Frontend / Mobile:** React Native with Expo SDK 51+ (TypeScript)
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Realtime WebSockets, Storage)
- **Native Android Layer:** Expo Config Plugins, `SYSTEM_ALERT_WINDOW` permission, Foreground Services
- **Navigation:** React Native Navigation / Expo Router
- **State Management:** React Context (`AuthContext`) and custom React hooks

---

## 3. Project Structure & Architecture
Follow this directory convention:

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
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Button.tsx      # Branded action buttons
│   │   │   ├── Card.tsx        # Styled card containers
│   │   │   └── index.ts
│   │   ├── context/            # React Context providers
│   │   │   └── AuthContext.tsx # User session and authentication state
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.ts      # Authentication hook
│   │   │   ├── useChores.ts    # Real-time chore subscriptions
│   │   │   └── useDeviceLock.ts# Device lock state watcher
│   │   ├── lib/
│   │   │   └── supabase.ts     # Supabase client initialization
│   │   ├── screens/            # Core Screen Registry
│   │   │   ├── AuthScreen.tsx       # Registration & login form
│   │   │   ├── ChildLockScreen.tsx  # Non-dismissible lock & photo proof trigger
│   │   │   ├── ParentDashboard.tsx  # Guardian dashboard, approvals & device status
│   │   │   └── RoleScreen.tsx       # Role selector & 6-digit PIN circle pairing
│   │   ├── services/           # Pure Supabase API service layer
│   │   │   ├── authService.ts       # Auth sign-up, sign-in, and profile operations
│   │   │   ├── choreService.ts      # Chore CRUD and status updates
│   │   │   ├── deviceService.ts     # Device registration and lock updates
│   │   │   └── householdService.ts  # Household circle provisioning and PIN verification
│   │   ├── theme/              # Central design tokens
│   │   │   └── index.ts        # Colors (#38BDF8, #FF6B4A, #0F172A), spacing, typography
│   │   └── types/              # TypeScript types and interfaces
│   │       └── index.ts        # Chore, Profile, Device, Household types
│   ├── App.tsx                 # Root application entry & preview navigator
│   ├── app.json                # Expo configuration and native plugins
│   └── package.json
└── server/                     # Backend microservices (if applicable)
```

---

## 4. Core Screen Registry & Context

### 1. `mobile/src/screens/AuthScreen.tsx`
* **File:** `mobile/src/screens/AuthScreen.tsx`
* **Purpose:** Handles user authentication (Sign Up / Sign In) via Supabase Auth.
* **Form Inputs:**
  * Full Name (`full_name`)
  * Phone Number (`phone_number`)
  * Date of Birth (`date_of_birth`) & dynamic Age (`age`)
  * Email (`email`) & Password (`password`)
* **Backend Connection:** Triggers `supabase.auth.signUp` / `signInWithPassword`. The database trigger in `schema.sql` automatically populates the `public.profiles` table upon successful user creation.
* **Navigation Trigger:** Redirects to `RoleScreen.tsx` upon initial profile creation.

### 2. `mobile/src/screens/RoleScreen.tsx`
* **File:** `mobile/src/screens/RoleScreen.tsx`
* **Purpose:** Initial onboarding role selector to define the device node's role within the family.
* **Options:**
  * **Parent / Guardian Mode:** Provisions a new household Circle with a unique 6-digit pairing PIN, or lets secondary guardians join an existing Circle.
  * **Child Mode:** Prompts the child to enter the household's 6-digit PIN to pair the physical device with the family circle.
* **Backend Connection:** Interacts with `public.households` and updates the user's role (`'parent' | 'child'`) and `household_id` in `public.profiles`.

### 3. `mobile/src/screens/ParentDashboard.tsx`
* **File:** `mobile/src/screens/ParentDashboard.tsx`
* **Purpose:** Guardian command center for monitoring household devices and approving chores.
* **Key Features:**
  * **Circle Header:** Shows the household name and the unique 6-digit pairing PIN (`PIN: 482910`).
  * **Pending Approvals Queue:** Displays photo proof submissions from children with "Approve & Unlock" and "Reject" actions.
  * **Connected Devices:** Lists all paired child devices with their live lock status (`LOCKED` vs `UNLOCKED`).
* **Realtime Sync:** Subscribes to `public.chores` and `public.devices` via Supabase Realtime to update status instantly when proof is submitted.

### 4. `mobile/src/screens/ChildLockScreen.tsx`
* **File:** `mobile/src/screens/ChildLockScreen.tsx`
* **Purpose:** The enforcement view presented to the child when mandatory chores are pending.
* **Key Features:**
  * **Lock Header:** High-contrast dark container (`#0F172A`) signaling a locked device state.
  * **Active Chore Card:** Displays the current pending task (e.g., *"🧹 Clean Computer Desk"*), instructions, and status badge.
  * **Photo Proof Action:** Prompts child to launch the camera and capture proof of completion.
  * **Emergency SOS Override:** Unrestricted safety button allowing instant emergency phone calls or parent alerts.
* **Native Android Target:** Designed to run inside a full-screen, non-dismissible hardware overlay window (`SYSTEM_ALERT_WINDOW`).

---

## 5. Design & Branding Guidelines
- **Palette:**
  - `Primary / Sky Blue`: `#38BDF8` (Headers, active tabs, buttons)
  - `Accent / Coral Orange`: `#FF6B4A` (Action badges, alerts, unlock CTAs)
  - `Dark Neutral / Slate Navy`: `#0F172A` (Headings, primary text, lock screen background)
  - `Surface / Cloud White`: `#F8FAFC` (Card surfaces, screen backgrounds)
- **Mascot Persona:** *Chorpy the Maya* (Eurasian Tree Sparrow)
  - Use playful, encouraging messages during unlocks and chore completions.
  - Maintain a clean, high-contrast, child-friendly yet modern interface.

---

## 6. Coding Standards & Conventions
- **Language:** TypeScript with strict type checking enabled.
- **Components:** Functional components using React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Styling:** React Native `StyleSheet.create()`; reference tokens from `src/theme/index.ts` instead of hardcoded hex values.
- **Service Layer:** Keep UI screens clean by delegating all Supabase queries, mutations, and realtime listeners to `src/services/`.
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
2. Run linter:
   ```bash
   cd mobile && npx expo lint
   ```
3. Ensure no regressions or broken imports exist.

<div align="center">

# 🐦 CHORPY
### Networked Household Chore Management & Digital Wellbeing System

[![React Native](https://img.shields.io/badge/React_Native-Expo-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Android](https://img.shields.io/badge/Platform-Android_Enforcement-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

> 📖 **Official System Documentation & Technical Specifications**  
> For the complete architectural specifications, functional/non-functional requirements, database ERD, RBAC matrices, and developer dual-workflow, please see **[OfficialDocumentation.md](file:///OfficialDocumentation.md)**.

</div>

---

## 📌 About Chorpy

**Chorpy** is an IoT-inspired household chore management and digital wellbeing ecosystem built with **React Native / Expo** and **Supabase**. It bridges the gap between digital screen entertainment and physical domestic responsibilities by establishing a synchronized parent-child device relationship across the household.

Chorpy enforces a **merit-based digital enforcement model**:
1. **The Hook:** Children earn access to their personal devices by completing assigned household chores.
2. **The Lock:** When a chore is pending, the child's Android device screen is designed to lock via a hardware-level, non-dismissible screen overlay (`SYSTEM_ALERT_WINDOW`) *(native Android module planned)*.
3. **The Proof:** To restore screen access, the child submits photo evidence. Once reviewed and approved by an adult, the lock dissolves via Supabase Realtime WebSockets *(camera upload and live lock wiring in development)*.
4. **The Life-Safety Anchor:** An emergency SOS bypass remains accessible on the locked screen to trigger parent calls and panic GPS telemetry *(planned)*.

---

## 🚀 Development Progress Tracker

```text
Chorpy MVP Functional Implementation: [███████░░░░░░░░░░░░░] 37.00% (Audited)
Status: Phase 1 Foundation, Onboarding, PIN TTL Security & Chore Management Active
Target Milestone: Academic Capstone Defense MVP
```

> 🔍 **Codebase Audit Notice (November 13, 2026):**  
> An audit of `mobile/src/`, `mobile/package.json`, `mobile/app.json`, `database/schema.sql`, and `database/queryAdd.sql` confirms that two-step account onboarding (with platform-adaptive DOB selection, dynamic age derivation, `< 18` role gating, SVG family fork icons, and 30-minute TTL family PIN/household RPC setup), Supabase Auth persistence, RBAC navigation, the live RBAC `HouseholdPinCard` in `SettingsScreen`, and the `MyFamilyScreen` chore creation and virtualized table (`useChores` + `useHouseholdMembers` + Realtime sync) are actively implemented. Native `SYSTEM_ALERT_WINDOW` overlay enforcement, `expo-camera` proof capture/storage upload, `ChildLockScreen` live wiring, Emergency SOS, and `chores`/`devices` multi-tenant RLS policy hardening remain planned. For the full audit breakdown, see **[OfficialDocumentation.md Section 1](file:///OfficialDocumentation.md#1-system-implementation-audit--feature-completion-percentage-tracker)**.

### 1. Core Milestones (Academic Defense MVP)

| Milestone | Scope / Feature | Status | Notes |
| :--- | :--- | :---: | :--- |
| **M1: Architecture & Project Setup** | Monorepo layout, Expo SDK 58 setup, design tokens (`#1B365D`, `#60C1E5`), agent protocol | `Completed` ✅ | Strict TypeScript, `Fredoka` + `Poppins` typography, `audit-rn-standards.js` gate active |
| **M2: Database & Security Schema** | PostgreSQL schema, `auto_enable_rls` & `handle_new_user` triggers, Realtime publication | `In Progress` 🟡 | Core tables, 30-min PIN TTL RPCs & member-scoped `households` RLS in `database/schema.sql` and `database/queryAdd.sql`; `chores`/`devices` RLS hardening pending |
| **M3: Auth & Profile Onboarding** | Supabase Auth, 2-step onboarding, platform DOB wheel picker, age derivation & `< 18` role gating | `Substantially Implemented` 🟢 | `LoginScreen`, `OnboardingScreen`, `DobWheelPicker`, `WheelColumn`, `validation.ts`, `onboardingValidation.ts` wired to `authService` |
| **M4: Family Circle & Pairing** | Household creation, 6-digit 30-min TTL PIN verification, reclamation & RBAC regeneration | `In Progress` 🟡 | 30-min TTL create/verify/join/regenerate RPCs active via `householdService` & `HouseholdPinCard`; dual-PIN (`guardian_pin`) & QR onboarding planned |
| **M5: Chore Management & Dashboard** | RBAC-gated chore creation, child assignment, virtualized table, optimistic updates & rollback | `In Progress` 🟡 | `MyFamilyScreen`, `AddChoreForm`, `ChildMemberPicker`, `ChoreTable`, `ChoreRow` active; proof review UI & deduplication modal planned |
| **M6: Hardware Screen Overlay Enforcement** | Android `SYSTEM_ALERT_WINDOW` non-dismissible lock, back-key trap | `Planned` ⚪ | `ChildLockScreen.tsx` UI scaffold built; native Android config plugin & `useDeviceLock` wiring queued |
| **M7: Camera Verification & Geofence Check** | Photo proof capture, Supabase Storage upload (`chore-proofs`), Haversine home radius check | `Planned` ⚪ | `expo-camera` & `expo-location` not yet installed; storage bucket queued |
| **M8: Realtime Collaborative Approvals** | WebSocket sync across household dashboards, proof review & sub-second unlock | `In Progress` 🟡 | `useChores` & `useDeviceLock` Realtime channels active; guardian proof review buttons & attribution queued |
| **M9: Life-Safety Emergency SOS** | Always-on emergency call bypass (`tel:911`), panic GPS broadcast | `Planned` ⚪ | `EmergencySOSButton.tsx`, native `tel:` intent, and panic broadcast queued |
| **M10: End-to-End System Integration** | Live demo defense dry-run (`Create -> Lock -> Capture -> Approve -> Unlock`) | `Planned` ⚪ | Scheduled upon completion of M6, M7, and M8 |

---

### 2. Screen & Component Implementation Status

Tracking the frontend implementation inside [`mobile/src/screens/`](file:///mobile/src/screens/) and [`mobile/src/components/`](file:///mobile/src/components/):

| Screen / Component | File Path | Status | Implemented Features & Remaining Gaps |
| :--- | :--- | :---: | :--- |
| **App Loader Screen** | [`AppLoaderScreen.tsx`](file:///mobile/src/screens/AppLoaderScreen.tsx) | `Active` 🟢 | Session bootstrap loader, font preloading fallback, and connection retry state |
| **Auth Coordinator & Login** | [`AuthScreen.tsx`](file:///mobile/src/screens/AuthScreen.tsx), [`LoginScreen.tsx`](file:///mobile/src/screens/LoginScreen.tsx) | `Active` 🟢 | Active Supabase Auth sign-in, RFC 5322 email validation, and `DeveloperQuickPreview` role preview |
| **2-Step Onboarding Flow** | [`OnboardingScreen.tsx`](file:///mobile/src/screens/OnboardingScreen.tsx), [`components/onboarding/`](file:///mobile/src/components/onboarding/index.ts) | `Active` 🟢 | `OnboardingStep1Form` (`DobWheelPicker` native/web 3-column `WheelColumn`, editable `Age`, `< 18` `RoleSelector` lock, `PasswordEntropyChips`, `onboardingValidation.ts`), `OnboardingFamilyFork` (`react-native-svg` `KeyIcon` & `FamilyIcon`), `OnboardingJoinPin`, `OnboardingCreateHousehold` |
| **Home Dashboard** | [`HomeScreen.tsx`](file:///mobile/src/screens/HomeScreen.tsx) | `Active` 🟢 | Branded Hero Card with Chorpy mascot and `Manage My Family` CTA |
| **My Family & Chores** | [`MyFamilyScreen.tsx`](file:///mobile/src/screens/MyFamilyScreen.tsx), [`components/family/`](file:///mobile/src/components/family/ChoreTable.tsx) | `Active` 🟢 | Dynamic `AuthContext` greeting, parent-only `"Add Chore"` inline `AddChoreForm` + `ChildMemberPicker`, virtualized `ChoreTable` + `ChoreRow` with optimistic creation, rollback, 5-state UI resilience, Realtime sync, and parent/child chore filtering *(proof approval actions planned)* |
| **Child Enforcement Lock** | [`ChildLockScreen.tsx`](file:///mobile/src/screens/ChildLockScreen.tsx) | `Scaffolding` 🟡 | Dark enforcement UI scaffold with static pending chore card & unhooked photo proof button *(SOS button, `useDeviceLock` wiring, camera, and `SYSTEM_ALERT_WINDOW` planned)* |
| **Settings & Preferences** | [`SettingsScreen.tsx`](file:///mobile/src/screens/SettingsScreen.tsx), [`HouseholdPinCard.tsx`](file:///mobile/src/components/settings/HouseholdPinCard.tsx) | `Active` 🟢 | Authenticated profile overview, RBAC live Household Circle & 30-minute TTL PIN card (`Parent` countdown + `Regenerate PIN`; `Parent Only` masked for `Child`), wellbeing status, and sign-out |
| **Join Circle (QR / Guardian)** | `JoinCircleScreen.tsx` | `Planned` ⚪ | Guardian QR scanner & secondary adult federation (`co_parent` / `caregiver`) |
| **Permissions Wizard** | `PermissionHandshakeScreen.tsx` | `Planned` ⚪ | Overlay (`SYSTEM_ALERT_WINDOW`), Camera, and Location runtime checklist |
| **Emergency SOS Trigger** | `EmergencySOSButton.tsx` | `Planned` ⚪ | Persistent non-blocking dialer launcher & GPS panic broadcast |
| **Family Circle Map** | `FamilyMapView.tsx` | `Planned` ⚪ | Passive child telemetry & geofence visualization |

---

### 3. Services, Hooks & Context Layer Status

Tracking business logic and reactive state inside [`mobile/src/`](file:///mobile/src/):

| Layer / Module | File Path | Status | Operational Capability |
| :--- | :--- | :---: | :--- |
| **Auth Context** | [`AuthContext.tsx`](file:///mobile/src/context/AuthContext.tsx) | `Active` 🟢 | Session hydration, `onAuthStateChange` listener, safety timeout, `signOut`, `refreshProfile` |
| **Auth Hook** | [`useAuth.ts`](file:///mobile/src/hooks/useAuth.ts) | `Active` 🟢 | Exposes `AuthContext` plus `isParent`, `isChild`, and `isAuthenticated` |
| **Chores Hook** | [`useChores.ts`](file:///mobile/src/hooks/useChores.ts) | `Active` 🟢 | `household_id` Realtime sync, `createChoreOptimistic`, rollback, `pendingIds`, `isPartial`, `mutationError` |
| **Household Members Hook** | [`useHouseholdMembers.ts`](file:///mobile/src/hooks/useHouseholdMembers.ts) | `Active` 🟢 | Fetches household profiles for child assignment picker and name mapping with retry state |
| **Device Lock Hook** | [`useDeviceLock.ts`](file:///mobile/src/hooks/useDeviceLock.ts) | `Active` 🟢 | Subscribes to `public.devices` updates for `childId` *(awaiting `ChildLockScreen` wiring)* |
| **Auth Service** | [`authService.ts`](file:///mobile/src/services/authService.ts) | `Active` 🟢 | `signUp` (passing `fullName`, `phoneNumber`, `dateOfBirth`, `age`, `role`), `signIn`, `signOut`, `getCurrentProfile` |
| **Chore Service** | [`choreService.ts`](file:///mobile/src/services/choreService.ts) | `Active` 🟢 | `getHouseholdChores`, `createChore`, `submitChoreProof`, `approveChore`, `rejectChore` |
| **Device Service** | [`deviceService.ts`](file:///mobile/src/services/deviceService.ts) | `Active` 🟢 | `registerDevice`, `updateLockStatus`, `getDeviceByChildId` |
| **Household Service** | [`householdService.ts`](file:///mobile/src/services/householdService.ts) | `Active` 🟢 | RPC-backed `verifyPin`, `createHousehold`, `joinHouseholdWithPin`, `getMyHousehold`, `regeneratePin`, and `getHouseholdMembers` |

---

### 4. Current Sprint Board

#### 🎯 Active Focus:
1. Harden remaining **`database/schema.sql`** RLS policies (`chores` and `devices`, extending member-scoped `households` isolation) and provision the `chore-proofs` Storage bucket.
2. Add guardian proof review controls (`Approve` / `Reject`) and live household circle name resolution to **`MyFamilyScreen.tsx`**.
3. Install `expo-camera` and `expo-location`, wire **`ChildLockScreen.tsx`** to `useDeviceLock` / `useChores`, and build the native Android `SYSTEM_ALERT_WINDOW` config plugin.

#### 📋 Sprint Backlog:
- [ ] Connect `ChildLockScreen.tsx` directly to `useDeviceLock` and `useChores` reactive hooks.
- [ ] Implement camera photo capture and upload pipeline to Supabase Storage bucket `chore-proofs`.
- [ ] Add proof review cards (`approveChore` / `rejectChore`) and chore deduplication modal in `MyFamilyScreen.tsx`.
- [ ] Build `PermissionHandshakeScreen.tsx` for Android overlay deep-linking (`android.settings.action.MANAGE_OVERLAY_PERMISSION`).
- [ ] Add `EmergencySOSButton.tsx` on `ChildLockScreen.tsx` with native `tel:` dialer intent and panic GPS broadcast.

---

### 5. Recent Activity & Changelog

- **2026-11-13 (Household Pairing PIN 30-Min TTL & RBAC):**
  - Replaced static `pairing_pin` handling with a server-authoritative **30-minute TTL** (`pin_expires_at = now() + interval '30 minutes'`), atomic expired-PIN reclamation (`allocate_household_pin`), `SECURITY DEFINER` RPCs, and tightened member-only `public.households` RLS in `database/queryAdd.sql` and `database/schema.sql`.
  - Wired `householdService.ts` and `OnboardingScreen.tsx` (`refreshProfile`) to the new RPCs and added `HouseholdPinCard.tsx` in `SettingsScreen.tsx` with server-clock-offset countdown (`MM:SS`) and RBAC regeneration (`Parent` only; masked `"Parent Only"` for `Child`).
- **2026-11-13:**  
  - Completed `OnboardingScreen` 2-step flow with platform-adaptive `DobWheelPicker` (`@react-native-community/datetimepicker` on iOS/Android + virtualized 3-column `WheelColumn` on Web), editable `Age` autofilled from DOB, `< 18` `RoleSelector` gating, `onboardingValidation.ts`, `react-native-svg` `KeyIcon`/`FamilyIcon` badges in `OnboardingFamilyFork.tsx`, and `authService.signUp` metadata persistence (`age`, `dateOfBirth`).
  - Built `HomeScreen.tsx` hero card and `MyFamilyScreen.tsx` with dynamic user greeting, RBAC-gated `"Add Chore"` inline `AddChoreForm`, `ChildMemberPicker` (`useHouseholdMembers`), virtualized `ChoreTable` + `ChoreRow` (`useChores` optimistic creation, rollback, 5-state UI resilience, Realtime sync, and parent/child chore filtering).
  - Updated project documentation ([README.md](file:///README.md), [OfficialDocumentation.md](file:///OfficialDocumentation.md), [.agents/instructions.md](file:///.agents/instructions.md), and [FileStructure.md](file:///.agents/skills/chief-of-staff/FileStructure.md)) to reflect audited repository ground truth.
- **2026-11-02:**  
  - Transferred complete system, architectural, and developer documentation to **[OfficialDocumentation.md](file:///OfficialDocumentation.md)**.
  - Repurposed **[README.md](file:///README.md)** into the central development progress tracking dashboard and milestone hub.
- **2026-10-27:**  
  - Initialized agent protocols ([`.agents/agentProtocol.md`](file:///.agents/agentProtocol.md)) and verification quality rules.
- **2026-10-23:**  
  - Initialized foundational mobile screens, Supabase client service layer (`authService`, `choreService`, `deviceService`, `householdService`), and brand design tokens in [`mobile/src/theme/index.ts`](file:///mobile/src/theme/index.ts).

---

## 🧭 Repository Quick Navigation

- 📖 **Technical Architecture & Specifications:** [OfficialDocumentation.md](file:///OfficialDocumentation.md)
- 🤖 **Agent Protocol & Cheatsheet:** [.agents/agentProtocol.md](file:///.agents/agentProtocol.md)
- 📋 **Master Agent Guidelines:** [.agents/instructions.md](file:///.agents/instructions.md)
- 🗂️ **Architecture & File Inventory:** [.agents/skills/chief-of-staff/FileStructure.md](file:///.agents/skills/chief-of-staff/FileStructure.md)
- 🗄️ **Database Schemas & Policies:** [database/schema.sql](file:///database/schema.sql) | [database/queryAdd.sql](file:///database/queryAdd.sql)
- 📱 **Mobile Application (Expo SDK 58):** [mobile/](file:///mobile/)

---

## 💻 Quick Start

```bash
# 1. Enter mobile workspace
cd mobile

# 2. Install dependencies
npm install

# 3. Configure environment variables in mobile/.env.local
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# 4. Start Expo development server
npx expo start

# 5. Run mandatory verification gates
npx tsc --noEmit
npm run lint:standards
npx expo lint
```

> For comprehensive environment setup, prebuilding native Android modules, and live defense walkthrough scripts, consult **Section 13 & Section 14** of [OfficialDocumentation.md](file:///OfficialDocumentation.md#13-getting-started).

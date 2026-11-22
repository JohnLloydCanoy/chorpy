<div align="center">

# CHORPY
### Networked Household Chore Management & Digital Wellbeing System

[![React Native](https://img.shields.io/badge/React_Native-Expo-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Android](https://img.shields.io/badge/Platform-Android_Enforcement-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![Audit Completion](https://img.shields.io/badge/MVP_Implementation-45.00%25_Audited-blue?style=for-the-badge)](OfficialDocumentation.md#1-system-implementation-audit--feature-completion-percentage-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

> **Official System Documentation & Gap Analysis**  
> For complete architectural specifications, functional/non-functional requirements, database ERD, RBAC matrices, and the developer dual-workflow, see **[OfficialDocumentation.md](file:///OfficialDocumentation.md)**.  
> For the full gap analysis, remaining requirements matrix, and 9-domain engineering improvement blueprint, see **[LackingRequirements.md](file:///LackingRequirements.md)**.

</div>

---

## About Chorpy

**Chorpy** is an IoT-inspired household chore management and digital wellbeing ecosystem built with **React Native / Expo** and **Supabase**. It bridges the gap between digital screen entertainment and physical domestic responsibilities by establishing a synchronized parent-child device relationship across the household.

Chorpy enforces a **merit-based digital enforcement model**:
1. **The Hook:** Children earn access to their personal devices by completing assigned household chores.
2. **The Lock:** When a mandatory chore is pending or reaches its scheduled lock deadline, the child's device state transitions to `'locked'` in PostgreSQL (`on_chore_synced_immediate_lock`) and is designed to enforce a hardware-level, non-dismissible Android screen overlay (`SYSTEM_ALERT_WINDOW`) *(native Android overlay module planned)*.
3. **The Proof:** To restore screen access, the child submits photo evidence. Once reviewed and approved by an adult, the lock dissolves via Supabase Realtime WebSockets *(camera upload and guardian proof review UI in development)*.
4. **The Life-Safety Anchor:** An emergency SOS bypass remains accessible on the locked screen to trigger parent calls and panic GPS telemetry *(planned)*.

---

## Development Progress Tracker

```text
Chorpy MVP Functional Implementation: [█████████░░░░░░░░░░░] 45.00% (Audited: 2026-11-22)
Previous Audit Baseline (2026-11-13): [███████░░░░░░░░░░░░░] 37.00% (+8.00% Net Gain)
Scanned Source Files: 74 (73 in mobile/src/ + mobile/App.tsx)
Status: Phase 1 Auth, Fail-Closed Multi-Tenant RLS, Calendar Scheduling, Chore Sheet & Notification Center Active
Target Milestone: Academic Capstone Defense MVP
```

> **Codebase Audit Notice (November 22, 2026):**  
> An audit of all **74 mobile source files** (`mobile/src/` and `mobile/App.tsx`), `mobile/package.json`, `mobile/app.json`, `database/schema.sql`, and `database/queryAdd.sql` confirms that two-step account onboarding, 30-minute TTL household pairing PIN RPCs, **100% fail-closed multi-tenant Row Level Security (RLS)** across all four tables (`households`, `profiles`, `chores`, `devices`), the `on_chore_synced_immediate_lock` immediate device-lock trigger, the `HomeScreen` Day/Week/Month calendar (`react-native-big-calendar`), the 3-mode full-screen slide-up chore sheet (`create`, `edit`, and Child read-only `view`) with phone lock timing presets (`scheduled_at`, `lock_at`, `lock_mode`), the anchored Facebook-style in-app notification center (`NotificationContext`, `NotificationDropdown`), the `MyFamilyScreen` `Chores`/`Family` sub-tabs (`FamilyMembersList`, `InviteFamilyModal`), and `SettingsScreen` profile editing (`ProfileHeaderCard`, `EditProfileModal`) are actively implemented and verified. Native `SYSTEM_ALERT_WINDOW` overlay inflation, `expo-camera` proof capture/storage upload, guardian proof approval UI, and Emergency SOS remain planned. See **[OfficialDocumentation.md Section 1](file:///OfficialDocumentation.md#1-system-implementation-audit--feature-completion-percentage-tracker)** and **[LackingRequirements.md](file:///LackingRequirements.md)**.

### 1. Core Milestones (Academic Defense MVP)

| Milestone | Scope / Feature | Status | Notes |
| :--- | :--- | :---: | :--- |
| **M1: Architecture & Project Setup** | Monorepo layout, Expo SDK 58 setup, design tokens (`#1B365D`, `#60C1E5`), agent protocol | `[COMPLETED]` | 74 source files passing `tsc --noEmit`, `lint:standards` (`<= 250` lines/file, Pure CNG), and `expo lint` with 0 errors and 0 warnings |
| **M2: Database & Security Schema** | PostgreSQL schema, `auto_enable_rls` & `handle_new_user` triggers, fail-closed RLS, Realtime publication | `[SUBSTANTIALLY IMPLEMENTED]` | All 4 tables enforce fail-closed multi-tenant RLS (`get_my_household_id()`, `get_my_role()`, `enforce_chore_update_guard()`, `on_chore_synced_immediate_lock`); `chore-proofs` storage bucket & geofence columns pending |
| **M3: Auth, Onboarding & Profile Management** | Supabase Auth, 2-step onboarding, DOB wheel picker, `< 18` role gating, animated splash, profile editing | `[COMPLETED]` | `LoginScreen`, `OnboardingScreen`, `DobWheelPicker`, `useAppSplash`, `FlyingBirdIllustration`, `ProfileHeaderCard`, and `EditProfileModal` wired to `authService` |
| **M4: Family Circle, Roster & Pairing** | Household creation, 6-digit 30-min TTL PIN verification, reclamation, RBAC regeneration & member roster | `[IN PROGRESS]` | 30-min TTL RPCs active via `householdService`, `useHouseholdPin`, `HouseholdPinCard`, `InviteFamilyModal`, and Realtime `FamilyMembersList`; dual-PIN (`guardian_pin`) & QR onboarding planned |
| **M5: Calendar Scheduling, Chore Sheet & Notifications** | Day/Week/Month calendar, 3-mode slide-up chore sheet (`create`/`edit`/`view`), lock timing presets, notification dropdown | `[SUBSTANTIALLY IMPLEMENTED]` | `HomeScreen` `ChoreCalendarView`, `CalendarGridSurface`, `MyFamilyScreen` `ChoreTable`, `AddChorePageContent`, `updateChoreOptimistic`, and `NotificationDropdown` active; proof review UI & deduplication modal planned |
| **M6: Hardware Screen Overlay Enforcement** | Android `SYSTEM_ALERT_WINDOW` non-dismissible lock, back-key trap, active lock view | `[IN PROGRESS]` | DB trigger `on_chore_synced_immediate_lock` locks `public.devices` on `'immediate'` chores and `useDeviceLock` subscribes to updates; static `ChildLockScreen.tsx` removed pending native Android config plugin and active lock view |
| **M7: Camera Verification & Geofence Check** | Photo proof capture, Supabase Storage upload (`chore-proofs`), Haversine home radius check | `[PLANNED]` | `expo-camera`, `expo-image-manipulator`, and `expo-location` not yet installed; `chore-proofs` storage bucket queued |
| **M8: Realtime Collaborative Approvals** | WebSocket sync across household dashboards, proof review & sub-second unlock | `[IN PROGRESS]` | `useChores`, `useHouseholdMembers`, and `useDeviceLock` Realtime channels active; guardian proof review buttons (`Approve` / `Reject`) & unlock trigger queued |
| **M9: Life-Safety Emergency SOS** | Always-on emergency call bypass (`tel:911`), panic GPS broadcast | `[PLANNED]` | `EmergencySOSButton.tsx`, native `tel:` intent, and panic WebSocket broadcast queued |
| **M10: End-to-End System Integration** | Live demo defense dry-run (`Create -> Lock -> Capture -> Approve -> Unlock`) | `[PLANNED]` | Scheduled upon completion of M6, M7, and M8 |

---

### 2. Screen & Component Implementation Status

Tracking the frontend implementation inside [`mobile/src/screens/`](file:///mobile/src/screens/) and [`mobile/src/components/`](file:///mobile/src/components/):

| Screen / Component | File Path | Status | Implemented Features & Remaining Gaps |
| :--- | :--- | :---: | :--- |
| **App Loader & Flying Mascot Splash** | [`AppLoaderScreen.tsx`](file:///mobile/src/screens/AppLoaderScreen.tsx), [`FlyingBirdIllustration.tsx`](file:///mobile/src/components/common/FlyingBirdIllustration.tsx), [`useAppSplash.ts`](file:///mobile/src/hooks/useAppSplash.ts) | `[ACTIVE]` | Session bootstrap loader, `expo-splash-screen` handoff, cross-platform animated SVG bird illustration, live Supabase RTT probe, and retry/reset actions |
| **Unified Top Navigation Bar** | [`MainNavBar.tsx`](file:///mobile/src/components/navigation/MainNavBar.tsx), [`NavTabIcon.tsx`](file:///mobile/src/components/navigation/NavTabIcon.tsx) | `[ACTIVE]` | Top navigation bar (`HOME`, `MY FAMILY`, `SETTING`) with semantic `react-native-svg` tab icons and active route guard in `App.tsx` |
| **Auth Coordinator & Login** | [`AuthScreen.tsx`](file:///mobile/src/screens/AuthScreen.tsx), [`LoginScreen.tsx`](file:///mobile/src/screens/LoginScreen.tsx) | `[ACTIVE]` | Active Supabase Auth sign-in, RFC 5322 email validation, and `DeveloperQuickPreview` role preview |
| **2-Step Onboarding Flow** | [`OnboardingScreen.tsx`](file:///mobile/src/screens/OnboardingScreen.tsx), [`components/onboarding/`](file:///mobile/src/components/onboarding/index.ts) | `[ACTIVE]` | `OnboardingStep1Form` (`DobWheelPicker`, `WheelColumn`, editable `Age`, `< 18` `RoleSelector` lock, `PasswordEntropyChips`), `OnboardingFamilyFork`, `OnboardingJoinPin`, `OnboardingCreateHousehold` |
| **Home Calendar Dashboard** | [`HomeScreen.tsx`](file:///mobile/src/screens/HomeScreen.tsx), [`components/calendar/`](file:///mobile/src/components/calendar/ChoreCalendarView.tsx) | `[ACTIVE]` | Interactive Day/Week/Month calendar (`ChoreCalendarView`, `CalendarGridSurface`, `CalendarToolbar`, `CalendarStateViews`, `calendarUtils`), Day `current time - 2h` auto-scroll, parent time-slot tap-to-add chore, and event tap-to-edit/view |
| **Header Actions & Notification Center** | [`HomeHeaderActions.tsx`](file:///mobile/src/components/home/HomeHeaderActions.tsx), [`NotificationDropdown.tsx`](file:///mobile/src/components/home/NotificationDropdown.tsx), [`NotificationRow.tsx`](file:///mobile/src/components/home/NotificationRow.tsx), [`HomeHeaderIcons.tsx`](file:///mobile/src/components/home/HomeHeaderIcons.tsx) | `[ACTIVE]` | Identical top-right Bell + Location buttons on `Home` and `My Family`, anchored Facebook-style dropdown popover (`"Created Chore"` for Parents, `"Task Assigned"` for Children), unread dot persistence, and tap-to-open chore sheet |
| **My Family Chores & Roster Hub** | [`MyFamilyScreen.tsx`](file:///mobile/src/screens/MyFamilyScreen.tsx), [`FamilySubNav.tsx`](file:///mobile/src/components/family/FamilySubNav.tsx), [`ChoreTable.tsx`](file:///mobile/src/components/family/ChoreTable.tsx), [`ChoreRow.tsx`](file:///mobile/src/components/family/ChoreRow.tsx), [`FamilyMembersList.tsx`](file:///mobile/src/components/family/FamilyMembersList.tsx), [`InviteFamilyModal.tsx`](file:///mobile/src/components/family/InviteFamilyModal.tsx) | `[ACTIVE]` | 2-tab `Chores` and `Family` sub-navigation, clickable virtualized `ChoreTable` + `ChoreRow` (`CHORE_ROW_HEIGHT = 76`), virtualized `FamilyMembersList` (`MEMBER_ROW_HEIGHT = 68`), and parent-only `InviteFamilyModal` *(live household subtitle binding & proof approval buttons planned)* |
| **3-Mode Slide-Up Chore Sheet** | [`SlideUpPage.tsx`](file:///mobile/src/components/common/SlideUpPage.tsx), [`AddChoreForm.tsx`](file:///mobile/src/components/family/AddChoreForm.tsx), [`AddChorePageContent.tsx`](file:///mobile/src/components/family/AddChorePageContent.tsx), [`ChoreFormBody.tsx`](file:///mobile/src/components/family/ChoreFormBody.tsx), [`ChoreDetailReadOnlyBody.tsx`](file:///mobile/src/components/family/ChoreDetailReadOnlyBody.tsx), [`ChoreScheduleSection.tsx`](file:///mobile/src/components/family/ChoreScheduleSection.tsx), [`DateTimeFieldPicker.tsx`](file:///mobile/src/components/family/DateTimeFieldPicker.tsx), [`WebDateTimeWheel.tsx`](file:///mobile/src/components/family/WebDateTimeWheel.tsx), [`FloatingAddButton.tsx`](file:///mobile/src/components/common/FloatingAddButton.tsx) | `[ACTIVE]` | Full-screen animated slide-up overlay supporting Parent `create` (`"Add Household Chore"`), Parent `edit` (`"Edit Household Chore"` with live calendar sync), and Child read-only `view` (`"Chore Details"`), plus pop-up date/time pickers and 5 lock timing presets |
| **Settings, Profile Editor & PIN Card** | [`SettingsScreen.tsx`](file:///mobile/src/screens/SettingsScreen.tsx), [`ProfileHeaderCard.tsx`](file:///mobile/src/components/settings/ProfileHeaderCard.tsx), [`EditProfileModal.tsx`](file:///mobile/src/components/settings/EditProfileModal.tsx), [`HouseholdPinCard.tsx`](file:///mobile/src/components/settings/HouseholdPinCard.tsx) | `[ACTIVE]` | Centered avatar profile header, `EditProfileModal` (`full_name`, E.164 `phone_number`, `date_of_birth`, derived `age`), RBAC 30-min TTL `HouseholdPinCard`, wellbeing overview, and sign-out |
| **Active Child Enforcement Lock View** | `ChildEnforcementLockView.tsx` | `[PLANNED]` | Static `ChildLockScreen.tsx` scaffold removed; active lock screen wired to `useDeviceLock`, `expo-camera` proof capture, and native Android `SYSTEM_ALERT_WINDOW` overlay is queued for Phase 1A/1B |
| **Join Circle (QR / Guardian)** | `JoinCircleScreen.tsx` | `[PLANNED]` | Guardian QR scanner & secondary adult federation (`co_parent` / `caregiver`) |
| **Permissions Wizard** | `PermissionHandshakeScreen.tsx` | `[PLANNED]` | Overlay (`SYSTEM_ALERT_WINDOW`), Camera, and Location runtime checklist |
| **Emergency SOS Trigger** | `EmergencySOSButton.tsx` | `[PLANNED]` | Persistent non-blocking dialer launcher (`tel:911`) & GPS panic broadcast |
| **Family Circle Map** | `FamilyMapView.tsx` | `[PLANNED]` | Passive child telemetry & geofence visualization wired to header Location button |

---

### 3. Services, Hooks, Context & Utils Layer Status

Tracking business logic, contexts, hooks, and utilities inside [`mobile/src/`](file:///mobile/src/):

| Layer / Module | File Path | Status | Operational Capability |
| :--- | :--- | :---: | :--- |
| **Auth Context** | [`AuthContext.tsx`](file:///mobile/src/context/AuthContext.tsx) | `[ACTIVE]` | Session hydration, 6s safety timeout, `onAuthStateChange` listener, `signOut`, `refreshProfile`, `retrySession`, `clearLocalSession` |
| **Add Chore Overlay Context** | [`AddChoreOverlayContext.tsx`](file:///mobile/src/context/AddChoreOverlayContext.tsx) | `[ACTIVE]` | Split state/dispatch context mounting `AddChoreOverlayHost` at root `App.tsx` above navigation bars without nested `<Modal>` conflicts |
| **Notification Context** | [`NotificationContext.tsx`](file:///mobile/src/context/NotificationContext.tsx) | `[ACTIVE]` | Per-user `lastSeenAt` persistence in `AsyncStorage` (`chorpy_notif_seen_v1_${userId}`) and session `readIds` synchronized across `Home` and `My Family` |
| **App Splash Hook** | [`useAppSplash.ts`](file:///mobile/src/hooks/useAppSplash.ts) | `[ACTIVE]` | Coordinates initial session/Connection readiness and `probeSupabaseConnection` RTT diagnostics |
| **Auth Hook** | [`useAuth.ts`](file:///mobile/src/hooks/useAuth.ts) | `[ACTIVE]` | Exposes `AuthContext` plus `isParent`, `isChild`, and `isAuthenticated` |
| **Chores Hook** | [`useChores.ts`](file:///mobile/src/hooks/useChores.ts) | `[ACTIVE]` | `household_id` Realtime sync, `createChoreOptimistic`, `updateChoreOptimistic`, snapshot rollback, `pendingIds`, `isPartial`, `mutationError` |
| **Chore Sheet State Hook** | [`useChoreSheetState.ts`](file:///mobile/src/hooks/useChoreSheetState.ts) | `[ACTIVE]` | Shared 3-mode state machine (`create` / `edit` / `view`, `openCreate`, `openChore`, `closeSheet`) used by `HomeScreen` and `MyFamilyScreen` |
| **Household Chore Data Hook** | [`useHouseholdChoreData.ts`](file:///mobile/src/hooks/useHouseholdChoreData.ts) | `[ACTIVE]` | Aggregates `AuthContext`, `useChores`, and `useHouseholdMembers` with role-filtered `visibleChores`, `childMembers`, and `memberNameMap` |
| **Household Members Hook** | [`useHouseholdMembers.ts`](file:///mobile/src/hooks/useHouseholdMembers.ts) | `[ACTIVE]` | Fetches household profiles and subscribes to `public.profiles` Realtime updates for `FamilyMembersList` and `ChildMemberPicker` |
| **Household PIN Hook** | [`useHouseholdPin.ts`](file:///mobile/src/hooks/useHouseholdPin.ts) | `[ACTIVE]` | Manages `getMyHousehold`, `regeneratePin`, and server-clock-offset-calibrated 30-minute TTL countdowns |
| **Device Lock Hook** | [`useDeviceLock.ts`](file:///mobile/src/hooks/useDeviceLock.ts) | `[ACTIVE]` | Subscribes to `public.devices` updates for `childId` *(awaiting root lock screen wiring)* |
| **Supabase Client** | [`supabase.ts`](file:///mobile/src/lib/supabase.ts) | `[ACTIVE]` | Singleton client with 12s `AbortController` `resilientFetch`, `webSafeStorage`, and `AppState` / browser online auto-refresh lifecycle |
| **Auth Service** | [`authService.ts`](file:///mobile/src/services/authService.ts) | `[ACTIVE]` | `signUp`, `signIn`, `signOut`, `getCurrentProfile`, `updateProfile`, and `probeSupabaseConnection` |
| **Chore Service** | [`choreService.ts`](file:///mobile/src/services/choreService.ts) | `[ACTIVE]` | `getHouseholdChores`, `createChore`, `updateChore`, `submitChoreProof`, `approveChore`, `rejectChore` |
| **Device Service** | [`deviceService.ts`](file:///mobile/src/services/deviceService.ts) | `[ACTIVE]` | `registerDevice`, `updateLockStatus`, `getDeviceByChildId` |
| **Household Service** | [`householdService.ts`](file:///mobile/src/services/householdService.ts) | `[ACTIVE]` | RPC-backed `verifyPin`, `createHousehold`, `joinHouseholdWithPin`, `getMyHousehold`, `regeneratePin`, and `getHouseholdMembers` |
| **Schedule, Notification & Validation Utils** | [`choreScheduleUtils.ts`](file:///mobile/src/utils/choreScheduleUtils.ts), [`notificationUtils.ts`](file:///mobile/src/utils/notificationUtils.ts), [`profileValidation.ts`](file:///mobile/src/utils/profileValidation.ts), [`onboardingValidation.ts`](file:///mobile/src/utils/onboardingValidation.ts), [`validation.ts`](file:///mobile/src/utils/validation.ts) | `[ACTIVE]` | Lock preset math (`Right Now`, `30m`, `1h`, `2h`, `Custom`), notification builders, RFC 5322 email, password entropy, E.164 phone, and DOB age derivation |

---

### 4. Current Sprint Board

#### Active Focus:
1. Provision the **`chore-proofs`** Supabase Storage bucket and install `expo-camera` + `expo-image-manipulator` to enable Child photo proof capture in **`ChoreDetailReadOnlyBody.tsx`** (`FR-4.3`, `FR-4.4`, `FR-4.5`).
2. Add Guardian proof review controls (**Approve Task** / **Reject Task** with rejection reason) in **`AddChorePageContent.tsx`** and atomic PostgreSQL unlock trigger `sync_chore_approval_device_unlock()` (`FR-2.5`, `FR-5.3`, `FR-5.4`).
3. Install `expo-device`, wire automatic child device registration (`deviceService.registerDevice`) upon joining a household, and connect **`useDeviceLock.ts`** in **`App.tsx`** to an active child enforcement lock screen (`FR-1.3.1`, `FR-2.2.3`, `FR-5.1`).
4. Build **`PermissionHandshakeScreen.tsx`**, **`EmergencySOSButton.tsx`** (`tel:911` + panic GPS broadcast), and the native Android `SYSTEM_ALERT_WINDOW` config plugin (`FR-3.x`, `FR-6.x`).

#### Sprint Backlog:
- [ ] Execute `database/queryAdd.sql` in the Supabase SQL Editor to ensure cloud deployment of `scheduled_at`, `lock_at`, `lock_mode`, `get_my_role()`, `enforce_chore_update_guard()`, `on_chore_synced_immediate_lock`, and fail-closed `chores`/`devices` RLS policies.
- [ ] Add `BEFORE UPDATE` trigger `enforce_profile_update_guard()` on `public.profiles` to block direct PostgREST mutations to `role`, `email`, or `household_id`.
- [ ] Provision Supabase Storage bucket `chore-proofs` and wire `expo-camera` photo upload in `ChoreDetailReadOnlyBody.tsx`.
- [ ] Add parent proof image preview and Approve/Reject buttons in `ChoreFormBody.tsx` / `AddChorePageContent.tsx`.
- [ ] Replace the static `"Canoy Family Circle"` subtitle in `MyFamilyScreen.tsx` with the live household name from `useHouseholdPin` / `householdService.getMyHousehold()`.
- [ ] Build `PermissionHandshakeScreen.tsx`, `EmergencySOSButton.tsx`, and the native Android `SYSTEM_ALERT_WINDOW` CNG config plugin.

---

### 5. Recent Activity & Changelog

- **2026-11-22 (Calendar Scheduling, 3-Mode Chore Sheet, Notification Center, Fail-Closed RLS & System Audit):**
  - **Fail-Closed Multi-Tenant RLS & Triggers (`database/queryAdd.sql`, `database/schema.sql`):** Added `get_my_household_id()`, `get_my_role()`, co-member profile read policy, `public.profiles` Realtime publication, `scheduled_at`/`lock_at`/`lock_mode` columns and constraints on `public.chores`, `enforce_chore_update_guard()` (`BEFORE UPDATE` trigger blocking child edits to chore definitions), `on_chore_synced_immediate_lock` (`AFTER INSERT OR UPDATE` trigger locking `public.devices` on `'immediate'` chores), and fail-closed household/role RLS policies on `public.chores` and `public.devices`.
  - **Home Calendar & Scheduling Engine (`HomeScreen.tsx`, `components/calendar/*`, `choreScheduleUtils.ts`):** Integrated `react-native-big-calendar` across Day, Week, and Month views via `ChoreCalendarView.tsx` and `CalendarGridSurface.tsx` (eliminating `PanResponder` tap-stealing and Month negative-`zIndex` bugs), added Day tab `current time - 2h` auto-scroll (`DAY_HOUR_ROW_HEIGHT = 60`), parent time-slot tap-to-add chore pre-filling date/time, and 5 phone lock timing presets (`Right Now`, `30 mins`, `1 hr`, `2 hrs`, `Custom`).
  - **Unified 3-Mode Slide-Up Chore Sheet & Live Editing (`SlideUpPage.tsx`, `AddChoreOverlayContext.tsx`, `AddChorePageContent.tsx`, `ChoreFormBody.tsx`, `ChoreDetailReadOnlyBody.tsx`, `useChoreSheetState.ts`):** Built full-viewport animated slide-up page supporting Parent `create`, Parent `edit` (`choreService.updateChore` + `useChores.updateChoreOptimistic` syncing live to the Calendar and Chores table), and strictly read-only Child `view`, while removing the inline `ChoreEventDetailCard.tsx` calendar extension and deleting the static `ChildLockScreen.tsx` placeholder.
  - **Unified Header Actions & Facebook-Style Notification Dropdown (`NotificationContext.tsx`, `HomeHeaderActions.tsx`, `NotificationDropdown.tsx`, `NotificationRow.tsx`, `notificationUtils.ts`):** Placed identical 48dp Notification Bell and Location Map header buttons on `HomeScreen` and `MyFamilyScreen` for all roles, with an anchored dropdown popover listing `"Created Chore"` + timestamp for Parents/Co-Parents and `"Task Assigned"` + timing for Children, backed by per-user `AsyncStorage` unread persistence.
  - **Family Roster, Invite Modal, Profile Editing & Navigation (`MyFamilyScreen.tsx`, `FamilySubNav.tsx`, `FamilyMembersList.tsx`, `InviteFamilyModal.tsx`, `SettingsScreen.tsx`, `ProfileHeaderCard.tsx`, `EditProfileModal.tsx`, `MainNavBar.tsx`):** Added `Chores`/`Family` sub-navigation, virtualized `FamilyMembersList`, parent `InviteFamilyModal`, centered `ProfileHeaderCard` + `EditProfileModal` (`authService.updateProfile`), circular `FloatingAddButton`, semantic vector `MainNavBar` icons, and `FlyingBirdIllustration` splash loader.
  - **System Audit & Gap Blueprint (`LackingRequirements.md`, `OfficialDocumentation.md`, `README.md`):** Audited all 74 mobile source files and SQL schemas at **45.00%** weighted MVP completion and published the comprehensive gap matrix and 9-domain engineering improvement blueprint in **[LackingRequirements.md](file:///LackingRequirements.md)**.
- **2026-11-13 (Household Pairing PIN 30-Min TTL & RBAC):**
  - Replaced static `pairing_pin` handling with a server-authoritative **30-minute TTL** (`pin_expires_at = now() + interval '30 minutes'`), atomic expired-PIN reclamation (`allocate_household_pin`), `SECURITY DEFINER` RPCs, and tightened member-only `public.households` RLS in `database/queryAdd.sql` and `database/schema.sql`.
  - Wired `householdService.ts` and `OnboardingScreen.tsx` (`refreshProfile`) to the new RPCs and added `HouseholdPinCard.tsx` in `SettingsScreen.tsx` with server-clock-offset countdown (`MM:SS`) and RBAC regeneration (`Parent` only; masked `"Parent Only"` for `Child`).
- **2026-11-13:**  
  - Completed `OnboardingScreen` 2-step flow with platform-adaptive `DobWheelPicker` (`@react-native-community/datetimepicker` on iOS/Android + virtualized 3-column `WheelColumn` on Web), editable `Age` autofilled from DOB, `< 18` `RoleSelector` gating, `onboardingValidation.ts`, `react-native-svg` `KeyIcon`/`FamilyIcon` badges in `OnboardingFamilyFork.tsx`, and `authService.signUp` metadata persistence (`age`, `dateOfBirth`).
  - Built initial `MyFamilyScreen.tsx` with dynamic user greeting, RBAC-gated `"Add Chore"` form, `ChildMemberPicker` (`useHouseholdMembers`), and virtualized `ChoreTable` + `ChoreRow` (`useChores` optimistic creation, rollback, 5-state UI resilience, and Realtime sync).
- **2026-11-02:**  
  - Transferred complete system, architectural, and developer documentation to **[OfficialDocumentation.md](file:///OfficialDocumentation.md)** and repurposed **[README.md](file:///README.md)** into the central development progress tracking dashboard.
- **2026-10-27:**  
  - Initialized agent protocols ([`.agents/agentProtocol.md`](file:///.agents/agentProtocol.md)) and verification quality rules.
- **2026-10-23:**  
  - Initialized foundational mobile screens, Supabase client service layer (`authService`, `choreService`, `deviceService`, `householdService`), and brand design tokens in [`mobile/src/theme/index.ts`](file:///mobile/src/theme/index.ts).

---

## Repository Quick Navigation

- **Technical Architecture & Specifications:** [OfficialDocumentation.md](file:///OfficialDocumentation.md)
- **System Audit, Lacking Requirements & Improvements:** [LackingRequirements.md](file:///LackingRequirements.md)
- **Agent Protocol & Cheatsheet:** [.agents/agentProtocol.md](file:///.agents/agentProtocol.md)
- **Master Agent Guidelines:** [.agents/instructions.md](file:///.agents/instructions.md)
- **Architecture & File Inventory:** [.agents/skills/chief-of-staff/FileStructure.md](file:///.agents/skills/chief-of-staff/FileStructure.md)
- **Database Schemas & Policies:** [database/schema.sql](file:///database/schema.sql) | [database/queryAdd.sql](file:///database/queryAdd.sql)
- **Mobile Application (Expo SDK 58):** [mobile/](file:///mobile/)

---

## Quick Start

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

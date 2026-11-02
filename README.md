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
2. **The Lock:** When a chore is pending, the child's Android screen is locked via a hardware-level, non-dismissible screen overlay (`SYSTEM_ALERT_WINDOW`).
3. **The Proof:** To restore screen access, the child takes photo evidence. Once reviewed and approved by an adult, the lock instantly dissolves via Supabase Realtime WebSockets.
4. **The Life-Safety Anchor:** An emergency SOS bypass is continuously accessible on the locked screen to trigger parent calls and panic GPS telemetry.

---

## 🚀 Development Progress Tracker

```text
Overall MVP Progress: [██████████░░░░░░░░░░] 50% Complete
Target Scope: Academic Capstone Defense MVP
```

### 1. Core Milestones (Academic Defense MVP)

| Milestone | Scope / Feature | Status | Notes |
| :--- | :--- | :---: | :--- |
| **M1: Architecture & Project Setup** | Monorepo layout, Expo SDK 58 setup, design tokens, agent protocol | `Completed` ✅ | Clean repository initialized with strict typing |
| **M2: Database & Security Schema** | PostgreSQL schema, Row Level Security (RLS) triggers, Realtime publication | `In Progress` 🟡 | Schema drafted in `database/schema.sql`; RLS policies undergoing tuning |
| **M3: Auth & Profile Onboarding** | Supabase Auth, dynamic age derivation, role pre-selection (`parent` vs `child`) | `In Progress` 🟡 | Base screens built; role gating & input masking active |
| **M4: Family Circle & Dual-PIN Pairing** | Auto-circle provisioning, Child Pairing PIN & Guardian Invite PIN / QR | `In Progress` 🟡 | Initial household service & PIN logic implemented |
| **M5: Chore Management & Deduplication** | Chore creation, queue bundling, deduplication concurrency guard | `In Progress` 🟡 | Task CRUD operational; fuzzy deduplication modal queued |
| **M6: Hardware Screen Overlay Enforcement** | Android `SYSTEM_ALERT_WINDOW` non-dismissible lock, back-key trap | `Planned` ⚪ | Screen UI built; native Android config plugin integration in progress |
| **M7: Camera Verification & Geofence Check** | Photo proof capture, Supabase Storage upload, Haversine home radius check | `In Progress` 🟡 | Camera screen ready; storage bucket hooks in progress |
| **M8: Realtime Collaborative Approvals** | WebSocket sync across guardian dashboards, sub-second lock dissolution | `In Progress` 🟡 | Basic subscriptions active; multi-guardian optimistic lock in dev |
| **M9: Life-Safety Emergency SOS** | Always-on emergency call bypass (`tel:911`), panic GPS broadcast | `Planned` ⚪ | UI trigger stubbed; native intent and GPS broadcast wiring next |
| **M10: End-to-End System Integration** | Live demo defense dry-run (Create $\rightarrow$ Lock $\rightarrow$ Capture $\rightarrow$ Approve $\rightarrow$ Unlock) | `Planned` ⚪ | Scheduled upon completion of M6 & M8 |

---

### 2. Screen & Component Implementation Status

Tracking the frontend implementation inside [`mobile/src/screens/`](file:///mobile/src/screens/):

| Screen / Component | File Path | Status | Implemented Features |
| :--- | :--- | :---: | :--- |
| **Auth Screen** | [`AuthScreen.tsx`](file:///mobile/src/screens/AuthScreen.tsx) | `Active` 🟢 | Supabase email/password login, registration, DOB age derivation |
| **Role Designation Screen** | [`RoleScreen.tsx`](file:///mobile/src/screens/RoleScreen.tsx) | `Active` 🟢 | Parent vs. Child selection, 6-digit PIN input container |
| **Parent Dashboard** | [`ParentDashboard.tsx`](file:///mobile/src/screens/ParentDashboard.tsx) | `Active` 🟢 | Task list view, chore assignment form, proof review cards |
| **Child Enforcement Lock** | [`ChildLockScreen.tsx`](file:///mobile/src/screens/ChildLockScreen.tsx) | `Active` 🟢 | Lock state display, task review, photo capture launch button |
| **Household Fork Gateway** | `HouseholdForkScreen.tsx` | `Planned` ⚪ | "Create New Circle" vs "Join Existing Circle" selection |
| **Join Circle (QR / PIN)** | `JoinCircleScreen.tsx` | `Planned` ⚪ | Guardian QR scanner & secondary adult federation |
| **Permissions Wizard** | `PermissionHandshakeScreen.tsx` | `Planned` ⚪ | Overlay (`SYSTEM_ALERT_WINDOW`), Camera, Location checklist |
| **Emergency SOS Trigger** | `EmergencySOSButton.tsx` | `Planned` ⚪ | Persistent non-blocking dialer launcher |
| **Family Circle Map** | `FamilyMapView.tsx` | `Planned` ⚪ | Passive child telemetry & geofence visualization |

---

### 3. Backend & Services Layer Status

Tracking services inside [`mobile/src/services/`](file:///mobile/src/services/):

| Service | File Path | Status | Operational Capability |
| :--- | :--- | :---: | :--- |
| **Auth Service** | [`authService.ts`](file:///mobile/src/services/authService.ts) | `Active` 🟢 | `signUp`, `signIn`, `signOut`, `getCurrentProfile` |
| **Chore Service** | [`choreService.ts`](file:///mobile/src/services/choreService.ts) | `Active` 🟢 | `createChore`, `getPendingChores`, `submitChoreProof`, `approveChore` |
| **Device Service** | [`deviceService.ts`](file:///mobile/src/services/deviceService.ts) | `Active` 🟢 | `registerDevice`, `updateLockStatus`, `getDeviceByChildId` |
| **Household Service** | [`householdService.ts`](file:///mobile/src/services/householdService.ts) | `Active` 🟢 | `createHousehold`, `joinHouseholdWithPin`, `getHouseholdMembers` |

---

### 4. Current Sprint Board

#### 🎯 Active Focus:
1. Complete **`database/schema.sql`** migrations in the active Supabase instance with automatic RLS triggers.
2. Wire up the **Dual-PIN Household Circle** flow (`Child Pairing PIN` vs `Guardian Invite PIN / QR`).
3. Implement the native Android config plugin for `SYSTEM_ALERT_WINDOW` screen overlay inflation.

#### 📋 Sprint Backlog:
- [ ] Connect `ChildLockScreen.tsx` directly to the `useDeviceLock` reactive hook.
- [ ] Implement camera photo upload pipeline directly to Supabase Storage bucket `chore-proofs`.
- [ ] Implement deduplication check modal in `ParentDashboard.tsx` before task insertion.
- [ ] Build the `PermissionHandshakeScreen.tsx` for Android overlay deep-linking (`android.settings.action.MANAGE_OVERLAY_PERMISSION`).
- [ ] Add the Emergency SOS action button on the locked view with native `tel:` dialer fallback.

---

### 5. Recent Activity & Changelog

- **2026-11-02:**  
  - Transferred complete system, architectural, and developer documentation to **[OfficialDocumentation.md](file:///OfficialDocumentation.md)**.
  - Repurposed **[README.md](file:///README.md)** into the central development progress tracking dashboard and milestone hub.
- **2026-10-27:**  
  - Initialized agent protocols ([`agentProtocol.md`](file:///agentProtocol.md)) and verification quality rules.
- **2026-10-23:**  
  - Implemented foundational mobile client screens: [`AuthScreen.tsx`](file:///mobile/src/screens/AuthScreen.tsx), [`RoleScreen.tsx`](file:///mobile/src/screens/RoleScreen.tsx), [`ParentDashboard.tsx`](file:///mobile/src/screens/ParentDashboard.tsx), and [`ChildLockScreen.tsx`](file:///mobile/src/screens/ChildLockScreen.tsx).
  - Configured Supabase client service layer (`authService`, `choreService`, `deviceService`, `householdService`).
  - Defined brand design tokens and typography in [`theme/index.ts`](file:///mobile/src/theme/index.ts).

---

## 🧭 Repository Quick Navigation

- 📖 **Technical Architecture & Specifications:** [OfficialDocumentation.md](file:///OfficialDocumentation.md)
- 🤖 **Agent Protocol & Cheatsheet:** [agentProtocol.md](file:///agentProtocol.md)
- 📋 **Master Agent Guidelines:** [.agents/instructions.md](file:///.agents/instructions.md)
- 🗄️ **Database Schemas & Policies:** [database/schema.sql](file:///database/schema.sql)
- 📱 **Mobile Application (Expo SDK 58):** [mobile/](file:///mobile/)

---

## 💻 Quick Start

```bash
# 1. Clone & Enter mobile workspace
cd mobile

# 2. Install dependencies
npm install

# 3. Start Expo development server
npx expo start
```

> For comprehensive environment setup, prebuilding native Android modules, and live defense walkthrough scripts, consult **Section 12 & Section 13** of [OfficialDocumentation.md](file:///OfficialDocumentation.md#12-getting-started).

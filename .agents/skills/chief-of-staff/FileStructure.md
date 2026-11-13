# Chorpy System Architecture & File Structure Reference

> **Document Context:**  
> This reference specification is maintained for the **Chief of Staff (CoS)** skill and all delegated subagents (**Researcher**, **Implementer**, and **Quality Assurance / QA**). It defines the codebase layout, architectural boundaries, cross-layer contracts, and structural governance for the **Chorpy** household chore and child device-enforcement ecosystem.

---

## 1. Overview & Purpose

The Chorpy codebase is structured as a modular three-tier architecture:
1. **`database/`** – Supabase / PostgreSQL schema, automated security triggers (fail-closed RLS), Realtime publications, and relational models.
2. **`mobile/`** – Cross-platform React Native / Expo application built with TypeScript, adhering strictly to Continuous Native Generation (CNG), centralized theme tokens, and clean separation between UI and services.
3. **`server/`** – Backend microservice and background worker tier for automated chore resets, cron jobs, database cleanup, and push notifications.

### How Delegated Agents Utilize This Document

| Role | Operational Usage |
| :--- | :--- |
| **Chief of Staff (CoS)** | Slices incoming epics across subsystems; verifies architectural boundaries; guarantees that no layer violates dependency rules. |
| **Researcher** | Inspects schema definitions, API contracts, and file locations before advising on implementation; checks for existing utilities to avoid duplicate work. |
| **Implementer** | Guides file creation and modifications; enforces service-layer isolation (no database queries in UI screens); adheres strictly to `src/theme/` design tokens and sub-250 line file limits. |
| **Quality Assurance (QA)** | Validates that files adhere to prescribed directory paths; verifies RLS policies; checks that Continuous Native Generation (CNG) rules are intact (no manual `android/` or `ios/` folders). |

---

## 2. `database/` Subsystem

The `database/` directory manages all database schema definitions, data integrity constraints, Row Level Security (RLS) policies, and event triggers for the Supabase backend.

### 2.1 File Tree

```
database/
├── queryAdd.sql              # Idempotent Supabase SQL Editor migration for 30-min PIN TTL, RPCs & households RLS
└── schema.sql                # Complete schema definition, fail-closed triggers, TTL RPCs, RLS, and Realtime pub
```

### 2.2 Schema & Architectural Contracts (`schema.sql`)

#### Extensions & Security Foundation
- **UUID Generation:** Enabled via `create extension if not exists "uuid-ossp";`.
- **Fail-Closed RLS Event Trigger:** `public.enable_rls_on_new_tables()` is invoked via an event trigger `auto_enable_rls` on `ddl_command_end` for all `CREATE TABLE` and `CREATE TABLE AS` operations. Any newly created table automatically has Row Level Security enabled by default.

#### Core Tables & Relationships

```
┌─────────────────────────┐
│     auth.users          │
└────────────┬────────────┘
             │ 1:1 (id = auth.uid)
             ▼
┌─────────────────────────┐          N:1            ┌─────────────────────────┐
│     public.profiles     │ ──────────────────────► │    public.households    │
│  - role: parent | child │                         │  - pairing_pin (unique) │
└────────────┬────────────┘                         └────────────┬────────────┘
             │                                                   │
             ├──────────────────────────┐                        │
             │ 1:N                      │ 1:N                    │ 1:N
             ▼                          ▼                        ▼
┌─────────────────────────┐   ┌───────────────────────────────────────────────┐
│     public.devices      │   │               public.chores                   │
│  - child_id (FK)        │   │  - household_id (FK)                          │
│  - lock_status:         │   │  - assigned_child_id (FK)                     │
│    locked | unlocked    │   │  - status: pending | awaiting_approval |      │
└─────────────────────────┘   │            approved | rejected                │
                              └───────────────────────────────────────────────┘
```

1. **`public.households` (Family Circles)**
   - `id`: `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
   - `name`: `TEXT NOT NULL`
   - `pairing_pin`: `VARCHAR(6) UNIQUE` (Nullable 6-digit numeric code with 30-minute TTL; reclaimed into `NULL` on expiry)
   - `pin_expires_at`: `TIMESTAMPTZ` (Server-authoritative expiration timestamp set to `now() + interval '30 minutes'`; `NULL` treated as expired)
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
   - Partial Index: `idx_households_active_pin` on `(pairing_pin) WHERE pairing_pin IS NOT NULL`

2. **`public.profiles` (User Profiles linked to Supabase Auth)**
   - `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `household_id`: `UUID REFERENCES public.households(id) ON DELETE SET NULL`
   - `email`: `TEXT NOT NULL`
   - `full_name`: `TEXT`
   - `phone_number`: `TEXT`
   - `date_of_birth`: `DATE`
   - `age`: `INTEGER`
   - `role`: `TEXT NOT NULL DEFAULT 'child' CHECK (role IN ('parent', 'child'))`
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

3. **`public.devices` (Registered Enforcement Hardware)**
   - `id`: `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
   - `child_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
   - `device_name`: `TEXT NOT NULL`
   - `lock_status`: `TEXT NOT NULL DEFAULT 'unlocked' CHECK (lock_status IN ('locked', 'unlocked'))`
   - `last_seen`: `TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

4. **`public.chores` (Household Chore Items & Tasks)**
   - `id`: `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
   - `household_id`: `UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE`
   - `assigned_child_id`: `UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE`
   - `title`: `TEXT NOT NULL`
   - `description`: `TEXT`
   - `status`: `TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'awaiting_approval', 'approved', 'rejected'))`
   - `proof_image_url`: `TEXT`
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
   - `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

#### Functions & Triggers
- **`public.handle_new_user()`:**  
  Triggered `AFTER INSERT ON auth.users` for every new signup (`on_auth_user_created`). Automatically maps user metadata (`full_name`, `phone_number`, `date_of_birth`, `age`, `role`) into `public.profiles`.
- **Household Pairing PIN 30-Minute TTL & Reclamation RPCs (`SECURITY DEFINER`, `SET search_path = public`):**
  - `public.allocate_household_pin()`: Internal helper generating a 6-digit PIN (`100000..999999`), locking matching rows `FOR UPDATE`, reclaiming expired PINs (`pin_expires_at IS NULL OR pin_expires_at <= now()`), and retrying active collisions.
  - `public.verify_household_pin(p_pin text)` (`anon, authenticated`): Pre-signup check returning `boolean` without leaking household rows.
  - `public.create_household_with_pin(p_name text)` (`authenticated`, Parent only): Creates household with 30-minute TTL and links `profiles.household_id`.
  - `public.regenerate_household_pin()` (`authenticated`, Parent only): Issues a fresh 6-digit PIN and 30-minute TTL for the parent's household.
  - `public.join_household_with_pin(p_pin text)` (`authenticated`): Atomically links caller to an active household (`pin_expires_at > now()`) and masks PIN fields for non-parent accounts.
  - `public.get_my_household()` (`authenticated`): Returns caller's linked household plus `server_now` for clock-skew-safe countdowns, masking `pairing_pin`/`pin_expires_at` for children.

#### Realtime Publications
Supabase Realtime WebSocket synchronization is activated on:
- `alter publication supabase_realtime add table public.chores;`
- `alter publication supabase_realtime add table public.devices;`

#### Row Level Security (RLS) Policies
- `profiles`:
  - `Allow users to read their own profile`: `auth.uid() = id`
  - `Allow users to update their own profile`: `auth.uid() = id`
- `households`: *(member-scoped SELECT enforced; mutations gated via `SECURITY DEFINER` RPCs)*
  - `Allow members to read their own household`: `to authenticated using (id = (select household_id from public.profiles where id = auth.uid()))`
- `chores`: *(permissive authenticated stubs — multi-tenant `household_id` hardening pending)*
  - `Allow users to read household chores`: `to authenticated using (true)`
  - `Allow users to insert chores`: `to authenticated with check (true)`
  - `Allow users to update chores`: `to authenticated using (true)`
- `devices`: *(permissive authenticated stubs — multi-tenant `household_id` hardening pending)*
  - `Allow authenticated users to read devices`: `to authenticated using (true)`
  - `Allow authenticated users to update devices`: `to authenticated using (true)`
  - `Allow authenticated users to register devices`: `to authenticated with check (true)`

### 2.3 Supabase Cloud Operational Context & Environment

> [!NOTE]
> **Active Environment Configuration:**
> - **Provider:** Supabase Cloud (Hosted Postgres + Auth + Realtime).
> - **Authentication Strategy:** Email + Password only.
> - **Email Confirmation:** **DISABLED** (Users are auto-confirmed upon `supabase.auth.signUp`; no email verification step required during onboarding).
> - **Phone / Social Auth:** Inactive for current milestone.
> - **Storage Buckets:** No storage buckets provisioned yet. When implementing photo proof submissions (FR-3), provision bucket `chore-proofs` with appropriate RLS policies.
> - **Client Environment Variables:** Requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `mobile/.env.local`.

### 2.4 Migration & Seeding Conventions
- **Future Migrations:** When altering schemas, create sequential migration scripts under `database/migrations/` using timestamped naming (e.g., `YYYYMMDDHHMMSS_add_device_token.sql`) or Supabase CLI conventions (`supabase/migrations/`).
- **Seed Scripts:** Development and testing seed datasets should reside in `database/seeds/seed.sql` containing mock households, sample parent and child profiles, test chore queues, and sample devices.
- **Fail-Closed Invariant:** Never disable RLS on any table. Any new table must define explicit `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies.

---

## 3. `mobile/` Subsystem

The `mobile/` directory contains the complete Expo / React Native application. It implements modern cross-platform mobile patterns, strict TypeScript typing, centralized theme design tokens, and service-based architecture.

### 3.1 Comprehensive Directory Tree

```
mobile/
├── assets/                                  # Static image assets and platform icons
│   ├── android-icon-background.png          # Android adaptive icon background layer
│   ├── android-icon-foreground.png          # Android adaptive icon foreground layer
│   ├── android-icon-monochrome.png          # Android themed/monochrome icon layer
│   ├── Background-of-Primary-Color.png      # Branded primary Navy hero/button background asset
│   ├── favicon.png                          # Web favicon
│   ├── icon.png                             # Universal app icon (1024x1024)
│   ├── splash-icon.png                      # Native splash screen logo
│   └── White-Background-Assets.png          # Branded light background asset for auth/onboarding
├── src/
│   ├── components/                          # Presentational, reusable atomic UI components
│   │   ├── family/                          # Household chore creation & virtualized table components
│   │   │   ├── AddChoreForm.tsx             # Inline parent chore creation form with sanitization
│   │   │   ├── ChildMemberPicker.tsx        # Horizontal FlatList selector for household child profiles
│   │   │   ├── ChoreRow.tsx                 # Memoized fixed-height chore row with status badge
│   │   │   └── ChoreTable.tsx               # Virtualized FlatList chore table with 5-state UI resilience
│   │   ├── onboarding/                      # Multi-step Onboarding & Household Setup Components
│   │   │   ├── DobWheelPicker.tsx           # Platform-adaptive DOB picker (native spinner / web wheel)
│   │   │   ├── WheelColumn.tsx              # Virtualized FlatList wheel column for Web DOB selection
│   │   │   ├── OnboardingStep1Form.tsx      # Step 1: Credentials, DOB, editable Age, role & entropy chips
│   │   │   ├── OnboardingFamilyFork.tsx     # Step 2: Join existing family vs create circle decision
│   │   │   ├── OnboardingJoinPin.tsx        # Step 2a: 6-digit numeric family PIN pairing input
│   │   │   ├── OnboardingCreateHousehold.tsx# Step 2b: Household circle naming and family composition
│   │   │   └── index.ts                     # Onboarding component export barrel
│   │   ├── settings/                        # Settings screen domain components
│   │   │   └── HouseholdPinCard.tsx         # RBAC live household PIN card, server-offset countdown & Regenerate PIN
│   │   ├── Button.tsx                       # Themed interactive button (variants: primary, secondary, danger)
│   │   ├── Card.tsx                         # Elevated container component with theme border/shadow
│   │   ├── DeveloperQuickPreview.tsx        # Quick role preview toolbar for development
│   │   ├── PasswordEntropyChips.tsx         # Live visual security chips for password strength
│   │   ├── RoleSelector.tsx                 # Parent/child role selection toggle with < 18 gating
│   │   └── index.ts                         # Component re-export barrel
│   ├── context/                             # Scoped application state providers
│   │   └── AuthContext.tsx                  # Global Supabase authentication and profile provider
│   ├── hooks/                               # Custom hooks encapsulating state & realtime subscriptions
│   │   ├── useAuth.ts                       # Convenient hook exposing auth session, role flags, and profile
│   │   ├── useChores.ts                     # Realtime chore sync, optimistic creation & rollback
│   │   ├── useDeviceLock.ts                 # Realtime hook tracking hardware device lock status
│   │   └── useHouseholdMembers.ts           # Household member fetching & retry state hook
│   ├── lib/                                 # External SDK initialization & platform shims
│   │   └── supabase.ts                      # Supabase client singleton with AsyncStorage persistence
│   ├── screens/                             # Screen views and application route containers
│   │   ├── AppLoaderScreen.tsx              # Session bootstrap & font loader with retry view
│   │   ├── AuthScreen.tsx                   # Auth coordinator screen (Login vs Onboarding)
│   │   ├── LoginScreen.tsx                  # User authentication / sign in view
│   │   ├── OnboardingScreen.tsx             # Multi-step registration and family setup gateway
│   │   ├── HomeScreen.tsx                   # Landing hero card with Chorpy mascot & Manage My Family CTA
│   │   ├── MyFamilyScreen.tsx               # Dynamic greeting, RBAC chore creation & virtualized chore table
│   │   ├── ChildLockScreen.tsx              # Child lock enforcement UI scaffold (camera & overlay planned)
│   │   └── SettingsScreen.tsx               # Profile overview, household circle status, wellbeing & sign-out
│   ├── services/                            # Pure API and database communication layer (Supabase SDK)
│   │   ├── authService.ts                   # Auth signup, signin, signout, and profile retrieval
│   │   ├── choreService.ts                  # Chore creation, listing, proof submission, approval, rejection
│   │   ├── deviceService.ts                 # Device registration, status updates, and lookup
│   │   └── householdService.ts              # RPC-backed household creation, PIN verification, joining, lookup & PIN regeneration
│   ├── theme/                               # Design system single source of truth
│   │   └── index.ts                         # Color palette (#1B365D, #60C1E5, #0F172A), spacing, typography
│   ├── types/                               # TypeScript domain models and interfaces
│   │   └── index.ts                         # UserRole, LockStatus, ChoreStatus, Profile, Household, Device, Chore
│   └── utils/                               # Pure validation and input formatting utilities
│       ├── onboardingValidation.ts          # Editable age validation & Step 1 submission validation
│       └── validation.ts                    # Email regex, password entropy, E.164 phone, DOB age calculation
├── .env.local                               # Local environment variables (EXPO_PUBLIC_SUPABASE_URL, etc.)
├── .gitignore                               # Git ignore list (ignores node_modules, .expo, android/, ios/)
├── AGENTS.md                                # Mobile-specific developer guardrails and rules
├── App.tsx                                  # Top-level application component, font loader & RBAC navigator
├── app.json                                 # Expo project configuration and CNG plugin specifications
├── eslint.config.js                         # ESLint flat config using eslint-config-expo
├── index.ts                                 # Expo application entry point (`registerRootComponent(App)`)
├── package.json                             # Dependencies, scripts, and package metadata
└── tsconfig.json                            # TypeScript configuration with Expo base presets
```

### 3.2 Directory Breakdown & Component Responsibilities

#### `mobile/assets/`
Contains high-resolution visual branding assets:
- `icon.png`: Main square app icon used across iOS, Android, and web packaging.
- `splash-icon.png`: Displayed centrally on the native splash screen while assets and auth tokens resolve.
- `android-icon-*.png`: Multi-layered assets required by Google Play Store for Android adaptive icons.
- `Background-of-Primary-Color.png` & `White-Background-Assets.png`: Branded backdrop images used in `App.tsx`, `HomeScreen.tsx`, `LoginScreen.tsx`, `OnboardingScreen.tsx`, and primary CTAs.

#### `mobile/src/components/`
Atomic, reusable UI building blocks:
- **`family/`**: Family chore management UI modules:
  - `AddChoreForm.tsx`: Parent-only inline form with text sanitization, validation, and rollback-safe submission.
  - `ChildMemberPicker.tsx`: Horizontal `FlatList` child selector with loading, error/retry, and empty states.
  - `ChoreRow.tsx`: `React.memo` fixed-height (`68px`) chore row rendering title, description, assignee label, and status badge (`Saving`, `Pending`, `In Review`, `Approved`, `Rejected`).
  - `ChoreTable.tsx`: Virtualized `FlatList` chore table (`getItemLayout`, `removeClippedSubviews`) implementing Empty, Loading, Error, Partial, and Populated states.
- **`onboarding/`**: Multi-step onboarding components including `DobWheelPicker.tsx` (using `@react-native-community/datetimepicker` on Android/iOS and `WheelColumn.tsx` 3-column virtualized wheel on Web), `OnboardingStep1Form.tsx` (credentials, DOB, editable Age, `< 18` role gating, entropy chips), `OnboardingFamilyFork.tsx` (join vs create selection), `OnboardingJoinPin.tsx` (6-digit numeric family PIN input), and `OnboardingCreateHousehold.tsx` (household naming and family composition).
- **`settings/`**: `HouseholdPinCard.tsx` — RBAC household circle card displaying live 30-minute TTL PIN, server-clock-offset `MM:SS` countdown, and `Regenerate PIN` for Parents while masking PIN (`"Parent Only"`) for Children.
- **`Button.tsx`**: Encapsulates accessibility guidelines (minimum 48dp touch target), loading spinners, and visual variants.
- **`Card.tsx`**: Uniform container providing standard border radius, surface color, and border styling.
- **`DeveloperQuickPreview.tsx`**: Development toolbar for rapid Parent/Child role testing.
- **`PasswordEntropyChips.tsx`**: Live security chips for 8+ characters, uppercase, lowercase, and numbers.
- **`RoleSelector.tsx`**: Account role selector (parent/child) with under-18 enforcement.
- **`index.ts`**: Re-exports shared components for clean modular imports.

#### `mobile/src/context/`
Application-wide React Context providers:
- **`AuthContext.tsx`**: Manages the current `Session`, `User`, and `Profile`. Subscribes to Supabase `onAuthStateChange`, hydrates profile data on mount with a 6s safety timeout, and provides `signOut` and `refreshProfile` utilities.

#### `mobile/src/hooks/`
Encapsulates reactive logic, hooks, and WebSocket subscriptions:
- **`useAuth.ts`**: Helper exposing `user`, `profile`, `isParent`, `isChild`, and `isAuthenticated`.
- **`useChores.ts`**: Fetches chores for `householdId`, subscribes to Postgres changes on `public.chores` via Supabase Realtime channels, and exposes `createChoreOptimistic` with optimistic UI insertion, rollback on error, `pendingIds`, `isPartial`, and `mutationError`.
- **`useDeviceLock.ts`**: Tracks the lock state of a child's registered device in realtime via `public:devices:child:{childId}`.
- **`useHouseholdMembers.ts`**: Fetches household profiles via `householdService.getHouseholdMembers` for child assignment and name lookup with loading, error, and `refetchMembers` support.

#### `mobile/src/lib/`
Configuration for external libraries and platforms:
- **`supabase.ts`**: Initializes the Supabase client (`createClient`) configured with `@react-native-async-storage/async-storage` for auth session persistence and `react-native-url-polyfill`.

#### `mobile/src/screens/`
Screen-level views coordinating business hooks and presentational components:
- **`AppLoaderScreen.tsx`**: Branded initial bootstrap & session verification loader with error retry state.
- **`AuthScreen.tsx`**: Auth coordinator switching between Login and Onboarding flows.
- **`LoginScreen.tsx`**: Sign in view handling email/password authentication and quick demo role preview.
- **`OnboardingScreen.tsx`**: Multi-step registration, credentials validation, and family setup gateway (Join with PIN or Create Household), passing `age` and `dateOfBirth` to `authService.signUp`.
- **`HomeScreen.tsx`**: Authenticated landing view displaying the Chorpy mascot hero card and `Manage My Family` CTA.
- **`MyFamilyScreen.tsx`**: Dynamic user greeting from `AuthContext`, RBAC-gated `"Add Chore"` toggle opening `AddChoreForm` + `ChildMemberPicker`, and virtualized `ChoreTable` backed by `useChores` with parent/child filtering *(proof approval controls & live household PIN header planned)*.
- **`ChildLockScreen.tsx`**: Child lock enforcement UI scaffold showing a dark lock header, placeholder pending chore card, and unhooked photo proof button *(SOS button, `useDeviceLock` wiring, `expo-camera`, and native `SYSTEM_ALERT_WINDOW` planned)*.
- **`SettingsScreen.tsx`**: User profile and account overview, household info, device wellbeing overview, and account sign-out.

#### `mobile/src/services/`
The pure database and network communication layer:
- **`authService.ts`**: Isolated Supabase Auth calls (`signUp`, `signIn`, `signOut`, `getCurrentProfile`).
- **`choreService.ts`**: CRUD operations for chores (`getHouseholdChores`, `createChore`, `submitChoreProof`, `approveChore`, `rejectChore`).
- **`deviceService.ts`**: Hardware lock registry operations (`registerDevice`, `updateLockStatus`, `getDeviceByChildId`).
- **`householdService.ts`**: RPC-backed circle management (`verifyPin`, `createHousehold`, `joinHouseholdWithPin`, `getMyHousehold`, `regeneratePin`, `getHouseholdMembers`).

#### `mobile/src/theme/`
The single source of truth for all styling:
- **`colors`**: Primary (`#1B365D` Navy Blue), Secondary/Accent (`#60C1E5` Light Sky/Cyan), Success (`#16A34A`), Warning (`#F59E0B`), Danger (`#DC2626`), Background (`#F8FAFC`), Surface (`#FFFFFF`), Dark Surface (`#0F172A`), and Typography colors.
- **`spacing`**: Standard scale (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`).
- **`typography`**: `Fredoka` (`main`, `mainSemiBold`, `mainBold`) + `Poppins` (`secondary`, `secondaryMedium`, `secondarySemiBold`, `secondaryBold`) font families, sizes (`xs: 11` to `display: 36`), and weights.
- **`borderRadius`**: Radii scale (`sm: 6` to `full: 9999`).
- **`globalStyles`**: Shared `container`, `card`, and `center` style presets.

#### `mobile/src/types/`
TypeScript type definitions and entity models:
- Enums & unions: `UserRole` ('parent' | 'child'), `LockStatus` ('locked' | 'unlocked'), `ChoreStatus` ('pending' | 'awaiting_approval' | 'approved' | 'rejected').
- Interfaces: `Profile`, `Household`, `Device`, `Chore`.

#### `mobile/src/utils/`
Pure validation and formatting helpers:
- **`validation.ts`**: RFC 5322 email validation (`validateEmail`), 4-rule password entropy evaluation (`evaluatePasswordEntropy`), `formatTitleCase`, E.164 phone standardization (`formatE164Phone`), and calendar-validated age derivation (`calculateAgeFromDOB`).
- **`onboardingValidation.ts`**: Editable age range validation (`validateAgeInput`, 0–125) and full Step 1 submission validation (`validateStep1Submission`).

### 3.3 Core Architectural Guardrails

1. **Service Layer Isolation:**
   - Screens and UI components **must never** import `@supabase/supabase-js` or execute raw database queries directly.
   - All database communication must pass through functions defined in `src/services/` or reactive hooks in `src/hooks/`.
2. **Design Token Adherence:**
   - No hardcoded hex color codes or ad-hoc spacing values in components. All styles must reference tokens from `src/theme/`.
3. **Continuous Native Generation (CNG):**
   - The repository strictly follows CNG. No raw `android/` or `ios/` folders are committed.
   - All native permissions, splash screen configs, and package settings must be specified inside `app.json` or config plugins.
4. **Thread & Render Performance:**
   - Modules must remain under 200–250 lines.
   - Hoist `StyleSheet.create` definitions outside render cycles; zero dynamic style object generation inside `.map()`.
   - Never use `PanResponder`; use `react-native-gesture-handler` and `react-native-reanimated` for smooth 60/120 FPS UI execution.

---

## 4. `server/` Subsystem

The `server/` directory is an initialized backend tier reserved for scheduled tasks, background workers, and administrative server-side operations that cannot execute on client devices.

### 4.1 Current Status
- **Current State:** Initialized root directory, clean and ready for microservice scaffolding.
- **Runtime Environment:** Node.js / TypeScript containerized via Docker.

### 4.2 Prescribed Future Architecture & Directory Tree

```
server/
├── Dockerfile                         # Container definition for production deployment
├── docker-compose.yml                 # Local development orchestration
├── package.json                       # Server dependencies (Express/Fastify, node-cron, BullMQ)
├── tsconfig.json                      # Node.js TypeScript compilation target
├── .env.example                       # Template for service role keys and port configs
└── src/
    ├── index.ts                       # Server bootstrapper and healthcheck listener
    ├── config/                        # Environment parsing and Supabase service client setup
    │   └── env.ts                     # Validated environment configuration (SUPABASE_SERVICE_ROLE_KEY)
    ├── controllers/                   # Webhook endpoints (e.g., Supabase Database Webhooks)
    │   └── webhookController.ts
    ├── cron/                          # Scheduled cron trigger definitions
    │   └── choreSchedules.ts          # Daily/weekly chore generation & recurring schedules
    ├── workers/                       # Asynchronous background job processors
    │   └── choreResetWorker.ts        # Nightly reset of pending/rejected daily chores
    └── services/                      # Internal business logic and external integrations
        ├── notificationService.ts     # Firebase Cloud Messaging (FCM) / Apple Push Notifications (APNs)
        └── cleanupService.ts          # Purge expired proofs, stale devices, and orphaned records
```

### 4.3 Planned Responsibilities & Capabilities

1. **Scheduled Chore Resets & Recurring Routines:**
   - Execute midnight cron jobs that inspect recurring chores and reset their statuses back to `pending`.
   - Calculate streaks, distribute allowance points, and notify parents of overdue tasks.
2. **Push Notification Dispatch (FCM / APNs):**
   - Dispatch immediate native push notifications when:
     - A child submits a proof photo for parent approval (`awaiting_approval`).
     - A parent approves or rejects a chore (`approved` or `rejected`).
     - A child's device is locked or unlocked remotely.
3. **Automated Database Maintenance & Housekeeping:**
   - Prune unreferenced proof image URLs in cloud storage.
   - Monitor device heartbeat timeouts (`last_seen` in `public.devices`) and flag offline or tampered devices.
4. **Privileged Operations via Supabase Service Role:**
   - Execute administrative database updates bypassing RLS using the secure `SUPABASE_SERVICE_ROLE_KEY`, which must never be exposed to the `mobile/` client.

---

## 5. Cross-Layer Dependency Map & Interaction Matrix

### 5.1 End-to-End Architectural Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                MOBILE CLIENT                                    │
│                                                                                 │
│   ┌───────────────────────────┐         ┌───────────────────────────────────┐   │
│   │   Screens & UI Views      │ ──────► │       Context & Custom Hooks      │   │
│   │ (MyFamilyScreen,          │         │ (AuthContext, useChores,          │   │
│   │  ChildLockScreen, etc.)   │ ◄────── │  useDeviceLock, useAuth)          │   │
│   └───────────────────────────┘         └─────────────────┬─────────────────┘   │
│                                                           │                     │
│                                                           ▼                     │
│                                         ┌───────────────────────────────────┐   │
│                                         │          Service Layer            │   │
│                                         │ (choreService, authService, etc.) │   │
│                                         └─────────────────┬─────────────────┘   │
│                                                           │                     │
│                                                           ▼                     │
│                                         ┌───────────────────────────────────┐   │
│                                         │      Supabase Client (lib/)       │   │
│                                         │   (Anon Key + User Auth JWT)      │   │
│                                         └─────────────────┬─────────────────┘   │
└───────────────────────────────────────────────────────────┼─────────────────────┘
                                                            │
                            HTTPS REST / GraphQL            │  Realtime WebSocket (WSS)
                            (PostgREST Mutations & Queries) │  (chores & devices changes)
                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE POSTGRESQL                                │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                       Row Level Security (RLS)                          │   │
│   │    - Fail-closed trigger: enable_rls_on_new_tables                      │   │
│   │    - Auth-gated access policies on profiles, households, chores, devices │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                       Relational Tables & Triggers                      │   │
│   │    - public.profiles (Auth trigger: handle_new_user)                    │   │
│   │    - public.households (Family Circles & PIN pairing)                   │   │
│   │    - public.chores (Status: pending -> awaiting -> approved/rejected)   │   │
│   │    - public.devices (Lock status: locked / unlocked)                    │   │
│   └────────────────────────────────────▲────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────┴────────────────────────────────────┐   │
│   │                   Supabase Realtime Publication Engine                  │   │
│   │    - Broadcasts live row updates to connected mobile clients            │   │
│   └────────────────────────────────────▲────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │
                   Privileged Service Role (HTTPS) / Webhook Dispatch
                                         │
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                              SERVER SUBSYSTEM                                   │
│                                                                                 │
│   ┌───────────────────────────┐         ┌───────────────────────────────────┐   │
│   │     Webhook Receiver      │         │         Cron Schedulers           │   │
│   │   (Database mutations,    │         │ (Midnight reset, streak counter,  │   │
│   │    device heartbeats)     │         │  recurring task creator)          │   │
│   └─────────────┬─────────────┘         └─────────────────┬─────────────────┘   │
│                 │                                         │                     │
│                 ▼                                         ▼                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │               Background Workers & Notification Engine                  │   │
│   │    - Dispatches FCM / APNs Push Notifications                           │   │
│   │    - Executes automated database cleanup & hygiene                      │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Layer Interaction Matrix

| Source Layer | Target Layer | Protocol / Mechanism | Security & Auth Policy | Description |
| :--- | :--- | :--- | :--- | :--- |
| `mobile/src/screens` | `mobile/src/hooks` | React state & hooks invocation | In-memory React lifecycle | Screens consume reactive state without direct network dependencies. |
| `mobile/src/hooks` | `mobile/src/services` | Async TypeScript method calls | Internal module boundary | Hooks orchestrate data retrieval and state mutation through services. |
| `mobile/src/services` | `database` (Postgres) | HTTPS / PostgREST via Supabase JS | Supabase Anon Key + Authenticated User JWT | Performs CRUD on `profiles`, `households`, `chores`, and `devices`. |
| `database` | `mobile/src/hooks` | WebSocket (WSS) via Supabase Realtime | Supabase Realtime channel subscription | Instantly pushes updates when chores are approved or device lock states change. |
| `server/cron` | `database` (Postgres) | HTTPS / PostgREST via Supabase JS | `SUPABASE_SERVICE_ROLE_KEY` (Full Admin) | Resets daily chores, archives outdated items, and cleans orphaned proof images. |
| `server/workers` | External Push Providers (FCM/APNs) | HTTPS (Google/Apple Push APIs) | Service account credentials | Delivers instant alerts to parents and children regarding chore status changes. |

---

## 6. Status & Tracking Checklist

This tracking register is audited by the **Chief of Staff** and **QA** subagents during continuous integration and feature development.

| Subsystem / Layer | Component / Area | Status | Active Files | Audit & Compliance Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`database/`** | Core Schema & Tables | Complete / Active | `database/schema.sql` | `profiles`, `households`, `devices`, `chores` specified with PK/FK and `handle_new_user` trigger. |
| **`database/`** | Security & RLS | In Progress | `database/schema.sql`, `database/queryAdd.sql` | Automatic fail-closed trigger active; `profiles` self-scoped and `households` member-scoped with `SECURITY DEFINER` TTL RPCs; `chores`/`devices` multi-tenant hardening pending. |
| **`database/`** | Realtime Sync | Complete / Active | `database/schema.sql` | `chores` and `devices` tables published to `supabase_realtime`. |
| **`database/`** | Migrations & Seeds | Planned | `database/migrations/` (to be created) | Target convention: timestamped migrations and test seed fixtures. |
| **`mobile/`** | App Entry & Config | Complete / Active | `App.tsx`, `app.json`, `index.ts` | Configured for Expo SDK 58 (`expo-font`, `@react-native-community/datetimepicker`) and CNG. |
| **`mobile/`** | Design Tokens & Theme | Complete / Active | `src/theme/index.ts` | Global colors (`#1B365D`, `#60C1E5`, `#0F172A`), `Fredoka`/`Poppins` typography, spacing, and `globalStyles`. |
| **`mobile/`** | Service Layer | Complete / Active | `src/services/*.ts` | All Supabase queries isolated across 4 dedicated service files. |
| **`mobile/`** | State & Hooks | Complete / Active | `src/context/`, `src/hooks/` | `AuthContext`, `useAuth`, `useChores` (optimistic creation + Realtime), `useHouseholdMembers`, and `useDeviceLock` active. |
| **`mobile/`** | UI Screens | In Progress / Active | `src/screens/*.tsx` | `AppLoader`, `Auth`, `Login`, `Onboarding`, `Home`, `MyFamily`, and `Settings` active; `ChildLockScreen` is a UI scaffold pending camera/overlay wiring. |
| **`mobile/`** | UI Components | Complete / Active | `src/components/` | Shared primitives, `family/` chore creation/table components, and `onboarding/` (including `DobWheelPicker` & `WheelColumn`) active. |
| **`server/`** | Root & Scaffolding | Initialized | `server/` | Directory initialized; awaiting worker, cron, and Docker scaffolding. |
| **`server/`** | Scheduled Reset Worker| Planned | `server/src/workers/` | Planned for automated chore resets and streak calculation. |
| **`server/`** | Push Notifications | Planned | `server/src/services/` | Planned for FCM / APNs integration. |

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
└── schema.sql                # Complete schema definition, fail-closed triggers, RLS, and Realtime pub
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
   - `pairing_pin`: `VARCHAR(6) NOT NULL UNIQUE` (6-digit alphanumeric or numeric code used by children to pair into a household)
   - `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

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

#### Realtime Publications
Supabase Realtime WebSocket synchronization is activated on:
- `alter publication supabase_realtime add table public.chores;`
- `alter publication supabase_realtime add table public.devices;`

#### Row Level Security (RLS) Policies
- `profiles`:
  - `Allow users to read their own profile`: `auth.uid() = id`
  - `Allow users to update their own profile`: `auth.uid() = id`
- `households`:
  - `Allow authenticated users to read households`: `to authenticated using (true)`
  - `Allow authenticated users to create households`: `to authenticated with check (true)`
- `chores`:
  - `Allow users to read household chores`: `to authenticated using (true)`
  - `Allow users to insert chores`: `to authenticated with check (true)`
  - `Allow users to update chores`: `to authenticated using (true)`
- `devices`:
  - `Allow authenticated users to read devices`: `to authenticated using (true)`
  - `Allow authenticated users to update devices`: `to authenticated using (true)`
  - `Allow authenticated users to register devices`: `to authenticated with check (true)`

### 2.3 Migration & Seeding Conventions
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
│   ├── favicon.png                          # Web favicon
│   ├── icon.png                             # Universal app icon (1024x1024)
│   └── splash-icon.png                      # Native splash screen logo
├── src/
│   ├── components/                          # Presentational, reusable atomic UI components
│   │   ├── Button.tsx                       # Themed interactive button (variants: primary, secondary, danger)
│   │   ├── Card.tsx                         # Elevated container component with theme border/shadow
│   │   └── index.ts                         # Component re-export barrel
│   ├── context/                             # Scoped application state providers
│   │   └── AuthContext.tsx                  # Global Supabase authentication and profile provider
│   ├── hooks/                               # Custom hooks encapsulating state & realtime subscriptions
│   │   ├── useAuth.ts                       # Convenient hook exposing auth session, role flags, and profile
│   │   ├── useChores.ts                     # Realtime reactive hook synchronizing chores for a household
│   │   └── useDeviceLock.ts                 # Realtime hook tracking hardware device lock status
│   ├── lib/                                 # External SDK initialization & platform shims
│   │   └── supabase.ts                      # Supabase client singleton with AsyncStorage persistence
│   ├── screens/                             # Screen views and application route containers
│   │   ├── AuthScreen.tsx                   # User login and registration screen
│   │   ├── ChildLockScreen.tsx              # Child kiosk / locked state enforcement and task proof screen
│   │   ├── ParentDashboard.tsx              # Parent chore management, child approval, and device control
│   │   └── RoleScreen.tsx                   # Role selection (Parent vs. Child) and Household pairing flow
│   ├── services/                            # Pure API and database communication layer (Supabase SDK)
│   │   ├── authService.ts                   # Auth signup, signin, signout, and profile retrieval
│   │   ├── choreService.ts                  # Chore creation, listing, proof submission, approval, rejection
│   │   ├── deviceService.ts                 # Device registration, status updates, and lookup
│   │   └── householdService.ts              # Household creation, PIN generation, and household joining
│   ├── theme/                               # Design system single source of truth
│   │   └── index.ts                         # Color palette, spacing scales, typography, and shadow tokens
│   └── types/                               # TypeScript domain models and interfaces
│       └── index.ts                         # UserRole, LockStatus, ChoreStatus, Profile, Household, Device, Chore
├── .env.local                               # Local environment variables (EXPO_PUBLIC_SUPABASE_URL, etc.)
├── .gitignore                               # Git ignore list (ignores node_modules, .expo, android/, ios/)
├── AGENTS.md                                # Mobile-specific developer guardrails and rules
├── App.tsx                                  # Top-level application component and screen switcher preview
├── app.json                                 # Expo project configuration and CNG plugin specifications
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

#### `mobile/src/components/`
Atomic, reusable UI building blocks:
- **`Button.tsx`**: Encapsulates accessibility guidelines (minimum 48dp touch target), loading spinners, and visual variants (`primary`, `secondary`, `accent`, `danger`, `outline`).
- **`Card.tsx`**: Uniform container providing standard border radius, surface color, and shadows.
- **`index.ts`**: Re-exports all shared components for clean modular imports.

#### `mobile/src/context/`
Application-wide React Context providers:
- **`AuthContext.tsx`**: Manages the current `Session`, `User`, and `Profile`. Subscribes to Supabase `onAuthStateChange` and hydrates profile data on mount. Provides `signOut` and `refreshProfile` utilities.

#### `mobile/src/hooks/`
Encapsulates reactive logic, hooks, and WebSocket subscriptions:
- **`useAuth.ts`**: Helper exposing `user`, `profile`, `isParent`, `isChild`, and `isAuthenticated`.
- **`useChores.ts`**: Fetches chores for a given `householdId` and subscribes to Postgres changes on `public.chores` via Supabase Realtime channels.
- **`useDeviceLock.ts`**: Tracks the lock state of a child's registered device in realtime via `public:devices:child:{childId}`.

#### `mobile/src/lib/`
Configuration for external libraries and platforms:
- **`supabase.ts`**: Initializes the Supabase client (`createClient`) configured with `@react-native-async-storage/async-storage` for auth session persistence and `react-native-url-polyfill`.

#### `mobile/src/screens/`
Screen-level views coordinating business hooks and presentational components:
- **`AuthScreen.tsx`**: Handles login and sign-up with email and password, full name, phone number, and role selection.
- **`RoleScreen.tsx`**: Guides new users through creating a family circle or joining via a 6-digit household PIN.
- **`ParentDashboard.tsx`**: Displays household chores categorized by status (`pending`, `awaiting_approval`, `approved`), provides quick-action approval/rejection triggers, and remote device lock controls.
- **`ChildLockScreen.tsx`**: Visual child lock enforcement mode. Displays lock status, assigned chores, and proof submission actions.

#### `mobile/src/services/`
The pure database and network communication layer:
- **`authService.ts`**: Isolated Supabase Auth calls (`signUp`, `signInWithPassword`, `signOut`, `getCurrentProfile`).
- **`choreService.ts`**: CRUD operations for chores (`getHouseholdChores`, `createChore`, `submitChoreProof`, `approveChore`, `rejectChore`).
- **`deviceService.ts`**: Hardware lock registry operations (`registerDevice`, `updateLockStatus`, `getDeviceByChildId`).
- **`householdService.ts`**: Circle management (`createHousehold`, `joinHouseholdWithPin`, `getHouseholdMembers`).

#### `mobile/src/theme/`
The single source of truth for all styling:
- **`colors`**: Primary (`#0284C7`), Primary Dark (`#0369A1`), Accent (`#FF6B4A`), Success (`#16A34A`), Warning (`#F59E0B`), Danger (`#DC2626`), Surface, and Typography colors.
- **`spacing`**: Standard scale (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 40`).
- **`typography`**: Standard sizes (`xs: 12` to `xxxl: 32`) and font weights.
- **`borderRadius`**: Radii scale (`sm: 6` to `full: 9999`).
- **`shadows`**: Cross-platform elevation tokens (`sm`, `md`, `lg`).

#### `mobile/src/types/`
TypeScript type definitions and entity models:
- Enums & unions: `UserRole` ('parent' | 'child'), `LockStatus` ('locked' | 'unlocked'), `ChoreStatus` ('pending' | 'awaiting_approval' | 'approved' | 'rejected').
- Interfaces: `Profile`, `Household`, `Device`, `Chore`.

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
│   │ (ParentDashboard,         │         │ (AuthContext, useChores,          │   │
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
| **`database/`** | Core Schema & Tables | Complete / Active | `database/schema.sql` | `profiles`, `households`, `devices`, `chores` fully specified with PK/FK. |
| **`database/`** | Security & RLS | Complete / Active | `database/schema.sql` | Automatic fail-closed trigger configured; base policies active on all tables. |
| **`database/`** | Realtime Sync | Complete / Active | `database/schema.sql` | `chores` and `devices` tables published to `supabase_realtime`. |
| **`database/`** | Migrations & Seeds | Planned | `database/migrations/` (to be created) | Target convention: timestamped migrations and test seed fixtures. |
| **`mobile/`** | App Entry & Config | Complete / Active | `App.tsx`, `app.json`, `index.ts` | Configured for Expo SDK 58 and Continuous Native Generation (CNG). |
| **`mobile/`** | Design Tokens & Theme | Complete / Active | `src/theme/index.ts` | Global colors, typography, spacing, and shadows established. |
| **`mobile/`** | Service Layer | Complete / Active | `src/services/*.ts` | All Supabase queries isolated across 4 dedicated service files. |
| **`mobile/`** | State & Hooks | Complete / Active | `src/context/`, `src/hooks/` | Realtime sync hooks for chores and device lock active. |
| **`mobile/`** | UI Screens | Complete / Active | `src/screens/*.ts` | Auth, Role, ParentDashboard, and ChildLock screens active. |
| **`mobile/`** | UI Components | Complete / Active | `src/components/*.tsx` | Shared `Button` and `Card` components adhering to design tokens. |
| **`server/`** | Root & Scaffolding | Initialized | `server/` | Directory initialized; awaiting worker, cron, and Docker scaffolding. |
| **`server/`** | Scheduled Reset Worker| Planned | `server/src/workers/` | Planned for automated chore resets and streak calculation. |
| **`server/`** | Push Notifications | Planned | `server/src/services/` | Planned for FCM / APNs integration. |

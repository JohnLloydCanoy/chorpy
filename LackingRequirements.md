# CHORPY — System Audit, Lacking Requirements & Engineering Improvement Blueprint

**Audit Date:** November 22, 2026  
**Repository Scope:** `mobile/src/` (73 files), `mobile/App.tsx` (74 total scanned source files), `mobile/package.json`, `mobile/app.json`, `database/schema.sql`, `database/queryAdd.sql`, `server/`  
**Audited MVP Completion:** 45.00% (Weighted across FR-1.1 through FR-6.4, Database/RLS, and Native Android CNG)  
**Governance Compliance:** Strict TypeScript (`tsc --noEmit`: 0 errors), Standards Audit (`audit-rn-standards.js`: 0 errors, 0 warnings across 74 files, Pure CNG), Expo ESLint (`npx expo lint`: 0 errors).

---

## 1. Executive Summary

As of November 22, 2026, Chorpy has completed **45.00%** of its Academic Capstone Defense MVP specification (up from 37.00% on November 13, 2026). The repository implements a two-step authentication and onboarding pipeline, server-authoritative 30-minute TTL household PIN pairing with expired-PIN reclamation, 100% fail-closed multi-tenant Row Level Security (RLS) across all four PostgreSQL tables (`households`, `profiles`, `chores`, `devices`), an interactive Day/Week/Month calendar scheduling engine (`react-native-big-calendar`), a 3-mode full-screen chore sheet (`create`, `edit`, read-only `view`) with optimistic mutations and rollback, a database trigger (`on_chore_synced_immediate_lock`) that automatically locks a child's `public.devices` record upon `'immediate'` chore assignment or update, an in-app notification center (`NotificationContext.tsx`, `NotificationDropdown.tsx`), a live Realtime household roster (`FamilyMembersList.tsx`, `InviteFamilyModal.tsx`), and authenticated profile editing (`ProfileHeaderCard.tsx`, `EditProfileModal.tsx`).

However, **55.00% of the weighted system specification remains unimplemented**, concentrated in physical hardware enforcement, camera proof capture, parent proof approval UI, multi-guardian federation, and life-safety subsystems:

1. **Operational Subsystems (End-to-End Verified Today):**
   - Email/password registration, dynamic age derivation from DOB, `< 18` role gating, E.164 phone formatting, and password entropy validation (`OnboardingScreen.tsx`, `validation.ts`, `onboardingValidation.ts`).
   - Household creation and 6-digit PIN joining with 30-minute server-side TTL, clock-skew-safe countdowns, and parent-only regeneration (`householdService.ts`, `useHouseholdPin.ts`, `HouseholdPinCard.tsx`, `InviteFamilyModal.tsx`).
   - Parent chore creation and editing with `scheduled_at`, `lock_at`, and `lock_mode` presets (`'immediate' | 'offset_30m' | 'offset_1h' | 'offset_2h' | 'custom'`), rendered across Day/Week/Month calendar views (`HomeScreen.tsx`, `ChoreCalendarView.tsx`, `CalendarGridSurface.tsx`) and virtualized tables (`MyFamilyScreen.tsx`, `ChoreTable.tsx`, `ChoreRow.tsx`), plus read-only inspection for children (`ChoreDetailReadOnlyBody.tsx`).
   - Real-time synchronization of `profiles`, `chores`, and `devices` via Supabase Realtime WebSockets, backed by fail-closed RLS (`get_my_household_id()`, `get_my_role()`, `enforce_chore_update_guard()`).

2. **Remaining Blockers for Live Capstone Defense Readiness:**
   - **No Photo Proof Capture or Storage Upload (FR-4.3, FR-4.4, FR-4.5):** `expo-camera` and `expo-image-manipulator` are not installed; Supabase Storage bucket `chore-proofs` is not provisioned; children have no UI control in `ChoreDetailReadOnlyBody.tsx` to capture a photo and invoke `choreService.submitChoreProof()`.
   - **No Parent Proof Review UI (FR-2.5, FR-5.3, FR-5.4):** `choreService.approveChore()` and `choreService.rejectChore()` exist in `mobile/src/services/choreService.ts`, but no UI renders the uploaded `proof_image_url` or exposes Approve/Reject buttons to parents.
   - **No Active Lock Screen or Native Android Overlay (FR-3.3, FR-3.4, FR-3.5, FR-5.1, FR-5.2, FR-5.5):** The static `ChildLockScreen.tsx` scaffold was removed, `useDeviceLock.ts` is not consumed by any active screen, `deviceService.registerDevice()` is never called during child onboarding, and no custom Expo config plugin exists to inflate a native Android `SYSTEM_ALERT_WINDOW` (`WindowManager`) overlay.
   - **No Emergency SOS or Geofencing (FR-6.1, FR-6.2, FR-6.3, FR-6.4):** `expo-location` is not installed; no `EmergencySOSButton.tsx` (`tel:911` intent + panic WebSocket broadcast) or Haversine distance verification exists.

---

## 2. Remaining Lacking Requirements (Comprehensive Gap Matrix)

### 2.1 Functional Requirements Gaps (FR-1.x through FR-6.x)

#### FR-1.x: Account Onboarding & Role Selection (Current Score: 92.0%)

| Requirement ID | Requirement Title | Status | Concrete Codebase / Database Gap |
| :--- | :--- | :---: | :--- |
| **FR-1.2.2** | Role Immutability & Hardware Binding | `[PARTIALLY IMPLEMENTED]` | `authService.updateProfile()` excludes `role` and `household_id` from client updates, and `enforce_chore_update_guard()` protects chores, but `public.profiles` RLS policy `"Allow users to update their own profile"` (`using (auth.uid() = id)`) lacks a `BEFORE UPDATE` trigger on `public.profiles` to block direct PostgREST mutations to `role`, `email`, or `household_id`. Physical hardware binding in `public.devices` is not triggered during onboarding. |
| **FR-1.3.1** | Multi-Stage Lifecycle Routing | `[PARTIALLY IMPLEMENTED]` | `mobile/App.tsx` routes between `AppLoaderScreen`, `AuthScreen`, and the 3-tab authenticated shell (`HomeScreen`, `MyFamilyScreen`, `SettingsScreen`). However, authenticated users with `profile.household_id === null` are not automatically intercepted and routed to a standalone post-login household pairing screen; child accounts with incomplete permissions are not routed to `PermissionHandshakeScreen.tsx`; and child accounts with `lock_status === 'locked'` are not routed into an active enforcement lock screen. |
| **FR-1.3.2** | Fail-Closed Offline Enforcement & Anti-Evasion Guard | `[NOT STARTED]` | `useDeviceLock.ts` holds `lockStatus` in volatile React state only. It does not persist `lock_status` or pending chore IDs to `AsyncStorage` (`FR-1.3.2.1`), does not engage a fail-closed lock on offline boot (`FR-1.3.2.2`), has no native Android `BOOT_COMPLETED` broadcast receiver (`FR-1.3.2.3`), and has no `@react-native-community/netinfo` recovery handshake (`FR-1.3.2.4`). |
| **FR-1.5.2** | Circle Federation Pathway (Secondary Adult) | `[NOT STARTED]` | `JoinCircleScreen.tsx` does not exist. Secondary adults can enter a 6-digit PIN in `OnboardingJoinPin.tsx`, but cannot scan a QR code or select a secondary guardian tier (`co_parent`, `caregiver`). |
| **FR-1.5.3** | Child Node Pathway Restriction | `[PARTIALLY IMPLEMENTED]` | In `OnboardingScreen.tsx` (lines 115–121), when `step1Data.role === 'child'`, Step 2 still renders `OnboardingFamilyFork.tsx` allowing the child to tap *"No, I don't have a family"* and reach `OnboardingCreateHousehold.tsx`, where submission fails with the database RPC exception `'Only parent accounts can create a household.'`. Children must bypass `OnboardingFamilyFork` and route directly to `OnboardingJoinPin`. |

#### FR-2.x: Family Circle Management, Multi-Guardian Pairing & RBAC (Current Score: 62.0%)

| Requirement ID | Requirement Title | Status | Concrete Codebase / Database Gap |
| :--- | :--- | :---: | :--- |
| **FR-2.1.1** | Dual-PIN Architecture Generation | `[PARTIALLY IMPLEMENTED]` | `public.households` in `database/schema.sql` only defines a single `pairing_pin varchar(6) unique` with `pin_expires_at`. It lacks a separate `guardian_pin varchar(6) unique` (and `guardian_pin_expires_at`) to distinguish child device pairing from secondary guardian (`co_parent` / `caregiver`) invitations. |
| **FR-2.1.2** | Instant Admin Binding & Zero-Friction Routing | `[PARTIALLY IMPLEMENTED]` | `OnboardingCreateHousehold.tsx` collects `numChildren` and `numCoParents` steppers, and `OnboardingScreen.tsx` passes `{ numChildren, numCoParents }` to `householdService.createHousehold()`, but `householdService.ts` (line 34) prefixes `_metadata` as unused and `create_household_with_pin(p_name text)` does not persist those columns. |
| **FR-2.2.1** | Child-Friendly PIN Entry UX & QR Scanner | `[PARTIALLY IMPLEMENTED]` | `OnboardingJoinPin.tsx` provides a single 6-digit numeric `TextInput`, not 6 discrete auto-advancing digit boxes, does not auto-submit on the 6th digit, and lacks a 1-tap QR code scanner. |
| **FR-2.2.2** | Rate-Limited Validation & Anti-Guessing Guard | `[NOT STARTED]` | Neither `OnboardingJoinPin.tsx` nor `public.verify_household_pin(p_pin text)` / `public.join_household_with_pin(p_pin text)` tracks failed PIN attempts or enforces the mandatory 5-attempt / 60-second lockout cooldown. |
| **FR-2.2.3** | Hardware Fingerprint & Telemetry Ingestion | `[PARTIALLY IMPLEMENTED]` | `deviceService.registerDevice(childId, deviceName)` exists in `mobile/src/services/deviceService.ts` (lines 6–20), and RLS policy `"Allow child to register own device"` exists in `database/schema.sql` (lines 670–673), but `registerDevice` is never called anywhere in `mobile/src/`. `expo-device` / `expo-application` are not installed to capture manufacturer, model, OS version, and installation ID. |
| **FR-2.2.4** | Automated Transition to Permissions Wizard | `[NOT STARTED]` | After `joinHouseholdWithPin` succeeds in `OnboardingScreen.tsx`, the user is dropped into `HomeScreen.tsx` rather than a celebratory Chorpy welcome view followed by `PermissionHandshakeScreen.tsx`. |
| **FR-2.3.1 - FR-2.3.4** | Multi-Guardian Household Federation & QR Onboarding | `[NOT STARTED]` | No QR code generator exists in `InviteFamilyModal.tsx` or `HouseholdPinCard.tsx`; no native share-sheet integration (`Share.share()`) is wired; no QR camera scanner exists; no relationship selector (`"Co-Parent"`, `"Grandparent"`, `"Caregiver/Nanny"`) or join toast banner exists. |
| **FR-2.4.1 - FR-2.4.4** | Four-Tier Role-Based Access Control (RBAC) | `[PARTIALLY IMPLEMENTED]` | `public.profiles.role` check constraint (`role in ('parent', 'child')`) and `UserRole` in `mobile/src/types/index.ts` (`'parent' | 'child'`) only support 2 tiers instead of the specified 4 tiers (`'parent' | 'co_parent' | 'caregiver' | 'child'`). Additionally, `public.households` has no `owner_id uuid references public.profiles(id)` column to distinguish the Primary Parent (Circle Owner) from a secondary `'parent'` / `'co_parent'`. |
| **FR-2.5.1 - FR-2.5.4** | Real-Time Collaborative Approval Synchronization | `[PARTIALLY IMPLEMENTED]` | `useChores.ts` syncs `public.chores` row changes over WebSockets, and `choreService.approveChore()` / `rejectChore()` exist, but there is no guardian proof review UI, no `approved_by_id` or `created_by_id` column in `public.chores`, no reviewer attribution toast (*"Approved by Dad"*), no optimistic concurrency collision lockout badge, and `approveChore()` does not automatically look up or unlock the child's `public.devices` rows in an atomic database trigger when all pending/rejected chores are cleared. |
| **FR-2.6.1 - FR-2.6.4** | Live Circle Telemetry Roster & Remote Controls | `[PARTIALLY IMPLEMENTED]` | `FamilyMembersList.tsx` renders member names, emails, and role badges in real time via `useHouseholdMembers.ts`, and `HouseholdPinCard.tsx` / `InviteFamilyModal.tsx` fetch the real household name via `useHouseholdPin.ts`. However: (1) `MyFamilyScreen.tsx` line 109 hardcodes `<Text style={styles.subgreeting} numberOfLines={1}>Canoy Family Circle</Text>` instead of binding `activeHousehold?.name`; (2) no child device health cards display lock status, hardware model, battery percentage, or `last_seen` heartbeat; and (3) no 1-tap emergency remote override controls (*"Force Unlock for 30 Mins"* / *"Instant Emergency Lock"*) exist. |

#### FR-3.x: Device Permissions & System Handshake (Current Score: 0.0%)

| Requirement ID | Requirement Title | Status | Concrete Codebase / Database Gap |
| :--- | :--- | :---: | :--- |
| **FR-3.1.1 - FR-3.1.2** | Camera & Media Storage Runtime Handshake | `[NOT STARTED]` | `expo-camera` and `expo-media-library` are not installed in `mobile/package.json`. `PermissionHandshakeScreen.tsx` and `Linking.openSettings()` fallback do not exist. |
| **FR-3.2.1 - FR-3.2.2** | Geolocation & Presence Verification Permissions | `[NOT STARTED]` | `expo-location` is not installed in `mobile/package.json`. No foreground location permission prompt or passive telemetry disclosure exists. |
| **FR-3.3.1 - FR-3.3.2** | Android `SYSTEM_ALERT_WINDOW` Overlay Inspection | `[NOT STARTED]` | No native module or config plugin queries `Settings.canDrawOverlays(context)` or re-evaluates overlay permission on `AppState` `'active'` transitions. |
| **FR-3.4.1 - FR-3.4.2** | Automated Android Special App Access Deep-Linking | `[NOT STARTED]` | No intent launcher dispatches `android.settings.action.MANAGE_OVERLAY_PERMISSION` with `package:com.chorpy.app`. |
| **FR-3.5.1 - FR-3.5.2** | Fail-Closed Hardware Gateway & Anti-Revocation Guard | `[NOT STARTED]` | No router gate in `mobile/App.tsx` blocks child access when Camera, Location, or Overlay permissions are missing or revoked. |

#### FR-4.x: Chore Creation & Task Management (Current Score: 68.0%)

| Requirement ID | Requirement Title | Status | Concrete Codebase / Database Gap |
| :--- | :--- | :---: | :--- |
| **FR-4.3** | Embedded Camera Viewfinder | `[NOT STARTED]` | `ChoreDetailReadOnlyBody.tsx` displays chore instructions and lock timing to the child, but provides no camera trigger or embedded `expo-camera` viewfinder to capture photo proof. |
| **FR-4.4** | Image Compression & Storage Upload | `[NOT STARTED]` | `expo-image-manipulator` is not installed; no client image compression pipeline ($\le 1.2\text{ MB}$, $1080\times 1920\text{ px}$ `.jpg`) exists; no upload service method exists to push blobs/arraybuffers to Supabase Storage bucket `chore-proofs`. |
| **FR-4.5** | Automatic Status Transition to `awaiting_approval` | `[PARTIALLY IMPLEMENTED]` | `choreService.submitChoreProof(choreId, proofImageUrl)` (lines 83–97 of `choreService.ts`) and RLS policy `"Allow assigned child to submit chore proof"` (`schema.sql` lines 603–618) are implemented, but no UI component invokes `submitChoreProof()`. |
| **FR-4.6.1 - FR-4.6.4** | Collaborative Chore Deduplication & Concurrency Guard | `[NOT STARTED]` | `AddChorePageContent.tsx` does not perform fuzzy text matching (Levenshtein / normalized token overlap) against active `'pending'` or `'awaiting_approval'` chores for the selected child, does not display a conflict resolution modal (*View Existing*, *Merge Requirements*, *Create Separate*), does not support single-proof merged tasks, and does not display an aggregate multi-task queue progress counter (*"1 of 2 Chores Completed"*). |

#### FR-5.x: Hardware Device Enforcement & Verification Release (Current Score: 20.0%)

| Requirement ID | Requirement Title | Status | Concrete Codebase / Database Gap |
| :--- | :--- | :---: | :--- |
| **FR-5.1.1 - FR-5.1.2** | Hardware Screen Hijack & System Overlay Inflation | `[PARTIALLY IMPLEMENTED]` | The database trigger `on_chore_synced_immediate_lock` (`sync_immediate_chore_device_lock()`) sets `public.devices.lock_status = 'locked'` immediately on `'immediate'` chore assignment, and `useDeviceLock.ts` subscribes to `public.devices` updates. However: (1) delayed lock modes (`offset_30m`, `offset_1h`, `offset_2h`, `custom`) have no cron worker or client timer to flip `lock_status = 'locked'` when `lock_at <= now()`; (2) `useDeviceLock.ts` is not wired into `mobile/App.tsx` or any screen; and (3) no Android Foreground Service or `WindowManager` (`TYPE_APPLICATION_OVERLAY`, `FLAG_NOT_TOUCH_MODAL`, `FLAG_FULLSCREEN`) native module exists. |
| **FR-5.2.1 - FR-5.2.2** | Navigation Trapping & System UI Suppression | `[NOT STARTED]` | No native Android key interceptor (`KEYCODE_BACK`, `KEYCODE_APP_SWITCH`) or immersive sticky kiosk flags (`SYSTEM_UI_FLAG_IMMERSIVE_STICKY`, `SYSTEM_UI_FLAG_HIDE_NAVIGATION`) are implemented. Note that `SettingsScreen.tsx` lines 98–99 currently display a hardcoded static label `"Hardware Overlay: SYSTEM_ALERT_WINDOW Active"` instead of querying real overlay permission state. |
| **FR-5.3.1 - FR-5.3.2** | Real-Time Proof Ingestion & Verification Telemetry | `[PARTIALLY IMPLEMENTED]` | `useChores.ts` receives real-time updates when a chore transitions to `'awaiting_approval'`, and `ChoreRow.tsx` / `ChoreCalendarView.tsx` render the `"In Review"` badge. However, `AddChorePageContent.tsx` (in parent `edit` mode) does not render the uploaded `proof_image_url` card, submission timestamp, device name, or geofence presence badge. |
| **FR-5.4.1 - FR-5.4.2** | Collaborative Decision Matrix & Remediation Loop | `[PARTIALLY IMPLEMENTED]` | `choreService.approveChore()` and `choreService.rejectChore()` exist, but: (1) `rejectChore()` reverts `status` to `'pending'` instead of setting `status = 'rejected'` with a `rejection_reason` column; (2) no parent UI exposes *"Approve Task"* or *"Reject Task"* with a rejection reason prompt; and (3) no database trigger automatically sets `public.devices.lock_status = 'unlocked'` when a child has zero remaining `'pending'` or `'rejected'` chores whose `lock_at <= now()`. |
| **FR-5.5.1 - FR-5.5.2** | Hardware Dissolution & Sub-Second Unlock Handshake | `[PARTIALLY IMPLEMENTED]` | `useDeviceLock.ts` listens for `lock_status = 'unlocked'`, but no native `WindowManager.removeView()` bridge, celebratory Chorpy confetti unlock modal, or `DigitalWellbeingCompanionView.tsx` exists. |

#### FR-6.x: Household Geolocation, Geofencing & Life-Safety SOS (Current Score: 0.0%)

| Requirement ID | Requirement Title | Status | Concrete Codebase / Database Gap |
| :--- | :--- | :---: | :--- |
| **FR-6.1.1 - FR-6.1.3** | Emergency SOS & Life-Safety Call Bypass | `[NOT STARTED]` | `EmergencySOSButton.tsx` does not exist. No `Linking.openURL('tel:911')` or parent speed-dial bottom sheet is available during lock enforcement. (`SettingsScreen.tsx` line 103 displays a static text label `"Emergency SOS: Accessible (911 / Guardian)"`, not an interactive dialer). |
| **FR-6.2.1 - FR-6.2.3** | Real-Time Panic Telemetry & GPS Broadcast | `[NOT STARTED]` | No high-accuracy GPS sampling (`Location.Accuracy.Highest`), no Supabase Realtime broadcast channel `household:{household_id}:alerts`, and no audible `EmergencyAlertModal.tsx` on parent dashboards. |
| **FR-6.3.1 - FR-6.3.2** | Household Presence & Geofenced Chore Verification | `[NOT STARTED]` | `public.households` lacks `latitude`, `longitude`, and `geofence_radius_meters`; `public.chores` lacks `submission_lat`, `submission_lng`, and `is_within_geofence`; no Haversine distance utility exists in `mobile/src/utils/`. |
| **FR-6.4.1 - FR-6.4.2** | Passive Family Circle Telemetry & Interactive Map View | `[NOT STARTED]` | `HomeHeaderActions.tsx` (lines 122–130) renders the `FoldedMapIcon` button, but neither `HomeScreen.tsx` nor `MyFamilyScreen.tsx` passes an `onPressLocation` handler. `FamilyMapView.tsx` and passive geofence/battery telemetry do not exist. |

---

### 2.2 Non-Functional Requirements Gaps (NFR-1.1 through NFR-6.3)

| NFR ID | Specification Benchmark | Status | Audit Finding & Gap |
| :--- | :--- | :---: | :--- |
| **NFR-1.1** | Sub-Second WebSocket Propagation ($< 500\text{ ms}$) | `[PARTIALLY IMPLEMENTED]` | `public.profiles`, `public.chores`, and `public.devices` are published to `supabase_realtime`. However, `useChores.ts` (line 105) and `useHouseholdMembers.ts` (line 108) perform a full HTTP `SELECT *` re-fetch on every WebSocket event instead of applying the `payload.new` / `payload.old` delta in memory, adding an extra PostgREST round-trip ($100\text{--}300\text{ ms}$) to every Realtime update. |
| **NFR-1.2** | Client-Side Image Optimization ($\le 1.2\text{ MB}$, $1080\times 1920$, $< 2.5\text{ s}$) | `[NOT STARTED]` | Camera capture and `expo-image-manipulator` compression pipeline are not yet implemented. |
| **NFR-1.3** | Database Query SLA ($< 150\text{ ms}$) | `[IMPLEMENTED]` | Composite indexes `idx_households_active_pin`, `idx_chores_household_scheduled`, and `idx_chores_pending_lock_at` are active in `database/schema.sql`. Adding an index on `public.profiles(household_id)` and `public.devices(child_id)` is recommended as household sizes scale. |
| **NFR-2.1** | Instantaneous Emergency Dialing SLA ($< 100\text{ ms}$) | `[NOT STARTED]` | `EmergencySOSButton.tsx` and synchronous `Linking.openURL('tel:911')` are not implemented. |
| **NFR-2.2** | Life-Safety Telemetry Priority & Persistent Retry Queue | `[NOT STARTED]` | Panic WebSocket channel `household:{household_id}:alerts` and offline retry queue are not implemented. |
| **NFR-3.1** | Multi-Tenant Row-Level Boundary Isolation (100% RLS) | `[IMPLEMENTED]` | All 4 tables (`households`, `profiles`, `chores`, `devices`) have fail-closed RLS enabled, `auto_enable_rls` DDL trigger active, and strict `household_id = public.get_my_household_id()` boundary isolation enforced. |
| **NFR-3.2** | Transport & Storage Cryptography | `[PARTIALLY IMPLEMENTED]` | All Supabase Cloud REST/WebSocket traffic uses TLS 1.3 (HTTPS/WSS). However, mobile auth tokens in `mobile/src/lib/supabase.ts` use unencrypted `@react-native-async-storage/async-storage` rather than hardware-backed `expo-secure-store` (Android Keystore / iOS Keychain). |
| **NFR-3.3** | System Clock Tampering Resistance | `[PARTIALLY IMPLEMENTED]` | Household PIN TTL (`useHouseholdPin.ts`) calculates `serverOffsetMs = Date.parse(server_now) - Date.now()` from `get_my_household()` to resist device clock tampering. However, chore schedule evaluation (`ChoreDetailReadOnlyBody.tsx` line 37: `lockDate.getTime() <= Date.now()`) and `notificationUtils.ts` still rely on uncalibrated local `Date.now()`. |
| **NFR-3.4** | Brute-Force Rate Limiting (5 attempts / 60s lockout) | `[NOT STARTED]` | No client-side or PostgreSQL rate limiting exists on `verify_household_pin` or `join_household_with_pin`. |
| **NFR-4.1** | Boot-Time Overlay Restoration SLA ($\le 3\text{ s}$) | `[NOT STARTED]` | Native Android `BOOT_COMPLETED` broadcast receiver is not implemented. |
| **NFR-4.2** | Fail-Closed Offline Default | `[NOT STARTED]` | Local `AsyncStorage` caching of `lock_status = 'locked'` and offline lock router interception are not implemented. |
| **NFR-4.3** | Graceful Error Isolation & Boundaries | `[PARTIALLY IMPLEMENTED]` | Defensive `try/catch` blocks, 12s `AbortController` fetch timeouts (`supabase.ts`), 6s auth hydration timeouts (`AuthContext.tsx`), and 5-state UI views exist across all screens. However, no React class `ErrorBoundary` component (`componentDidCatch` / `getDerivedStateFromError`) wraps the root navigation tree in `mobile/App.tsx`. |
| **NFR-5.1 - NFR-5.3** | Battery ($< 3\% / 8\text{h}$), RAM ($< 90\text{ MB}$), Passive Geofencing | `[PARTIALLY IMPLEMENTED]` | List virtualization (`FlatList` with `getItemLayout` and `removeClippedSubviews`), `React.memo`, and zero `PanResponder` keep RAM and JS thread utilization low. Native background service and passive geofencing battery profiling await Sprint 3/4 implementation. |
| **NFR-6.1** | Child-Centric Touch Targets ($\ge 48\times 48\text{ dp}$) | `[IMPLEMENTED]` | Enforced across buttons, tabs, calendar toolbars, form inputs, and modals (`minHeight: 48`, `hitSlop`), with one minor exception in `OnboardingCreateHousehold.tsx` (line 151: `stepperBtn` is `36x36` without `hitSlop`). |
| **NFR-6.2** | Aspect Ratio & Resolution Adaptability | `[IMPLEMENTED]` | Responsive flexbox layouts, `useWindowDimensions()`, `KeyboardAvoidingView`, and `ScrollView` wrappers implemented across all 7 screens. |
| **NFR-6.3** | Standalone Sideload Compilation (`.apk`) | `[PARTIALLY IMPLEMENTED]` | `mobile/app.json` defines `android.package = "com.chorpy.app"` and CNG plugins (`expo-font`, `@react-native-community/datetimepicker`, `expo-splash-screen`), ready for `npx expo prebuild` / EAS Build once native overlay permissions and plugins are added. |

---

### 2.3 Database, Storage & Server Subsystem Gaps

1. **Missing Schema Columns in `database/schema.sql`:**
   - `public.households`: Missing `owner_id uuid references public.profiles(id)`, `guardian_pin varchar(6) unique`, `guardian_pin_expires_at timestamptz`, `latitude double precision`, `longitude double precision`, `geofence_radius_meters integer default 150 not null`.
   - `public.profiles`: Role check constraint (`check (role in ('parent', 'child'))`) omits `'co_parent'` and `'caregiver'`. Missing `avatar_url text` column (`ProfileHeaderCard.tsx` accepts `avatarUrl` prop, but `Profile` interface and `public.profiles` table lack `avatar_url`).
   - `public.devices`: Missing `hardware_model text`, `manufacturer text`, `os_version text`, `installation_id text unique`, `battery_level integer`, `override_until timestamptz`.
   - `public.chores`: Missing `created_by_id uuid references public.profiles(id)`, `approved_by_id uuid references public.profiles(id)`, `rejection_reason text`, `submission_lat double precision`, `submission_lng double precision`, `is_within_geofence boolean`.
2. **Missing Database Triggers & Indexes:**
   - No `BEFORE UPDATE` trigger on `public.profiles` preventing an authenticated user from mutating their own `role`, `household_id`, or `email` via direct PostgREST `PATCH /rest/v1/profiles`.
   - No `AFTER UPDATE OF status ON public.chores` trigger to automatically transition `public.devices.lock_status` back to `'unlocked'` when a child's last remaining active locked chore is `'approved'`.
   - Missing foreign-key lookup indexes `idx_profiles_household_id` on `public.profiles(household_id)` and `idx_devices_child_id` on `public.devices(child_id)`.
3. **Unprovisioned Supabase Storage Bucket:**
   - Bucket `chore-proofs` and its `storage.objects` RLS policies (`INSERT` for authenticated children in household, `SELECT` for authenticated household members) do not exist in `database/schema.sql`.
4. **Empty `server/` Microservice Tier:**
   - `server/` is an empty directory. No cron worker or Supabase `pg_cron` job exists to transition scheduled non-immediate chores (`lock_mode in ('offset_30m', 'offset_1h', 'offset_2h', 'custom')`) into active device locks (`public.devices.lock_status = 'locked'`) when `lock_at <= now()`, nor to dispatch FCM/APNs push notifications when apps are backgrounded.

---

## 3. Future Work & Phased Engineering Roadmap

### Phase 1A: Immediate Capstone Defense Blockers (Core Loop Completion)
1. **Provision Storage & Proof Submission Pipeline (FR-4.3, FR-4.4, FR-4.5):**
   - Install `expo-camera` and `expo-image-manipulator` via `npx expo install`.
   - Add SQL migration in `database/schema.sql` and `database/queryAdd.sql` creating the `chore-proofs` storage bucket and `storage.objects` RLS policies.
   - Extend `ChoreDetailReadOnlyBody.tsx` so children can capture a photo, compress it to $\le 1.2\text{ MB}$ ($1080\times 1920\text{ px}$), upload it to `chore-proofs/{household_id}/{chore_id}.jpg`, and invoke `choreService.submitChoreProof()`.
2. **Guardian Proof Review, Approval & Remediation UI (FR-2.5, FR-5.3, FR-5.4):**
   - Add `created_by_id`, `approved_by_id`, and `rejection_reason` to `public.chores`.
   - Extend `ChoreFormBody.tsx` / `AddChorePageContent.tsx` when `chore.status === 'awaiting_approval'` to render the uploaded proof photo card and parent action buttons: **Approve Task** (`choreService.approveChore`) and **Reject Task** (with rejection reason input setting `status = 'rejected'`).
   - Add PostgreSQL trigger `sync_chore_approval_device_unlock()` on `public.chores` to automatically set `public.devices.lock_status = 'unlocked'` when all of a child's chores with `lock_at <= now()` are `'approved'`.
3. **Child Device Registration & Active Lock Enforcement Screen (FR-1.3.1, FR-2.2.3, FR-5.1, FR-5.5):**
   - Install `expo-device` via `npx expo install` and invoke `deviceService.registerDevice()` automatically when a child completes `joinHouseholdWithPin` or logs in without a device record.
   - Wire `useDeviceLock(user?.id)` into `mobile/App.tsx`: when `effectiveRole === 'child'` and `isLocked === true` (or any assigned chore has `status in ('pending', 'rejected')` and `lock_at <= serverNow`), intercept navigation and render a dedicated, non-dismissible `ChildEnforcementLockView` featuring the active chore queue, camera proof submission trigger, and `EmergencySOSButton`.
4. **Life-Safety Emergency SOS & Haversine Geofencing (FR-6.1, FR-6.2, FR-6.3):**
   - Install `expo-location` via `npx expo install`.
   - Build `EmergencySOSButton.tsx` dispatching `Linking.openURL('tel:911')` in $< 100\text{ ms}$ while broadcasting high-accuracy GPS coordinates on Supabase Realtime channel `household:{household_id}:alerts` and opening `EmergencyAlertModal.tsx` on parent devices.
   - Implement `mobile/src/utils/geofenceUtils.ts` (`calculateHaversineDistanceMeters`) and stamp `submission_lat`, `submission_lng`, and `is_within_geofence` during photo proof submission.

### Phase 1B: Native Android Hardware Overlay & Permissions Handshake (FR-3.x, FR-5.1, FR-5.2)
1. **Permissions Handshake Wizard (`PermissionHandshakeScreen.tsx`):**
   - Build sequential verification cards for Camera (`expo-camera`), Location (`expo-location`), and Display Over Other Apps (`SYSTEM_ALERT_WINDOW`), with `AppState` auto-refresh and `android.settings.action.MANAGE_OVERLAY_PERMISSION` deep-linking.
2. **Expo Config Plugin for Native Android Overlay (`plugins/withChorpyEnforcement.js`):**
   - Inject `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE`, and `RECEIVE_BOOT_COMPLETED` into `AndroidManifest.xml` via `mobile/app.json` CNG plugins.
   - Implement native Android `WindowManager` overlay service and `BOOT_COMPLETED` receiver for standalone `.apk` Dev Client builds.

### Phase 2: Closed Beta, Multi-Guardian Federation & Scheduled Workers
1. **4-Tier RBAC & Dual-PIN / QR Federation (FR-2.1.1, FR-2.3, FR-2.4):**
   - Expand `UserRole` and `public.profiles.role` to `'parent' | 'co_parent' | 'caregiver' | 'child'` plus `households.owner_id` and `households.guardian_pin`.
   - Add QR generation (`react-native-svg` QR matrix) in `InviteFamilyModal.tsx` and QR scanning in `JoinCircleScreen.tsx`.
2. **Scheduled Lock Worker & Push Notifications (`server/` or `pg_cron`):**
   - Activate `pg_cron` (or `server/src/workers/`) to flip `public.devices.lock_status = 'locked'` at exact `lock_at` timestamps for non-immediate chores and dispatch Expo/FCM push notifications on chore assignment, proof upload, and approval.
3. **Collaborative Deduplication Guard (FR-4.6):**
   - Add fuzzy title matching in `AddChorePageContent.tsx` to warn guardians of duplicate active chores and support single-proof task merging.

### Phase 3: Commercial Scale & AI Auto-Verification
1. **AI Vision Pre-Verification:** Supabase Edge Function invoking multimodal vision heuristics on uploaded `chore-proofs` images to flag blurry/dark photos immediately or auto-approve verified completions.
2. **Cross-Platform OS Entitlements:** Android AccessibilityService / DevicePolicyManager anti-tamper protection and iOS `FamilyControls` / `ManagedSettings` Screen Time API integration.

---

## 4. System-Wide Improvements on Every Aspect (9 Technical Domains)

### 4.1 Authentication, Session Lifecycle & Onboarding
- **Current Implementation:** `AuthContext.tsx` manages session hydration with a 6-second timeout, deduplicated `loadProfile` refs, and `retrySession` / `clearLocalSession` recovery actions; `supabase.ts` wraps requests in a 12-second `AbortController` timeout (`resilientFetch`).
- **Architectural Limitations:**
  1. **Unencrypted Token Storage on Native:** `supabase.ts` (line 90) stores session JWTs in plaintext `@react-native-async-storage/async-storage` on Android/iOS instead of hardware-backed encrypted storage (`NFR-3.2`).
  2. **Child Pathway Leak in Step 2:** `OnboardingScreen.tsx` (lines 45, 115–121) routes `'child'` signups to `OnboardingFamilyFork.tsx` instead of directly to `OnboardingJoinPin.tsx` (`FR-1.5.3`).
  3. **Late Account Creation Risk:** `OnboardingScreen.tsx` (lines 52–66) calls `authService.signUp()` inside `registerAndLink()` during Step 2 submission. If `signUp()` succeeds but `joinHouseholdWithPin()` or `createHousehold()` fails due to a network drop, the user's `auth.users` and `public.profiles` rows exist with `household_id = null`, and retrying Step 2 throws `"User already registered"`.
  4. **Temporary Testing Artifacts in Production Root:** `mobile/App.tsx` (lines 101–111, 137–146), `AppLoaderScreen.tsx` (lines 15–17), and `useAppSplash.ts` (lines 11–15, 80–101) contain `TODO(remove-after-testing): Temporary Demo Splash` buttons and state in the primary authenticated header and auth footer.
- **Concrete Engineering Improvements:**
  1. Install `expo-secure-store` via `npx expo install expo-secure-store` and implement a chunked `SecureStoreAdapter` for `supabase.auth.storage` on Android and iOS.
  2. In `OnboardingScreen.tsx` `handleStep1Continue()`, branch directly on `values.role === 'child' ? setStep('join') : setStep(2)`.
  3. Modify `registerAndLink()` in `OnboardingScreen.tsx` to check if `useAuthContext().user` is already authenticated before calling `authService.signUp()`; if already signed in with `household_id === null`, skip `signUp()` and execute `action(user.id)` directly. Additionally, in `mobile/App.tsx`, if an authenticated user has `profile.household_id === null`, render the household pairing step so orphaned signups can always complete circle linking.
  4. Gate the `Demo Splash` trigger in `mobile/App.tsx` behind `__DEV__` or move it into `DeveloperQuickPreview.tsx`.

### 4.2 Calendar & Chore Scheduling Engine
- **Current Implementation:** `ChoreCalendarView.tsx` and `CalendarGridSurface.tsx` render `react-native-big-calendar` primitives (`CalendarHeader`, `CalendarBody`, `CalendarHeaderForMonthView`, `CalendarBodyForMonthView`) across Day, Week, and Month modes without `PanResponder`, mapping chores via `mapChoresToCalendarEvents()` in `calendarUtils.ts`.
- **Architectural Limitations:**
  1. **Unbounded Historical & Future Event Mapping:** `useChores.ts` fetches every chore ever created for the household (`SELECT * FROM chores WHERE household_id = ...`), and `mapChoresToCalendarEvents()` maps all of them on every render regardless of the currently visible calendar month/week.
  2. **Visual Clamping of Long Lock Windows:** `calendarUtils.ts` (lines 21–23, 87–90) clamps calendar event visual duration between `MIN_EVENT_DURATION_MS` (30 mins) and `MAX_EVENT_DURATION_MS` (4 hours). If a chore is scheduled at 9:00 AM with a custom lock time at 6:00 PM (9 hours), the calendar block visually terminates at 1:00 PM, hiding the true lock deadline on the Day/Week grid.
  3. **Delayed Lock Mode Execution Gap:** When `lock_mode` is `'offset_30m'`, `'offset_1h'`, `'offset_2h'`, or `'custom'`, `on_chore_synced_immediate_lock` does not fire when `lock_at` arrives because no database row mutation occurs at `lock_at`.
- **Concrete Engineering Improvements:**
  1. In `calendarUtils.ts`, filter or window `chores` to a $\pm 45$-day range around `activeDate` before constructing `ChoreCalendarEvent` objects, or add date-range pagination parameters (`fromDate`, `toDate`) to `choreService.getHouseholdChores()`.
  2. For chores where `lock_at - scheduled_at > 4 hours`, render the event block at the scheduled start time and append an explicit deadline suffix in the event title (`"${chore.title} (Locks ${formatScheduleTimeLabel(lockCandidate)})"`).
  3. Add a PostgreSQL RPC `public.evaluate_due_chore_locks()` (and invoke it on client heartbeat / `pg_cron`) that locks `public.devices` whenever `EXISTS (SELECT 1 FROM public.chores WHERE assigned_child_id = devices.child_id AND status IN ('pending', 'rejected') AND lock_at <= now())`.

### 4.3 Chore Lifecycle, Proof Capture & Verification Loop
- **Current Implementation:** `AddChorePageContent.tsx` coordinates `create` and `edit` modes via `ChoreFormBody.tsx` and `view` mode via `ChoreDetailReadOnlyBody.tsx`. `choreService.ts` provides `getHouseholdChores`, `createChore`, `updateChore`, `submitChoreProof`, `approveChore`, and `rejectChore`.
- **Architectural Limitations:**
  1. **Broken Lifecycle State Machine in UI:** Neither child proof submission (`pending` $\rightarrow$ `awaiting_approval`) nor parent review (`awaiting_approval` $\rightarrow$ `approved` / `rejected`) is reachable from the UI.
  2. **Incorrect Status in `choreService.rejectChore()`:** In `mobile/src/services/choreService.ts` (lines 123–133), `rejectChore(choreId)` sets `status: 'pending'` instead of `status: 'rejected'`. Consequently, the `'rejected'` status badge styling in `ChoreRow.tsx` (lines 46, 56), `ChoreCalendarView.tsx` (line 142), `ChoreFormBody.tsx` (line 60), and `ChoreDetailReadOnlyBody.tsx` (line 44) can never be triggered.
  3. **Non-Atomic Multi-Chore Device Unlock:** `choreService.approveChore(choreId, childDeviceId)` (lines 100–120) performs two separate client-side HTTP `UPDATE` calls and unlocks the device blindly even if the child still has other `'pending'` or `'rejected'` chores due.
- **Concrete Engineering Improvements:**
  1. Fix `choreService.rejectChore(choreId, rejectionReason?: string)` to set `status: 'rejected'` and persist `rejection_reason`.
  2. Move device unlock orchestration into a PostgreSQL trigger `AFTER UPDATE OF status ON public.chores`: when a chore transitions to `'approved'`, check if the child has any remaining chores with `status IN ('pending', 'rejected') AND (lock_mode = 'immediate' OR lock_at <= now())`; if none remain, atomically `UPDATE public.devices SET lock_status = 'unlocked' WHERE child_id = NEW.assigned_child_id`.
  3. Add a photo proof capture card to `ChoreDetailReadOnlyBody.tsx` (visible when `chore.status === 'pending' || chore.status === 'rejected'`) and a parent verification review panel to `ChoreFormBody.tsx` (visible when `chore.status === 'awaiting_approval'`).

### 4.4 Notification & Realtime Sync Architecture
- **Current Implementation:** `NotificationContext.tsx` tracks `lastSeenAt` in `AsyncStorage` and `readIds` in memory; `buildChoreNotifications()` in `notificationUtils.ts` transforms the `chores` array into notification items rendered by `NotificationDropdown.tsx` and `NotificationRow.tsx`.
- **Architectural Limitations:**
  1. **Creation-Only Notification Feed:** `buildChoreNotifications()` (`notificationUtils.ts` lines 74–95) only generates notifications keyed by `chore.created_at` with static labels (`"Created Chore"` for Parents, `"Task Assigned"` for Children). When a child submits photo proof (`awaiting_approval`) or a parent approves/rejects a chore (`updated_at`), no status-transition notification is generated and `timestampMs` remains `created_at`.
  2. **Ephemeral Per-Item Read State:** `NotificationContext.tsx` (lines 49–76, 78–81) persists `lastSeenAt` to `AsyncStorage`, but keeps `readIds` (`markItemRead`) in volatile React state only. Tapping individual notifications to mark them read is lost on app restart unless the user taps `"Mark all read"`.
  3. **Duplicate Realtime Subscriptions & Full-Table Re-fetches:** Both `HomeScreen.tsx` and `MyFamilyScreen.tsx` invoke `useHouseholdChoreData()`, which instantiates `useChores()` and `useHouseholdMembers()`. When `postgres_changes` fires on `public.chores`, `useChores.ts` (line 105) re-fetches the entire `chores` table via REST instead of merging the WebSocket payload.
- **Concrete Engineering Improvements:**
  1. Update `buildChoreNotifications()` in `notificationUtils.ts` to derive the event timestamp from `chore.updated_at || chore.created_at` and emit status-specific categories: for Parents, highlight `status === 'awaiting_approval'` as `"Proof Submitted for Review"`; for Children, highlight `status === 'approved'` as `"Chore Approved"` and `status === 'rejected'` as `"Chore Needs Redo"`.
  2. Persist `readIds` alongside `lastSeenAt` as a JSON object in `AsyncStorage` under `chorpy_notif_state_v2_${userId}` inside `NotificationContext.tsx`.
  3. Update `useChores.ts` and `useHouseholdMembers.ts` Realtime callbacks to apply `INSERT`, `UPDATE`, and `DELETE` payloads directly from `payload.new` and `payload.old` in state, falling back to full REST refetch only on channel reconnection.

### 4.5 Family Circle, Multi-Guardian RBAC & Household Management
- **Current Implementation:** `householdService.ts` calls `SECURITY DEFINER` RPCs (`verify_household_pin`, `create_household_with_pin`, `regenerate_household_pin`, `join_household_with_pin`, `get_my_household`); `useHouseholdPin.ts` powers `HouseholdPinCard.tsx` and `InviteFamilyModal.tsx`.
- **Architectural Limitations:**
  1. **Hardcoded Household Subtitle in `MyFamilyScreen.tsx`:** Line 109 of `MyFamilyScreen.tsx` renders `<Text style={styles.subgreeting} numberOfLines={1}>Canoy Family Circle</Text>` for all users regardless of their actual household name in `public.households`.
  2. **Co-Parent Join Collision via Single PIN:** Because `join_household_with_pin(p_pin text)` links any authenticated user who enters `pairing_pin`, a second parent who selects `role = 'parent'` in Step 1 and joins via `pairing_pin` becomes a full `'parent'` with equal rights to regenerate PINs, and there is no `owner_id` on `public.households` to protect owner-exclusive actions (`FR-2.4.2`).
  3. **No Brute-Force Protection on PIN Entry:** `verify_household_pin(p_pin text)` is callable by `anon` and `authenticated` roles with zero rate limiting (`FR-2.2.2`, `NFR-3.4`).
- **Concrete Engineering Improvements:**
  1. In `MyFamilyScreen.tsx` (or `useHouseholdChoreData.ts`), expose the active household name from `householdService.getMyHousehold()` and replace the hardcoded `"Canoy Family Circle"` string with `activeHousehold?.name || 'Family Circle'`.
  2. Add `owner_id uuid references public.profiles(id)` and `guardian_pin varchar(6) unique` to `public.households`, and expand `profiles.role` to `'parent' | 'co_parent' | 'caregiver' | 'child'`.
  3. Create a `public.pin_verification_attempts` rate-limiting table (or track failed attempts per caller IP / `auth.uid()`) inside `verify_household_pin` and `join_household_with_pin`, locking out callers for 60 seconds after 5 consecutive failures.

### 4.6 Database Schema, Triggers, RLS & Storage
- **Current Implementation:** `database/schema.sql` (673 lines) and `database/queryAdd.sql` (356 lines) implement `auto_enable_rls`, 4 core tables, `get_my_household_id()`, `get_my_role()`, `enforce_chore_update_guard()`, `sync_immediate_chore_device_lock()`, 6 PIN TTL RPCs, `supabase_realtime` publications, and fail-closed RLS policies.
- **Architectural Limitations:**
  1. **Self-Privilege Escalation Vulnerability on `public.profiles`:** In `database/schema.sql` (lines 535–537), the RLS policy `"Allow users to update their own profile"` is defined as `on public.profiles for update using (auth.uid() = id)` with no column restriction trigger. While `authService.updateProfile()` only sends `full_name`, `phone_number`, `date_of_birth`, and `age`, a malicious child client holding their own valid Supabase JWT can send a direct PostgREST `PATCH /rest/v1/profiles?id=eq.<uid>` with `{"role": "parent"}` and escalate their privileges to `'parent'`.
  2. **Missing Foreign-Key Indexes:** `public.profiles(household_id)` and `public.devices(child_id)` lack B-tree indexes, even though every RLS policy on `profiles`, `chores`, and `devices` executes subqueries filtering on `profiles.household_id` and `devices.child_id`.
  3. **No `DELETE` Policies or Soft-Delete Support on `public.chores`:** Parents can create and edit chores, but there is no `DELETE` RLS policy on `public.chores` or `choreService.deleteChore()` method if a parent creates a chore by mistake.
- **Concrete Engineering Improvements:**
  1. Add a `BEFORE UPDATE ON public.profiles` trigger function `public.enforce_profile_update_guard()` in `database/schema.sql` that blocks any non-service-role change to `id`, `email`, `role`, `created_at`, or `household_id` (allowing `household_id` updates only when invoked via the trusted `SECURITY DEFINER` household RPCs).
  2. Add indexes `CREATE INDEX IF NOT EXISTS idx_profiles_household_id ON public.profiles(household_id);` and `CREATE INDEX IF NOT EXISTS idx_devices_child_id ON public.devices(child_id);`.
  3. Add a parent-scoped `DELETE` policy on `public.chores` (`using (public.get_my_role() = 'parent' and household_id = public.get_my_household_id())`) and expose `deleteChore(choreId, householdId)` in `choreService.ts`.

### 4.7 Native Android Enforcement, Hardware Overlay & Life-Safety SOS
- **Current Implementation:** Pure Expo managed workflow (`mobile/app.json`) with `expo-font`, `@react-native-community/datetimepicker`, and `expo-splash-screen` plugins.
- **Architectural Limitations:**
  1. **Misleading Static Wellbeing Status in `SettingsScreen.tsx`:** Lines 97–108 of `SettingsScreen.tsx` unconditionally render `"Hardware Overlay: SYSTEM_ALERT_WINDOW Active"` and `"Emergency SOS: Accessible (911 / Guardian)"` as hardcoded static text, even on web or unconfigured devices where no overlay permission exists.
  2. **Missing CNG Config Plugin for Android Overlay:** `mobile/app.json` does not declare `android.permissions` for `SYSTEM_ALERT_WINDOW`, `CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `FOREGROUND_SERVICE`, or `RECEIVE_BOOT_COMPLETED`.
- **Concrete Engineering Improvements:**
  1. Replace the static labels in `SettingsScreen.tsx` (lines 97–108) with live runtime permission telemetry (reading actual Camera, Location, Overlay, and Supabase Realtime channel connection states).
  2. Configure `android.permissions` in `mobile/app.json` and author a modular CNG config plugin (`mobile/plugins/withChorpyEnforcement.js`) to register the native Android overlay service and `BOOT_COMPLETED` receiver without committing an unmanaged `android/` folder.

### 4.8 UI/UX, Accessibility, Design System & Performance
- **Current Implementation:** All 74 source files pass `audit-rn-standards.js` with 0 errors and 0 warnings. All files are under the 250-line ceiling (largest file: `NotificationDropdown.tsx` at 246 lines), use `StyleSheet.create`, avoid `PanResponder`, and reference tokens from `mobile/src/theme/index.ts`.
- **Architectural Limitations:**
  1. **Raw Emoji Characters in Legacy Auth/Settings Screens (`ui.md` Rule #19):** Three screens still render a raw Unicode bird character (`<Text style={styles.mascot}>...</Text>`) in production UI chrome:
     - `mobile/src/screens/LoginScreen.tsx` (line 62)
     - `mobile/src/screens/OnboardingScreen.tsx` (line 103)
     - `mobile/src/screens/SettingsScreen.tsx` (line 117)
     This violates `.agents/rules/ui.md` Rule #19 (*"Never use raw emoji characters as functional UI icons in production chrome. Use crisp vector icons (`react-native-svg`)"*).
  2. **Brand Palette Token Documentation Drift:** `AGENTS.md` (Section 2) and `OfficialDocumentation.md` (Section 4.1) refer to an older Sky Blue `#0284C7` & Coral Orange `#FF6B4A` palette, whereas the canonical `mobile/src/theme/index.ts` implements Navy Blue (`primary: '#1B365D'`) and Light Sky/Cyan (`secondary: '#60C1E5'`).
  3. **Sub-48dp Touch Target in Stepper Controls:** `OnboardingCreateHousehold.tsx` (line 151) defines `stepperBtn` with `width: 36, height: 36` and no `hitSlop`, falling below the mandatory $48\times 48\text{ dp}$ child-centric touch target (`NFR-6.1`).
- **Concrete Engineering Improvements:**
  1. Replace `<Text style={styles.mascot}>` in `LoginScreen.tsx`, `OnboardingScreen.tsx`, and `SettingsScreen.tsx` with a compact `react-native-svg` Chorpy mascot crest component (reusing the vector paths from `FlyingBirdIllustration.tsx`).
  2. Increase `stepperBtn` in `OnboardingCreateHousehold.tsx` to `width: 48, height: 48` (or add `hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}`).

### 4.9 Testing, Verification Gates, CI/CD & Observability
- **Current Implementation:** Three static verification gates exist: `npx tsc --noEmit`, `npm run lint:standards` (`audit-rn-standards.js`), and `npx expo lint`.
- **Architectural Limitations:**
  1. **Zero Automated Unit or Integration Tests:** `mobile/package.json` contains no test runner (`jest` / `jest-expo`) and zero unit test suites for pure critical logic (`validation.ts`, `onboardingValidation.ts`, `profileValidation.ts`, `choreScheduleUtils.ts`, `notificationUtils.ts`, `calendarUtils.ts`).
  2. **Missing Root React `ErrorBoundary`:** While `chief-of-staff/SKILL.md` Section 6.2.5 and `NFR-4.3` mandate wrapping high-level screens in a React `ErrorBoundary`, no `ErrorBoundary.tsx` component exists in `mobile/src/components/`.
  3. **No GitHub Actions CI Workflow:** No `.github/workflows/ci.yml` runs `tsc --noEmit`, `lint:standards`, and `expo lint` automatically on push/PR.
- **Concrete Engineering Improvements:**
  1. Create `mobile/src/components/common/ErrorBoundary.tsx` (implementing `getDerivedStateFromError` and a themed retry fallback card) and wrap `<AppContent />` in `mobile/App.tsx`.
  2. Install `jest` and `jest-expo` via `npx expo install` and add deterministic unit test suites for all pure functions in `mobile/src/utils/` and `mobile/src/components/calendar/calendarUtils.ts`.
  3. Add `.github/workflows/verify.yml` to enforce the 3 mandatory static gates on every commit.

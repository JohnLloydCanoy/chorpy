# Mobile & Database Security Rules

> **Target Audience:** All AI agents, backend architects, and mobile developers working on Chorpy.  
> **Status:** Mandatory. Zero-tolerance policy on security regressions.  
> **Framework:** OWASP Mobile Application Security (MASVS) & Supabase Hardened Security Standards.

---

## 1. Mobile Client Security Architecture

### A. Credential & Session Management
1. **Never Commit Secrets:**
   - Absolute ban on storing secrets, private keys, or API tokens in git.
   - Client code in `mobile/` may ONLY access environment variables prefixed with `EXPO_PUBLIC_` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
2. **Service Role Key Isolation:**
   - The Supabase `service_role` key completely bypasses Row Level Security.
   - **It must NEVER exist in the mobile application bundle, `app.json`, `.env`, or client-accessible services.**
   - All client database interactions must execute under authenticated user sessions governed by RLS.
3. **Session Token Storage:**
   - All session tokens and refresh tokens must be securely stored using encrypted storage (`expo-secure-store`) or an isolated storage wrapper.
   - Sensitive user secrets (e.g., encryption keys, parent authorization credentials) must never be written to plaintext `AsyncStorage` or unencrypted local SQLite files.
4. **Transport Layer Security:**
   - All outbound network calls must enforce TLS 1.3/HTTPS and WSS (WebSocket Secure for Supabase Realtime).
   - Cleartext HTTP traffic (`android:usesCleartextTraffic="true"`) is strictly prohibited in production builds.

---

## 2. Supabase Row Level Security (RLS) Guardrails

### A. Fail-Closed Table Policy
1. **100% RLS Coverage:** Every table created in PostgreSQL MUST have Row Level Security enabled immediately:
   ```sql
   ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
   ```
2. **Never Rely on Client-Side Filtering Alone:**
   - Client-side `.eq('household_id', id)` or `.eq('assigned_child_id', user.id)` is for query optimization, **NOT security**.
   - An adversarial client can easily alter or remove filter parameters.
   - Access boundaries must be rigidly enforced by database RLS policies (`auth.uid() = id`, or checking membership in `public.households`).
3. **Policy Design Patterns:**
   - **Profiles:** Users may read and update only their own profile record (`auth.uid() = id`).
   - **Households:** Only members belonging to the household (joined via valid PIN or creator ID) may select or update the circle.
   - **Chores:** Chores are only readable and actionable by confirmed members of the matching `household_id`.
   - **Devices:** Devices can only be updated by the registered child or the household guardian.
4. **Database Event Triggers:**
   - The automated RLS event trigger (`auto_enable_rls` in `database/schema.sql`) must remain active to automatically enforce RLS on newly created tables.

---

## 3. Input Sanitization & Validation Schemas

All inputs entering client services or database triggers must undergo defensive validation before processing:

### A. Pairing PIN Validation (6-Digit Strict)
- Must be exactly 6 numeric digits: `/^\d{6}$/`.
- Must reject spaces, alphabetic characters, unicode glyphs, or SQL injection payloads.
- Rate-limit failed PIN attempts to prevent brute-forcing household circles.

### B. Email & Authentication Inputs
- **Email:** Validate RFC 5322 compliance, normalize via `.trim().toLowerCase()`.
- **Password:** Minimum 8 characters. Never log passwords in diagnostic messages or crash reports.
- **Full Name & Text Fields:** Sanitize against null-byte injection and strip unescaped HTML/script tags before transmission.

### C. Photo Proof Submissions
- File uploads for chore proof must be constrained to image MIME types (`image/jpeg`, `image/png`, `image/webp`).
- Upload payloads must be capped at 5 MB to prevent mobile memory exhaustion and storage denial-of-service.
- Validate upload URLs against the official Supabase Storage bucket domain.

---

## 4. Hardware Enforcement & Android Permissions

Chorpy relies on sensitive Android native permissions for digital wellbeing and device locking. Misconfiguration poses severe security or UX failure risks.

### A. Overlay Permission (`SYSTEM_ALERT_WINDOW`)
1. **Runtime Verification:**
   - Check overlay permission status at startup using `Settings.canDrawOverlays(context)`.
   - If permission is missing, provide a friendly explanation screen with a direct intent redirect to Android's "Display over other apps" settings.
2. **Safety Exemption (Emergency SOS):**
   - The `SYSTEM_ALERT_WINDOW` lock screen MUST ALWAYS maintain an unobstructed, interactive Emergency SOS action.
   - The SOS button must immediately trigger the native phone dialer (`tel:911` or emergency contact) or emergency intent.
   - Under no circumstances may an app crash, offline state, or pending chore trap a child without emergency dialing capabilities.

### B. Foreground Services (`FOREGROUND_SERVICE`)
1. **Compliance with Android 14+:**
   - Specify explicit foreground service types in `mobile/app.json` (e.g., `dataSync` or `specialUse`).
   - Attach a persistent, non-dismissible notification explaining why the background sync service is active (e.g., *"Chorpy Device Protection Active"*).
2. **Resource Consumption:**
   - Avoid aggressive CPU spin locks. Rely on event-driven Supabase Realtime WebSocket events and push notifications instead of rapid polling intervals.

### C. Camera & Media Permissions (`CAMERA`)
1. **Contextual Request:** Never request camera access on app startup. Request only when the child taps "Take Photo Proof".
2. **Graceful Degradation:** If camera permission is denied, explain clearly why photo proof cannot be captured and guide the user to app settings without crashing.

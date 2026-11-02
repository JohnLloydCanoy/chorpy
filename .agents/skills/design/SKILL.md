---
name: design
description: Progressive-disclosure design skill for mobile UI/UX engineering, theme tokens, typography scales, spacing grids, accessible touch ergonomics, and brand identity in Chorpy.
---

# Chorpy Mobile Design System & Token Specification

> **Domain:** Mobile UI/UX Design & Frontend Engineering  
> **Target Framework:** React Native / Expo (SDK 58)  
> **Source of Truth:** `mobile/src/theme/index.ts`  
> **Governing Rules:** Strictly enforced by `.agents/rules/ui.md` and `.agents/rules/ux.md`.

---

## 1. Brand Identity & Color Tokens

The visual foundation of Chorpy blends an inviting, child-friendly personality with structured, high-contrast utility for parental oversight and hardware lock screens.

### Canonical Color Palette

All color references in components **MUST** be imported from `src/theme` (`colors.<token>`). Never write raw hex values in component style blocks.

| Token | Hex | Role & Usage Context |
| :--- | :--- | :--- |
| `colors.primary` | `#0284C7` | **Sky Blue (Primary):** Main headers, primary buttons, active tabs, keyboard focus rings. |
| `colors.primaryLight` | `#38BDF8` | **Light Sky Blue:** Hover states, active badge highlights, brand accent accents. |
| `colors.primarySoft` | `#F0F9FF` | **Soft Tint:** Background highlights for primary cards and selected list items. |
| `colors.primaryDark` | `#0369A1` | **Dark Sky Blue:** Pressed states for primary buttons, high-contrast borders. |
| `colors.accent` | `#FF6B4A` | **Coral Orange (Accent):** Critical call-to-actions, urgent alerts, unlock CTAs. |
| `colors.accentHover` | `#EA580C` | **Dark Coral:** Pressed state for accent buttons. |
| `colors.accentSoft` | `#FFF7ED` | **Soft Coral:** Background container for urgent warnings or chore badges. |
| `colors.background` | `#F8FAFC` | **Cloud White:** App-wide screen background (clean, non-glare canvas). |
| `colors.surface` | `#FFFFFF` | **Pure White:** Card surfaces, bottom sheets, form input backgrounds. |
| `colors.surfaceDark` | `#0F172A` | **Slate Navy:** Child Lock Screen background, primary high-contrast headings. |
| `colors.surfaceCardDark` | `#1E293B` | **Dark Card Surface:** High-contrast chore cards on the Child Lock Screen. |
| `colors.border` | `#E2E8F0` | **Divider / Border:** 1px solid card borders, input borders, list item separators. |
| `colors.borderDark` | `#334155` | **Dark Mode Border:** Separator for dark surfaces and lock overlays. |
| `colors.text` | `#0F172A` | **Dark Text:** Primary headings and high-priority body copy. |
| `colors.textSecondary`| `#64748B` | **Slate Gray:** Subtitles, descriptive labels, secondary metrics. |
| `colors.textMuted` | `#94A3B8` | **Muted Gray:** Placeholder text, disabled labels. |
| `colors.textLight` | `#FFFFFF` | **White Text:** Text rendered on dark surfaces (`surfaceDark` / `primary`). |

### Status & Feedback Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `colors.success` | `#16A34A` | Approved chores, unlocked device badge, successful photo upload. |
| `colors.successSoft` | `#F0FDF4` | Background container for success banners and approval queues. |
| `colors.warning` | `#F59E0B` | Pending review status, warning banners, PIN entry hints. |
| `colors.warningSoft` | `#FEF3C7` | Background container for pending review items. |
| `colors.danger` | `#DC2626` | Locked device state, rejected chores, emergency SOS buttons. |
| `colors.dangerSoft` | `#FEF2F2` | Background container for rejection alerts and SOS containers. |

---

## 2. Mascot Guidelines: *Chorpy the Maya*

**Chorpy** is modeled after the *Maya* (Eurasian Tree Sparrow / *Passer montanus*), a familiar, agile, and industrious bird symbolizing community, teamwork, and diligence.

### Personality & Tone
- **Diligence & Encouragement:** Chorpy speaks in upbeat, positive, and affirming terms.
- **Tone Matrix:**
  - *Chore Approved / Device Unlocked:* "Chirp chirp! All done! Great teamwork today."
  - *Chore In Review:* "Looking good! Waiting for parent confirmation."
  - *Screen Locked:* "Time to fly through chores! Complete your tasks to unlock."
  - *Emergency SOS:* Calm, neutral, and immediate. No mascot interference on safety actions.
- **Imagery Rules:**
  - Use vector SVG or clean transparent PNG assets stored under `mobile/assets/mascot/`.
  - Maintain clean, child-friendly proportions with crisp borders.
  - **Zero Emojis in Body Copy:** Do not insert emojis (`✨`, `🚀`, `🔥`) into headings or button titles (strictly per `.agents/rules/ui.md`). Let Chorpy's illustration convey warmth.

---

## 3. Typography Hierarchy & Contrast

Chorpy enforces a strict mathematical type scale derived from modern mobile accessibility standards.

### Type Scale Specification

```typescript
export const typography = {
  fontSizes: {
    xs: 11,      // Badges, caption indicators, legal notices
    sm: 13,      // Secondary descriptions, timestamps, helper text
    base: 15,    // Standard body copy, form input labels
    lg: 18,      // Section subheadings, card titles
    xl: 22,      // Screen headers, primary modal titles
    xxl: 28,     // Hero titles, PIN circle displays
    display: 36, // Massive countdown numbers, lock state indicators
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

### Contrast & Legibility Rules
1. **WCAG 2.1 AA Compliance:** All text must maintain a contrast ratio of at least **4.5:1** against its direct background (and **3:1** for large text $>18\text{pt}$).
2. **No Whisper-Thin Fonts:** Font weight `normal` (`400`) is the minimum permitted weight. Never use `100`, `200`, or `300`.
3. **No Muted Text on White:** Never render `colors.textMuted` (`#94A3B8`) as body copy or instructions; reserve it exclusively for disabled states and input placeholders.

---

## 4. Spacing System (4-Point Grid)

All layout paddings, margins, and component gaps must be whole-number multiples of 4:

```typescript
export const spacing = {
  xs: 4,   // Micro-gaps between badge icons and text
  sm: 8,   // Internal button padding, compact list gaps
  md: 16,  // Default card padding, horizontal screen margins
  lg: 24,  // Section spacing, form field spacing
  xl: 32,  // Major section breaks, lock screen spacing
  xxl: 48, // Top-of-screen safe area offsets, hero separation
};
```

### Border Radii Standards

```typescript
export const borderRadius = {
  sm: 6,    // Small badges, tooltips
  md: 10,   // Text inputs, secondary action buttons
  lg: 14,   // Primary chore cards, device status cards
  xl: 18,   // Modal sheets, floating action containers
  full: 9999, // Pill buttons, avatar circles, PIN dots
};
```

---

## 5. Touch Ergonomics & Accessibility

Because Chorpy is operated by children (with developing fine motor skills) and parents on the move, touch target standards are strictly enforced.

### Ergonomic Rules
1. **Minimum Touch Target: 48dp:**
   - Every interactive control (`TouchableOpacity`, `Pressable`, `Button`) must measure at least **$48 \times 48\text{dp}$**.
   - If visual styling requires a smaller icon (e.g., $24\text{dp}$ cross icon), expand its hit target using:
     ```tsx
     <Pressable hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
     ```
2. **Accessibility Semantics:**
   - Every button must specify `accessibilityRole="button"`.
   - Provide clear, descriptive `accessibilityLabel` attributes (e.g., `"Approve chore: Clean bedroom"` instead of `"Approve"`).
   - Use `accessibilityHint` for non-obvious actions (e.g., `"Double tap to capture photo evidence of completed chore"`).
3. **One Primary Action per Viewport:**
   - Each screen must have exactly one high-contrast primary CTA (Sky Blue or Coral Orange).
   - Secondary actions must use outlined or subtle surface styles.

---

## 6. Component Architecture & Guidelines

All UI components must be built in accordance with `.agents/rules/ui.md` (no gradients, solid colors, clean borders) and `.agents/rules/ux.md` (five core states).

### 1. Button Component Standard (`mobile/src/components/Button.tsx`)
- **Variants:**
  - `primary`: Background `colors.primary`, Text `colors.textLight`.
  - `accent`: Background `colors.accent`, Text `colors.textLight`.
  - `outline`: Background `transparent`, Border `1px solid colors.border`, Text `colors.text`.
  - `danger`: Background `colors.danger`, Text `colors.textLight` (SOS and delete).
- **Interactive States:**
  - `disabled`: `opacity: 0.5`, non-interactive.
  - `loading`: Replaces text with a centered `ActivityIndicator` (preserves button dimensions).
  - `active/pressed`: Subtle opacity shift (`0.85`), no jarring layout jumps.

### 2. Card Container Standard (`mobile/src/components/Card.tsx`)
- **Light Surface:** `backgroundColor: colors.surface`, `borderColor: colors.border`, `borderWidth: 1`, `borderRadius: borderRadius.lg`.
- **Dark Surface (Lock Screen):** `backgroundColor: colors.surfaceCardDark`, `borderColor: colors.borderDark`.
- **Anti-Pattern Guard:** Never nest cards inside cards with identical borders. Use horizontal rules (`borderBottomWidth: 1`) or clean spacing instead.

### 3. Five UI States Implementation Checklist

Every screen and data-backed widget must implement:
1. **Empty State:** Constructive illustration + clear title + primary action button (e.g., "No Chores Yet — Add your first household chore to get started").
2. **Loading State:** Native geometry-matched skeleton placeholders avoiding Cumulative Layout Shift (CLS).
3. **Error State:** Clear diagnosis of failure (e.g., "Network disconnected") with a prominent "Retry" button.
4. **Partial State:** Cached or optimistic data shown with subtle sync indicator; automated rollback on mutation failure.
5. **Populated State:** High-performance list (`FlatList` with `getItemLayout` and `keyExtractor`), structured typography, and proper 48dp touch targets.

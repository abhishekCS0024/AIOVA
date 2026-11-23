# Design system

Visual and interaction rules for the RCA Workbench frontend. Tokens live in
[`frontend/src/styles/tokens.css`](../frontend/src/styles/tokens.css); component styles in
[`global.css`](../frontend/src/styles/global.css); React primitives in `frontend/src/components/ui/`.

Derived from the UI/UX Pro Max skill's rule priorities (its search database was not available,
so palette and type are hand-picked for an internal GMP quality tool).

## Direction

- **Product:** internal B2B quality/compliance workbench; data-dense, trust over flair.
- **Style:** clean enterprise minimalism; light and dark themes (system default, toggle in header).
- **Type:** Inter (UI), JetBrains Mono (IDs, batch numbers, document text). Base 16px, line-height 1.5.
- **Color roles:** slate neutrals · indigo `primary` (actions) · violet `ai` (anything AI-generated) ·
  `success` / `warning` / `danger` / `info` for state. Components use tokens only, never raw hex.
- All text/background token pairs meet WCAG AA (≥ 4.5:1) in both themes.

## Rules

| Area | Rule |
|---|---|
| Accessibility | Visible focus ring on every control; labels on every input (`Field`); ARIA tabs with arrow/Home/End keys; skip link; `aria-live` toasts; status never by color alone (icon + text) |
| Interaction | Controls ≥ 40px tall (tabs 44px); every async action shows loading and a toast; destructive-ish actions (Reject) styled distinctly |
| AI provenance | `AI suggested` tag + violet left border on AI-filled fields; `Edited` once changed; AI draft vs final table in Review |
| Permissions | UI mirrors backend rules: only QA sees Confirm/Approve; Confirm disabled without supporting evidence (with reason shown); approved records read-only |
| Layout | Two columns ≥ 900px (AI panel sticky); single column below, form first once analyzed; no horizontal page scroll at 375px |
| Navigation | Tab state in the URL (`?tab=causes`) for deep links and back button |
| Motion | 120–200ms ease-out transitions; `prefers-reduced-motion` disables animation |
| Feedback | Inline field errors near the field; empty states explain the next step; skeletons while loading |

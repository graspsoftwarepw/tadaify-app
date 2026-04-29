# Landing page test plan (F-LANDING-001)

Covers: BR-LANDING-001 — handle claim flow and landing page presentation.
Story: #1 (graspsoftwarepw/tadaify-app)
Author: implementation agent, 2026-04-29

---

## Required seed users

None. The landing page is fully unauthenticated. All scenarios work with an anonymous session.

## Preconditions

- `supabase start` is running locally (port-band 5435X)
- `npm run dev` serves the app on `http://localhost:5173`
- `handle_reservations` table exists (migration `20260429000001_handle_reservations.sql` applied)
- No pre-existing reservations in `handle_reservations` (reset via `supabase db reset` or manual DELETE)

---

## Scenario S1 — Hero section renders all required elements

**Prerequisite:** fresh browser, no prior interaction.

**Steps:**
1. Navigate to `http://localhost:5173/`
2. Observe the page title, nav, hero section.

**Verifies:**
- Page `<title>` contains "tadaify"
- Nav contains `tada!ify` wordmark (logo orb + brand text)
- Hero headline visible and non-empty
- Hero handle input present (`placeholder` ends in "…")
- Handle preview div has `aria-live="polite"` attribute
- MotionLogo SVG present in hero right column (contains `<circle>` orbit element)
- "Free forever" / creator card visible in hero column

**Covers:** BR-LANDING-001 §Hero

---

## Scenario S2 — Live availability check — handle available

**Prerequisite:** `handle_reservations` table empty.

**Steps:**
1. Navigate to `/`
2. Type a valid, unique handle (e.g. `coolcreator`) into the hero input (3+ chars)
3. Wait 350 ms (debounce fires at 300ms)

**Verifies:**
- URL preview below input shows exactly `tadaify.com/coolcreator` (no `!`, no `-`)
- Status indicator shows "available" state (green checkmark or similar)
- "Claim your handle →" button is enabled (`not disabled`)
- No alternatives shown

**Covers:** BR-LANDING-001 §Handle claim, TADA-BUG-001 (real URL, not brand lockup)

---

## Scenario S3 — Live availability check — handle too short

**Steps:**
1. Navigate to `/`
2. Type `ab` (2 chars) into the hero input

**Verifies:**
- Status shows error/invalid state (not "available")
- Claim button remains disabled
- No API call made (client-side validation fires first)

**Covers:** BR-LANDING-001 §Validation

---

## Scenario S4 — Live availability check — invalid characters

**Steps:**
1. Navigate to `/`
2. Type `my-handle` (hyphen) into hero input
3. Wait 350 ms

**Verifies:**
- Status shows validation error
- Claim button disabled
- URL preview not shown (or shows error state)

**Covers:** BR-LANDING-001 §Validation (hyphens disallowed)

---

## Scenario S5 — Live availability check — blocked word

**Steps:**
1. Navigate to `/`
2. Type `admin` into hero input
3. Wait 350 ms

**Verifies:**
- Status shows "blocked" or equivalent error message
- Claim button disabled
- No alternatives offered for blocked words

**Covers:** BR-LANDING-001 §Validation, `handle-validator.ts` blocked word list

---

## Scenario S6 — Already reserved handle shows alternatives

**Prerequisite:** Manually insert a test reservation:
```sql
INSERT INTO handle_reservations (handle, expires_at)
VALUES ('takenhandle', NOW() + INTERVAL '15 minutes');
```

**Steps:**
1. Navigate to `/`
2. Type `takenhandle` into hero input
3. Wait 350 ms

**Verifies:**
- Status shows "taken" / "reserved" state
- At least 1 alternative suggestion button appears (e.g. `takenhandle_` or `the_takenhandle`)
- Clicking an alternative fills the input with that handle
- After clicking alternative, status changes to show availability of the new handle

**Covers:** BR-LANDING-001 §Alternatives

---

## Scenario S7 — Successful reservation navigates to /register

**Prerequisite:** `handle_reservations` table empty.

**Steps:**
1. Navigate to `/`
2. Type `myhandle23` into hero input
3. Wait 350 ms (available state confirmed)
4. Click "Claim your handle →" button

**Verifies:**
- Browser navigates to `/register?handle=myhandle23`
- A row appears in `handle_reservations` for `myhandle23` with `expires_at` ~15 min in future

**Covers:** BR-LANDING-001 §Reservation flow

---

## Scenario S8 — Underscores allowed in handle

**Steps:**
1. Navigate to `/`
2. Type `cool_creator_2026` into hero input
3. Wait 350 ms

**Verifies:**
- Status shows available (or taken if seeded)
- No validation error (underscores ARE permitted)
- URL preview shows `tadaify.com/cool_creator_2026`

**Covers:** BR-LANDING-001 §Validation, handle regex `^[a-z0-9](?:[a-z0-9_]{1,29})?$`

---

## Scenario S9 — Final CTA band claim form works independently

**Steps:**
1. Navigate to `/` and scroll to bottom CTA band
2. Type a valid handle into the CTA band input (separate form instance)
3. Wait 350 ms
4. Click claim button in CTA band

**Verifies:**
- CTA band form shows availability state independently
- Preview shows `tadaify.com/<handle>` (correct URL, no `!`)
- Navigates to `/register?handle=<input>` on claim

**Covers:** BR-LANDING-001 §Final CTA band

---

## Scenario S10 — Pricing section shows correct values

**Steps:**
1. Navigate to `/`
2. Scroll to pricing / feature comparison sections

**Verifies:**
- Creator tier price shows `$7.99/mo` (NOT $8, $9, or any other value)
- Pro tier price shows `$19.99/mo` (NOT $19 or $20)
- Custom domain add-on shows `$1.99/mo`
- AI quota ladder visible: Free 5 / Creator 20 / Pro 100 / Business ∞

**Covers:** BR-LANDING-001 §Pricing (DEC-279, DEC-AI-QUOTA-LADDER-01)

---

## Scenario S11 — FAQ section renders and expands

**Steps:**
1. Navigate to `/`
2. Scroll to FAQ section
3. Click the first FAQ item

**Verifies:**
- FAQ items use native `<details>` / `<summary>` elements
- Clicking opens the answer panel
- AI quota FAQ answer mentions `5 / 20 / 100 / ∞`

**Covers:** BR-LANDING-001 §FAQ

---

## Scenario S12 — Accessibility: aria-live on preview

**Steps:**
1. Navigate to `/`
2. Use automated accessibility checker (e.g. axe-core or manual attribute check)

**Verifies:**
- The URL preview container has `aria-live="polite"`
- Hero input has an associated `<label>` or `aria-label`
- MotionLogo respects `prefers-reduced-motion` (RAF not started when motion disabled)

**Covers:** BR-LANDING-001 §Accessibility

---

## ECN coverage

| ECN | Title | Covered by |
|-----|-------|-----------|
| ECN-LANDING-01 | 2-char handle typed | S3 |
| ECN-LANDING-02 | Hyphen in handle | S4 |
| ECN-LANDING-03 | Blocked word | S5 |
| ECN-LANDING-04 | Already reserved | S6 |
| ECN-LANDING-05 | Underscore handle | S8 |
| ECN-LANDING-06 | Wrong pricing value visible | S10 |

---

## Notes

- S7 requires local Supabase running and migration applied.
- S6 requires manual seed or `supabase db reset && psql ... -c "INSERT ..."`.
- No `.spec.ts` file is generated at this stage per `feedback_tadaify_per_playwright_test_authorization`. Playwright specs are generated post-DEV-deploy by `test-spec-generator` skill dispatch.

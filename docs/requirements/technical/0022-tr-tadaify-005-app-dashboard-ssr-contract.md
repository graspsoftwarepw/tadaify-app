# TR-tadaify-005 — App Dashboard SSR-first contract

**Level:** MUST
**Introduced:** F-APP-DASHBOARD-001a (#171)
**Status:** accepted

## Context

The `/app` route is the primary post-onboarding workspace for every tadaify creator. It must render
a complete, useful first paint from the server so that creators with slow connections or disabled JS
see their dashboard immediately, without a client-side loading skeleton.

The route also needs to infer the creator's onboarding-completion state from their profile row and
surface the correct welcome banner copy — with a hard constraint (DEC-332=D) that the banner never
claims the page is "live" when it may not yet be published.

## Decision

1. **SSR-first loader**: the RR7 `loader()` in `app/routes/app.tsx` fetches `profiles`,
   `account_settings`, `pages`, and `blocks` in parallel via Supabase service-role REST before
   returning the view-model. No client waterfall on first load.

2. **Pure-function extractables**: `parseTab(URLSearchParams)`, `parseDevice(URLSearchParams)`,
   and `parseSubTab(URLSearchParams)` are exported from the route module so they can be unit-tested
   in isolation (U1 test suite) without spinning up a Workers runtime.

3. **Onboarding state derivation**: `app/lib/onboarding-state.ts` exports `deriveOnboardingState()`,
   `getBannerCopy()`, and `getResumeUrl()`. These are pure functions with no I/O. The loader calls
   `deriveOnboardingState(profile)` and passes the resulting `OnboardingState` enum value into the
   view-model. Component receives it as a prop — no client-side re-derivation.

4. **DEC-332=D enforcement in type system**: `OnboardingState` is a discriminated string union.
   `getBannerCopy()` maps every value; the exhaustive unit tests (U2, U4) assert that no state
   produces "your page is live" copy.

5. **Stub mode for dev without Supabase**: when `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are
   absent from the Workers env, the loader returns `buildStubViewModel()` instead of throwing.
   Facilitates `npm run dev` smoke tests without a running local Supabase.

6. **Responsive layout contract**:
   - `<600px` (mobile): `.app-sidebar { display: none }`, `.app-mobile-tabs` shown.
   - `600–1023px` (tablet): sidebar visible, preview pane hidden.
   - `≥1024px` (desktop): sidebar + preview pane both visible.

## Consequences

- The loader always performs at least 3 parallel REST fetches. Cold Workers start latency is
  acceptable because Supabase local + Workers dev server both run on localhost.
- Unit tests (U1-U4) cover all pure-function branches without a DOM environment.
- Playwright tests (S1-S7) cover auth + onboarding-interrupt scenarios end-to-end.
- Adding blocks or pages to the homepage requires re-running the loader (full page navigation or
  `revalidate`). Client-side optimistic adds are out of scope for #171.

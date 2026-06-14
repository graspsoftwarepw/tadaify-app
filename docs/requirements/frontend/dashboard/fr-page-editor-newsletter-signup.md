---
id: fr-page-editor-newsletter-signup
title: Page editor — Newsletter signup page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-newsletter-signup]
related_files:
  - src/proto/screens/page-editors/NewsletterSignupEditorScreen.tsx
  - src/proto/screens/page-editors/newsletterSignupEditorFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Newsletter signup page

The creator-facing editor a creator opens at Pages > Subscribe, ported from
`mockups/tadaify-mvp/app-page-newsletter-signup.html`. It pairs with the public visitor view
(creator-newsletter-signup-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Subscribe), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Subscribe" sub-page row marked as the active page.
- The page header shall show the emoji "✉️", the title "Subscribe", a one-line description, a URL pill
  (`tadaify.com/<handle>/subscribe` with a live dot when published), and a "Preview" link.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Page settings section

- A collapsible "Page settings" section (with a "Live" chip) shall contain: page title, URL slug
  (prefixed `tadaify.com/<handle>/`), a "Page is live" publish toggle, a "Common alternatives"
  title/slug chip row, a page theme-colour swatch row (one selected), a collapsible "SEO settings"
  expander (meta title with ✨ Suggest, meta description, OG-image drop), a Pro-badged "Custom domain"
  field with an upgrade hint, and a Business-badged "A/B test variants" toggle with an upgrade hint.

## Content sections

- **Hero** — headline (with ✨ Suggest and headline-idea chips), sub-headline, and a cover-image drop.
- **Email provider** — a provider select (Kit, Beehiiv, MailerLite, Mailchimp, Klaviyo, Google Sheets,
  Generic webhook) whose connection panel swaps to match the choice (API-key + test + list/source for
  the API providers; Google sign-in + sheet/tab for Google Sheets; webhook URL + copyable tadaify
  endpoint for the webhook), plus a success-message field with ✨ Suggest.
- **Signup form** — a three-option layout picker (one-line / two-line / centered card), email
  placeholder, button label (✨ Suggest), a GDPR consent toggle with an info hint, and consent copy.
- **Social proof** — a style select (count / quotes / both), a count template, a "Pull count" toggle,
  a Creator-badged "Show count to visitors" toggle, and an editable testimonial-quote list.
- **What you'll get** — a section heading, an editable emoji-bullet list, and template chips.
- **Past issues preview** (Creator tier badge) — a "Show past issues" toggle and a live preview grid
  of three recent posts.
- **FAQ** — editable question/answer rows with delete, plus an "Add question" action.
- **Footer CTA** — closing headline, button label, social-fallback copy, and a "Use my main page
  socials" toggle.
- Premium fields (custom domain, A/B testing, public count, past-issues preview) shall stay fully
  visible and interactive on every tier; the upgrade gate is mocked at Save.

## Modals

- "Add section" shall open a centred modal — never a side drawer — listing section-type tiles (some
  carrying tier badges and an "Added" marker).
- Any cover-image drop shall open a centred image-picker modal (a drop zone, a library grid, and a
  ✨ Generate-with-AI action). Cancel / Escape / the backdrop closes any modal.

## States

- The editor shall render either a filled state (the seeded section stack) or an empty state
  (a "Your subscribe page is empty" prompt with "Use recommended layout" and "Add section" actions).
  A demo control toggles between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (the layout picker, social-proof rows, bullet rows, and past-issue grid reflow on narrow screens).

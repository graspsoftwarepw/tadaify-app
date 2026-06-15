---
id: fr-domain
title: Configuration — Custom domain
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/domain]
related_files:
  - src/proto/screens/domain/DomainScreen.tsx
  - src/proto/screens/domain/domainFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Configuration — Custom domain

The creator-facing custom-domain configuration page a creator opens at
Configuration > Domain, ported from `mockups/tadaify-mvp/app-domain.html`. It renders inside the
creator dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) with the Domain entry in the
Configuration group marked active, and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)) so light and dark
stay auditable. A custom domain is a universal $1.99/mo add-on available on every tier; custom
domains route to tadaify infrastructure (single-domain architecture).

## Shell & header

- The screen shall render inside the shared dashboard chrome with `activeNav="domain"`.
- The page header shall show the title "Your domain", a one-line description ("Connect a custom
  domain so visitors see your URL, not ours."), and a primary action button that reads "Add domain"
  in the empty state and "Add another" once at least one domain is connected.
- A demo control row (state Empty / List and tier Free / Creator / Pro / Business) shall let the
  reviewer flip between the empty and list states and switch the billing-note tier. It is a mockup
  affordance, not part of the real UX.

## Empty state

- When no domains are connected the screen shall show a dashed hero ("Make tadaify yours", an
  apex-URL preview, a benefit paragraph, an "Add domain" button, and a "$1.99/mo per domain"
  price note) plus a footer that reassures "Already have a domain?" and lists recommended
  registrars as chips.

## Connected-domain list

- When one or more domains are connected the screen shall list each as a card with a coloured
  status dot (green active / yellow provisioning / red error), the domain name, an optional
  "Primary" badge, a meta row (e.g. Connected · SSL active · 47 days, or DNS verified · a pulsing
  "SSL provisioning…" · Updates every 30s), an optional "Visit" link (active domains only), and a
  kebab menu.
- The kebab menu shall offer Set as primary and Test live (active domains only), Re-check DNS / SSL,
  and a destructive Remove domain item. It closes on outside click and on Escape.
- A tier-contextual billing row shall summarise the monthly cost for the connected domains based on
  the selected tier.

## Add-domain wizard

- The "Add domain" / "Add another" button shall open a centred modal wizard — never a side drawer —
  with a three-step indicator (Domain / DNS / Live).
- **Step 1 — Domain** — a domain input with an apex-vs-subdomain auto-detect hint, inline validation
  errors (rejecting http://, www., spaces and malformed domains), and Cancel / Continue actions.
- **Payment overlay** — on the Free tier when adding the first domain, Continue shall route to a
  mocked "$1.99/mo" custom-domain add-on payment panel (plan summary + card fields) with Back /
  "Pay & continue" actions before DNS. Other tiers skip straight to DNS.
- **Step 2 — DNS** — a DNS-record table (CNAME → tadaify.com, Name/Host derived from apex vs
  subdomain, TTL), an expandable optional TXT verification record, a live DNS status bar
  (waiting → verified), an expandable per-registrar instruction list, and Back / "I've added the
  records — verify now" actions. Clicking verify marks DNS verified and advances to Live.
- **Step 3 — Live** — an SSL provisioning timeline (DNS verified → provisioning SSL → SSL ready). A
  demo control finishes provisioning, revealing a success CTA with the live `https://` URL, a Copy
  URL button, a Done button, and the recurring-billing fine print.

## Remove confirmation

- Choosing Remove domain shall open a centred confirm modal naming the domain, explaining visitors
  will be redirected to the tadaify page, and noting the add-on cancels at the end of the current
  billing period (days remaining). Keep domain dismisses it; Remove domain drops the card.

## DNS troubleshooting & help

- A page-level expandable "DNS troubleshooting — common registrars & errors" section shall list
  per-registrar CNAME paths plus a DNS-propagation note. A footer shall link to a domain setup
  guide and to support (mocked, no-op).

## Theming, modals & responsiveness

- All modals shall be centred and close on Escape, Cancel and backdrop click.
- The screen shall render correctly in light and dark themes and adapt across desktop, tablet, and
  phone widths down to 390px, with the DNS-record table and live-URL CTA wrapping or scrolling
  rather than overflowing, and the right-hand best-practices tips panel showing only on wide screens.

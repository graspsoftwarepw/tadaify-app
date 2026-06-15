/**
 * Administration → Store (v2 placeholder) — the creator-facing admin page a
 * creator opens at Administration > Store. Faithful port of
 * mockups/tadaify-mvp/app-admin-store.html, rendered inside the shared
 * dashboard chrome (appbar + sidebar) with the Store sub-item (marked "v2")
 * active.
 *
 * Store ships in v2 (native commerce: Stripe Connect, product CRUD, checkout,
 * orders). MVP renders ONLY this empty/coming-soon state — the breadcrumb,
 * page header, a v2 hero with two cross-links to the Product block / block
 * picker, a "notify me" signup card, a "What's coming in v2" feature grid, and
 * a closing Product-block cross-link. Presentational; local state is limited to
 * the notify-me email input. Data comes from the typed adminStoreFixture.
 *
 * @implements fr-admin-store
 * @implements fr-globalui-view-layout
 */
import "./admin-store-proto.css";
import { useState } from "react";
import { DashboardChrome } from "../dashboard/DashboardChrome";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { adminStoreFixture } from "./adminStoreFixture";

export function AdminStoreScreen() {
  const fx = adminStoreFixture();
  const [email, setEmail] = useState("");

  const onNotify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail("");
    alert(
      "Mockup — you would receive a notification when Store v2 ships.",
    );
  };

  return (
    <DashboardChrome profile={dashboardProfileFixture()} activeNav="admin-store">
      <section className="proto-admin-store" aria-labelledby="admin-store-title">
        <nav className="as-crumb" aria-label="Breadcrumb">
          <a href="/__proto/dashboard">Dashboard</a>
          <span className="sep" aria-hidden>/</span>
          <span className="here">Administration · Store</span>
        </nav>

        <header className="page-head as-page-head">
          <div>
            <h1 id="admin-store-title">
              <span className="ph-emoji" aria-hidden>{fx.emoji}</span> {fx.title}{" "}
              <span className="chip as-chip-v2">v2</span>
            </h1>
            <div className="sub">{fx.description}</div>
          </div>
        </header>

        <div className="as-hero">
          <div className="as-hero-icon" aria-hidden>{fx.emoji}</div>
          <div className="as-timeline-pill">{fx.timelinePill}</div>
          <h2>{fx.heroHeadline}</h2>
          <p>
            tadaify MVP doesn't include a native commerce platform. For now,
            sell via your existing store — Shopify, Stripe Payment Links, Etsy,
            Gumroad, Lemon Squeezy, or any URL — by adding a{" "}
            <b>Product block</b> to your home page. The block links visitors
            directly to your checkout.
          </p>
          <div className="as-hero-actions">
            <a href="/__proto/block-editor" className="btn btn-primary">
              ＋ Add a Product block now
            </a>
            <a href="/__proto/block-picker" className="btn btn-ghost">
              Browse other blocks
            </a>
          </div>
        </div>

        <div className="as-signup-card">
          <div className="as-signup-copy">
            <div className="label">{fx.signup.label}</div>
            <div className="sub">{fx.signup.sub}</div>
          </div>
          <form className="as-signup-form" onSubmit={onNotify}>
            <input
              type="email"
              placeholder={fx.signup.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email for Store v2 launch notification"
            />
            <button className="btn btn-primary btn-sm" type="submit">
              Notify me
            </button>
          </form>
        </div>

        <h3 className="as-features-heading">{fx.featuresHeading}</h3>
        <div className="as-feature-list">
          {fx.features.map((f) => (
            <div className="as-feature-card" key={f.id}>
              <div className="as-feat-icon" aria-hidden>{f.icon}</div>
              <h4 className="as-feat-name">{f.name}</h4>
              <div className="as-feat-sub">{f.sub}</div>
            </div>
          ))}
        </div>

        <div className="as-crosslink">
          <div className="as-cl-icon" aria-hidden>{fx.crosslink.icon}</div>
          <div className="as-cl-meta">
            <div className="as-cl-name">{fx.crosslink.name}</div>
            <div className="as-cl-sub">{fx.crosslink.sub}</div>
          </div>
          <a href="/__proto/block-editor" className="btn btn-warm">
            Open block editor
          </a>
        </div>
      </section>
    </DashboardChrome>
  );
}

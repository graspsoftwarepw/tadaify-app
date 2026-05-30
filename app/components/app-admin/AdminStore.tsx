/**
 * AdminStore — Administration → Store sub-page.
 *
 * Visual contract: mockups/tadaify-mvp/app-admin-store.html (216 LOC)
 *
 * Per feedback_tadaify_no_shop_in_mvp — Store ships in v2 with Stripe Connect,
 * product CRUD, checkout, and orders. MVP only shows the v2 placeholder with
 * feature preview and notify-me form.
 *
 * All form actions stubbed — TODO: wire to admin API.
 */

interface AdminStoreProps {
  handle: string;
}

const V2_FEATURES = [
  { icon: "📦", name: "Product CRUD",              sub: "Create, edit, archive products. Cover, gallery, variants (size/color), inventory tracking, SKU." },
  { icon: "💳", name: "Stripe Connect checkout",   sub: "Native checkout with Stripe Connect. Payouts to your bank, Apple Pay / Google Pay, EU tax handling." },
  { icon: "📋", name: "Orders inbox",              sub: "All orders in one view. Mark fulfilled, print packing slips, refund, contact buyer." },
  { icon: "📊", name: "Sales analytics",           sub: "Revenue per product, cart abandonment, top referrer, monthly snapshots." },
  { icon: "🚚", name: "Shipping & digital",        sub: "Physical (rates by zone) + digital (auto-deliver download link on payment)." },
  { icon: "🎁", name: "Discount codes",            sub: "Percentage + flat-amount codes, expiry, usage limits. Free Stripe automatic taxes." },
];

export function AdminStore({ handle: _handle }: AdminStoreProps) {
  return (
    <section className="main-admin main-admin-store" aria-labelledby="admin-store-title">
      {/* Breadcrumb */}
      <nav className="admin-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Dashboard</a>
        <span className="admin-crumb-sep">/</span>
        <span className="admin-crumb-here">Administration · Store</span>
      </nav>

      {/* Page head */}
      <div className="admin-page-head">
        <div>
          <h1 id="admin-store-title">
            <span className="admin-ph-emoji" aria-hidden="true">🛍</span>
            Store{" "}
            <span className="admin-chip admin-chip-v2">v2</span>
          </h1>
          <div className="admin-page-sub">Native commerce, products, inventory, and orders ship in tadaify v2.</div>
        </div>
      </div>

      {/* v2 hero */}
      <div className="admin-v2-hero">
        <div className="admin-v2-icon" aria-hidden="true">🛍</div>
        <div className="admin-timeline-pill">⏱ Targeting v2 · later this year</div>
        <h2>Native Store comes in v2</h2>
        <p>
          tadaify MVP doesn&apos;t include a native commerce platform. For now, sell via your existing store —
          Shopify, Stripe Payment Links, Etsy, Gumroad, Lemon Squeezy, or any URL — by adding a{" "}
          <b>Product block</b> to your home page. The block links visitors directly to your checkout.
        </p>
        <div className="admin-v2-actions">
          {/* TODO: wire to admin API */}
          <button className="admin-btn admin-btn-primary">＋ Add a Product block now</button>
          <button className="admin-btn admin-btn-ghost">Browse other blocks</button>
        </div>
      </div>

      {/* Notify me form */}
      <div className="admin-signup-card">
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="admin-signup-label">Get notified when Store ships</div>
          <div className="admin-signup-sub">One email when v2 launches with native commerce. No promo, no spam.</div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: wire to admin API
          }}
          style={{ display: "flex", gap: 8, flex: 1, minWidth: 240 }}
        >
          <input type="email" placeholder="alexandra@example.com" className="admin-email-input" aria-label="Email address" />
          <button className="admin-btn admin-btn-primary admin-btn-sm" type="submit">Notify me</button>
        </form>
      </div>

      {/* v2 feature list */}
      <h3 className="admin-v2-features-title">What&apos;s coming in v2</h3>
      <div className="admin-feature-list">
        {V2_FEATURES.map((f) => (
          <div className="admin-feature-card" key={f.name}>
            <div className="admin-feat-icon" aria-hidden="true">{f.icon}</div>
            <h4 className="admin-feat-name">{f.name}</h4>
            <div className="admin-feat-sub">{f.sub}</div>
          </div>
        ))}
      </div>

      {/* Cross-link to Product block */}
      <div className="admin-crosslink">
        <div className="admin-crosslink-icon" aria-hidden="true">🔗</div>
        <div className="admin-crosslink-meta">
          <div className="admin-crosslink-name">In the meantime — use the Product block</div>
          <div className="admin-crosslink-sub">
            The Product block on your home page can link to ANY external store URL — Shopify, Etsy, Gumroad, Stripe
            Payment Link. Visitors click → land on your existing checkout. Zero migration needed.
          </div>
        </div>
        {/* TODO: wire to admin API */}
        <button className="admin-btn admin-btn-warm">Open block editor</button>
      </div>
    </section>
  );
}

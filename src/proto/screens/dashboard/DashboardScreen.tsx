/**
 * Creator dashboard — "My page" view. Faithful port of
 * mockups/tadaify-mvp/app-dashboard.html, reusing the app's own dashboard
 * styling (app/styles/app-dashboard.css, loaded globally by root.tsx and scoped
 * under `.app-dashboard-root`). Presentational only; data from typed fixtures.
 *
 * The appbar + sidebar chrome is shared with the page editors via
 * `DashboardChrome`; this screen only owns its `main.content` body.
 *
 * @implements fr-dashboard-my-page
 * @implements fr-globalui-view-layout
 */
import "./dashboard-proto.css";
import { DashboardChrome, ChromeIcon as S, SOCIAL_CLASS, SOCIAL_TIP, SocialGlyph } from "./DashboardChrome";
import {
  dashboardBlocksFixture,
  dashboardProfileFixture,
} from "./dashboardFixture";

export function DashboardScreen() {
  const profile = dashboardProfileFixture();
  const blocks = dashboardBlocksFixture();

  return (
    <DashboardChrome profile={profile} activeTab="page" activePage="home">
      <section className="main-page" aria-labelledby="page-title">
        <div className="page-head">
          <div>
            <h1 id="page-title">My page</h1>
            <div className="sub">
              <span>{profile.blockCount} blocks</span>
              <span className="dot" />
              <span className="only-ready">Live · updated 2 min ago</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-ghost btn-sm" type="button">
              <S w={14}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></S>
              Copy link
            </button>
            <button className="btn btn-primary btn-sm" type="button">
              <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
              Add block
            </button>
          </div>
        </div>

        {/* Welcome banner */}
        <div className="welcome-banner only-ready">
          <span className="wb-ic">🎉</span>
          <div className="wb-body">
            <b>Your page is live.</b> Share{" "}
            <a href="/__proto/creator-public" style={{ color: "var(--brand-primary)", fontWeight: 500 }}>
              tadaify.com/{profile.handle}
            </a>{" "}
            on your socials — you had {profile.visitsThisWeek} visits this week.
          </div>
          <button className="wb-close" aria-label="Dismiss" type="button">✕</button>
        </div>

        {/* Pinned message */}
        <div className="proto-pinned">
          <label className="proto-pinned-label">
            <span className="toggle" />
            <span>Pinned message</span>
          </label>
          <div className="proto-pinned-field">
            <input
              className="proto-pinned-input"
              type="text"
              maxLength={80}
              placeholder="e.g. New course Friday — set a reminder? 📣"
            />
            <span className="proto-pinned-meta">80</span>
          </div>
          <span className="proto-pinned-meta">Dismissible by visitor</span>
        </div>

        {/* Profile card */}
        <div className="profile-card">
          <div className="pc-av-wrap">
            <div className="pc-av">{profile.initials}</div>
            <div className="pc-av-cam">
              <S w={12}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></S>
            </div>
          </div>
          <div className="pc-body">
            <div className="pc-head">
              <div className="pc-name">{profile.displayName}</div>
              {profile.verified && <span className="chip verified">✓ verified</span>}
            </div>
            <div className="pc-bio">{profile.bio}</div>
            <div className="pc-handle">tadaify.com/{profile.handle}</div>
            <div className="pc-socials">
              {profile.socials.map((kind) => (
                <button key={kind} className={`pc-social ${SOCIAL_CLASS[kind]}`} aria-label={`${SOCIAL_TIP[kind]} @${profile.handle}`} type="button">
                  <SocialGlyph kind={kind} />
                </button>
              ))}
              <button className="pc-social-add" aria-label="Add another social" type="button">+</button>
            </div>
          </div>
          <button className="pc-edit" type="button">
            <S><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></S>
            <span>Edit</span>
          </button>
        </div>

        {/* Quick chips */}
        <div className="quick-chips only-ready">
          <button className="qchip" type="button">
            <S><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></S>
            Organise…
            <S w={12}><polyline points="6 9 12 15 18 9" /></S>
          </button>
          <button className="qchip" type="button">
            <S><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></S>
            Share page
          </button>
        </div>

        {/* Blocks */}
        <div className="only-ready">
          <div className="section-label">Blocks</div>
          <section className="blocks" aria-label="Page blocks">
            {blocks.map((b) => (
              <div className="block" key={b.id} data-block={b.id}>
                <span className="grip" title="Drag to reorder">⋮⋮</span>
                <span className={`ic ${SOCIAL_CLASS[b.kind]}`}>
                  <SocialGlyph kind={b.kind} />
                </span>
                <div className="meta">
                  <div className="t">{b.title}</div>
                  <div className="u">{b.url}</div>
                </div>
                <div className="stat"><b>{b.clicks}</b>clicks · 7d</div>
                <div className="tools">
                  <span className={`toggle ${b.live ? "on" : ""}`} />
                  <button className="iconbtn" aria-label="Edit block" type="button">
                    <S><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></S>
                  </button>
                  <button className="iconbtn" aria-label="More" type="button">
                    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} aria-hidden><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                  </button>
                </div>
              </div>
            ))}
            <button className="add-block" type="button">
              <S w={18}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
              Add a block
            </button>
          </section>
        </div>
      </section>
    </DashboardChrome>
  );
}

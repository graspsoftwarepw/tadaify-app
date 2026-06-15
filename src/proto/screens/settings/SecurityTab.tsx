/**
 * Settings · Security tab — sign-in password (change + sign-out-everywhere),
 * authenticator-app 2FA (enrolled state, backup codes, recovery method),
 * active sessions list, a filterable login-history audit log, and connected
 * OAuth accounts, with a security-score recommendations rail. Faithful port of
 * mockups/tadaify-mvp/app-settings-security.html, composed on the shared
 * SettingsShell primitives.
 *
 * Security changes apply immediately — there is no batch save-bar (the tab
 * never calls `onSaveBar`). Every editor opens a centred modal that closes on
 * Escape / backdrop / Cancel: change-password, the 3-step TOTP setup, view /
 * regenerate backup codes, disable 2FA, sign-out-all, and disconnect-provider.
 * All side effects (sign out, disable 2FA, regenerate, OAuth) are mocked with
 * an alert — no dead links. Data comes from the typed securityFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import { SettingsSection, FieldRow, SettingsModal } from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import { securityFixture, type LoginEvent } from "./securityFixture";

type Modal =
  | null
  | "change-password"
  | "totp-setup"
  | "backup-view"
  | "regenerate"
  | "disable-2fa"
  | "signout-all"
  | { kind: "disconnect"; provider: string };

const mock = (msg: string) => () => alert(msg);

export function SecurityTab() {
  const fx = securityFixture();
  const [modal, setModal] = useState<Modal>(null);
  const [totpStep, setTotpStep] = useState<1 | 2 | 3>(1);
  const [histFilter, setHistFilter] = useState<"all" | "success" | "fail">("all");

  const close = () => {
    setModal(null);
    setTotpStep(1);
  };

  const shownHistory = fx.history.filter((h) => histFilter === "all" || h.kind === histFilter);

  return (
    <div className="sec-grid">
      <div className="sec-col-main">
        {/* Password */}
        <SettingsSection
          title="Sign-in password"
          lede="Used when you sign in with email + password. We hash with bcrypt server-side; we never store the plaintext."
          action={<span className="chip warn">Last changed {fx.passwordAgeDays} days ago</span>}
        >
          <FieldRow label="Change password" hint="Opens a centred modal to change in one step">
            <button className="btn btn-primary btn-sm" type="button" onClick={() => setModal("change-password")}>
              <S w={14}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </S>
              Change password
            </button>
            <p className="field-help">All other devices are signed out automatically when your password changes (this session stays active).</p>
          </FieldRow>
          <FieldRow label="Sign out everywhere" hint="Without changing your password">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setModal("signout-all")}>
              <S w={14}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </S>
              Sign out all other sessions
            </button>
            <p className="field-help">Useful if you signed in on a friend's laptop and forgot to log out. Your current session keeps working.</p>
          </FieldRow>
        </SettingsSection>

        {/* 2FA */}
        <SettingsSection
          title="Authenticator app (TOTP)"
          lede="Time-based one-time codes from Google Authenticator, 1Password, Authy, Bitwarden, or any RFC-6238 app."
          action={
            <span className={`status-pill ${fx.twoFactorOn ? "is-on" : "is-off"}`}>
              <span className="sp-dot" aria-hidden />
              {fx.twoFactorOn ? "Enabled" : "Disabled"}
            </span>
          }
        >
          <FieldRow label="Authenticator" hint="RFC-6238 TOTP, 6 digits / 30 s">
            {fx.twoFactorOn ? (
              <div className="totp-on-row">
                <span className="totp-enrolled">
                  <S w={14}>
                    <polyline points="20 6 9 17 4 12" />
                  </S>
                  Enrolled <b>{fx.enrolledOn}</b> · last used <b>{fx.lastUsed}</b>
                </span>
                <button className="btn btn-danger-ghost btn-sm" type="button" onClick={() => setModal("disable-2fa")}>
                  Disable 2FA
                </button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setModal("totp-setup")}>
                Set up authenticator
              </button>
            )}
          </FieldRow>
          {fx.twoFactorOn && (
            <>
              <FieldRow label="Backup codes" hint="Single-use, bypass 2FA if you lose your device">
                <div className="inline-actions">
                  <span className="chip success">
                    {fx.backupCodesUnused} of {fx.backupCodesTotal} unused
                  </span>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setModal("backup-view")}>
                    View remaining
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setModal("regenerate")}>
                    Regenerate (invalidates old)
                  </button>
                </div>
              </FieldRow>
              <FieldRow label="Recovery method" hint="If both authenticator and backup codes are lost">
                <div style={{ fontSize: 13, color: "var(--fg)" }}>
                  Email <b>{fx.recoveryEmail}</b> — verified {fx.recoveryVerifiedOn}
                </div>
                <p className="field-help">
                  If you lose access, contact support from this verified email. We never auto-recover 2FA — a security trade-off.
                </p>
              </FieldRow>
            </>
          )}
        </SettingsSection>

        {/* Active sessions */}
        <SettingsSection
          title="Where you're signed in"
          lede="Sessions auto-prune after 90 days of inactivity. Sign out any device to revoke its access immediately."
          action={
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setModal("signout-all")}>
              Sign out all other sessions
            </button>
          }
        >
          <div className="sess-list">
            {fx.sessions.map((s) => (
              <div key={s.id} className="sess-row">
                <div className="sess-icon" aria-hidden>
                  {s.icon}
                </div>
                <div className="sess-info">
                  <div className="s-device">
                    {s.device}
                    {s.current && <span className="sess-current-pill">This session</span>}
                    {s.sameWifi && <span className="chip">Same Wi-Fi</span>}
                  </div>
                  <div className={`s-meta${s.stale ? " is-stale" : ""}`}>
                    {s.location} · <span className="mono">{s.ip}</span> · Last seen {s.lastSeen}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  type="button"
                  disabled={s.current}
                  title={s.current ? "Can't sign out the session you're using" : undefined}
                  onClick={s.current ? undefined : mock(`Mockup — would sign out ${s.device}`)}
                >
                  Sign out
                </button>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Login history */}
        <SettingsSection
          title="Login history · last 30 days"
          lede="Read-only audit log of every sign-in event. Older entries are pruned automatically."
          action={
            <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would email support about suspicious activity")}>
              Suspicious activity?
            </button>
          }
        >
          <div className="log-toolbar">
            <div className="log-tabs" role="tablist">
              {([
                ["all", "All"],
                ["success", "Successful"],
                ["fail", "Failed"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={histFilter === id}
                  className={`log-tab${histFilter === id ? " active" : ""}`}
                  onClick={() => setHistFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="log-list">
            {shownHistory.map((h: LoginEvent) => (
              <div key={h.id} className={`log-row${h.kind === "fail" ? " is-failed" : ""}`}>
                <div className="lr-icon" aria-hidden>
                  {h.icon}
                </div>
                <div className="lr-event">
                  {h.event}
                  <span className="lr-meta">{h.meta}</span>
                </div>
                <span className={`lr-method m-${h.methodClass}`}>{h.method}</span>
                <div className="lr-time">{h.time}</div>
              </div>
            ))}
          </div>
          <div className="log-foot">
            <span>Showing last 30 days · older entries pruned automatically.</span>
            <button className="field-link" type="button" onClick={mock("Mockup — would download a CSV of all visible rows")}>
              Download as CSV
            </button>
          </div>
        </SettingsSection>

        {/* Connected accounts */}
        <SettingsSection title="Sign in with…" lede="Use a connected account as an alternative way to sign in. You can disconnect any time as long as you have a password set.">
          <div className="oauth-grid">
            {fx.oauth.map((o) => (
              <div key={o.id} className={`oauth-card${o.connected ? "" : " is-disconnected"}`}>
                <div className={`o-ico ${o.glyphClass}`} aria-hidden>
                  {o.glyph}
                </div>
                <div className="o-info">
                  <div className="o-name">{o.name}</div>
                  <div className="o-meta">{o.meta}</div>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  type="button"
                  onClick={
                    o.connected
                      ? () => setModal({ kind: "disconnect", provider: o.name })
                      : mock(`Mockup — would start ${o.name} OAuth flow`)
                  }
                >
                  {o.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </div>
          <p className="field-help" style={{ marginTop: 14 }}>
            Disconnecting a provider doesn't sign you out — it just removes that sign-in option for next time.
          </p>
        </SettingsSection>
      </div>

      {/* Recommendations rail */}
      <aside className="sec-col-side" aria-label="Security recommendations">
        <div className="rec-card">
          <div className="rec-head">
            <div className="rec-title">Security score</div>
            <span className="rec-score is-good">{fx.securityScore} / 100 · Good</span>
          </div>
          <p className="rec-lede">Based on password age, 2FA, recent sessions, and connected accounts. Updated live.</p>
          <div className="rec-list">
            {fx.recommendations.map((r) => (
              <div key={r.id} className={`rec-item prio-${r.prio}${r.done ? " is-done" : ""}`}>
                <span className="rec-prio" aria-hidden />
                <div className="rec-body">
                  <div className="rec-name">{r.name}</div>
                  <div className="rec-desc">{r.desc}</div>
                  {r.cta && (
                    <button
                      className="rec-cta"
                      type="button"
                      onClick={r.id === "r2" ? () => setModal("change-password") : mock("Mockup — would jump to the relevant section")}
                    >
                      {r.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rec-card">
          <div className="rec-head">
            <div className="rec-title">About this tab</div>
          </div>
          <p className="rec-lede" style={{ margin: 0 }}>
            Security settings are <b>free for every tier</b> — Free, Creator, Pro, and Business get the same features. We never charge
            for staying safe.
          </p>
        </div>
      </aside>

      {/* ── Modals ── */}
      {modal === "change-password" && (
        <SettingsModal
          title="Change password"
          sub="All other devices will be signed out automatically — this session stays. If 2FA is on, it stays on."
          onClose={close}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would change your password and revoke other sessions");
                close();
              }}
            >
              Save password
            </button>
          }
        >
          <div className="modal-fields">
            <input className="field-input" type="password" placeholder="Current password" autoComplete="current-password" />
            <input className="field-input" type="password" placeholder="New password (min. 12 characters)" autoComplete="new-password" />
            <input className="field-input" type="password" placeholder="Confirm new password" autoComplete="new-password" />
          </div>
          <div className="modal-info">
            <b>Heads up:</b> all other active sessions will be signed out as soon as you save. You'll stay signed in here.
          </div>
        </SettingsModal>
      )}

      {modal === "totp-setup" && (
        <SettingsModal
          title="Set up two-factor authentication"
          sub="A 6-digit code from your authenticator app, in addition to your password. Adds about 5 seconds to sign-in."
          onClose={close}
          wide
          hideCancel
          confirm={
            totpStep === 1 ? (
              <button className="btn btn-primary btn-sm" type="button" onClick={() => setTotpStep(2)}>
                I scanned it — next →
              </button>
            ) : totpStep === 2 ? (
              <>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTotpStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => setTotpStep(3)}>
                  Verify and enable
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  alert("Mockup — would enrol the authenticator and store hashed backup codes");
                  close();
                }}
              >
                2FA enabled — done
              </button>
            )
          }
        >
          <div className="stepper" aria-label="Setup steps">
            {(["Scan QR", "Verify code", "Backup codes"] as const).map((label, i) => (
              <span key={label} className={`step-pill${totpStep === i + 1 ? " is-current" : ""}`}>
                <span className="step-num">{i + 1}</span>
                {label}
              </span>
            ))}
          </div>
          {totpStep === 1 && (
            <div className="qr-row">
              <div className="qr-tile" aria-hidden>
                <S w={88}>
                  <rect x="3" y="3" width="6" height="6" />
                  <rect x="15" y="3" width="6" height="6" />
                  <rect x="3" y="15" width="6" height="6" />
                  <rect x="11" y="11" width="2" height="2" />
                  <rect x="15" y="13" width="2" height="2" />
                  <rect x="13" y="17" width="2" height="2" />
                  <rect x="17" y="17" width="4" height="4" />
                </S>
              </div>
              <div className="qr-info">
                <ol>
                  <li>Open your authenticator app.</li>
                  <li>Tap <b>+ Add</b> or <b>Scan QR code</b>.</li>
                  <li>Point your camera at the code, or paste the secret below.</li>
                </ol>
                <div className="qr-secret-row">
                  <code>{fx.totpSecret}</code>
                  <button className="btn btn-ghost btn-xs" type="button" onClick={mock("Mockup — would copy the setup secret")}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
          {totpStep === 2 && (
            <>
              <p style={{ fontSize: 13, margin: "8px 0 12px" }}>Enter the 6-digit code currently shown in your authenticator app.</p>
              <input className="field-input totp-input" inputMode="numeric" maxLength={6} placeholder="000000" />
              <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", marginTop: 10 }}>Allows a ±30 s clock skew (RFC-6238).</p>
            </>
          )}
          {totpStep === 3 && (
            <>
              <div className="modal-warning">
                <strong>Save these codes now.</strong> They will not be shown again. Each one signs you in once if you lose access to
                your authenticator.
              </div>
              <div className="codes-grid">
                {fx.backupCodes.map((c) => (
                  <code key={c}>{c}</code>
                ))}
              </div>
              <div className="inline-actions" style={{ marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would copy all codes")}>
                  Copy all
                </button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would download backup-codes.txt")}>
                  Download
                </button>
              </div>
            </>
          )}
        </SettingsModal>
      )}

      {modal === "backup-view" && (
        <SettingsModal
          title="Remaining backup codes"
          sub={`${fx.backupCodesUnused} of ${fx.backupCodesTotal} unused. Used codes are masked. To see fresh codes, regenerate (which invalidates these).`}
          onClose={close}
          confirm={
            <button className="btn btn-primary btn-sm" type="button" onClick={close}>
              Close
            </button>
          }
        >
          <div className="codes-grid">
            {fx.backupCodes.map((c, i) =>
              i === 1 || i === 7 ? (
                <code key={c} className="is-used">
                  used
                </code>
              ) : (
                <code key={c}>{c}</code>
              ),
            )}
          </div>
        </SettingsModal>
      )}

      {modal === "regenerate" && (
        <SettingsModal
          title="Regenerate backup codes?"
          sub="This invalidates your existing codes immediately. New codes will be shown once — save them right away."
          onClose={close}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would invalidate old codes and generate a fresh set");
                close();
              }}
            >
              Yes — generate new codes
            </button>
          }
        >
          <div className="modal-warning">Any code you've written down or stored will stop working after you confirm.</div>
        </SettingsModal>
      )}

      {modal === "disable-2fa" && (
        <SettingsModal
          title="Disable two-factor authentication?"
          sub="Your account will be protected by your password alone. We strongly recommend keeping 2FA on."
          onClose={close}
          confirm={
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would unenrol the authenticator and delete unused backup codes");
                close();
              }}
            >
              Disable 2FA
            </button>
          }
        >
          <div className="modal-warning">Disabling will also delete all unused backup codes. You can always re-enable later.</div>
          <div className="modal-fields" style={{ marginTop: 12 }}>
            <input className="field-input" type="password" placeholder="Confirm your current password" autoComplete="current-password" />
            <input className="field-input" type="email" placeholder="Recovery email" autoComplete="email" />
          </div>
        </SettingsModal>
      )}

      {modal === "signout-all" && (
        <SettingsModal
          title="Sign out all other sessions?"
          sub="Every device except this one will be signed out immediately. They'll need your password (and 2FA, if enabled) to sign back in."
          onClose={close}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would revoke all other sessions and refresh the list");
                close();
              }}
            >
              Yes — sign out everywhere else
            </button>
          }
        >
          <div className="modal-info">
            Your iPhone, MacBook Air, Windows 11, and iPad Pro sessions will end. <b>This MacBook Pro stays signed in.</b>
          </div>
        </SettingsModal>
      )}

      {modal && typeof modal === "object" && modal.kind === "disconnect" && (
        <SettingsModal
          title={`Disconnect ${modal.provider}?`}
          sub="You'll no longer be able to sign in with this provider. Make sure you have a working password before disconnecting."
          onClose={close}
          confirm={
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={() => {
                alert(`Mockup — would disconnect ${modal.provider}`);
                close();
              }}
            >
              Disconnect
            </button>
          }
        />
      )}
    </div>
  );
}

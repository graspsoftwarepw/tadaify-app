/**
 * Settings · Account tab — profile photo, profile fields (display name, bio,
 * pronouns), and account identity (handle with a 1/30-day cap, email). Faithful
 * port of the Account pane in mockups/tadaify-mvp/app-settings-account.html,
 * composed on the shared SettingsShell primitives.
 *
 * Presentational, local-state only: editing a profile field flips the shell
 * save-bar to dirty (registered via `onSaveBar`); the handle field enables its
 * Save button once changed and opens a centred confirm modal; Change email
 * opens a centred modal. Both modals close on Escape / backdrop / Cancel. Data
 * comes from the typed accountFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import {
  SettingsSection,
  FieldRow,
  SettingsModal,
  type SaveBar,
} from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import { accountFixture } from "./accountFixture";

export type SettingsTabProps = {
  /** Register (or clear) this tab's sticky save-bar with the shell. */
  onSaveBar: (save: SaveBar | null) => void;
  /** Jump to another settings tab (cross-links). */
  onTab: (id: string) => void;
};

export function AccountTab({ onSaveBar, onTab }: SettingsTabProps) {
  const fx = accountFixture();

  const [bio, setBio] = useState(fx.bio);
  const [handle, setHandle] = useState(fx.handle);
  const [changeEmail, setChangeEmail] = useState(false);
  const [confirmHandle, setConfirmHandle] = useState(false);

  const markDirty = () =>
    onSaveBar({
      state: "dirty",
      onSave: () => onSaveBar(null),
      onDiscard: () => onSaveBar(null),
    });

  const handleChanged = handle.trim() !== fx.handle;

  return (
    <>
      {/* Profile photo */}
      <SettingsSection title="Profile photo">
        <div className="avatar-upload-row">
          <div className="avatar-circle">{fx.initials}</div>
          <div>
            <div className="avatar-btns">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => alert("Mockup — would open file picker")}>
                <S w={13}>
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.4 7A8 8 0 1 0 4 11" />
                </S>
                Upload photo
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => alert("Mockup — would remove photo")}>
                Remove
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 8 }}>{fx.avatarFormats}</p>
          </div>
        </div>
      </SettingsSection>

      {/* Profile */}
      <SettingsSection title="Profile">
        <FieldRow label="Display name">
          <input className="field-input" type="text" defaultValue={fx.displayName} placeholder="Your full name or display name" onChange={markDirty} />
        </FieldRow>

        <FieldRow label="Bio" hint="Appears on your public page">
          <textarea
            className="field-input"
            value={bio}
            maxLength={fx.bioMax}
            placeholder="Tell visitors who you are…"
            onChange={(e) => {
              setBio(e.target.value);
              markDirty();
            }}
          />
          <div className="field-counter">
            {bio.length}/{fx.bioMax}
          </div>
        </FieldRow>

        <FieldRow label="Pronouns" hint="Optional">
          <input className="field-input" type="text" defaultValue={fx.pronouns} placeholder="e.g. she/her, they/them, he/him" onChange={markDirty} />
        </FieldRow>
      </SettingsSection>

      {/* Account identity */}
      <SettingsSection title="Account identity">
        <FieldRow label="Handle" hint="Your public URL slug · 1 change per 30 days">
          <div className="handle-wrap">
            <div className="handle-field">
              <span className="handle-prefix">{fx.handlePrefix}</span>
              <input
                className="field-input"
                type="text"
                value={handle}
                maxLength={30}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                onChange={(e) => setHandle(e.target.value)}
              />
              <span className="handle-status">{handleChanged ? "available" : fx.handleStatus}</span>
            </div>
            <button className="btn btn-primary btn-sm" type="button" disabled={!handleChanged} onClick={() => setConfirmHandle(true)}>
              Save handle
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6 }}>
            Lowercase letters, numbers, and dashes. 3–30 chars. Last changed: <strong>{fx.handleLastChanged}</strong>.
          </p>
        </FieldRow>

        <FieldRow label="Email">
          <input className="field-input" type="email" value={fx.email} readOnly />
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6 }}>
            <button className="field-link" type="button" onClick={() => setChangeEmail(true)}>
              Change email →
            </button>
          </p>
        </FieldRow>
      </SettingsSection>

      {/* Cross-link to GDPR */}
      <p style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: -4 }}>
        Want to delete your account?{" "}
        <button className="field-link" style={{ fontSize: 12.5 }} type="button" onClick={() => onTab("gdpr")}>
          Go to GDPR &amp; data →
        </button>
      </p>

      {/* Change email modal */}
      {changeEmail && (
        <SettingsModal
          title="Change email"
          sub="We'll send a verification link to your new address. Your current email stays active until you click the link."
          onClose={() => setChangeEmail(false)}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would send verification email");
                setChangeEmail(false);
              }}
            >
              Send verification link
            </button>
          }
        >
          <div className="modal-fields">
            <input className="field-input" type="email" placeholder="New email address" autoComplete="email" />
            <input className="field-input" type="password" placeholder="Confirm your password" autoComplete="current-password" />
          </div>
        </SettingsModal>
      )}

      {/* Change handle confirm modal */}
      {confirmHandle && (
        <SettingsModal
          title="Change handle?"
          sub={
            <>
              Your tadaify slug changes from <strong>{fx.handlePrefix}{fx.handle}</strong> to <strong>{fx.handlePrefix}{handle}</strong>.
            </>
          }
          onClose={() => setConfirmHandle(false)}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would update handle, start a 30-day redirect, and lock further changes for 30 days");
                setConfirmHandle(false);
              }}
            >
              Confirm change
            </button>
          }
        >
          <div className="modal-warning">
            <strong>What happens to the old URL</strong>
            <br />
            For 30 days, <code>{fx.handlePrefix}{fx.handle}</code> will 301-redirect to your primary page (your active custom domain{" "}
            <code>{fx.customDomain}</code>). After 30 days the old slug is released and someone else can claim it.
            <br />
            <br />
            Custom domains stay bound to your account — <code>{fx.customDomain}</code> keeps working with no DNS change. You can change your handle
            again in <strong>30 days</strong>.
          </div>
        </SettingsModal>
      )}
    </>
  );
}

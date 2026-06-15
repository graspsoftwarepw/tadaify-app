/**
 * Typed mock seam for the Settings · Security tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-security.html (password age, 2FA state,
 * active sessions, login history, connected accounts, security recommendations)
 * so the tab graduates by swapping this factory for the real loader.
 *
 * @implements fr-settings
 */

export type Session = {
  id: string;
  icon: string;
  device: string;
  location: string;
  ip: string;
  lastSeen: string;
  current?: boolean;
  stale?: boolean;
  sameWifi?: boolean;
};

export type LoginEvent = {
  id: string;
  kind: "success" | "fail";
  icon: string;
  event: string;
  meta: string;
  method: string;
  methodClass: "password" | "totp" | "magic" | "oauth";
  time: string;
};

export type OAuthAccount = {
  id: string;
  name: string;
  glyph: string;
  glyphClass: string;
  connected: boolean;
  meta: string;
};

export type SecurityRec = {
  id: string;
  prio: "high" | "med" | "low";
  name: string;
  desc: string;
  cta?: string;
  done?: boolean;
};

export type SecurityFixture = {
  passwordAgeDays: number;
  twoFactorOn: boolean;
  enrolledOn: string;
  lastUsed: string;
  backupCodesUnused: number;
  backupCodesTotal: number;
  recoveryEmail: string;
  recoveryVerifiedOn: string;
  securityScore: number;
  sessions: Session[];
  history: LoginEvent[];
  oauth: OAuthAccount[];
  recommendations: SecurityRec[];
  /** TOTP manual-entry secret + sample backup codes shown in the setup modal. */
  totpSecret: string;
  backupCodes: string[];
};

export const securityFixture = (): SecurityFixture => ({
  passwordAgeDays: 47,
  twoFactorOn: true,
  enrolledOn: "Mar 9, 2026",
  lastUsed: "today 09:14",
  backupCodesUnused: 8,
  backupCodesTotal: 10,
  recoveryEmail: "alexandra@example.com",
  recoveryVerifiedOn: "Apr 12, 2026",
  securityScore: 82,
  sessions: [
    { id: "s1", icon: "💻", device: 'MacBook Pro 16" — Safari 17.4', location: "Lisbon, Portugal", ip: "212.18.4.22", lastSeen: "just now", current: true },
    { id: "s2", icon: "📱", device: "iPhone 15 Pro — Safari Mobile 17.4", location: "Lisbon, Portugal", ip: "212.18.4.22", lastSeen: "2 hours ago" },
    { id: "s3", icon: "💻", device: "MacBook Air M2 — Chrome 124", location: "Lisbon, Portugal", ip: "212.18.4.22", lastSeen: "yesterday 18:42", sameWifi: true },
    { id: "s4", icon: "🖥️", device: "Windows 11 — Chrome 124", location: "Berlin, Germany", ip: "85.214.38.12", lastSeen: "27 days ago — will auto-expire in 63 days", stale: true },
    { id: "s5", icon: "📱", device: 'iPad Pro 11" — Safari Mobile 16.6', location: "Lagos, Portugal", ip: "213.13.205.7", lastSeen: "5 days ago" },
  ],
  history: [
    { id: "h1", kind: "success", icon: "✅", event: "Signed in", meta: "MacBook Pro · Safari 17 · Lisbon, PT · 212.18.4.22", method: "Password + 2FA", methodClass: "totp", time: "Today 09:14" },
    { id: "h2", kind: "success", icon: "✅", event: "Signed in", meta: "iPhone 15 Pro · Safari Mobile · Lisbon, PT · 212.18.4.22", method: "Magic link", methodClass: "magic", time: "Yesterday 21:02" },
    { id: "h3", kind: "success", icon: "🔐", event: "2FA enabled", meta: "MacBook Pro · Safari · Lisbon, PT", method: "TOTP enrol", methodClass: "totp", time: "Mar 9, 14:32" },
    { id: "h4", kind: "fail", icon: "⚠️", event: "Failed sign-in attempt", meta: "Unknown device · Berlin, DE · 85.214.38.12 · wrong password", method: "Password", methodClass: "password", time: "Apr 20, 03:17" },
    { id: "h5", kind: "success", icon: "🔑", event: "Password changed", meta: "MacBook Pro · Safari · Lisbon, PT · all other sessions revoked", method: "Password", methodClass: "password", time: "Mar 9, 14:18" },
    { id: "h6", kind: "success", icon: "✅", event: "Signed in", meta: "iPad Pro · Safari Mobile · Lagos, PT · 213.13.205.7", method: "Google OAuth", methodClass: "oauth", time: "Apr 19, 19:11" },
    { id: "h7", kind: "fail", icon: "⚠️", event: "Failed sign-in attempt", meta: "Unknown device · Berlin, DE · 85.214.38.12 · invalid 2FA code", method: "Password + 2FA", methodClass: "totp", time: "Apr 18, 22:51" },
    { id: "h8", kind: "success", icon: "🚪", event: "Signed out — manual", meta: "MacBook Air · Chrome · Lisbon, PT · 212.18.4.22", method: "—", methodClass: "password", time: "Apr 16, 17:30" },
  ],
  oauth: [
    { id: "google", name: "Google", glyph: "G", glyphClass: "g", connected: true, meta: "Connected as alexandra@gmail.com" },
    { id: "github", name: "GitHub", glyph: "GH", glyphClass: "gh", connected: false, meta: "Not connected" },
    { id: "apple", name: "Apple", glyph: "", glyphClass: "ap", connected: false, meta: "Not connected" },
  ],
  recommendations: [
    { id: "r2", prio: "med", name: "Update your password", desc: "Last changed 47 days ago — still healthy. We'll remind you again at 90 days.", cta: "Change now →" },
    { id: "r3", prio: "low", name: "Review your active sessions", desc: "The Berlin Windows session has been idle for 27 days — consider signing it out.", cta: "Review →" },
    { id: "r4", prio: "low", name: "Connect a backup sign-in method", desc: "Google connected — you can recover access even without your password.", done: true },
  ],
  totpSecret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK",
  backupCodes: ["4P9C-WK2L", "JX7V-Q3RM", "HG1A-D8YN", "T6BS-LF2K", "9MC3-XZ7P", "RW8E-N5VT", "K2HJ-PQ6Y", "BX4U-S9LM", "FD7T-G3WA", "YN1Q-VB6E"],
});

/**
 * Typed mock seam for the platform-admin Registration & waitlist section.
 * Mirrors the data shown in mockups/tadaify-mvp/admin-panel.html
 * (#pane-registration): cap KPIs, cohort telemetry, the waitlist queue, and
 * the email-preview tabs. Swap this factory for the real loader to graduate
 * the section.
 *
 * @implements fr-admin-panel
 */

export type RegistrationKpi = {
  label: string;
  /** Pre-rendered KPI markup may carry a suffix span — kept as separate parts. */
  value: string;
  suffix?: string;
  foot?: string;
  /** Warning-coloured KPI value (waitlist). */
  warn?: boolean;
  /** Inline progress bar (Used) rendered to this percent. */
  barPct?: number;
};

export type Cohort = {
  name: string;
  note: string;
  signups: number;
  /** Bar width percent for the signups column. */
  signupsPct: number;
  /** Activation cell text; "—" when in flight. */
  activation: string;
  activationInFlight?: boolean;
  activationPct?: number;
  /** success | warning bar colour for activation. */
  activationTone?: "success" | "warning";
  retention: string;
};

export type WaitlistConfirmed = "confirmed" | "unconfirmed";

export type WaitlistRow = {
  pos: number;
  name: string;
  handle: string;
  email: string;
  /** Avatar palette suffix class, e.g. "av-2"; empty string for base. */
  avClass: string;
  initial: string;
  signedUp: string;
  confirmed: WaitlistConfirmed;
  waiting: string;
  /** First row is bold (#1) and exposes a move-to-top action. */
  topRow?: boolean;
};

export type EmailTab = {
  label: string;
  active?: boolean;
};

export type RegistrationFixture = {
  kpis: RegistrationKpi[];
  capValue: number;
  capFoot: string;
  promoteDefault: number;
  promoteMax: number;
  slotsFreeNow: number;
  slotsAfter: number;
  cohorts: Cohort[];
  waitlistWaitingCount: number;
  queue: WaitlistRow[];
  queueMore: number;
  emailTabs: EmailTab[];
};

export const registrationFixture = (): RegistrationFixture => ({
  kpis: [
    { label: "Cap", value: "1,000", foot: "Set 2026-03-04 by founder@" },
    { label: "Used", value: "847", suffix: "· 84.7%", barPct: 84.7 },
    { label: "Slots free", value: "153", foot: "~18d at current rate" },
    { label: "Waitlist", value: "247", warn: true, foot: "oldest: 12d 4h" },
  ],
  capValue: 1000,
  capFoot: "Set 2026-03-04 by founder@",
  promoteDefault: 14,
  promoteMax: 247,
  slotsFreeNow: 153,
  slotsAfter: 139,
  cohorts: [
    {
      name: "Apr 26 (today)",
      note: "14 promoted",
      signups: 14,
      signupsPct: 14,
      activation: "—",
      activationInFlight: true,
      retention: "—",
    },
    {
      name: "Apr 19",
      note: "21 promoted",
      signups: 21,
      signupsPct: 21,
      activation: "76% (16/21)",
      activationPct: 76,
      activationTone: "success",
      retention: "71% (15/21)",
    },
    {
      name: "Apr 12 (PH)",
      note: "47 organic",
      signups: 47,
      signupsPct: 47,
      activation: "89% (42/47)",
      activationPct: 89,
      activationTone: "success",
      retention: "83% (39/47)",
    },
    {
      name: "Apr 5",
      note: "12 promoted",
      signups: 12,
      signupsPct: 12,
      activation: "67% (8/12)",
      activationPct: 67,
      activationTone: "warning",
      retention: "50% (6/12)",
    },
    {
      name: "Mar 29",
      note: "9 promoted",
      signups: 9,
      signupsPct: 9,
      activation: "56% (5/9)",
      activationPct: 56,
      activationTone: "warning",
      retention: "33% (3/9)",
    },
  ],
  waitlistWaitingCount: 247,
  queue: [
    {
      pos: 1,
      name: "Priya Singh",
      handle: "@priya_arts",
      email: "priya@example.com",
      avClass: "av-2",
      initial: "P",
      signedUp: "Apr 14",
      confirmed: "confirmed",
      waiting: "12d 4h",
      topRow: true,
    },
    {
      pos: 2,
      name: "Tom Reyes",
      handle: "@tom_r",
      email: "tom.reyes@example.com",
      avClass: "av-3",
      initial: "T",
      signedUp: "Apr 14",
      confirmed: "confirmed",
      waiting: "11d 23h",
    },
    {
      pos: 3,
      name: "Marie Lefèvre",
      handle: "@m_lefevre",
      email: "marie@example.com",
      avClass: "",
      initial: "M",
      signedUp: "Apr 14",
      confirmed: "unconfirmed",
      waiting: "11d 22h",
    },
    {
      pos: 4,
      name: "Jin Watanabe",
      handle: "@jin_w",
      email: "jin@example.com",
      avClass: "av-4",
      initial: "J",
      signedUp: "Apr 15",
      confirmed: "confirmed",
      waiting: "10d 8h",
    },
    {
      pos: 5,
      name: "Bea Costa",
      handle: "@bea_costa",
      email: "bea@example.com",
      avClass: "av-5",
      initial: "B",
      signedUp: "Apr 15",
      confirmed: "confirmed",
      waiting: "10d 6h",
    },
    {
      pos: 6,
      name: "Ruth Marin",
      handle: "@r_marin",
      email: "ruth@example.com",
      avClass: "av-6",
      initial: "R",
      signedUp: "Apr 16",
      confirmed: "confirmed",
      waiting: "9d 11h",
    },
    {
      pos: 7,
      name: "Karim Bakr",
      handle: "@karim_b",
      email: "karim@example.com",
      avClass: "av-2",
      initial: "K",
      signedUp: "Apr 17",
      confirmed: "confirmed",
      waiting: "8d 4h",
    },
  ],
  queueMore: 240,
  emailTabs: [
    { label: "You're in!", active: true },
    { label: "7d reminder" },
    { label: "Final day" },
  ],
});

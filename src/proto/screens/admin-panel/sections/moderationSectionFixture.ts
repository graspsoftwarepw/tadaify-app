/**
 * Typed mock seam for the Moderation section: KPI cards, the open-report
 * inbox queue, take-down history, and repeat offenders. Mirrors the markup in
 * mockups/tadaify-mvp/admin-panel.html (#pane-moderation) so the section
 * graduates by swapping these factories for real moderation data.
 *
 * Mock-only typed view-model — no live data.
 * @implements fr-admin-panel
 */

export type ChipTone = "" | "warn" | "danger" | "success";

export type ModerationKpi = {
  label: string;
  num: string;
  /** Inline colour override for the number (mockup uses --danger on open). */
  numColor?: string;
  foot: string;
};

/** A coloured chip rendered inside a report row. */
export type ReportChip = {
  tone: ChipTone;
  label: string;
};

/** Action buttons offered on a report row. */
export type ReportAction =
  | { kind: "takedown"; label: string; reason: string; writeGated: true }
  | { kind: "dismiss"; label: string; writeGated: boolean }
  | { kind: "alert"; label: string; message: string; writeGated: boolean };

/** Avatar tone class (av-2 … av-4 in the mockup). */
export type AvatarTone = "av-2" | "av-3" | "av-4";

export type ModerationReport = {
  id: string;
  avatarTone: AvatarTone;
  avatarInitial: string;
  /** Handle stripped of the leading "@" — used for modal context. */
  handle: string;
  /** Display name shown in the row mini (may include report subject). */
  name: string;
  /** tadaify.com/<handle> sub-line. */
  url: string;
  chips: ReportChip[];
  /** Timing note shown after the chips. */
  timing: string;
  /** Bold lead-in for the reporter notes line ("Reporter notes:" / "Reporter note:"). */
  notesLabel: string;
  /** Body text of the reporter notes line. */
  notes: string;
  actions: ReportAction[];
};

export type TakeDownHistoryRow = {
  when: string;
  page: string;
  reason: { tone: ChipTone; label: string };
  reviewer: string;
};

export type RepeatOffender = {
  avatarTone: AvatarTone;
  avatarInitial: string;
  name: string;
  meta: string;
  status: { tone: ChipTone; label: string };
};

export type StateFilterOption = string;

export const moderationKpisFixture = (): ModerationKpi[] => [
  { label: "Open reports", num: "3", numColor: "var(--danger)", foot: "oldest: 23m ago" },
  { label: "Resolved (7d)", num: "12", foot: "avg time: 2.4h" },
  { label: "Take-downs (30d)", num: "4", foot: "2 spam · 1 NSFW · 1 IP" },
  { label: "Suspensions (30d)", num: "2", foot: "repeat offenders" },
];

export const moderationStateFiltersFixture = (): StateFilterOption[] => [
  "All states",
  "Open",
  "Resolved",
  "Dismissed",
];

export const moderationReasonFiltersFixture = (): StateFilterOption[] => [
  "All reasons",
  "Spam",
  "Abuse / harassment",
  "NSFW",
  "Illegal",
  "Copyright (DMCA)",
  "Other",
];

export const moderationSortFiltersFixture = (): StateFilterOption[] => [
  "Sort: oldest first",
  "Newest first",
  "Most reports",
];

export const moderationReportsFixture = (): ModerationReport[] => [
  {
    id: "r1",
    avatarTone: "av-2",
    avatarInitial: "L",
    handle: "lukas_b",
    name: '@lukas_b · "Get rich crypto"',
    url: "tadaify.com/lukas_b",
    chips: [
      { tone: "danger", label: "4 reports" },
      { tone: "warn", label: "spam" },
    ],
    timing: "First report: 23m ago · most recent: 4m ago",
    notesLabel: "Reporter notes:",
    notes:
      '"Page links to a crypto ponzi", "Same scam I saw on TikTok", "Promotes a fake giveaway", "Bot-like behaviour"',
    actions: [
      { kind: "takedown", label: "Take down", reason: "spam", writeGated: true },
      { kind: "alert", label: "Suspend creator", message: "Mockup — would suspend creator", writeGated: true },
      { kind: "alert", label: "Warn", message: "Mockup — would issue warning", writeGated: true },
      { kind: "dismiss", label: "Not violating", writeGated: true },
      {
        kind: "alert",
        label: "Preview page ↗",
        message: "Mockup — would open page preview in new tab",
        writeGated: false,
      },
    ],
  },
  {
    id: "r2",
    avatarTone: "av-3",
    avatarInitial: "G",
    handle: "gym_results",
    name: '@gym_results · "Lose 30lbs"',
    url: "tadaify.com/gym_results",
    chips: [
      { tone: "warn", label: "2 reports" },
      { tone: "danger", label: "copyright (DMCA)" },
    ],
    timing: "First report: 1h 4m ago",
    notesLabel: "Reporter notes:",
    notes: '"Uses my workout video without permission" — DMCA notice attached, valid signature.',
    actions: [
      { kind: "takedown", label: "Take down (DMCA)", reason: "copyright (DMCA)", writeGated: true },
      {
        kind: "alert",
        label: "Counter-notice",
        message: "Mockup — would request counter-notice",
        writeGated: true,
      },
      { kind: "alert", label: "View notice ↗", message: "Mockup — would view DMCA PDF", writeGated: false },
    ],
  },
  {
    id: "r3",
    avatarTone: "av-4",
    avatarInitial: "F",
    handle: "fashion_alert",
    name: "@fashion_alert",
    url: "tadaify.com/fashion_alert",
    chips: [
      { tone: "", label: "1 report" },
      { tone: "", label: "other" },
    ],
    timing: "2h 18m ago",
    notesLabel: "Reporter note:",
    notes: '"Bio claims to be a verified celebrity but is impersonating @realfashionalert"',
    actions: [
      {
        kind: "alert",
        label: "Escalate to legal",
        message: "Mockup — would escalate to legal review",
        writeGated: false,
      },
      {
        kind: "alert",
        label: "Request ID",
        message: "Mockup — would request ID verification",
        writeGated: true,
      },
      { kind: "dismiss", label: "Not violating", writeGated: true },
    ],
  },
];

export const takeDownHistoryFixture = (): TakeDownHistoryRow[] => [
  { when: "Apr 24 14:08", page: "@spam_drop_22", reason: { tone: "warn", label: "spam" }, reviewer: "founder@" },
  { when: "Apr 18 09:42", page: "@nsfw_acc_4", reason: { tone: "danger", label: "NSFW" }, reviewer: "founder@" },
  {
    when: "Apr 12 18:11",
    page: "@dance_remix_pro",
    reason: { tone: "danger", label: "copyright" },
    reviewer: "founder@",
  },
  { when: "Apr 03 11:27", page: "@phish_login", reason: { tone: "warn", label: "spam" }, reviewer: "founder@" },
];

export const repeatOffendersFixture = (): RepeatOffender[] => [
  {
    avatarTone: "av-3",
    avatarInitial: "D",
    name: "@dance_captain",
    meta: "3 violations · last: today",
    status: { tone: "danger", label: "Suspended" },
  },
  {
    avatarTone: "av-2",
    avatarInitial: "L",
    name: "@lukas_b",
    meta: "2 violations · last: 23m ago",
    status: { tone: "warn", label: "Active" },
  },
];

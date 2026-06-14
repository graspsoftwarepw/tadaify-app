/**
 * Typed mock seam for the app-shell navigation. Presentational components read
 * this view-model; graduation to production swaps the factory, not the props.
 *
 * @implements FR-GLOBALUI-VIEW-LAYOUT
 */

export type NavItem = {
  /** Stable key + the /__proto route segment this item points at. */
  key: string;
  label: string;
  /** lucide-react icon name, resolved by the shell. */
  icon: string;
  /** Optional tier badge shown inline (Pro / Business). */
  badge?: string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export type CreatorIdentity = {
  displayName: string;
  handle: string;
  tier: "Free" | "Creator" | "Pro" | "Business";
  initials: string;
};

export const creatorIdentityFixture = (): CreatorIdentity => ({
  displayName: "Alex Rivera",
  handle: "alexrivera",
  tier: "Creator",
  initials: "AR",
});

export const appNavFixture = (): NavSection[] => [
  {
    items: [
      { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { key: "design", label: "Design", icon: "Palette" },
      { key: "insights", label: "Insights", icon: "BarChart3" },
    ],
  },
  {
    title: "Pages",
    items: [
      { key: "pages-blog", label: "Blog", icon: "Newspaper" },
      { key: "pages-about", label: "About", icon: "User" },
      { key: "pages-portfolio", label: "Portfolio", icon: "Images" },
      { key: "pages-schedule", label: "Schedule", icon: "CalendarClock", badge: "Pro" },
    ],
  },
  {
    title: "Grow",
    items: [
      { key: "feedback", label: "Feedback", icon: "MessageSquare" },
      { key: "domain", label: "Custom domain", icon: "Globe", badge: "Pro" },
      { key: "affiliate", label: "Affiliate", icon: "Gift" },
    ],
  },
  {
    items: [{ key: "settings", label: "Settings", icon: "Settings" }],
  },
];

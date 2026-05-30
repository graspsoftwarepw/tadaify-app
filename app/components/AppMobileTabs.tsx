/**
 * AppMobileTabs — mobile bottom tab bar (≤720px viewport).
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~3662-3683
 * (`<nav class="mobile-tabs">`). Uses inline SVGs verbatim from the mockup
 * and the `.mobile-tabs` / `.mt-btn` / `.mt-btn.active` CSS classes already
 * scoped under `.app-dashboard-root` in `app/styles/app-dashboard.css`.
 *
 * Visibility (display: flex on ≤720px / hidden ≥720px) is driven by CSS.
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * Covers: AC#3, ECN-26a-12, S7
 */

interface AppMobileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  {
    id: "page",
    label: "Home",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    id: "design",
    label: "Design",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "insights",
    label: "Stats",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-7" />
      </svg>
    ),
  },
  {
    id: "shop",
    label: "Shop",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8" />
      </svg>
    ),
  },
];

export function AppMobileTabs({ activeTab, onTabChange }: AppMobileTabsProps) {
  return (
    <nav
      data-testid="mobile-tabs"
      aria-label="Mobile navigation"
      className="mobile-tabs"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={isActive ? "mt-btn active" : "mt-btn"}
            data-nav={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

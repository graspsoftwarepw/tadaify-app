/**
 * ProtoShell — the persistent authenticated app shell (sidebar + topbar +
 * content region) every dashboard-side screen renders inside. This is the
 * foundational view-layout for the prototype.
 *
 * Presentational only: nav + identity come from typed fixtures, navigation is
 * plain anchors into the dev-only `/__proto` namespace.
 *
 * @implements FR-GLOBALUI-VIEW-LAYOUT
 */
import type { ReactNode } from "react";
import * as Icons from "lucide-react";
import {
  appNavFixture,
  creatorIdentityFixture,
  type NavSection,
} from "../fixtures/appShell";
import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const C = (Icons as Record<string, Icons.LucideIcon>)[name] ?? Icons.Square;
  return <C size={size} aria-hidden />;
}

export function ProtoShell({
  activeKey,
  title,
  children,
  nav = appNavFixture(),
}: {
  activeKey?: string;
  title: string;
  children: ReactNode;
  nav?: NavSection[];
}) {
  const identity = creatorIdentityFixture();

  return (
    <div className="proto-root flex min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Sidebar */}
      <aside
        aria-label="Primary navigation"
        className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] md:flex"
      >
        <div className="flex h-16 items-center px-5">
          <a href="/__proto" className="no-underline">
            <Wordmark size="sm" />
          </a>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {nav.map((section, i) => (
            <div key={section.title ?? i} className="mb-4">
              {section.title && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const active = item.key === activeKey;
                return (
                  <a
                    key={item.key}
                    href={`/__proto/${item.key}`}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors",
                      active
                        ? "bg-[rgba(99,102,241,0.12)] text-[var(--brand-primary)]"
                        : "text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]",
                    ].join(" ")}
                  >
                    <Icon name={item.icon} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="pill pill-pro text-[10px]">{item.badge}</span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: "var(--hero-gradient)" }}
              aria-hidden
            >
              {identity.initials}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{identity.displayName}</p>
              <p className="truncate text-xs text-[var(--fg-muted)]">
                @{identity.handle} · {identity.tier}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-5">
          <h1 className="font-display text-xl font-semibold text-[var(--fg)]">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <a
              href={`/__proto/creator-public`}
              className="btn btn-secondary btn-sm no-underline"
            >
              View public page
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

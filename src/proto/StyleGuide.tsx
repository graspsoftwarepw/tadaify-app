/**
 * StyleGuide — the dev-only showcase route. Renders every design token swatch
 * and every core component state so the Owner can review the accent + full
 * light/dark palette in one place (flip the theme with the toggle in the bar).
 * This is the visual source of truth that later catches colour drift.
 *
 * @implements FR-GLOBALUI-THEME-AND-COLOURS
 * @implements FR-GLOBALUI-VIEW-LAYOUT
 */
import type { ReactNode } from "react";
import { ThemeToggle } from "./lib/ThemeToggle";
import { Wordmark } from "./lib/Wordmark";

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-14 w-full rounded-lg border border-[var(--border)]"
        style={{ background: `var(${token})` }}
      />
      <span className="text-xs font-medium text-[var(--fg)]">{label}</span>
      <span className="font-mono text-[11px] text-[var(--fg-subtle)]">{token}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display mb-4 text-2xl font-semibold text-[var(--fg)]">{title}</h2>
      {children}
    </section>
  );
}

export function StyleGuide() {
  return (
    <div className="proto-root min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6">
        <Wordmark size="sm" />
        <span className="pill pill-primary">Style guide · showcase</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="mb-10 max-w-2xl text-[var(--fg-muted)]">
          Foundation tokens and component states for the tadaify prototype. The
          accent is locked to Indigo Serif (<span className="font-mono">#6366F1</span>).
          Toggle the theme in the top bar to verify both light and dark.
        </p>

        <Section title="Brand">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch token="--brand-primary" label="Primary" />
            <Swatch token="--brand-secondary" label="Secondary" />
            <Swatch token="--brand-warm" label="Warm" />
            <Swatch token="--brand-warm-soft" label="Warm soft" />
          </div>
        </Section>

        <Section title="Surfaces">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch token="--bg" label="Background" />
            <Swatch token="--bg-elevated" label="Elevated" />
            <Swatch token="--bg-muted" label="Muted" />
            <Swatch token="--bg-sunken" label="Sunken" />
          </div>
        </Section>

        <Section title="Foreground & border">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch token="--fg" label="Text" />
            <Swatch token="--fg-muted" label="Muted text" />
            <Swatch token="--fg-subtle" label="Subtle text" />
            <Swatch token="--border" label="Border" />
          </div>
        </Section>

        <Section title="Semantic">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch token="--success" label="Success" />
            <Swatch token="--warning" label="Warning" />
            <Swatch token="--danger" label="Danger" />
            <Swatch token="--info" label="Info" />
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-2">
            <h1 className="font-display text-5xl font-semibold">Display H1 — Crimson Pro</h1>
            <h2 className="font-display text-3xl font-semibold">Display H2</h2>
            <p className="text-base text-[var(--fg)]">Body — Inter, the workhorse sans.</p>
            <p className="text-sm text-[var(--fg-muted)]">Small muted body copy.</p>
            <p className="font-mono text-sm">Mono — JetBrains Mono · tadaify.com/handle</p>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-warm">Warm</button>
            <button className="btn btn-primary btn-sm">Small</button>
            <button className="btn btn-primary btn-lg">Large</button>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="max-w-sm space-y-3">
            <div>
              <label>Display name</label>
              <input className="input" placeholder="Alex Rivera" defaultValue="Alex Rivera" />
            </div>
            <div>
              <label>Focused / error states use token borders</label>
              <input className="input" placeholder="Type here…" />
            </div>
          </div>
        </Section>

        <Section title="Pills">
          <div className="flex flex-wrap gap-2">
            <span className="pill">Default</span>
            <span className="pill pill-primary">Primary</span>
            <span className="pill pill-warm">Warm</span>
            <span className="pill pill-success">Success</span>
            <span className="pill pill-danger">Danger</span>
            <span className="pill pill-pro">Pro</span>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card">
              <h4 className="font-display mb-1 text-lg font-semibold">Card</h4>
              <p className="text-sm text-[var(--fg-muted)]">Standard elevated surface.</p>
            </div>
            <div className="card card-lg">
              <h4 className="font-display mb-1 text-lg font-semibold">Card · large</h4>
              <p className="text-sm text-[var(--fg-muted)]">More padding, softer shadow.</p>
            </div>
            <div className="card card-highlight">
              <h4 className="font-display mb-1 text-lg font-semibold">Highlight</h4>
              <p className="text-sm text-[var(--fg-muted)]">Accent-bordered emphasis.</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

/** SVG icons ported verbatim from mockups/tadaify-mvp/app-dashboard.html. */
import type { SocialKind } from "./dashboardFixture";

const SOCIAL_PATHS: Record<SocialKind, string> = {
  ig: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.4.3 1.1.4 2.3.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.2-1.1.3-2.3.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.4-.3-1.1-.4-2.3C2.2 15.6 2.2 15.3 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.2 1.1-.3 2.3-.4 1.2-.1 1.6-.1 4.8-.1zm0 3.1a6.7 6.7 0 1 0 0 13.4 6.7 6.7 0 0 0 0-13.4zm0 11a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8zm7-11.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z",
  tt: "M19.3 6.7a5 5 0 0 1-3.6-3.1 5 5 0 0 1-.1-1V2h-3.4v13.6a2.4 2.4 0 1 1-2.4-2.4c.2 0 .5 0 .7.1V9.8a6 6 0 1 0 5.2 5.9V8.3a8.3 8.3 0 0 0 4.8 1.5V6.4c-.4 0-.8 0-1.2-.1z",
  yt: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z",
  x: "M18.9 2H22l-7 8 8.3 12h-6.5l-5-7.3L5.8 22H2.7l7.5-8.6L2 2h6.6l4.6 6.6L18.9 2zm-1 18.1h1.8L7.3 3.8H5.4l12.5 16.3z",
};

export function SocialGlyph({ kind }: { kind: SocialKind }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={SOCIAL_PATHS[kind]} />
    </svg>
  );
}

export const SOCIAL_CLASS: Record<SocialKind, string> = {
  ig: "social-ig",
  tt: "social-tt",
  yt: "social-yt",
  x: "social-x",
};

export const SOCIAL_TIP: Record<SocialKind, string> = {
  ig: "Instagram",
  tt: "TikTok",
  yt: "YouTube",
  x: "X",
};

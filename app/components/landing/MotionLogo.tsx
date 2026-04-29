/**
 * MotionLogo — tadaify Motion v10 logo component.
 *
 * Ported from mockups/tadaify-mvp/landing.html JS animation engine (verbatim constants).
 * DEC-029: tadaify-logo-motion-v10-FINAL is canonical.
 *
 * Renders an SVG orb (indigo stage + warm amber orbit ball) with 4-edge amber flash
 * spotlights. Uses requestAnimationFrame; respects prefers-reduced-motion.
 *
 * The nav variant (size="nav") omits flashes (too noisy at 44px).
 * The hero variant (size="hero") runs full animation at 280px mobile / 320px desktop.
 *
 * TADA-BUG-001 note: this component is the LOGO, NOT the wordmark URL preview.
 * The live preview (tadaify.com/<handle>) is in HandleClaimForm.
 * These are separate concerns — do NOT conflate.
 */

import { useEffect, useRef } from "react";

interface MotionLogoProps {
  /** "hero" = full 320px with 4-edge flashes. "nav" = 44px orb-only. */
  size: "hero" | "nav";
  className?: string;
}

// Motion v10 constants — verbatim from mockup JS (do not adjust without DEC)
const ORBIT_R = 18.4;
const CX = 60;
const CY = 60;
const GLIDE_IN = 900;
const ORBIT_DUR = 5600;
const GLIDE_OUT = 900;
const REST = 800;
const CYCLE = GLIDE_IN + ORBIT_DUR + GLIDE_OUT + REST;
const SWAY_AMP = 0.55;
const SWAY_FREQ = 4;
const FLASH_WINDOW = 0.55;
const FLASH_DECAY = 1.6;

const CARDINALS = {
  E: 0,
  S: Math.PI / 2,
  W: Math.PI,
  N: (3 * Math.PI) / 2,
} as const;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeIn(t: number) {
  return Math.pow(t, 3);
}
function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}
function angDist(a: number, b: number) {
  const d = Math.abs(a - b);
  return Math.min(d, 2 * Math.PI - d);
}
function flashOpacity(angle: number | null, cardinal: number): number {
  if (angle === null) return 0;
  const d = angDist(angle, cardinal);
  if (d >= FLASH_WINDOW) return 0;
  const t = d / FLASH_WINDOW;
  return Math.pow(1 - t, FLASH_DECAY);
}
function getPos(t: number) {
  if (t < GLIDE_IN) {
    const p = easeOut(clamp01(t / GLIDE_IN));
    return { x: CX + ORBIT_R * p, y: CY, angle: null as null };
  } else if (t < GLIDE_IN + ORBIT_DUR) {
    const el = t - GLIDE_IN;
    const angle = (2 * Math.PI * el) / ORBIT_DUR;
    const sway = SWAY_AMP * Math.sin(SWAY_FREQ * angle);
    const r = ORBIT_R + sway;
    return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle), angle };
  } else if (t < GLIDE_IN + ORBIT_DUR + GLIDE_OUT) {
    const el2 = t - GLIDE_IN - ORBIT_DUR;
    const p2 = easeIn(clamp01(el2 / GLIDE_OUT));
    return { x: CX + ORBIT_R * (1 - p2), y: CY, angle: null as null };
  } else {
    return { x: CX, y: CY, angle: null as null };
  }
}

function setAttr(el: SVGElement | null, attr: string, value: string) {
  if (el) el.setAttribute(attr, value);
}

export function MotionLogo({ size, className }: MotionLogoProps) {
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  // Unique IDs to prevent SVG gradient collisions when multiple logos render
  const uid = size; // "hero" | "nav" — safe since at most one of each

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const orbBase = document.getElementById(`orb-${uid}-base`) as SVGCircleElement | null;
    const orbLight = document.getElementById(`orb-${uid}-light`) as SVGCircleElement | null;
    const flashE = document.getElementById(`flash-${uid}-E`) as SVGElement | null;
    const flashS = document.getElementById(`flash-${uid}-S`) as SVGElement | null;
    const flashW = document.getElementById(`flash-${uid}-W`) as SVGElement | null;
    const flashN = document.getElementById(`flash-${uid}-N`) as SVGElement | null;
    const orbs = [orbBase, orbLight].filter((o): o is SVGCircleElement => o !== null);

    function frame(now: number) {
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) % CYCLE;
      const pos = getPos(t);

      const cx = pos.x.toFixed(3);
      const cy = pos.y.toFixed(3);
      for (const o of orbs) {
        setAttr(o, "cx", cx);
        setAttr(o, "cy", cy);
      }

      if (flashE && flashS && flashW && flashN) {
        setAttr(
          flashE,
          "opacity",
          Math.max(0, Math.min(1, flashOpacity(pos.angle, CARDINALS.E))).toFixed(3)
        );
        setAttr(
          flashS,
          "opacity",
          Math.max(0, Math.min(1, flashOpacity(pos.angle, CARDINALS.S))).toFixed(3)
        );
        setAttr(
          flashW,
          "opacity",
          Math.max(0, Math.min(1, flashOpacity(pos.angle, CARDINALS.W))).toFixed(3)
        );
        setAttr(
          flashN,
          "opacity",
          Math.max(0, Math.min(1, flashOpacity(pos.angle, CARDINALS.N))).toFixed(3)
        );
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [uid]);

  if (size === "nav") {
    return (
      <svg
        className={className}
        viewBox="0 0 120 120"
        width="44"
        height="44"
        role="img"
        aria-label="tadaify logo"
      >
        <defs>
          <linearGradient
            id={`stageL-${uid}`}
            x1="30%"
            y1="20%"
            x2="80%"
            y2="85%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#7C78FF" />
            <stop offset="58%" stopColor="#5B56E8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <radialGradient
            id={`stageHL-${uid}`}
            cx="32%"
            cy="24%"
            r="30%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.36)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient
            id={`warmL-${uid}`}
            x1="20%"
            y1="15%"
            x2="80%"
            y2="88%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#FFD36A" />
            <stop offset="58%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="40" fill={`url(#stageL-${uid})`} />
        <circle cx="60" cy="60" r="40" fill={`url(#stageHL-${uid})`} />
        <circle
          cx="60"
          cy="60"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="3.5"
        />
        <circle
          id={`orb-${uid}-base`}
          cx="60"
          cy="60"
          r="20"
          fill={`url(#warmL-${uid})`}
        />
      </svg>
    );
  }

  // Hero size — full animation with 4-edge flash spotlights
  return (
    <svg
      id={`logoHero`}
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
      role="img"
      aria-label="tadaify animated logo"
      className={className}
    >
      <defs>
        <linearGradient
          id={`stageL-${uid}`}
          x1="30%"
          y1="20%"
          x2="80%"
          y2="85%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#7C78FF" />
          <stop offset="58%" stopColor="#5B56E8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <radialGradient
          id={`stageHL-${uid}`}
          cx="32%"
          cy="24%"
          r="30%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.36)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient
          id={`stageBounce-${uid}`}
          cx="72%"
          cy="78%"
          r="28%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter
          id={`stageGlow-${uid}`}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="8"
            floodColor="rgba(79,70,229,0.30)"
            floodOpacity="1"
          />
        </filter>
        <linearGradient
          id={`warmL-${uid}`}
          x1="20%"
          y1="15%"
          x2="80%"
          y2="88%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#FFD36A" />
          <stop offset="58%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <radialGradient
          id={`warmHL-${uid}`}
          cx="28%"
          cy="22%"
          r="38%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter
          id={`warmGlow-${uid}`}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="7"
            floodColor="rgba(245,158,11,0.32)"
            floodOpacity="1"
          />
        </filter>
        {/* Light-theme flashes: pure amber, NO white core (per v10 light-theme fix) */}
        <radialGradient
          id={`flashE-${uid}`}
          cx="85%"
          cy="50%"
          r="60%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="rgba(252,211,77,1)" />
          <stop offset="22%" stopColor="rgba(245,158,11,0.85)" />
          <stop offset="55%" stopColor="rgba(217,119,6,0.35)" />
          <stop offset="100%" stopColor="rgba(180,83,9,0)" />
        </radialGradient>
        <radialGradient
          id={`flashS-${uid}`}
          cx="50%"
          cy="85%"
          r="60%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="rgba(252,211,77,1)" />
          <stop offset="22%" stopColor="rgba(245,158,11,0.85)" />
          <stop offset="55%" stopColor="rgba(217,119,6,0.35)" />
          <stop offset="100%" stopColor="rgba(180,83,9,0)" />
        </radialGradient>
        <radialGradient
          id={`flashW-${uid}`}
          cx="15%"
          cy="50%"
          r="60%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="rgba(252,211,77,1)" />
          <stop offset="22%" stopColor="rgba(245,158,11,0.85)" />
          <stop offset="55%" stopColor="rgba(217,119,6,0.35)" />
          <stop offset="100%" stopColor="rgba(180,83,9,0)" />
        </radialGradient>
        <radialGradient
          id={`flashN-${uid}`}
          cx="50%"
          cy="15%"
          r="60%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="rgba(252,211,77,1)" />
          <stop offset="22%" stopColor="rgba(245,158,11,0.85)" />
          <stop offset="55%" stopColor="rgba(217,119,6,0.35)" />
          <stop offset="100%" stopColor="rgba(180,83,9,0)" />
        </radialGradient>
      </defs>

      <g id={`flashes-${uid}`}>
        <ellipse
          id={`flash-${uid}-E`}
          cx="115"
          cy="60"
          rx="45"
          ry="38"
          fill={`url(#flashE-${uid})`}
          opacity="0"
        />
        <ellipse
          id={`flash-${uid}-S`}
          cx="60"
          cy="115"
          rx="38"
          ry="45"
          fill={`url(#flashS-${uid})`}
          opacity="0"
        />
        <ellipse
          id={`flash-${uid}-W`}
          cx="5"
          cy="60"
          rx="45"
          ry="38"
          fill={`url(#flashW-${uid})`}
          opacity="0"
        />
        <ellipse
          id={`flash-${uid}-N`}
          cx="60"
          cy="5"
          rx="38"
          ry="45"
          fill={`url(#flashN-${uid})`}
          opacity="0"
        />
      </g>

      <g filter={`url(#stageGlow-${uid})`}>
        <circle cx="60" cy="60" r="40" fill={`url(#stageL-${uid})`} />
        <circle cx="60" cy="60" r="40" fill={`url(#stageHL-${uid})`} />
        <circle cx="60" cy="60" r="40" fill={`url(#stageBounce-${uid})`} />
        <circle
          cx="60"
          cy="60"
          r="40"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="3.5"
        />
      </g>

      <g id={`warmGroup-${uid}`} filter={`url(#warmGlow-${uid})`}>
        <circle
          id={`orb-${uid}-base`}
          cx="60"
          cy="60"
          r="20"
          fill={`url(#warmL-${uid})`}
        />
        <circle
          id={`orb-${uid}-light`}
          cx="60"
          cy="60"
          r="20"
          fill={`url(#warmHL-${uid})`}
        />
      </g>
    </svg>
  );
}

/**
 * Typed mock seam for the Settings · Theme tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-theme.html (presets, palette swatches,
 * fonts, background types, patterns, density, theme history) so the tab
 * graduates by swapping this factory for the real loader.
 *
 * @implements fr-settings
 */
import type { ChipTier } from "./SettingsShell";

export type ThemePreset = {
  id: string;
  name: string;
  font: string;
  /** CSS background for the thumbnail. */
  thumb: string;
  /** Mini-button label + colors shown inside the thumb. */
  miniLabel: string;
  miniBg: string;
  miniColor: string;
  free: boolean;
};

export type PaletteSwatch = { id: string; name: string; hex: string; tip: string };

export type FontOption = string;

export type BgType = { id: string; name: string; sub: string; swatch: string; tier?: ChipTier };

export type Pattern = { id: string; name: string; cls: string };

export type Density = { id: string; name: string; sub: string; bars: number };

export type UploadedFont = { id: string; name: string; size: string; sample: string; family: string };

export type ThemeHistoryItem = { id: string; name: string; when: string; thumb: string; current?: boolean };

export type ThemeFixture = {
  handle: string;
  presets: ThemePreset[];
  activePreset: string;
  palette: PaletteSwatch[];
  recentColors: string[];
  fonts: FontOption[];
  displayFont: string;
  bodyFont: string;
  uploadedFonts: UploadedFont[];
  fontSlots: { used: number; max: number };
  bgTypes: BgType[];
  activeBg: string;
  patterns: Pattern[];
  activePattern: string;
  densities: Density[];
  activeDensity: string;
  history: ThemeHistoryItem[];
};

export const themeFixture = (): ThemeFixture => ({
  handle: "alexandra",
  presets: [
    { id: "indigo", name: "Indigo Serif", font: "Crimson Pro · default", thumb: "radial-gradient(120% 80% at 50% 0%, #EEF2FF 0%, #F9FAFB 60%)", miniLabel: "Subscribe", miniBg: "#6366F1", miniColor: "#fff", free: true },
    { id: "mono", name: "Mono Minimal", font: "Inter", thumb: "linear-gradient(180deg, #FAFAFA 0%, #FFF 100%)", miniLabel: "Subscribe", miniBg: "#111", miniColor: "#fff", free: true },
    { id: "pastel", name: "Pastel Pop", font: "Quicksand", thumb: "linear-gradient(135deg, #E9D5FF 0%, #FED7AA 50%, #BBF7D0 100%)", miniLabel: "Tap me", miniBg: "#C084FC", miniColor: "#fff", free: true },
    { id: "glass", name: "Dark Glass", font: "Inter · dark default", thumb: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", miniLabel: "Subscribe", miniBg: "rgba(255,255,255,0.16)", miniColor: "#fff", free: true },
    { id: "earth", name: "Earth Tones", font: "Lora", thumb: "linear-gradient(135deg, #FED7AA 0%, #FECACA 40%, #D9F99D 100%)", miniLabel: "Read more", miniBg: "#C2410C", miniColor: "#FEF3C7", free: true },
    { id: "neon", name: "Neon Night", font: "Space Grotesk", thumb: "radial-gradient(circle at 70% 30%, #A855F7, #1A0B2E)", miniLabel: "Listen now", miniBg: "#A855F7", miniColor: "#fff", free: true },
    { id: "sunrise", name: "Soft Sunrise", font: "Raleway", thumb: "linear-gradient(135deg, #FED7AA 0%, #FBCFE8 50%, #FEF3C7 100%)", miniLabel: "Say hi", miniBg: "#F97316", miniColor: "#fff", free: true },
    { id: "editorial", name: "Editorial", font: "Playfair Display", thumb: "#FAFAF9", miniLabel: "Read piece", miniBg: "#DC2626", miniColor: "#fff", free: true },
  ],
  activePreset: "indigo",
  palette: [
    { id: "primary", name: "Primary", hex: "#6366F1", tip: "Primary — buttons + accents" },
    { id: "accent", name: "Accent", hex: "#F59E0B", tip: "Accent — secondary highlights" },
    { id: "background", name: "Background", hex: "#F9FAFB", tip: "Page background" },
    { id: "text", name: "Text", hex: "#111827", tip: "Body text" },
  ],
  recentColors: ["#6366F1", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#0EA5E9", "#EC4899", "#111827"],
  fonts: ["Crimson Pro", "Inter", "Quicksand", "Lora", "Space Grotesk", "Raleway", "Playfair Display", "Cormorant"],
  displayFont: "Crimson Pro",
  bodyFont: "Inter",
  uploadedFonts: [
    { id: "uf1", name: "Atelier-Display.woff2", size: "142 KB", sample: "Aa", family: "'Cormorant', serif" },
    { id: "uf2", name: "Manrope-Variable.woff2", size: "86 KB", sample: "Aa", family: "'Inter', sans-serif" },
  ],
  fontSlots: { used: 2, max: 4 },
  bgTypes: [
    { id: "solid", name: "Solid", sub: "Background swatch", swatch: "#F9FAFB" },
    { id: "gradient", name: "Gradient", sub: "From palette", swatch: "linear-gradient(135deg,#EEF2FF,#FED7AA)" },
    { id: "radial", name: "Radial wash", sub: "Indigo Serif default", swatch: "radial-gradient(circle at 30% 20%, #C7D2FE, #F9FAFB)" },
    { id: "image", name: "Custom image", sub: "", swatch: "linear-gradient(135deg,#94A3B8,#475569)", tier: "pro" },
  ],
  activeBg: "radial",
  patterns: [
    { id: "dots", name: "Dots", cls: "pn-dots" },
    { id: "grid", name: "Grid", cls: "pn-grid" },
    { id: "waves", name: "Waves", cls: "pn-waves" },
    { id: "hex", name: "Hexagons", cls: "pn-hex" },
    { id: "tri", name: "Triangles", cls: "pn-tri" },
    { id: "noise", name: "Noise", cls: "pn-noise" },
  ],
  activePattern: "dots",
  densities: [
    { id: "compact", name: "Compact", sub: "More on screen", bars: 4 },
    { id: "comfortable", name: "Comfortable", sub: "Default — balanced", bars: 3 },
    { id: "roomy", name: "Roomy", sub: "Premium feel", bars: 2 },
  ],
  activeDensity: "comfortable",
  history: [
    { id: "h1", name: "Indigo Serif", when: "Applied today, 2:14 PM", thumb: "radial-gradient(circle at 30% 20%, #C7D2FE, #F9FAFB)", current: true },
    { id: "h2", name: "Soft Sunrise (custom palette)", when: "Applied 3 days ago · 14h published", thumb: "linear-gradient(135deg, #FED7AA, #FBCFE8, #FEF3C7)" },
    { id: "h3", name: "Indigo Serif", when: "Applied April 22 · 2 days published", thumb: "linear-gradient(135deg, #6366F1, #8B5CF6)" },
    { id: "h4", name: "Neon Night (custom CSS)", when: "Applied April 18 · 4 days published", thumb: "radial-gradient(circle at 70% 30%, #A855F7, #1A0B2E)" },
    { id: "h5", name: "Earth Tones", when: "Applied April 10 · 4 days published", thumb: "linear-gradient(135deg, #FED7AA, #FECACA, #D9F99D)" },
  ],
});

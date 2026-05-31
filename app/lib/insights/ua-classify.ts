/**
 * ua-classify — minimal, dependency-free user-agent classification for the
 * analytics beacon. We only need coarse buckets (device / browser / os) for
 * the Insights dimensions (DEC-077) plus a cheap bot filter (DEC — bot
 * pageviews excluded from creator-facing numbers).
 *
 * This is intentionally simple: a heuristic, not a full UA database. It runs on
 * every beacon, so it must be allocation-light and never throw.
 *
 * Story: F-INSIGHTS-CAPTURE-001.
 */

export type DeviceClass = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

const BOT_RE =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|discordbot|slackbot|headlesschrome|phantomjs|puppeteer|playwright|lighthouse|monitor|preview|curl|wget|python-requests|axios|go-http/i;

export function isLikelyBot(ua: string): boolean {
  if (!ua) return true; // no UA → almost always a bot / scraper
  return BOT_RE.test(ua);
}

export function classifyDevice(ua: string): DeviceClass {
  if (!ua) return "unknown";
  if (isLikelyBot(ua)) return "bot";
  const s = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|kindle|silk|playbook/.test(s)) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|bb10|opera mini/.test(s)) {
    return "mobile";
  }
  return "desktop";
}

export function classifyBrowser(ua: string): string {
  if (!ua) return "Unknown";
  const s = ua;
  // Order matters — Edge/Opera/Brave masquerade as Chrome; check them first.
  if (/Edg(e|A|iOS)?\//.test(s)) return "Edge";
  if (/OPR\/|Opera/.test(s)) return "Opera";
  if (/SamsungBrowser/.test(s)) return "Samsung Internet";
  if (/Firefox\/|FxiOS/.test(s)) return "Firefox";
  if (/Chrome\/|CriOS/.test(s)) return "Chrome";
  if (/Safari\//.test(s) && /Version\//.test(s)) return "Safari";
  return "Other";
}

export function classifyOs(ua: string): string {
  if (!ua) return "Unknown";
  const s = ua;
  if (/iPhone|iPad|iPod|iOS/.test(s)) return "iOS";
  if (/Android/.test(s)) return "Android";
  if (/Windows NT/.test(s)) return "Windows";
  if (/Mac OS X|Macintosh/.test(s)) return "macOS";
  if (/CrOS/.test(s)) return "ChromeOS";
  if (/Linux/.test(s)) return "Linux";
  return "Other";
}

export interface UaFacets {
  device: DeviceClass;
  browser: string;
  os: string;
  isBot: boolean;
}

export function classifyUa(ua: string): UaFacets {
  const isBot = isLikelyBot(ua);
  return {
    device: classifyDevice(ua),
    browser: classifyBrowser(ua),
    os: classifyOs(ua),
    isBot,
  };
}

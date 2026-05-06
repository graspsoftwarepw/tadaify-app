/**
 * Pure helper — section-aware welcome header copy for /register.
 *
 * Contract (DEC-358=B, locked 2026-05-06):
 *   A                   → "Hey @{handle} 👋"
 *   B                   → "Hey @{handle} 👋"
 *   B-email             → "Hey @{handle} 👋"
 *   B-otp               → "@{handle}, almost there..."
 *   B-password-toggle   → "@{handle}, almost there..."
 *   C                   → "Welcome @{handle}!"
 *
 * Story: tadaify-app#196 (F-002a follow-up)
 */

import type { RegisterSection } from "./otp-state";

export type { RegisterSection };

/**
 * Returns the welcome header copy for the given register section.
 * `handle` is the raw value from state — caller is responsible for
 * supplying a fallback (e.g. "yourname") when the value is empty.
 */
export function getWelcomeCopy(section: RegisterSection, handle: string): string {
  switch (section) {
    case "A":
    case "B":
    case "B-email":
      return `Hey @${handle} 👋`;
    case "B-otp":
    case "B-password-toggle":
      return `@${handle}, almost there...`;
    case "C":
      return `Welcome @${handle}!`;
    default: {
      // exhaustive guard — TypeScript will catch unhandled variants at compile time
      const _never: never = section;
      return `Hey @${handle} 👋`;
    }
  }
}

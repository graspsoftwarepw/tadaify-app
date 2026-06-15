/**
 * Typed mock seam for the onboarding Template step (step 4/5). Mirrors the
 * starter-template grid in mockups/tadaify-mvp/onboarding-template.html:
 * Chopin (default) + Neon, Minimal, Nightfall, Sunrise, Custom.
 *
 * @implements fr-onboarding
 */
export type TemplateOption = {
  id: string;
  name: string;
  tagline: string;
  /** Maps to a `.preview-<previewKind>` style in the stylesheet. */
  previewKind: "chopin" | "neon" | "minimal" | "nightfall" | "sunrise" | "custom";
  /** The preview card's name/bio/link sample copy. */
  previewName: string;
  previewBio: string;
  previewLink: string;
  isDefault?: boolean;
  isCustom?: boolean;
};

export type TemplateContent = {
  templates: TemplateOption[];
};

export function templateFixture(): TemplateContent {
  return {
    templates: [
      {
        id: "chopin",
        name: "Chopin",
        tagline: "Editorial · quiet confidence",
        previewKind: "chopin",
        previewName: "Alexandra",
        previewBio: "Fitness coach + content creator",
        previewLink: "→ Latest workout plan",
        isDefault: true,
      },
      {
        id: "neon",
        name: "Neon",
        tagline: "Bold · warm flex",
        previewKind: "neon",
        previewName: "ALEXANDRA",
        previewBio: "Fitness coach + creator",
        previewLink: "→ Latest workout plan",
      },
      {
        id: "minimal",
        name: "Minimal",
        tagline: "All white · type-driven",
        previewKind: "minimal",
        previewName: "Alexandra",
        previewBio: "Fitness coach",
        previewLink: "Latest workout plan →",
      },
      {
        id: "nightfall",
        name: "Nightfall",
        tagline: "Dark canvas · purple gradient",
        previewKind: "nightfall",
        previewName: "Alexandra",
        previewBio: "Fitness · content creator",
        previewLink: "→ Latest workout plan",
      },
      {
        id: "sunrise",
        name: "Sunrise",
        tagline: "Warm gradient · light",
        previewKind: "sunrise",
        previewName: "Alexandra",
        previewBio: "Fitness coach + creator",
        previewLink: "Latest workout plan",
      },
      {
        id: "custom",
        name: "Custom",
        tagline: "Blank slate · full control",
        previewKind: "custom",
        previewName: "Start blank",
        previewBio: "Build from scratch",
        previewLink: "",
        isCustom: true,
      },
    ],
  };
}

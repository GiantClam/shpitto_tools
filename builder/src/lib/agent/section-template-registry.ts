import fs from "fs";
import path from "path";

import { logInfo, logWarn } from "@/lib/logger";

type SectionKind =
  | "navigation"
  | "hero"
  | "story"
  | "approach"
  | "socialproof"
  | "products"
  | "contact"
  | "cta"
  | "footer";

export type SectionTemplateBlock = {
  type: string;
  props: Record<string, unknown>;
};

export type StyleProfile = {
  id: string;
  name: string;
  keywords: string[];
  templates: Partial<Record<SectionKind, SectionTemplateBlock>>;
};

const normalizeToken = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const cloneProps = (value: Record<string, unknown>) => JSON.parse(JSON.stringify(value)) as Record<string, unknown>;

const inferSectionKind = (sectionType: string, sectionId: string): SectionKind | null => {
  const typeToken = normalizeToken(sectionType);
  const idToken = normalizeToken(sectionId);
  const token = `${typeToken} ${idToken}`.trim();
  if (!token) return null;

  // Strong type-based routing first to avoid id keyword collisions like "project-proof".
  if (/(navigation|navbar|header|topnav)/.test(typeToken)) return "navigation";
  if (/(hero|pagehero|showcasehero)/.test(typeToken)) return "hero";
  if (/(studiostory|story|editorial|content|philosophy|narrative|about|mission)/.test(typeToken)) return "story";
  if (/(approach|metric|stats|feature|valueprop|process)/.test(typeToken)) return "approach";
  if (/(product|catalog|collection|store|shop|showcase|gallery|capability|module)/.test(typeToken))
    return "products";
  if (/(social|testimonial|trust|logo|collaborator|proof)/.test(typeToken)) return "socialproof";
  if (/(footercta|calltoaction|cta|pricing|plan|tier)/.test(typeToken)) return "cta";
  if (/(contact|lead|inquiry|form)/.test(typeToken)) return "contact";
  if (/footer/.test(typeToken)) return "footer";

  // Fallback to combined token matching.
  if (/(navigation|navbar|header|topnav)/.test(token)) return "navigation";
  if (/(hero|pagehero|showcasehero)/.test(token)) return "hero";
  if (/(studiostory|story|editorial|content|philosophy|narrative|about|mission)/.test(token)) return "story";
  if (/(approach|metric|stats|feature|valueprop|process)/.test(token)) return "approach";
  if (/(product|catalog|collection|store|shop|showcase|gallery|capability|module)/.test(token))
    return "products";
  if (/(social|proof|testimonial|trust|logo|collaborator)/.test(token)) return "socialproof";
  if (/(footercta|calltoaction|cta|pricing|plan|tier)/.test(token)) return "cta";
  if (/(contact|lead|inquiry|form)/.test(token)) return "contact";
  if (/footer/.test(token)) return "footer";
  return null;
};

const auraEditorialProfile: StyleProfile = {
  id: "aura_editorial_luxury",
  name: "Aura Editorial Luxury",
  keywords: [
    "aura",
    "sixtine",
    "timeless spatial design",
    "gallery-like minimalism",
    "editorial aesthetic",
    "understated luxury",
    "digital-design-13",
  ],
  templates: {
    navigation: {
      type: "Navbar",
      props: {
        logo: "Sixtine",
        links: [
          { label: "STUDIO", href: "#studio", variant: "link" },
          { label: "EXPERTISE", href: "#approach", variant: "link" },
          { label: "JOURNAL", href: "#journal", variant: "link" },
          { label: "PORTFOLIO", href: "#projects", variant: "link" },
          { label: "CONTACT", href: "#contact", variant: "link" },
        ],
        ctas: [{ label: "Start the Dialogue", href: "#contact", variant: "secondary" }],
        variant: "withCTA",
        sticky: true,
        paddingY: "sm",
        maxWidth: "xl",
      },
    },
    hero: {
      type: "HeroSplit",
      props: {
        eyebrow: "The Sixtine Residence",
        title: "Timeless Spatial Design",
        subtitle: "Curated interiors, crafted with restraint and enduring material poetry.",
        ctas: [
          { label: "View Project", href: "#projects", variant: "link" },
          { label: "Inquire", href: "#contact", variant: "secondary" },
        ],
        mediaPosition: "right",
        paddingY: "lg",
        maxWidth: "xl",
      },
    },
    story: {
      type: "ContentStory",
      props: {
        title: "Our Studio",
        subtitle: "Light, texture, and proportion; composed into a calm spatial narrative.",
        body: "We orchestrate bespoke architectural planning and heritage materials to shape homes that feel inevitable.",
        ctas: [{ label: "Explore the Studio", href: "#studio", variant: "link" }],
        variant: "split",
        maxWidth: "xl",
      },
    },
    approach: {
      type: "FeatureGrid",
      props: {
        title: "Define Your Signature Legacy",
        subtitle: "Bespoke interiors, curated for you.",
        items: [
          { title: "Project Scale", desc: "45 custom residences per annum", icon: "layers" },
          { title: "Material Sourcing", desc: "100% ethically sourced stone", icon: "shield" },
          { title: "Client Retention", desc: "98% satisfaction rate", icon: "chart" },
        ],
        variant: "3col",
        maxWidth: "xl",
      },
    },
    socialproof: {
      type: "TestimonialsGrid",
      props: {
        title: "Building for world-class innovators",
        items: [
          {
            quote: "They curated a lifestyle, not only a space.",
            name: "Alexander Vane",
            role: "CEO at Aura",
          },
          {
            quote: "A masterclass in restraint and elegance.",
            name: "Isabelle Dubois",
            role: "Founder of ArtHouse",
          },
        ],
        variant: "2col",
        maxWidth: "xl",
      },
    },
    cta: {
      type: "LeadCaptureCTA",
      props: {
        title: "Ready to define your space?",
        subtitle: "Book a private consultation or browse the lookbook.",
        cta: { label: "Inquire Now", href: "#contact", variant: "primary" },
        variant: "banner",
        maxWidth: "xl",
      },
    },
    footer: {
      type: "Footer",
      props: {
        logoText: "Sixtine",
        columns: [
          { title: "Studio", links: [{ label: "Approach", href: "#approach" }, { label: "Projects", href: "#projects" }] },
          { title: "Company", links: [{ label: "Journal", href: "#journal" }, { label: "Contact", href: "#contact" }] },
          { title: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
        ],
        legal: "© 2026 Sixtine Interiors. All rights reserved.",
        variant: "multiColumn",
        paddingY: "md",
        maxWidth: "xl",
      },
    },
  },
};

const builtInStyleProfiles: StyleProfile[] = [auraEditorialProfile];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sectionKinds: SectionKind[] = [
  "navigation",
  "hero",
  "story",
  "approach",
  "socialproof",
  "products",
  "contact",
  "cta",
  "footer",
];

const validateTemplateBlock = (value: unknown): SectionTemplateBlock | null => {
  if (!isRecord(value)) return null;
  if (typeof value.type !== "string" || !value.type.trim()) return null;
  if (!isRecord(value.props)) return null;
  return { type: value.type.trim(), props: value.props };
};

const validateStyleProfile = (value: unknown): StyleProfile | null => {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id.trim()) return null;
  if (typeof value.name !== "string" || !value.name.trim()) return null;
  if (!Array.isArray(value.keywords) || !value.keywords.length) return null;
  const keywords = value.keywords
    .map((keyword) => (typeof keyword === "string" ? keyword.trim() : ""))
    .filter(Boolean);
  if (!keywords.length) return null;
  if (!isRecord(value.templates)) return null;

  const templates: Partial<Record<SectionKind, SectionTemplateBlock>> = {};
  for (const kind of sectionKinds) {
    if (!(kind in value.templates)) continue;
    const block = validateTemplateBlock(value.templates[kind]);
    if (!block) continue;
    templates[kind] = block;
  }
  if (!Object.keys(templates).length) return null;

  return {
    id: value.id.trim(),
    name: value.name.trim(),
    keywords,
    templates,
  };
};

type ExternalLibraryPayload = {
  profiles?: unknown[];
};

const defaultExternalLibraryPath = path.join(
  process.cwd(),
  "template-factory",
  "library",
  "style-profiles.generated.json"
);

const resolveExternalLibraryPath = () => {
  const configured = process.env.BUILDER_TEMPLATE_LIBRARY_PATH?.trim();
  if (!configured) return defaultExternalLibraryPath;
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
};

const loadExternalStyleProfiles = (): StyleProfile[] => {
  const filePath = resolveExternalLibraryPath();
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as ExternalLibraryPayload | unknown[];
    const profileValues = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as ExternalLibraryPayload)?.profiles)
        ? (parsed as ExternalLibraryPayload).profiles ?? []
        : [];
    const profiles = profileValues
      .map((item) => validateStyleProfile(item))
      .filter((item): item is StyleProfile => Boolean(item));
    if (!profiles.length) {
      logInfo("[creation:agent] template-library:external_empty", { filePath });
      return [];
    }
    logInfo("[creation:agent] template-library:external_loaded", {
      filePath,
      profiles: profiles.length,
    });
    return profiles;
  } catch (error: any) {
    logWarn("[creation:agent] template-library:external_load_failed", {
      filePath,
      message: error?.message ?? String(error),
    });
    return [];
  }
};

const dedupeProfiles = (profiles: StyleProfile[]) => {
  const seen = new Set<string>();
  const ordered: StyleProfile[] = [];
  for (const profile of profiles) {
    const id = profile.id.trim().toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ordered.push(profile);
  }
  return ordered;
};

const styleProfiles: StyleProfile[] = dedupeProfiles([
  ...loadExternalStyleProfiles(),
  ...builtInStyleProfiles,
]);

export const getStyleProfiles = () => styleProfiles;

export const selectStyleProfile = (prompt: string): StyleProfile | null => {
  const normalizedPrompt = normalizeToken(prompt);
  if (!normalizedPrompt) return null;

  let best: StyleProfile | null = null;
  let bestScore = 0;
  let bestMatchedChars = 0;
  let bestTemplateCount = 0;
  for (const profile of styleProfiles) {
    let matchedChars = 0;
    const score = profile.keywords.reduce((acc, keyword) => {
      const token = normalizeToken(keyword);
      if (token && normalizedPrompt.includes(token)) {
        matchedChars += token.length;
        return acc + 1;
      }
      return acc;
    }, 0);
    if (score <= 0) continue;

    const templateCount = Object.keys(profile.templates ?? {}).length;
    const shouldReplace =
      score > bestScore ||
      (score === bestScore && matchedChars > bestMatchedChars) ||
      (score === bestScore && matchedChars === bestMatchedChars && templateCount > bestTemplateCount) ||
      // Tie-breaker: prefer the later profile (usually the latest generated one).
      (score === bestScore && matchedChars === bestMatchedChars && templateCount === bestTemplateCount);

    if (shouldReplace) {
      best = profile;
      bestScore = score;
      bestMatchedChars = matchedChars;
      bestTemplateCount = templateCount;
    }
  }
  return bestScore > 0 ? best : null;
};

export const resolveSectionTemplateBlock = (input: {
  prompt: string;
  pageName: string;
  sectionType: string;
  sectionId: string;
  sectionIntent?: string;
  idBase: string;
  anchor: string;
}): SectionTemplateBlock | null => {
  const profile = selectStyleProfile(input.prompt);
  if (!profile) return null;

  const kind = inferSectionKind(input.sectionType, input.sectionId);
  if (!kind) return null;

  const template = profile.templates[kind];
  if (!template) return null;

  const props = cloneProps(template.props);
  if (typeof props.id !== "string" || !props.id) {
    props.id = input.idBase;
  }
  if (typeof props.anchor !== "string" || !props.anchor) {
    props.anchor = kind === "navigation" ? "top" : input.anchor;
  }
  if (kind === "navigation") {
    const logoValue = props.logo;
    if (typeof logoValue === "string") {
      const alt = logoValue.trim() || input.pageName || "Brand";
      props.logo = { alt };
    } else if (isRecord(logoValue)) {
      const alt =
        typeof logoValue.alt === "string" && logoValue.alt.trim()
          ? logoValue.alt.trim()
          : input.pageName || "Brand";
      const src = typeof logoValue.src === "string" && logoValue.src.trim() ? logoValue.src.trim() : undefined;
      props.logo = src ? { src, alt } : { alt };
    } else {
      props.logo = { alt: input.pageName || "Brand" };
    }
  }
  if (kind === "footer" && (typeof props.logoText !== "string" || !String(props.logoText).trim())) {
    props.logoText = input.pageName || "Brand";
  }
  if (
    (kind === "hero" || kind === "cta") &&
    typeof input.sectionIntent === "string" &&
    input.sectionIntent.trim() &&
    (typeof props.title !== "string" || !String(props.title).trim())
  ) {
    props.title = input.sectionIntent.trim().slice(0, 96);
  }

  return { type: template.type, props };
};

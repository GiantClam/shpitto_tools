/**
 * generate-custom-section.mjs
 *
 * Generates custom React components for sections that need higher visual fidelity.
 * Uses the existing p2w creation API to generate section-specific components.
 *
 * The generated components:
 * - Are valid JSX/TSX that compileJIT can handle
 * - Export default a React component
 * - Accept props for editable content (title, subtitle, items, images, etc.)
 * - Use Tailwind CSS classes and CSS custom properties from the theme
 * - Are compatible with Puck editor (content is editable via props)
 *
 * Constraint: Cloudflare Pages compatible (no Node.js APIs, no server-side only code)
 * Constraint: Must render correctly in Puck editor and support content editing
 */

import { promises as fs } from "fs";
import path from "path";

/**
 * Build a prompt for generating a custom section component.
 *
 * @param {Object} options
 * @param {string} options.sectionKind - e.g. "hero", "features", "footer"
 * @param {string} options.sectionType - e.g. "HeroSplit", "FeatureGrid"
 * @param {Object} options.defaults - Current section defaults (props)
 * @param {Object} options.summary - Page summary (title, h1, h2, etc.)
 * @param {string} options.sourceScreenshotUrl - URL or path to source site section screenshot
 * @param {Object} [options.visualSignature] - Color/theme info from source
 * @param {Object} [options.theme] - Theme object (palette, fonts, etc.)
 * @returns {string} The prompt for LLM
 */
export const buildCustomSectionPrompt = ({
  sectionKind,
  sectionType,
  defaults = {},
  summary = {},
  sourceScreenshotUrl = "",
  visualSignature = null,
  theme = null,
}) => {
  const title = defaults.title || summary.title || "";
  const subtitle = defaults.subtitle || "";
  const items = Array.isArray(defaults.items) ? defaults.items : [];
  const ctas = Array.isArray(defaults.ctas) ? defaults.ctas : [];
  const links = Array.isArray(defaults.links) ? defaults.links : [];

  const contentDescription = [
    title ? `Title: "${title}"` : "",
    subtitle ? `Subtitle: "${subtitle}"` : "",
    items.length ? `Items: ${items.length} items (${items.slice(0, 3).map(i => i.title || i.label || "").join(", ")})` : "",
    ctas.length ? `CTAs: ${ctas.map(c => c.label || "").join(", ")}` : "",
    links.length ? `Links: ${links.slice(0, 5).map(l => l.label || "").join(", ")}` : "",
  ].filter(Boolean).join("\n");

  const colorHints = visualSignature?.dominantColors?.length
    ? `Source dominant colors: ${visualSignature.dominantColors.join(", ")}. isDark: ${visualSignature.isDark}.`
    : "";

  const themeHints = theme
    ? `Theme: mode=${theme.mode || "light"}, fontHeading=${theme.fontHeading || "Inter"}, fontBody=${theme.fontBody || "Inter"}, radius=${theme.radius || "0.5rem"}.`
    : "";

  return `Generate a custom React section component for a "${sectionKind}" section.

## Requirements

1. Export default a React component that accepts these props:
   - id: string (required, for anchor)
   - title: string
   - subtitle: string
   ${items.length ? "- items: Array<{ title: string; description: string; icon?: string; imageSrc?: string }>" : ""}
   ${ctas.length ? "- ctas: Array<{ label: string; href: string; variant?: 'primary' | 'secondary' }>" : ""}
   ${links.length ? "- links: Array<{ label: string; href: string }>" : ""}
   - background?: "none" | "muted" | "gradient"
   - paddingY?: "sm" | "md" | "lg"

2. Use Tailwind CSS classes. Available CSS variables:
   --background, --foreground, --muted, --muted-foreground, --primary, --primary-foreground,
   --accent, --accent-foreground, --border, --card, --radius, --font-heading, --font-body

3. Use hsl(var(--primary)) syntax for colors, not hardcoded values.

4. Available imports:
   - import React from "react"
   - import { Button } from "@/components/ui/button"
   - import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
   - import { Badge } from "@/components/ui/badge"
   - import * as Lucide from "lucide-react" (for icons)

5. The component MUST be self-contained. No external API calls, no Node.js APIs.

6. All text content must come from props (not hardcoded) so it's editable in Puck.

7. Wrap the section in a <section> tag with id={id} and appropriate padding.

## Current section type: ${sectionType}
## Section kind: ${sectionKind}

## Content to render:
${contentDescription}

${colorHints}
${themeHints}

## Source reference:
${sourceScreenshotUrl ? `Source screenshot available at: ${sourceScreenshotUrl}` : "No source screenshot available."}
Match the source site's visual style as closely as possible.

Generate ONLY the component code. No markdown, no explanation.`;
};

/**
 * Build Puck field definitions for a custom component based on its props.
 *
 * @param {Object} defaults - The component's default props
 * @returns {Object} Puck field definitions
 */
export const buildPuckFieldsForCustomComponent = (defaults = {}) => {
  const fields = {};

  if ("title" in defaults) fields.title = { type: "text", label: "Title" };
  if ("subtitle" in defaults) fields.subtitle = { type: "textarea", label: "Subtitle" };
  if ("eyebrow" in defaults) fields.eyebrow = { type: "text", label: "Eyebrow" };
  if ("description" in defaults) fields.description = { type: "textarea", label: "Description" };

  if (Array.isArray(defaults.items)) {
    fields.items = {
      type: "array",
      label: "Items",
      arrayFields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        icon: { type: "text", label: "Icon" },
        imageSrc: { type: "text", label: "Image Src" },
      },
    };
  }

  if (Array.isArray(defaults.ctas)) {
    fields.ctas = {
      type: "array",
      label: "CTAs",
      arrayFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Href" },
        variant: { type: "select", label: "Variant", options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
        ]},
      },
    };
  }

  if (Array.isArray(defaults.links)) {
    fields.links = {
      type: "array",
      label: "Links",
      arrayFields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Href" },
      },
    };
  }

  if (Array.isArray(defaults.logos)) {
    fields.logos = {
      type: "array",
      label: "Logos",
      arrayFields: {
        src: { type: "text", label: "Src" },
        alt: { type: "text", label: "Alt" },
      },
    };
  }

  // Common image props
  for (const key of ["imageSrc", "backgroundImageSrc", "heroImageSrc", "mediaSrc"]) {
    if (key in defaults) fields[key] = { type: "text", label: key.replace(/([A-Z])/g, " $1").trim() };
  }

  return fields;
};

/**
 * Package a custom component for inclusion in the creation output.
 *
 * @param {Object} options
 * @param {string} options.name - Component name (PascalCase)
 * @param {string} options.code - JSX/TSX source code
 * @param {Object} options.defaults - Default props
 * @param {string} options.sectionKind - Section kind
 * @returns {Object} Component package ready for spec-pack
 */
export const packageCustomComponent = ({ name, code, defaults = {}, sectionKind = "" }) => {
  const fields = buildPuckFieldsForCustomComponent(defaults);

  return {
    name,
    code,
    sectionKind,
    defaults,
    puckConfig: {
      defaultProps: { id: `${name}-1`, ...defaults },
      fields,
    },
  };
};

/**
 * Generate a unique component name for a custom section.
 *
 * @param {string} siteId - Site identifier
 * @param {string} sectionKind - Section kind
 * @param {string} pagePath - Page path
 * @returns {string} PascalCase component name
 */
export const generateCustomComponentName = (siteId, sectionKind, pagePath = "/") => {
  const siteSlug = String(siteId || "site")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  const kindPascal = sectionKind.charAt(0).toUpperCase() + sectionKind.slice(1);
  const pageSlug = pagePath === "/" ? "" : pagePath.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "");
  const suffix = pageSlug ? `_${pageSlug}` : "";
  return `Custom${siteSlug}${kindPascal}${suffix}`;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const collectSectionRows = (specPack = {}) => {
  const rows = [];
  const root = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
  for (const [kind, entry] of Object.entries(root)) {
    rows.push({ scope: `root.${kind}`, kind, defaults: entry?.defaults || {} });
  }
  for (const page of asArray(specPack?.page_specs)) {
    const path = String(page?.path || "/");
    const sections = page?.section_specs && typeof page.section_specs === "object" ? page.section_specs : {};
    for (const [kind, entry] of Object.entries(sections)) {
      rows.push({ scope: `page:${path}.${kind}`, kind, defaults: entry?.defaults || {} });
    }
  }
  return rows;
};

const collectImageViolations = (value, scope, issues) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectImageViolations(item, `${scope}[${index}]`, issues));
    return;
  }
  if (!value || typeof value !== "object") return;
  const hasImageSrc =
    isNonEmptyString(value.src) ||
    isNonEmptyString(value.mobileSrc) ||
    isNonEmptyString(value.imageSrc) ||
    (value.image && isNonEmptyString(value.image.src));
  const imageAlt = isNonEmptyString(value.alt)
    ? value.alt
    : isNonEmptyString(value.imageAlt)
      ? value.imageAlt
      : value.image && isNonEmptyString(value.image.alt)
        ? value.image.alt
        : "";
  if (hasImageSrc && !isNonEmptyString(imageAlt)) {
    issues.push({
      type: "missing_image_alt",
      severity: "major",
      scope,
      detail: "Image source found without alt text.",
    });
  }
  for (const [key, next] of Object.entries(value)) {
    collectImageViolations(next, `${scope}.${key}`, issues);
  }
};

export const evaluateAccessibilityFromSpecPack = ({ specPack = {} } = {}) => {
  const issues = [];
  const sections = collectSectionRows(specPack);
  for (const section of sections) {
    const defaults = section.defaults && typeof section.defaults === "object" ? section.defaults : {};
    const ctaRows = [];
    if (defaults?.cta && typeof defaults.cta === "object") ctaRows.push(defaults.cta);
    for (const entry of asArray(defaults?.ctas)) ctaRows.push(entry);
    for (const [index, cta] of ctaRows.entries()) {
      const label = String(cta?.label || "").trim();
      const href = String(cta?.href || "").trim();
      if (!label) {
        issues.push({
          type: "missing_cta_label",
          severity: "critical",
          scope: `${section.scope}.cta[${index}]`,
          detail: "CTA label is empty.",
        });
      }
      if (!href) {
        issues.push({
          type: "missing_cta_href",
          severity: "critical",
          scope: `${section.scope}.cta[${index}]`,
          detail: "CTA href is empty.",
        });
      }
    }

    const linkRows = asArray(defaults?.links);
    for (const [index, link] of linkRows.entries()) {
      const label = String(link?.label || "").trim();
      const href = String(link?.href || "").trim();
      if (!label || !href) {
        issues.push({
          type: "invalid_link",
          severity: "major",
          scope: `${section.scope}.links[${index}]`,
          detail: "Link requires both label and href.",
        });
      }
    }

    collectImageViolations(defaults, section.scope, issues);
  }

  const critical = issues.filter((item) => item.severity === "critical").length;
  const major = issues.filter((item) => item.severity === "major").length;
  const minor = issues.filter((item) => item.severity === "minor").length;
  const penalty = critical * 20 + major * 5 + minor * 1;
  const score = Math.max(0, 100 - penalty);

  return {
    generatedAt: new Date().toISOString(),
    score: Number(score.toFixed(2)),
    passed: critical === 0 && score >= 90,
    counts: {
      critical,
      major,
      minor,
      total: issues.length,
      sections: sections.length,
    },
    issues: issues.slice(0, 300),
  };
};

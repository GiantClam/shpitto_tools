const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizeHexColor = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (/^#[0-9a-f]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
  return "";
};

const extractHexColorsFromString = (value) => {
  const text = String(value || "");
  const matches = text.match(/#[0-9a-fA-F]{3,6}\b/g) || [];
  const colors = [];
  for (const token of matches) {
    const normalized = normalizeHexColor(token);
    if (normalized) colors.push(normalized);
  }
  return colors;
};

const collectHexColorsDeep = (value, rows = []) => {
  if (Array.isArray(value)) {
    for (const item of value) collectHexColorsDeep(item, rows);
    return rows;
  }
  if (!value || typeof value !== "object") return rows;
  for (const [key, next] of Object.entries(value)) {
    if (typeof next === "string") {
      if (/color|background|fill|gradient|border|shadow|overlay/i.test(key)) {
        rows.push(...extractHexColorsFromString(next));
      }
      continue;
    }
    collectHexColorsDeep(next, rows);
  }
  return rows;
};

const dedupe = (list = []) => Array.from(new Set(list.filter(Boolean)));

const SECTION_STYLE_KINDS = ["hero", "story", "approach", "footer"];

const asFiniteNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Number(parsed.toFixed(2));
};

const sanitizeRuntimeSurface = (value = {}) => {
  if (!value || typeof value !== "object") return null;
  const backgroundColorRaw = String(value?.backgroundColorRaw || value?.backgroundColor || "").trim();
  const colorRaw = String(value?.colorRaw || value?.color || "").trim();
  const result = {
    ...(backgroundColorRaw ? { backgroundColorRaw } : {}),
    ...(normalizeHexColor(backgroundColorRaw) ? { backgroundColor: normalizeHexColor(backgroundColorRaw) } : {}),
    ...(colorRaw ? { colorRaw } : {}),
    ...(normalizeHexColor(colorRaw) ? { color: normalizeHexColor(colorRaw) } : {}),
  };
  const backgroundImage = String(value?.backgroundImage || "").trim();
  if (backgroundImage && backgroundImage.toLowerCase() !== "none") result.backgroundImage = backgroundImage.slice(0, 480);
  const backdropFilter = String(value?.backdropFilter || "").trim();
  if (backdropFilter && backdropFilter.toLowerCase() !== "none") result.backdropFilter = backdropFilter.slice(0, 160);
  const textAlign = String(value?.textAlign || "").trim().toLowerCase();
  if (textAlign) result.textAlign = textAlign.slice(0, 24);
  for (const [key, numericValue] of Object.entries({
    minHeightPx: asFiniteNumber(value?.minHeightPx),
    borderRadiusPx: asFiniteNumber(value?.borderRadiusPx),
    backgroundAlpha: asFiniteNumber(value?.backgroundAlpha),
    opacity: asFiniteNumber(value?.opacity),
    paddingLeftPx: asFiniteNumber(value?.paddingLeftPx),
    paddingRightPx: asFiniteNumber(value?.paddingRightPx),
    paddingTopPx: asFiniteNumber(value?.paddingTopPx),
    paddingBottomPx: asFiniteNumber(value?.paddingBottomPx),
  })) {
    if (numericValue === null) continue;
    result[key] = numericValue;
  }
  return Object.keys(result).length ? result : null;
};

const sanitizeRuntimeTypography = (value = {}) => {
  if (!value || typeof value !== "object") return null;
  const fontFamily = String(value?.fontFamily || "").trim();
  const colorRaw = String(value?.colorRaw || value?.color || "").trim();
  const backgroundColorRaw = String(value?.backgroundColorRaw || value?.backgroundColor || "").trim();
  const result = {
    ...(fontFamily ? { fontFamily } : {}),
    ...(colorRaw ? { colorRaw } : {}),
    ...(normalizeHexColor(colorRaw) ? { color: normalizeHexColor(colorRaw) } : {}),
    ...(backgroundColorRaw ? { backgroundColorRaw } : {}),
    ...(normalizeHexColor(backgroundColorRaw) ? { backgroundColor: normalizeHexColor(backgroundColorRaw) } : {}),
  };
  const fontWeight = String(value?.fontWeight || "").trim();
  if (fontWeight) result.fontWeight = fontWeight.slice(0, 24);
  const letterSpacing = String(value?.letterSpacing || "").trim();
  if (letterSpacing) result.letterSpacing = letterSpacing.slice(0, 24);
  const textTransform = String(value?.textTransform || "").trim().toLowerCase();
  if (textTransform && textTransform !== "none") result.textTransform = textTransform.slice(0, 24);
  for (const [key, numericValue] of Object.entries({
    fontSizePx: asFiniteNumber(value?.fontSizePx),
    lineHeightPx: asFiniteNumber(value?.lineHeightPx),
    backgroundAlpha: asFiniteNumber(value?.backgroundAlpha),
  })) {
    if (numericValue === null) continue;
    result[key] = numericValue;
  }
  return Object.keys(result).length ? result : null;
};

const buildSectionStyleContract = (summary = {}) => {
  const source =
    summary?.sectionComputedStyles && typeof summary.sectionComputedStyles === "object" ? summary.sectionComputedStyles : {};
  const out = {};
  for (const kind of SECTION_STYLE_KINDS) {
    const row = source?.[kind];
    if (!row || typeof row !== "object") continue;
    const root = sanitizeRuntimeSurface(row?.root);
    const title = sanitizeRuntimeTypography(row?.title);
    const content = sanitizeRuntimeTypography(row?.content);
    const textPanel = sanitizeRuntimeSurface(row?.textPanel);
    const normalized = {
      ...(root ? { root } : {}),
      ...(title ? { title } : {}),
      ...(content ? { content } : {}),
      ...(textPanel ? { textPanel } : {}),
    };
    if (Object.keys(normalized).length) out[kind] = normalized;
  }
  return out;
};

const rgbFromHex = (hex) => {
  const normalized = normalizeHexColor(hex).replace(/^#/, "");
  if (!normalized) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (![r, g, b].every(Number.isFinite)) return null;
  return { r, g, b };
};

const nearestColorDistance = (hex, palette = []) => {
  const source = rgbFromHex(hex);
  if (!source) return Number.POSITIVE_INFINITY;
  let best = Number.POSITIVE_INFINITY;
  for (const token of palette) {
    const next = rgbFromHex(token);
    if (!next) continue;
    const dr = Math.abs(source.r - next.r);
    const dg = Math.abs(source.g - next.g);
    const db = Math.abs(source.b - next.b);
    const distance = dr + dg + db;
    if (distance < best) best = distance;
  }
  return best;
};

const collectSectionDefaults = (specPack = {}) => {
  const sections = [];
  const rootSections = specPack?.section_specs && typeof specPack.section_specs === "object" ? specPack.section_specs : {};
  for (const [kind, entry] of Object.entries(rootSections)) {
    sections.push({
      scope: `root.${kind}`,
      kind,
      blockType: String(entry?.block_type || ""),
      defaults: entry?.defaults && typeof entry.defaults === "object" ? entry.defaults : {},
    });
  }
  for (const page of asArray(specPack?.page_specs)) {
    const pagePath = String(page?.path || "/");
    const pageSections = page?.section_specs && typeof page.section_specs === "object" ? page.section_specs : {};
    for (const [kind, entry] of Object.entries(pageSections)) {
      sections.push({
        scope: `page:${pagePath}.${kind}`,
        kind,
        blockType: String(entry?.block_type || ""),
        defaults: entry?.defaults && typeof entry.defaults === "object" ? entry.defaults : {},
      });
    }
  }
  return sections;
};

export const buildDesignContract = ({ site = {}, indexCard = {}, summary = {}, visualSignature = null, specPack = {} } = {}) => {
  const summaryColors = asArray(summary?.themeColors).map((item) => normalizeHexColor(item)).filter(Boolean);
  const visualColors = asArray(visualSignature?.dominantColors).map((item) => normalizeHexColor(item)).filter(Boolean);
  const specColors = collectHexColorsDeep(specPack).map((item) => normalizeHexColor(item)).filter(Boolean);
  const palette = dedupe([...visualColors, ...summaryColors, ...specColors]).slice(0, 10);

  const sections = collectSectionDefaults(specPack);
  const sectionStyleContract = buildSectionStyleContract(summary);
  const maxWidthSet = new Set();
  const componentSpec = {};
  for (const section of sections) {
    const maxWidth = String(section?.defaults?.maxWidth || "").trim();
    if (maxWidth) maxWidthSet.add(maxWidth);
    if (!section.kind) continue;
    if (!componentSpec[section.kind]) {
      componentSpec[section.kind] = {
        blockType: section.blockType || "",
        variants: dedupe([String(section?.defaults?.variant || "").trim()]).filter(Boolean),
      };
      continue;
    }
    if (!componentSpec[section.kind].blockType && section.blockType) {
      componentSpec[section.kind].blockType = section.blockType;
    }
    const variant = String(section?.defaults?.variant || "").trim();
    if (variant) componentSpec[section.kind].variants = dedupe([...componentSpec[section.kind].variants, variant]);
  }
  for (const [kind, styleEntry] of Object.entries(sectionStyleContract)) {
    if (!componentSpec[kind]) continue;
    componentSpec[kind].computedStyle = styleEntry;
  }

  const primary = palette[0] || "#111827";
  const secondary = palette[1] || "#374151";
  const background = palette.find((entry) => nearestColorDistance(entry, ["#ffffff", "#f9fafb", "#111111", "#000000"]) < 100) || "#ffffff";
  const foreground = nearestColorDistance(background, ["#ffffff", "#f9fafb"]) < 100 ? "#111827" : "#f9fafb";
  const typographySignature = String(indexCard?.typography_signature || "").trim() || "system";
  const headingFontFromSections =
    String(sectionStyleContract?.hero?.title?.fontFamily || "").trim() ||
    String(sectionStyleContract?.story?.title?.fontFamily || "").trim();
  const bodyFontFromSections =
    String(sectionStyleContract?.story?.content?.fontFamily || "").trim() ||
    String(sectionStyleContract?.approach?.content?.fontFamily || "").trim() ||
    String(sectionStyleContract?.hero?.content?.fontFamily || "").trim();
  const headingTypographyToken = headingFontFromSections || typographySignature;
  const bodyTypographyToken = bodyFontFromSections || headingFontFromSections || typographySignature;

  return {
    $schema: "https://www.designtokens.org/TR/drafts/format/",
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    siteId: String(site?.id || ""),
    sourceUrl: String(site?.url || ""),
    tokens: {
      color: {
        primary: { $type: "color", $value: primary },
        secondary: { $type: "color", $value: secondary },
        background: { $type: "color", $value: background },
        foreground: { $type: "color", $value: foreground },
        palette: Object.fromEntries(
          palette.map((entry, index) => [`p${index + 1}`, { $type: "color", $value: entry }])
        ),
      },
      typography: {
        heading: { $type: "fontFamily", $value: headingTypographyToken },
        body: { $type: "fontFamily", $value: bodyTypographyToken },
        scale: {
          s1: { $type: "dimension", $value: "12px" },
          s2: { $type: "dimension", $value: "14px" },
          s3: { $type: "dimension", $value: "16px" },
          s4: { $type: "dimension", $value: "20px" },
          s5: { $type: "dimension", $value: "24px" },
          s6: { $type: "dimension", $value: "32px" },
        },
      },
      spacing: {
        s0: { $type: "dimension", $value: "0px" },
        s1: { $type: "dimension", $value: "4px" },
        s2: { $type: "dimension", $value: "8px" },
        s3: { $type: "dimension", $value: "12px" },
        s4: { $type: "dimension", $value: "16px" },
        s5: { $type: "dimension", $value: "24px" },
        s6: { $type: "dimension", $value: "32px" },
        s7: { $type: "dimension", $value: "48px" },
        s8: { $type: "dimension", $value: "64px" },
      },
      radius: {
        none: { $type: "dimension", $value: "0px" },
        sm: { $type: "dimension", $value: "4px" },
        md: { $type: "dimension", $value: "8px" },
        lg: { $type: "dimension", $value: "12px" },
        xl: { $type: "dimension", $value: "16px" },
        full: { $type: "dimension", $value: "9999px" },
      },
    },
    layout_rules: {
      containerMaxWidth: dedupe(Array.from(maxWidthSet)).slice(0, 6),
      gridColumns: 12,
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      sectionSpacingScale: ["64px", "80px", "96px"],
    },
    component_spec: componentSpec,
    ...(Object.keys(sectionStyleContract).length
      ? {
          section_style_contract: sectionStyleContract,
        }
      : {}),
  };
};

const collectValuesByKeyPattern = (value, pattern, rows = []) => {
  if (Array.isArray(value)) {
    for (const item of value) collectValuesByKeyPattern(item, pattern, rows);
    return rows;
  }
  if (!value || typeof value !== "object") return rows;
  for (const [key, next] of Object.entries(value)) {
    if (pattern.test(key)) rows.push(next);
    collectValuesByKeyPattern(next, pattern, rows);
  }
  return rows;
};

const percentage = (ok, total) => (total <= 0 ? 100 : Number(((ok / total) * 100).toFixed(2)));

export const evaluateDesignContractCompliance = ({ designContract = {}, specPack = {}, driftThreshold = 90 } = {}) => {
  const palette = Object.values(designContract?.tokens?.color?.palette || {})
    .map((entry) => normalizeHexColor(entry?.$value || entry?.value || ""))
    .filter(Boolean);
  const trackedColors = collectHexColorsDeep(specPack).map((entry) => normalizeHexColor(entry)).filter(Boolean);
  const colorOk = trackedColors.filter((entry) => nearestColorDistance(entry, palette) <= 72).length;
  const colorCompliance = percentage(colorOk, trackedColors.length);

  const spacingTokens = new Set(["sm", "md", "lg", "xl", "2xl", "none", "0", "4", "8", "12", "16", "24", "32", "48", "64", "80", "96"]);
  const spacingValues = collectValuesByKeyPattern(specPack, /(padding|margin|gap|spacing)/i).map((entry) =>
    String(entry || "").trim().toLowerCase()
  );
  const spacingOk = spacingValues.filter((entry) => !entry || spacingTokens.has(entry) || /^\d+(px|rem|em|%)?$/.test(entry)).length;
  const spacingCompliance = percentage(spacingOk, spacingValues.length);

  const typographyValues = collectValuesByKeyPattern(specPack, /(font|text|lineHeight|tracking)/i).map((entry) =>
    String(entry || "").trim()
  );
  const typographyOk = typographyValues.filter((entry) => entry.length > 0).length;
  const typographyCompliance = percentage(typographyOk, typographyValues.length);

  const sections = collectSectionDefaults(specPack);
  const componentKinds = Object.keys(designContract?.component_spec || {});
  const componentOk = sections.filter((section) => componentKinds.includes(section.kind)).length;
  const componentCompliance = percentage(componentOk, sections.length);

  const layoutAllowed = new Set(asArray(designContract?.layout_rules?.containerMaxWidth).map((entry) => String(entry || "").trim()));
  const layoutValues = sections.map((section) => String(section?.defaults?.maxWidth || "").trim()).filter(Boolean);
  const layoutOk = layoutValues.filter((entry) => layoutAllowed.size === 0 || layoutAllowed.has(entry)).length;
  const layoutCompliance = percentage(layoutOk, layoutValues.length);

  const overallScore = Number(
    (
      colorCompliance * 0.25 +
      typographyCompliance * 0.25 +
      spacingCompliance * 0.2 +
      componentCompliance * 0.2 +
      layoutCompliance * 0.1
    ).toFixed(2)
  );

  return {
    generatedAt: new Date().toISOString(),
    thresholds: {
      driftThreshold: Number(driftThreshold),
    },
    scores: {
      colorCompliance,
      typographyCompliance,
      spacingCompliance,
      componentCompliance,
      layoutCompliance,
    },
    overallScore,
    driftPassed: overallScore >= Number(driftThreshold),
    observations: {
      trackedColors: trackedColors.length,
      trackedSpacingValues: spacingValues.length,
      trackedTypographyValues: typographyValues.length,
      trackedSections: sections.length,
      trackedLayoutValues: layoutValues.length,
    },
  };
};

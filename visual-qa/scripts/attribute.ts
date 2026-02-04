import type { ProbeElement, ProbeResult } from "./probe.ts";
import { attributeByBlocks } from "./attribute-blocks.ts";

type Severity = "low" | "medium" | "high";

export type Attribution = {
  structure: { score: number; signals: any[] };
  tokens: { score: number; signals: any[] };
  content: { score: number; signals: any[] };
  summary: { primary_cause: "structure" | "tokens" | "content"; recommended_actions: string[] };
};

export function attribute(original: ProbeResult, puck: ProbeResult): Attribution {
  const structureSignals: any[] = [];
  const tokenSignals: any[] = [];
  const contentSignals: any[] = [];

  const blockSignals = attributeByBlocks(original, puck);
  for (const signal of blockSignals) {
    if (
      signal.kind === "missing_block" ||
      signal.kind === "block_bbox_shift" ||
      signal.kind === "block_title_shift"
    ) {
      structureSignals.push(signal);
    } else if (
      signal.kind === "block_font_mismatch" ||
      signal.kind === "block_primary_color_mismatch" ||
      signal.kind === "block_type_scale_mismatch"
    ) {
      tokenSignals.push(signal);
    } else if (
      signal.kind === "block_images_count_diff" ||
      signal.kind === "block_buttons_count_diff"
    ) {
      contentSignals.push(signal);
    }
  }

  for (const img of puck.images) {
    if (!img.src) continue;
    if (img.complete && img.naturalWidth > 0) continue;
    contentSignals.push({
      kind: "image_broken",
      src: img.src,
      severity: "high" as Severity,
    });
  }

  for (const fr of puck.network.failedRequests) {
    if (fr.url.includes("analytics") || fr.url.includes("doubleclick")) continue;
    contentSignals.push({
      kind: "request_failed",
      url: fr.url,
      errorText: fr.errorText,
      severity: "medium" as Severity,
    });
  }

  const fontErrors = puck.fonts.filter((f) => f.status === "error");
  for (const fe of fontErrors) {
    contentSignals.push({
      kind: "font_not_loaded",
      font: fe.family,
      severity: "medium" as Severity,
    });
  }

  const pairs = pairElements(original.elements, puck.elements);

  for (const { a, b, key } of pairs) {
    if (!a && b) {
      structureSignals.push({
        kind: "extra_element",
        selector: key,
        severity: "low" as Severity,
      });
      continue;
    }
    if (a && !b) {
      structureSignals.push({
        kind: "missing_element",
        selector: key,
        severity: severityForMissing(key),
      });
      continue;
    }
    if (!a || !b) continue;

    const shift = bboxDelta(a, b);
    const shiftSeverity = severityForShift(key, shift);
    if (shiftSeverity) {
      structureSignals.push({
        kind: "bbox_shift",
        selector: key,
        ...shift,
        severity: shiftSeverity,
      });
    }

    const t = tokenDiff(a, b);
    for (const d of t) tokenSignals.push(d);
  }

  const structureScore = scoreFromSignals(structureSignals);
  const tokenScore = scoreFromSignals(tokenSignals);
  const contentScore = scoreFromSignals(contentSignals);

  const primary = pickPrimary(
    structureScore,
    tokenScore,
    contentScore,
    structureSignals,
    tokenSignals,
    contentSignals
  );

  const actions = recommend(primary, structureSignals, tokenSignals, contentSignals);

  return {
    structure: { score: structureScore, signals: structureSignals },
    tokens: { score: tokenScore, signals: tokenSignals },
    content: { score: contentScore, signals: contentSignals },
    summary: { primary_cause: primary, recommended_actions: actions },
  };
}

function pairElements(aEls: ProbeElement[], bEls: ProbeElement[]) {
  const keys = new Set<string>();
  for (const e of aEls) keys.add(keyOf(e.selector));
  for (const e of bEls) keys.add(keyOf(e.selector));

  const pairs: { key: string; a?: ProbeElement; b?: ProbeElement }[] = [];

  for (const k of keys) {
    const aCandidates = aEls.filter((e) => keyOf(e.selector) === k);
    const bCandidates = bEls.filter((e) => keyOf(e.selector) === k);

    const a = aCandidates.sort((x, y) => y.meta.area - x.meta.area)[0];
    const b = bCandidates.sort((x, y) => y.meta.area - x.meta.area)[0];

    pairs.push({ key: k, a, b });
  }

  return pairs;
}

function keyOf(selector: string) {
  return selector.replace(/:nth-of-type\(\d+\)/g, "");
}

function bboxDelta(a: ProbeElement, b: ProbeElement) {
  const dx = Math.round(b.bbox.x - a.bbox.x);
  const dy = Math.round(b.bbox.y - a.bbox.y);
  const dw = Math.round(b.bbox.w - a.bbox.w);
  const dh = Math.round(b.bbox.h - a.bbox.h);
  return { dx, dy, dw, dh };
}

function severityForMissing(key: string): Severity {
  if (key.includes("main h1")) return "high";
  if (key.includes("header") || key.includes("footer")) return "high";
  if (key.includes("button") || key.includes("a[href]")) return "medium";
  return "low";
}

function severityForShift(
  key: string,
  d: { dx: number; dy: number; dw: number; dh: number }
): Severity | null {
  const abs = (n: number) => Math.abs(n);
  const strict = key.includes("main h1") || key.includes("header") || key.includes("footer");
  const posTh = strict ? 12 : 20;
  const sizeTh = strict ? 16 : 28;

  if (abs(d.dx) > posTh || abs(d.dy) > posTh || abs(d.dw) > sizeTh || abs(d.dh) > sizeTh) {
    return strict ? "high" : "medium";
  }
  return null;
}

function tokenDiff(a: ProbeElement, b: ProbeElement) {
  const out: any[] = [];

  if (isImportantText(a) && a.styles.color && b.styles.color && a.styles.color !== b.styles.color) {
    out.push({
      kind: "color_mismatch",
      selector: keyOf(a.selector),
      original: a.styles.color,
      puck: b.styles.color,
      severity: "low" as Severity,
    });
  }

  if (
    a.styles.fontFamily &&
    b.styles.fontFamily &&
    normalizeFont(a.styles.fontFamily) !== normalizeFont(b.styles.fontFamily)
  ) {
    out.push({
      kind: "font_family_mismatch",
      selector: keyOf(a.selector),
      original: a.styles.fontFamily,
      puck: b.styles.fontFamily,
      severity: isHeading(a) ? ("medium" as Severity) : ("low" as Severity),
    });
  }

  if (a.styles.fontSize && b.styles.fontSize && a.styles.fontSize !== b.styles.fontSize) {
    out.push({
      kind: "font_size_mismatch",
      selector: keyOf(a.selector),
      original: a.styles.fontSize,
      puck: b.styles.fontSize,
      severity: isHeading(a) ? ("medium" as Severity) : ("low" as Severity),
    });
  }

  if (
    isCardOrButton(a) &&
    a.styles.borderRadius &&
    b.styles.borderRadius &&
    a.styles.borderRadius !== b.styles.borderRadius
  ) {
    out.push({
      kind: "radius_mismatch",
      selector: keyOf(a.selector),
      original: a.styles.borderRadius,
      puck: b.styles.borderRadius,
      severity: "low" as Severity,
    });
  }

  if (isCardLike(a) && a.styles.boxShadow && b.styles.boxShadow && a.styles.boxShadow !== b.styles.boxShadow) {
    out.push({
      kind: "shadow_mismatch",
      selector: keyOf(a.selector),
      original: a.styles.boxShadow,
      puck: b.styles.boxShadow,
      severity: "low" as Severity,
    });
  }

  return out;
}

function normalizeFont(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}
function isHeading(e: ProbeElement) {
  return e.tag === "h1" || e.tag === "h2" || e.tag === "h3";
}
function isImportantText(e: ProbeElement) {
  return isHeading(e) || e.tag === "button" || e.tag === "a";
}
function isCardOrButton(e: ProbeElement) {
  return e.tag === "button" || e.tag === "a" || isCardLike(e);
}
function isCardLike(e: ProbeElement) {
  return e.selector.includes("card") || e.tag === "article" || e.tag === "section";
}

function scoreFromSignals(signals: any[]) {
  let penalty = 0;
  for (const s of signals) {
    if (s.severity === "high") penalty += 0.12;
    else if (s.severity === "medium") penalty += 0.06;
    else penalty += 0.02;
  }
  const score = Math.max(0, 1 - penalty);
  return round3(score);
}

function pickPrimary(
  structureScore: number,
  tokenScore: number,
  contentScore: number,
  structureSignals: any[],
  tokenSignals: any[],
  contentSignals: any[]
): "structure" | "tokens" | "content" {
  const highs = {
    structure: structureSignals.filter((s) => s.severity === "high").length,
    tokens: tokenSignals.filter((s) => s.severity === "high").length,
    content: contentSignals.filter((s) => s.severity === "high").length,
  };

  const candidates: { k: "structure" | "tokens" | "content"; score: number; high: number }[] = [
    { k: "structure", score: structureScore, high: highs.structure },
    { k: "tokens", score: tokenScore, high: highs.tokens },
    { k: "content", score: contentScore, high: highs.content },
  ];

  candidates.sort((a, b) => a.score - b.score || b.high - a.high);
  return candidates[0].k;
}

function recommend(
  primary: "structure" | "tokens" | "content",
  structureSignals: any[],
  tokenSignals: any[],
  contentSignals: any[]
) {
  const rec: string[] = [];

  if (primary === "content") {
    const broken = contentSignals.filter((s) => s.kind === "image_broken").slice(0, 3);
    for (const b of broken) {
      rec.push(`Fix missing/broken image: ${b.src} (ensure downloaded into /assets and path rewritten).`);
    }
    const reqFail = contentSignals.filter((s) => s.kind === "request_failed").slice(0, 2);
    for (const r of reqFail) {
      rec.push(`Check failed resource request: ${r.url} (${r.errorText}).`);
    }
    const fonts = contentSignals.filter((s) => s.kind === "font_not_loaded").slice(0, 2);
    for (const f of fonts) {
      rec.push(`Ensure font loads correctly or fallback matches: ${f.font}.`);
    }
  }

  if (primary === "structure") {
    const missing = structureSignals.filter((s) => s.kind === "missing_element").slice(0, 3);
    for (const m of missing) {
      rec.push(`Missing element: ${m.selector}. Check block selection/assembly for that section.`);
    }
    const shifts = structureSignals.filter((s) => s.kind === "bbox_shift").slice(0, 3);
    for (const sh of shifts) {
      rec.push(`Layout shift at ${sh.selector}: dx=${sh.dx}, dy=${sh.dy}. Tune block props (padding/align/maxWidth/variant).`);
    }
  }

  if (primary === "tokens") {
    const t = tokenSignals.slice(0, 4);
    for (const s of t) {
      if (s.kind === "font_family_mismatch") {
        rec.push(`Font family mismatch at ${s.selector}. Adjust theme token font stack.`);
      }
      if (s.kind === "font_size_mismatch") {
        rec.push(`Font size mismatch at ${s.selector}. Adjust typeScale tokens.`);
      }
      if (s.kind === "color_mismatch") {
        rec.push(`Color mismatch at ${s.selector}. Adjust theme color tokens (primary/foreground).`);
      }
      if (s.kind === "radius_mismatch") {
        rec.push(`Radius mismatch at ${s.selector}. Adjust theme radius token.`);
      }
    }
  }

  return rec.length
    ? rec
    : ["No strong attribution signals. Consider tightening probe selectors or adding section-level probes."];
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

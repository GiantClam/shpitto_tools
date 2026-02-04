import type { ProbeResult } from "./probe.ts";

type Severity = "low" | "medium" | "high";

export function attributeByBlocks(original: ProbeResult, puck: ProbeResult) {
  const signals: any[] = [];

  const oMap = new Map(original.blocks.map((b) => [b.blockId, b]));
  const pMap = new Map(puck.blocks.map((b) => [b.blockId, b]));

  const allIds = new Set<string>([...oMap.keys(), ...pMap.keys()]);

  for (const id of allIds) {
    const o = oMap.get(id);
    const p = pMap.get(id);

    if (o && !p) {
      signals.push({
        kind: "missing_block",
        blockId: id,
        blockType: o.blockType,
        severity: "high" as Severity,
      });
      continue;
    }
    if (!o && p) {
      signals.push({
        kind: "extra_block",
        blockId: id,
        blockType: p.blockType,
        severity: "low" as Severity,
      });
      continue;
    }
    if (!o || !p) continue;

    const dx = Math.round(p.bbox.x - o.bbox.x);
    const dy = Math.round(p.bbox.y - o.bbox.y);
    const dw = Math.round(p.bbox.w - o.bbox.w);
    const dh = Math.round(p.bbox.h - o.bbox.h);
    const abs = (n: number) => Math.abs(n);

    if (abs(dx) > 20 || abs(dy) > 20 || abs(dw) > 40 || abs(dh) > 40) {
      signals.push({
        kind: "block_bbox_shift",
        blockId: id,
        blockType: o.blockType,
        dx,
        dy,
        dw,
        dh,
        severity: abs(dx) > 40 || abs(dy) > 40 ? ("high" as Severity) : ("medium" as Severity),
      });
    }

    const titleA = o.keyElements?.find((k) => k.kind === "title");
    const titleB = p.keyElements?.find((k) => k.kind === "title");
    if (titleA && titleB) {
      const tdx = Math.round(titleB.bbox.x - titleA.bbox.x);
      const tdy = Math.round(titleB.bbox.y - titleA.bbox.y);
      const tdxAbs = Math.abs(tdx);
      const tdyAbs = Math.abs(tdy);
      if (tdxAbs > 16 || tdyAbs > 16) {
        signals.push({
          kind: "block_title_shift",
          blockId: id,
          blockType: o.blockType,
          dx: tdx,
          dy: tdy,
          severity: tdxAbs > 30 || tdyAbs > 30 ? ("high" as Severity) : ("medium" as Severity),
        });
      }
    }

    if (
      o.tokensSample.titleFont &&
      p.tokensSample.titleFont &&
      norm(o.tokensSample.titleFont) !== norm(p.tokensSample.titleFont)
    ) {
      signals.push({
        kind: "block_font_mismatch",
        blockId: id,
        blockType: o.blockType,
        severity: "medium" as Severity,
      });
    }
    if (
      o.tokensSample.titleSize &&
      p.tokensSample.titleSize &&
      o.tokensSample.titleSize !== p.tokensSample.titleSize
    ) {
      signals.push({
        kind: "block_type_scale_mismatch",
        blockId: id,
        blockType: o.blockType,
        severity: "medium" as Severity,
      });
    }
    if (
      o.tokensSample.primaryBg &&
      p.tokensSample.primaryBg &&
      o.tokensSample.primaryBg !== p.tokensSample.primaryBg
    ) {
      signals.push({
        kind: "block_primary_color_mismatch",
        blockId: id,
        blockType: o.blockType,
        severity: "medium" as Severity,
      });
    }

    if (Math.abs(o.stats.images - p.stats.images) >= 2) {
      signals.push({
        kind: "block_images_count_diff",
        blockId: id,
        blockType: o.blockType,
        original: o.stats.images,
        puck: p.stats.images,
        severity: "medium" as Severity,
      });
    }
    if (Math.abs(o.stats.buttons - p.stats.buttons) >= 2) {
      signals.push({
        kind: "block_buttons_count_diff",
        blockId: id,
        blockType: o.blockType,
        original: o.stats.buttons,
        puck: p.stats.buttons,
        severity: "low" as Severity,
      });
    }
  }

  return signals;
}

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}

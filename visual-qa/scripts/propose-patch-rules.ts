export function proposePatchRules(att: any, allowedEdits: any) {
  const ops: any[] = [];

  const primary = att.summary?.primary_cause;
  const blockIds = Object.keys(allowedEdits).filter(
    (k) => k !== "theme" && k !== "__meta"
  );

  if (primary === "structure") {
    const signals = att.structure?.signals ?? [];
    const shifts = signals.filter(
      (s: any) => s.kind === "block_bbox_shift" || s.kind === "bbox_shift"
    );
    const missingBlocks = signals.filter((s: any) => s.kind === "missing_block");
    const missingElements = signals.filter((s: any) => s.kind === "missing_element");

    const topShift = shifts[0];
    if (topShift?.blockId && allowedEdits[topShift.blockId]) {
      if (
        typeof topShift.dy === "number" &&
        Math.abs(topShift.dy) > 20 &&
        allowedEdits[topShift.blockId].includes("props.paddingY")
      ) {
        ops.push({
          op: "setBlockProp",
          blockId: topShift.blockId,
          path: "props.paddingY",
          value: topShift.dy > 0 ? "sm" : "xl",
        });
      }
      if (allowedEdits[topShift.blockId].includes("props.align")) {
        ops.push({
          op: "setBlockProp",
          blockId: topShift.blockId,
          path: "props.align",
          value: "center",
        });
      }
      if (allowedEdits[topShift.blockId].includes("props.maxWidth")) {
        ops.push({
          op: "setBlockProp",
          blockId: topShift.blockId,
          path: "props.maxWidth",
          value: "xl",
        });
      }
    }

    const topMissing = missingBlocks[0];
    if (topMissing?.blockId && allowedEdits[topMissing.blockId]) {
      if (allowedEdits[topMissing.blockId].includes("props.background")) {
        ops.push({
          op: "setBlockProp",
          blockId: topMissing.blockId,
          path: "props.background",
          value: "none",
        });
      }
      if (allowedEdits[topMissing.blockId].includes("props.emphasis")) {
        ops.push({
          op: "setBlockProp",
          blockId: topMissing.blockId,
          path: "props.emphasis",
          value: "normal",
        });
      }
    }

    const needsFooter = missingElements.some(
      (s: any) => typeof s.selector === "string" && s.selector.includes("footer")
    );
    if (needsFooter) {
      const newId = nextId("footer", blockIds);
      ops.push({
        op: "insertBlock",
        index: blockIds.length,
        block: {
          type: "Footer",
          props: baseProps(newId, "footer"),
          variant: "simple",
        },
      });
    }

    const needsMain = missingElements.some(
      (s: any) => typeof s.selector === "string" && s.selector.startsWith("main")
    );
    if (needsMain) {
      const newId = nextId("hero", blockIds);
      ops.push({
        op: "insertBlock",
        index: 0,
        block: {
          type: "HeroCentered",
          props: baseProps(newId, "hero"),
          variant: "textOnly",
        },
      });
    }

    if (allowedEdits.theme?.includes("root.props.branding.colors.background")) {
      ops.push({
        op: "setThemeToken",
        path: "root.props.branding.colors.background",
        value: "0 0% 100%",
      });
    }
    if (allowedEdits.theme?.includes("root.props.branding.colors.foreground")) {
      ops.push({
        op: "setThemeToken",
        path: "root.props.branding.colors.foreground",
        value: "222 47% 11%",
      });
    }
  }

  if (primary === "tokens") {
    if (allowedEdits.theme?.includes("root.props.branding.typography.body")) {
      ops.push({
        op: "setThemeToken",
        path: "root.props.branding.typography.body",
        value: "Inter",
      });
    }
    if (allowedEdits.theme?.includes("root.props.branding.typography.heading")) {
      ops.push({
        op: "setThemeToken",
        path: "root.props.branding.typography.heading",
        value: "Inter",
      });
    }
  }

  if (primary === "content") {
    const signals = att.content?.signals ?? [];
    const imageDiffs = signals.filter((s: any) => s.kind === "block_images_count_diff");
    const buttonDiffs = signals.filter((s: any) => s.kind === "block_buttons_count_diff");
    const brokenImages = signals.filter((s: any) => s.kind === "image_broken");

    for (const diff of imageDiffs) {
      const allow = allowedEdits[diff.blockId];
      if (!allow) continue;
      if (diff.puck > diff.original && allow.includes("props.media")) {
        ops.push({
          op: "setBlockProp",
          blockId: diff.blockId,
          path: "props.media",
          value: null,
        });
      }
      if (diff.puck > diff.original && allow.includes("props.items")) {
        ops.push({
          op: "setBlockProp",
          blockId: diff.blockId,
          path: "props.items",
          value: [],
        });
      }
      if (allow.includes("props.variant")) {
        ops.push({
          op: "setBlockProp",
          blockId: diff.blockId,
          path: "props.variant",
          value: "simple",
        });
      }
    }

    for (const diff of buttonDiffs) {
      const allow = allowedEdits[diff.blockId];
      if (!allow) continue;
      if (diff.puck > diff.original && allow.includes("props.ctas")) {
        ops.push({
          op: "setBlockProp",
          blockId: diff.blockId,
          path: "props.ctas",
          value: [
            { label: "Learn more", href: "#", variant: "secondary" },
          ],
        });
      }
      if (allow.includes("props.variant")) {
        ops.push({
          op: "setBlockProp",
          blockId: diff.blockId,
          path: "props.variant",
          value: "simple",
        });
      }
    }

    if (brokenImages.length) {
      const target = blockIds.find((id) => {
        const allow = allowedEdits[id];
        if (!allow) return false;
        return allow.includes("props.media") || allow.includes("props.mediaSrc");
      });
      if (target) {
        if (allowedEdits[target].includes("props.media")) {
          ops.push({
            op: "setBlockProp",
            blockId: target,
            path: "props.media",
            value: null,
          });
        }
        if (allowedEdits[target].includes("props.mediaSrc")) {
          ops.push({
            op: "setBlockProp",
            blockId: target,
            path: "props.mediaSrc",
            value: "",
          });
        }
      }
    }
  }

  if (!ops.length) return null;

  return { ops: ops.slice(0, 6), confidence: 0.4, notes: ["rule-based patch (MVP)"] };
}

function nextId(prefix: string, existing: string[]) {
  let index = 0;
  let candidate = `${prefix}-${index.toString().padStart(2, "0")}`;
  const set = new Set(existing);
  while (set.has(candidate)) {
    index += 1;
    candidate = `${prefix}-${index.toString().padStart(2, "0")}`;
  }
  return candidate;
}

function baseProps(id: string, anchor?: string) {
  return {
    id,
    anchor,
    paddingY: "lg",
    background: "none",
    align: "left",
    maxWidth: "xl",
    emphasis: "normal",
  };
}

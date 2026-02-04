export function applyPatch(pageData: any, patch: any) {
  if (!Array.isArray(pageData.content)) pageData.content = [];
  const byId = new Map<string, any>();
  for (const comp of pageData.content ?? []) {
    if (comp?.props?.id) byId.set(comp.props.id, comp);
  }

  for (const op of patch.ops ?? []) {
    if (op.op === "setBlockProp") {
      const comp = byId.get(op.blockId);
      if (!comp) continue;
      setPath(comp, op.path, op.value);
    } else if (op.op === "setBlockType") {
      const comp = byId.get(op.blockId);
      if (!comp) continue;
      comp.type = op.value;
      if (comp.props && !comp.props.__v) comp.props.__v = "v1";
    } else if (op.op === "setThemeToken") {
      setPath(pageData, op.path, op.value);
    } else if (op.op === "insertBlock") {
      const block = op.block ?? {};
      if (!block.props) block.props = {};
      if (!block.props.id) {
        block.props.id = buildAutoId(block.type || "block", pageData.content.length);
      }
      const index = clampIndex(op.index, pageData.content.length);
      pageData.content.splice(index, 0, block);
      byId.set(block.props.id, block);
    } else if (op.op === "removeBlock") {
      const id = op.blockId;
      const idx = pageData.content.findIndex((b: any) => b?.props?.id === id);
      if (idx >= 0) pageData.content.splice(idx, 1);
      byId.delete(id);
    } else if (op.op === "moveBlock") {
      const id = op.blockId;
      const idx = pageData.content.findIndex((b: any) => b?.props?.id === id);
      if (idx >= 0) {
        const [block] = pageData.content.splice(idx, 1);
        const nextIndex = clampIndex(op.index, pageData.content.length);
        pageData.content.splice(nextIndex, 0, block);
      }
    }
  }

  syncBlocks(pageData);
  return pageData;
}

function setPath(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null) cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function clampIndex(index: number, max: number) {
  if (typeof index !== "number" || Number.isNaN(index)) return max;
  if (index < 0) return 0;
  if (index > max) return max;
  return index;
}

function buildAutoId(type: string, index: number) {
  const base = String(type || "block")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
  return `${base}-auto-${index.toString().padStart(2, "0")}`;
}

function syncBlocks(pageData: any) {
  if (!Array.isArray(pageData.content)) return;
  pageData.blocks = pageData.content.map((block: any) => block?.type).filter(Boolean);
}

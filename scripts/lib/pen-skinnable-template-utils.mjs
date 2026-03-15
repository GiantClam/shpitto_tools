import path from "node:path";

import { slugify } from "./pen-exact-template-utils.mjs";

const normalizeString = (value = "") => String(value || "").trim();

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const sortByOrderThenId = (items = [], orderKey = "order", idKey = "slotId") =>
  [...items].sort((left, right) => {
    const leftOrder = Number(left?.[orderKey] ?? 0);
    const rightOrder = Number(right?.[orderKey] ?? 0);
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return String(left?.[idKey] || "").localeCompare(String(right?.[idKey] || ""));
  });

const slotLabel = (...parts) =>
  parts
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .join(" / ");

const imageUrlFromNode = (node = {}) =>
  node?.fill && typeof node.fill === "object" && node.fill.type === "image" ? String(node.fill.url || "") : "";

const extractStyleDefaults = (node = {}) => {
  const style = {};
  if (node.fill !== undefined) style.fill = cloneJson(node.fill);
  if (node.stroke !== undefined) style.stroke = cloneJson(node.stroke);
  if (node.effect !== undefined) style.effect = cloneJson(node.effect);
  if (node.cornerRadius !== undefined) style.cornerRadius = node.cornerRadius;
  if (node.padding !== undefined) style.padding = cloneJson(node.padding);
  if (node.gap !== undefined) style.gap = cloneJson(node.gap);
  if (node.layout !== undefined) style.layout = node.layout;
  if (node.justifyContent !== undefined) style.justifyContent = node.justifyContent;
  if (node.alignItems !== undefined) style.alignItems = node.alignItems;
  if (node.width !== undefined) style.width = node.width;
  if (node.height !== undefined) style.height = node.height;
  if (node.opacity !== undefined) style.opacity = node.opacity;
  if (node.rotation !== undefined) style.rotation = node.rotation;
  if (node.fontFamily !== undefined) style.fontFamily = node.fontFamily;
  if (node.fontSize !== undefined) style.fontSize = node.fontSize;
  if (node.fontWeight !== undefined) style.fontWeight = node.fontWeight;
  if (node.lineHeight !== undefined) style.lineHeight = node.lineHeight;
  if (node.letterSpacing !== undefined) style.letterSpacing = node.letterSpacing;
  if (node.textAlign !== undefined) style.textAlign = node.textAlign;
  if (node.textAlignVertical !== undefined) style.textAlignVertical = node.textAlignVertical;
  return style;
};

const hasEditableStyle = (style = {}) => Object.keys(style).length > 0;

const buildNodeRef = ({ page, section, block, node, order = 0 }) => ({
  pageId: String(page?.pageId || ""),
  pageName: String(page?.pageName || ""),
  sectionId: String(section?.sectionId || ""),
  sectionName: String(section?.sectionName || ""),
  sectionKind: String(section?.sectionKind || ""),
  blockId: String(block?.blockId || ""),
  blockName: String(block?.blockName || ""),
  blockType: String(block?.blockType || ""),
  nodeId: String(node?.id || ""),
  nodeName: String(node?.name || ""),
  nodeType: String(node?.type || ""),
  order,
});

const buildSlotId = (prefix, parts = []) =>
  `${prefix}-${parts
    .map((item) => slugify(item))
    .filter(Boolean)
    .join("-")}`;

const walkNodeTree = ({
  node,
  page,
  section,
  block,
  orderBase = 0,
  textSlots,
  imageSlots,
  linkSlots,
  styleSlots,
}) => {
  if (!node || typeof node !== "object") return;
  const baseRef = buildNodeRef({ page, section, block, node, order: orderBase });

  if (node.type === "text" && typeof node.content === "string") {
    textSlots.push({
      slotId: buildSlotId("text", [page.pageId, section.sectionId, block.blockId, node.id || node.name || String(orderBase)]),
      kind: "text",
      label: slotLabel(page.pageName, section.sectionName, block.blockName || block.blockType, node.name || node.id),
      defaultValue: node.content,
      ...baseRef,
    });
  }

  const imageUrl = imageUrlFromNode(node);
  if (imageUrl) {
    imageSlots.push({
      slotId: buildSlotId("image", [page.pageId, section.sectionId, block.blockId, node.id || node.name || String(orderBase)]),
      kind: "image",
      label: slotLabel(page.pageName, section.sectionName, block.blockName || block.blockType, node.name || node.id),
      defaultUrl: imageUrl,
      defaultMode: node.fill.mode || "fill",
      ...baseRef,
    });
  }

  if (typeof node.href === "string" && node.href.trim()) {
    linkSlots.push({
      slotId: buildSlotId("link", [page.pageId, section.sectionId, block.blockId, node.id || node.name || String(orderBase)]),
      kind: "link",
      label: slotLabel(page.pageName, section.sectionName, block.blockName || block.blockType, node.name || node.id),
      defaultHref: node.href,
      textValue: typeof node.content === "string" ? node.content : "",
      ...baseRef,
    });
  }

  const nodeStyle = extractStyleDefaults(node);
  if (hasEditableStyle(nodeStyle)) {
    styleSlots.push({
      slotId: buildSlotId("style", [page.pageId, section.sectionId, block.blockId, node.id || node.name || String(orderBase)]),
      kind: "style",
      label: slotLabel(page.pageName, section.sectionName, block.blockName || block.blockType, node.name || node.id),
      defaults: nodeStyle,
      scope: "node",
      ...baseRef,
    });
  }

  for (const [childIndex, child] of (Array.isArray(node.children) ? node.children : []).entries()) {
    walkNodeTree({
      node: child,
      page,
      section,
      block,
      orderBase: orderBase + childIndex + 1,
      textSlots,
      imageSlots,
      linkSlots,
      styleSlots,
    });
  }
};

const buildSectionStyleSlot = ({ page, section }) => {
  const defaults = extractStyleDefaults(section.rawSectionNode || {});
  return {
    slotId: buildSlotId("section-style", [page.pageId, section.sectionId]),
    kind: "section-style",
    label: slotLabel(page.pageName, section.sectionName || section.sectionKind),
    pageId: page.pageId,
    pageName: page.pageName,
    sectionId: section.sectionId,
    sectionName: section.sectionName,
    sectionKind: section.sectionKind,
    blockId: "",
    blockName: "",
    blockType: "",
    nodeId: section.sectionId,
    nodeName: section.sectionName,
    nodeType: "frame",
    scope: "section",
    defaults,
    order: Number(section.order || 0),
  };
};

export const collectPageEditableSlots = (page = {}) => {
  const textSlots = [];
  const imageSlots = [];
  const linkSlots = [];
  const styleSlots = [];

  for (const section of page.sections || []) {
    const sectionStyleSlot = buildSectionStyleSlot({ page, section });
    if (hasEditableStyle(sectionStyleSlot.defaults)) styleSlots.push(sectionStyleSlot);
    for (const [blockIndex, block] of (section.blocks || []).entries()) {
      walkNodeTree({
        node: block.rawBlockNode,
        page,
        section,
        block,
        orderBase: blockIndex,
        textSlots,
        imageSlots,
        linkSlots,
        styleSlots,
      });
    }
  }

  return {
    textSlots: sortByOrderThenId(textSlots),
    imageSlots: sortByOrderThenId(imageSlots),
    linkSlots: sortByOrderThenId(linkSlots),
    styleSlots: sortByOrderThenId(styleSlots),
  };
};

const pageSlug = (page = {}) => {
  const rawName = normalizeString(page.pageName || page.pageId || "page");
  return rawName.toLowerCase() === "home" ? "home" : slugify(rawName);
};

const buildPageSkinEntry = (page = {}) => {
  const editable = collectPageEditableSlots(page);
  return {
    pageId: page.pageId,
    pageName: page.pageName,
    pageType: page.pageType,
    pageKey: pageSlug(page),
    order: page.order,
    editable: {
      textSlots: editable.textSlots,
      imageSlots: editable.imageSlots,
      linkSlots: editable.linkSlots,
      styleSlots: editable.styleSlots,
    },
    counts: {
      textSlotCount: editable.textSlots.length,
      imageSlotCount: editable.imageSlots.length,
      linkSlotCount: editable.linkSlots.length,
      styleSlotCount: editable.styleSlots.length,
    },
    sections: (page.sections || []).map((section) => ({
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      sectionKind: section.sectionKind,
      order: section.order,
      blockCount: section.blockCount,
      textSlotCount: editable.textSlots.filter((slot) => slot.sectionId === section.sectionId).length,
      imageSlotCount: editable.imageSlots.filter((slot) => slot.sectionId === section.sectionId).length,
      linkSlotCount: editable.linkSlots.filter((slot) => slot.sectionId === section.sectionId).length,
      styleSlotCount: editable.styleSlots.filter((slot) => slot.sectionId === section.sectionId).length,
    })),
  };
};

export const buildSkinnableTemplate = ({ exactTemplate, templatePath = "" }) => {
  const pages = (exactTemplate.pages || []).map((page) => buildPageSkinEntry(page));
  return {
    schemaVersion: "pen-skinnable-template.v1",
    generatedAt: new Date().toISOString(),
    sourceTemplatePath: templatePath ? path.normalize(templatePath) : "",
    identity: exactTemplate.identity,
    theme: exactTemplate.theme,
    counts: {
      pageCount: pages.length,
      textSlotCount: pages.reduce((sum, page) => sum + page.counts.textSlotCount, 0),
      imageSlotCount: pages.reduce((sum, page) => sum + page.counts.imageSlotCount, 0),
      linkSlotCount: pages.reduce((sum, page) => sum + page.counts.linkSlotCount, 0),
      styleSlotCount: pages.reduce((sum, page) => sum + page.counts.styleSlotCount, 0),
    },
    capabilities: {
      theme: true,
      copy: true,
      images: true,
      links: true,
      style: true,
    },
    pages,
  };
};

export const buildSkinnableSiteBundle = ({ siteId, siteName, variants = [] }) => ({
  schemaVersion: "pen-skinnable-site-bundle.v1",
  generatedAt: new Date().toISOString(),
  siteId,
  siteName,
  variantCount: variants.length,
  variants,
  counts: {
    pageCount: variants.reduce((sum, variant) => sum + Number(variant.counts?.pageCount || 0), 0),
    textSlotCount: variants.reduce((sum, variant) => sum + Number(variant.counts?.textSlotCount || 0), 0),
    imageSlotCount: variants.reduce((sum, variant) => sum + Number(variant.counts?.imageSlotCount || 0), 0),
    linkSlotCount: variants.reduce((sum, variant) => sum + Number(variant.counts?.linkSlotCount || 0), 0),
    styleSlotCount: variants.reduce((sum, variant) => sum + Number(variant.counts?.styleSlotCount || 0), 0),
  },
});

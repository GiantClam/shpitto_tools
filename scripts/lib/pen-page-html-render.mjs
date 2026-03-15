import fs from "node:fs/promises";
import path from "node:path";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const camelToKebab = (value = "") => String(value).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

const scaleNumber = (value, scale = 1) => {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return Number((value * scale).toFixed(4));
};

const cssPx = (value) => (typeof value === "number" ? `${value}px` : undefined);

const normalizeBoxValues = (value = []) => {
  if (!Array.isArray(value)) return null;
  if (value.length === 2) {
    const [vertical, horizontal] = value;
    return [vertical, horizontal, vertical, horizontal];
  }
  if (value.length === 4) return value;
  if (value.length === 1) return [value[0], value[0], value[0], value[0]];
  return null;
};

const flexAlignment = (value = "") =>
  ({
    start: "flex-start",
    end: "flex-end",
    center: "center",
    stretch: "stretch",
    space_between: "space-between",
    space_around: "space-around",
    space_evenly: "space-evenly",
  })[String(value || "").trim().toLowerCase()] || undefined;

const isAutoLayoutNode = (node = {}) => {
  if (!Array.isArray(node.children) || node.children.length === 0) return false;
  if (node.layout === "vertical") return true;
  if (node.layout && node.layout !== "none") return true;
  if (node.justifyContent || node.alignItems || node.gap || node.padding) {
    return node.children.some((child) => child && typeof child === "object" && child.x === undefined && child.y === undefined);
  }
  return false;
};

const resolveImageMode = (mode = "") =>
  ({
    fill: "cover",
    fit: "contain",
    stretch: "100% 100%",
  })[String(mode || "").trim().toLowerCase()] || "cover";

const linearGradientCss = (fill = {}) => {
  const rotation = typeof fill.rotation === "number" ? fill.rotation : 180;
  const stops = Array.isArray(fill.colors)
    ? fill.colors.map((entry) => `${entry.color} ${Math.round((Number(entry.position || 0) || 0) * 10000) / 100}%`)
    : [];
  if (!stops.length) return "";
  return `linear-gradient(${rotation}deg, ${stops.join(", ")})`;
};

const imageCache = new Map();

const mimeFromExtension = (value = "") =>
  ({
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  })[String(value || "").trim().toLowerCase()] || "application/octet-stream";

const maybeToDataUri = async (source = "", assetMap = new Map()) => {
  const raw = String(source || "").trim();
  if (!raw) return "";
  if (/^data:/i.test(raw)) return raw;
  if (/^https?:/i.test(raw)) {
    if (imageCache.has(raw)) return imageCache.get(raw);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(raw, { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") || mimeFromExtension(path.extname(new URL(raw).pathname).slice(1));
      const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;
      imageCache.set(raw, dataUri);
      return dataUri;
    } catch {
      imageCache.set(raw, raw);
      return raw;
    }
  }
  const resolved = assetMap.get(raw) || raw;
  if (!path.isAbsolute(resolved)) return resolved;
  if (imageCache.has(resolved)) return imageCache.get(resolved);
  try {
    const buffer = await fs.readFile(resolved);
    const ext = path.extname(resolved).slice(1).toLowerCase() || "png";
    const mime = mimeFromExtension(ext);
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
    imageCache.set(resolved, dataUri);
    return dataUri;
  } catch {
    imageCache.set(resolved, resolved);
    return resolved;
  }
};

const buildShadow = (effect = {}, scaleX = 1, scaleY = 1) => {
  if (effect?.type !== "shadow") return "";
  const offsetX = scaleNumber(effect?.offset?.x || 0, scaleX) || 0;
  const offsetY = scaleNumber(effect?.offset?.y || 0, scaleY) || 0;
  const blur = scaleNumber(effect?.blur || 0, Math.max(scaleX, scaleY)) || 0;
  const color = String(effect?.color || "").trim();
  if (!color) return "";
  return `${offsetX}px ${offsetY}px ${blur}px ${color}`;
};

const serializeStyle = (style = {}) =>
  Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${camelToKebab(key)}:${String(value)}`)
    .join(";");

const escapeInlineScript = (value = "") =>
  String(value || "")
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--");

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const deepMergeObjects = (base, patch) => {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return patch;
  const output = Array.isArray(base) ? [...base] : { ...(base && typeof base === "object" ? base : {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value) && base && typeof base?.[key] === "object" && !Array.isArray(base[key])) {
      output[key] = deepMergeObjects(base[key], value);
      continue;
    }
    output[key] = value;
  }
  return output;
};

const applyNodeOverrides = (node, overrideMap = new Map()) => {
  if (!node || typeof node !== "object") return node;
  const next = cloneJson(node);
  const nodeId = String(next.id || "");
  const override = nodeId ? overrideMap.get(nodeId) : null;
  if (override && typeof override === "object") {
    if (Object.prototype.hasOwnProperty.call(override, "content")) next.content = override.content;
    if (Object.prototype.hasOwnProperty.call(override, "href")) next.href = override.href;
    if (Object.prototype.hasOwnProperty.call(override, "fill")) next.fill = deepMergeObjects(next.fill, override.fill);
    if (Object.prototype.hasOwnProperty.call(override, "stroke")) next.stroke = deepMergeObjects(next.stroke, override.stroke);
    if (Object.prototype.hasOwnProperty.call(override, "effect")) next.effect = deepMergeObjects(next.effect, override.effect);
    for (const key of [
      "padding",
      "gap",
      "layout",
      "justifyContent",
      "alignItems",
      "cornerRadius",
      "opacity",
      "rotation",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "textAlign",
      "textAlignVertical",
      "width",
      "height",
    ]) {
      if (Object.prototype.hasOwnProperty.call(override, key)) next[key] = override[key];
    }
  }
  if (Array.isArray(next.children)) {
    next.children = next.children.map((child) => applyNodeOverrides(child, overrideMap));
  }
  return next;
};

const buildInteractiveRuntimeHtml = (options = {}) => {
  const enhancements = Array.isArray(options.interactionEnhancements) ? options.interactionEnhancements : [];
  const motionMode = String(options.motionMode || "off").trim().toLowerCase();
  if (!enhancements.length && motionMode === "off") return "";
  const payload = escapeInlineScript(
    JSON.stringify({
      enhancements,
      motionMode,
    })
  );
  return `
    <style>
      .pen-overlay-root {
        position: absolute;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
      }
      .pen-overlay-link {
        position: absolute;
        display: block;
        pointer-events: auto;
        background: transparent;
        color: inherit;
        text-decoration: none;
        cursor: pointer;
      }
      .pen-overlay-menu {
        position: absolute;
        pointer-events: auto;
        z-index: 10010;
      }
      .pen-overlay-menu-trigger {
        position: absolute;
        inset: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
      }
      .pen-overlay-menu-popover {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        min-width: 220px;
        max-width: min(340px, calc(100vw - 32px));
        padding: 10px;
        border-radius: 16px;
        border: 1px solid rgba(17, 24, 39, 0.12);
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
        backdrop-filter: blur(18px);
        opacity: 0;
        transform: translate3d(0, 10px, 0) scale(0.98);
        transform-origin: top left;
        transition: opacity 180ms ease, transform 180ms ease;
        pointer-events: none;
        z-index: 10011;
      }
      .pen-overlay-menu:hover .pen-overlay-menu-popover,
      .pen-overlay-menu:focus-within .pen-overlay-menu-popover {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        pointer-events: auto;
      }
      .pen-overlay-menu-title {
        margin: 0 0 8px;
        font: 600 12px/1.4 Inter, "Helvetica Neue", Arial, sans-serif;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(71, 85, 105, 0.92);
      }
      .pen-overlay-menu-list {
        display: grid;
        gap: 4px;
      }
      .pen-overlay-menu-item {
        display: block;
        padding: 8px 10px;
        border-radius: 10px;
        color: #0f172a;
        text-decoration: none;
        font: 500 13px/1.4 Inter, "Helvetica Neue", Arial, sans-serif;
      }
      .pen-overlay-menu-item:hover,
      .pen-overlay-menu-item:focus-visible {
        background: rgba(15, 23, 42, 0.06);
        outline: none;
      }
      @media (prefers-reduced-motion: no-preference) {
        .pen-section-observe {
          opacity: 0.001;
          transform: translate3d(0, 24px, 0);
          transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
        .pen-section-observe.pen-section-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        .pen-hero-media {
          transform-origin: center center;
          animation: pen-hero-breathe 10s ease-in-out infinite;
          will-change: transform;
        }
      }
      @keyframes pen-hero-breathe {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(0, -6px, 0) scale(1.018); }
      }
    </style>
    <script>
      (() => {
        const payload = ${payload};
        const enhancements = Array.isArray(payload.enhancements) ? payload.enhancements : [];
        const motionMode = String(payload.motionMode || "off");
        const rootId = "pen-overlay-root";

        const createOverlayRoot = () => {
          let root = document.getElementById(rootId);
          if (root) return root;
          root = document.createElement("div");
          root.id = rootId;
          root.className = "pen-overlay-root";
          document.body.appendChild(root);
          return root;
        };

        const absoluteBox = (rect) => ({
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        });

        const createExactRanges = (element, label) => {
          const ranges = [];
          if (!element || !label) return ranges;
          const target = String(label);
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const textNode = walker.currentNode;
            const value = textNode.nodeValue || "";
            let index = value.indexOf(target);
            while (index !== -1) {
              const range = document.createRange();
              range.setStart(textNode, index);
              range.setEnd(textNode, index + target.length);
              ranges.push(range);
              index = value.indexOf(target, index + target.length);
            }
          }
          return ranges;
        };

        const renderSegmentLinks = (root, descriptor) => {
          const element = document.querySelector('[data-pen-node="' + CSS.escape(descriptor.nodeId || "") + '"]');
          if (!element) return;
          for (const item of descriptor.items || []) {
            for (const range of createExactRanges(element, item.label)) {
              for (const rect of Array.from(range.getClientRects())) {
                if (!rect.width || !rect.height) continue;
                const box = absoluteBox(rect);
                const link = document.createElement("a");
                link.className = "pen-overlay-link";
                link.href = String(item.href || "");
                link.dataset.penOverlay = "segment-link";
                link.dataset.location = String(descriptor.location || "");
                link.dataset.pageParam = String(item.pageParam || "");
                link.setAttribute("aria-label", String(item.label || item.pageParam || "Open page"));
                link.style.left = box.left + "px";
                link.style.top = box.top + "px";
                link.style.width = box.width + "px";
                link.style.height = box.height + "px";
                root.appendChild(link);
              }
            }
          }
        };

        const renderMenu = (root, descriptor) => {
          const element = document.querySelector('[data-pen-node="' + CSS.escape(descriptor.nodeId || "") + '"]');
          if (!element || !Array.isArray(descriptor.items) || !descriptor.items.length) return;
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const box = absoluteBox(rect);
          const triggerSize = Math.max(18, Math.min(44, Math.min(box.width || 44, box.height || 44)));
          const shell = document.createElement("div");
          shell.className = "pen-overlay-menu";
          shell.dataset.location = String(descriptor.location || "");
          shell.style.left = box.left + Math.max(0, box.width - triggerSize) + "px";
          shell.style.top = box.top + "px";
          shell.style.width = triggerSize + "px";
          shell.style.height = triggerSize + "px";

          const trigger = document.createElement("button");
          trigger.type = "button";
          trigger.className = "pen-overlay-menu-trigger";
          trigger.dataset.location = String(descriptor.location || "");
          trigger.setAttribute("aria-label", String(descriptor.title || "Site menu"));
          shell.appendChild(trigger);

          const popover = document.createElement("div");
          popover.className = "pen-overlay-menu-popover";
          popover.style.left = "auto";
          popover.style.right = "0";

          if (descriptor.title) {
            const title = document.createElement("p");
            title.className = "pen-overlay-menu-title";
            title.textContent = String(descriptor.title);
            popover.appendChild(title);
          }

          const list = document.createElement("div");
          list.className = "pen-overlay-menu-list";
          for (const item of descriptor.items) {
            const link = document.createElement("a");
            link.className = "pen-overlay-menu-item";
            link.href = String(item.href || "");
            link.dataset.penOverlay = "menu-item";
            link.dataset.location = String(descriptor.location || "");
            link.dataset.pageParam = String(item.pageParam || "");
            link.textContent = String(item.label || item.pageParam || "");
            list.appendChild(link);
          }
          popover.appendChild(list);
          shell.appendChild(popover);
          root.appendChild(shell);
        };

        const layoutEnhancements = () => {
          const root = createOverlayRoot();
          root.innerHTML = "";
          for (const descriptor of enhancements) {
            if (descriptor.type === "segment-links") renderSegmentLinks(root, descriptor);
            if (descriptor.type === "menu") renderMenu(root, descriptor);
          }
        };

        const setupMotion = () => {
          if (motionMode === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          const sections = Array.from(document.querySelectorAll("[data-pen-section='true']"));
          if (!sections.length) return;
          const observer = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) entry.target.classList.add("pen-section-visible");
              }
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0.18 }
          );
          for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.82) {
              section.classList.add("pen-section-visible");
            } else {
              section.classList.add("pen-section-observe");
              observer.observe(section);
            }
          }
          for (const hero of document.querySelectorAll('[data-pen-section-kind="hero"]')) {
            const media = hero.querySelector('[style*="background-image"]');
            if (media) media.classList.add("pen-hero-media");
          }
        };

        let frame = 0;
        const requestLayout = () => {
          if (frame) cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            layoutEnhancements();
            frame = 0;
          });
        };

        window.addEventListener("load", requestLayout, { once: true });
        window.addEventListener("resize", requestLayout);
        window.addEventListener("scroll", requestLayout, { passive: true });
        document.addEventListener("DOMContentLoaded", () => {
          requestLayout();
          setupMotion();
        });
      })();
    </script>
  `;
};

const renderLucideIcon = (iconName = "") => {
  const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    globe:
      `<svg viewBox="0 0 24 24" ${common}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    search:
      `<svg viewBox="0 0 24 24" ${common}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    "shopping-bag":
      `<svg viewBox="0 0 24 24" ${common}><path d="M6 2h12l1 5H5l1-5Z"/><path d="M3 7h18l-1 14H4L3 7Z"/><path d="M9 10a3 3 0 0 0 6 0"/></svg>`,
    wrench:
      `<svg viewBox="0 0 24 24" ${common}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-2-2 3-3Z"/></svg>`,
    newspaper:
      `<svg viewBox="0 0 24 24" ${common}><path d="M5 22h14a2 2 0 0 0 2-2V5H7a2 2 0 0 0-2 2v15Z"/><path d="M5 22a2 2 0 0 1-2-2V9"/><path d="M9 9h8"/><path d="M9 13h8"/><path d="M9 17h5"/></svg>`,
    "heart-handshake":
      `<svg viewBox="0 0 24 24" ${common}><path d="M16 4a4 4 0 0 1 3.5 5.9L12 21l-7.5-11.1A4 4 0 0 1 8 4c1.7 0 3 1 4 2 1-1 2.3-2 4-2Z"/><path d="m8 12 2 2 5-5"/></svg>`,
    "message-square":
      `<svg viewBox="0 0 24 24" ${common}><path d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>`,
  };
  return icons[iconName] || "";
};

const iconFontHtml = (node = {}, styleText = "") => {
  const family = String(node.iconFontFamily || "").trim().toLowerCase();
  const name = String(node.iconFontName || "").trim();
  const size = Math.max(Number(node.width || 0), Number(node.height || 0), 16);
  if (family === "material symbols rounded") {
    return `<span data-pen-node="${escapeHtml(node.id || "")}" class="material-symbols-rounded" style="${styleText};font-size:${size}px;line-height:1">${escapeHtml(
      name
    )}</span>`;
  }
  if (family === "phosphor") {
    return `<i data-pen-node="${escapeHtml(node.id || "")}" class="ph ph-${escapeHtml(name)}" style="${styleText};font-size:${size}px;line-height:1"></i>`;
  }
  if (family === "lucide") {
    const svg = renderLucideIcon(name);
    return `<span data-pen-node="${escapeHtml(node.id || "")}" class="pen-icon-svg" style="${styleText}">${svg}</span>`;
  }
  return `<span data-pen-node="${escapeHtml(node.id || "")}" style="${styleText};font-size:${size}px;line-height:1">${escapeHtml(
    name
  )}</span>`;
};

const resolveNumeric = (value, scale = 1) => {
  if (typeof value === "number") return cssPx(scaleNumber(value, scale));
  return undefined;
};

const buildNodeStyle = async (node = {}, context, parent = null, scaleX = 1, scaleY = 1, isRoot = false) => {
  const style = {
    boxSizing: "border-box",
  };
  const autoLayout = isAutoLayoutNode(node);
  if (!isRoot && !autoLayout) {
    style.position = "absolute";
    if (typeof node.x === "number") style.left = cssPx(scaleNumber(node.x, scaleX));
    if (typeof node.y === "number") style.top = cssPx(scaleNumber(node.y, scaleY));
  }
  if (autoLayout) {
    style.display = "flex";
    style.flexDirection = node.layout === "vertical" ? "column" : "row";
    style.justifyContent = flexAlignment(node.justifyContent) || undefined;
    style.alignItems = flexAlignment(node.alignItems) || undefined;
    if (typeof node.gap === "number") style.gap = cssPx(scaleNumber(node.gap, Math.max(scaleX, scaleY)));
  }

  const width =
    node.width === "fill_container"
      ? "100%"
      : typeof node.width === "number"
        ? cssPx(scaleNumber(node.width, scaleX))
        : undefined;
  const height =
    node.height === "fill_container"
      ? "100%"
      : typeof node.height === "number"
        ? cssPx(scaleNumber(node.height, scaleY))
        : undefined;

  if (width) style.width = width;
  if (height) style.height = height;

  if (node.width === "fill_container" && autoLayout) style.flex = style.flex || "1 1 auto";
  if (node.height === "fill_container" && autoLayout && node.layout === "vertical") style.flex = style.flex || "1 1 auto";

  const padding = normalizeBoxValues(node.padding);
  if (padding) {
    style.padding = padding
      .map((value, index) => cssPx(scaleNumber(value, index % 2 === 0 ? scaleY : scaleX) || 0))
      .join(" ");
  }

  if (node.cornerRadius !== undefined) {
    const radius = scaleNumber(Number(node.cornerRadius || 0), Math.max(scaleX, scaleY));
    style.borderRadius = cssPx(radius || 0);
  }
  if (node.clip || node.cornerRadius !== undefined) style.overflow = "hidden";

  if (typeof node.fill === "string" && node.type !== "text" && node.type !== "icon_font" && node.type !== "path") {
    style.background = node.fill;
  }
  if (node.stroke && typeof node.stroke === "object") {
    const thickness = scaleNumber(Number(node.stroke.thickness || 0), Math.max(scaleX, scaleY)) || 0;
    if (thickness > 0 && node.stroke.fill) {
      style.border = `${thickness}px solid ${node.stroke.fill}`;
    }
  }
  if (node.effect) {
    const shadow = buildShadow(node.effect, scaleX, scaleY);
    if (shadow) style.boxShadow = shadow;
  }
  if (typeof node.opacity === "number") style.opacity = String(node.opacity);

  if (node.rotation !== undefined) {
    const rotation = Number(node.rotation);
    if (!Number.isNaN(rotation)) {
      const unit = Math.abs(rotation) <= Math.PI * 2 ? "rad" : "deg";
      style.transform = `${style.transform ? `${style.transform} ` : ""}rotate(${rotation}${unit})`;
      style.transformOrigin = "top left";
    }
  }

  if (node.type === "text" || node.type === "icon_font") {
    style.color = typeof node.fill === "string" ? node.fill : undefined;
    if (node.fontFamily) style.fontFamily = `"${String(node.fontFamily)}", "Helvetica Neue", Arial, sans-serif`;
    if (node.fontSize !== undefined) style.fontSize = resolveNumeric(Number(node.fontSize || 0), Math.max(scaleX, scaleY));
    if (node.fontWeight !== undefined) style.fontWeight = String(node.fontWeight);
    if (node.lineHeight !== undefined) {
      const lineHeight = Number(node.lineHeight);
      style.lineHeight = Number.isFinite(lineHeight)
        ? lineHeight <= 4
          ? String(lineHeight)
          : cssPx(scaleNumber(lineHeight, scaleY))
        : undefined;
    }
    if (node.letterSpacing !== undefined) {
      style.letterSpacing = cssPx(scaleNumber(Number(node.letterSpacing || 0), scaleX) || 0);
    }
    if (node.textAlign) style.textAlign = String(node.textAlign).toLowerCase();
    if (node.textAlignVertical) {
      style.display = "flex";
      style.alignItems =
        ({
          top: "flex-start",
          middle: "center",
          center: "center",
          bottom: "flex-end",
        })[String(node.textAlignVertical || "").trim().toLowerCase()] || style.alignItems;
      style.justifyContent =
        ({
          left: "flex-start",
          center: "center",
          right: "flex-end",
        })[String(node.textAlign || "").trim().toLowerCase()] || style.justifyContent;
    }
    style.whiteSpace = "pre-wrap";
    style.overflowWrap = "break-word";
  }

  if (node.fill && typeof node.fill === "object") {
    if (node.fill.type === "image") {
      const url = await maybeToDataUri(node.fill.url, context.assetMap);
      style.backgroundImage = `url('${String(url).replace(/'/g, "%27")}')`;
      style.backgroundRepeat = "no-repeat";
      style.backgroundPosition = "center center";
      style.backgroundSize = resolveImageMode(node.fill.mode);
    } else if (node.fill.type === "gradient") {
      style.backgroundImage = linearGradientCss(node.fill);
    }
  }

  if (node.type === "frame" && !autoLayout && !style.position && !isRoot) style.position = "absolute";
  if (isRoot) {
    style.position = "relative";
    style.left = undefined;
    style.top = undefined;
  }

  return style;
};

const renderNodeHtml = async (node, context, parent = null, isRoot = false) => {
  if (!node || typeof node !== "object" || node.enabled === false) return "";
  const style = await buildNodeStyle(node, context, parent, context.scaleX, context.scaleY, isRoot);
  const styleText = serializeStyle(style);
  const sectionKind = context.sectionKindsById?.get?.(String(node.id || ""));
  const sectionAttr = sectionKind
    ? ` data-pen-section="true" data-pen-section-kind="${escapeHtml(sectionKind)}"`
    : "";

  if (node.type === "text") {
    return `<div data-pen-node="${escapeHtml(node.id || "")}"${sectionAttr} style="${escapeHtml(styleText)}">${escapeHtml(node.content || "")}</div>`;
  }

  if (node.type === "icon_font") {
    return iconFontHtml(node, escapeHtml(styleText));
  }

  if (node.type === "path") {
    return `<svg data-pen-node="${escapeHtml(node.id || "")}"${sectionAttr} style="${escapeHtml(styleText)}" viewBox="0 0 ${Number(
      node.width || 0
    )} ${Number(
      node.height || 0
    )}" preserveAspectRatio="none"><path d="${escapeHtml(node.geometry || "")}" fill="${escapeHtml(
      typeof node.fill === "string" ? node.fill : "#000000"
    )}"></path></svg>`;
  }

  if (node.type === "line") {
    const strokeColor = String(node?.stroke?.fill || "#000000");
    const strokeWidth = scaleNumber(Number(node?.stroke?.thickness || 1), Math.max(context.scaleX, context.scaleY)) || 1;
    const width = Number(node.width || 0);
    const height = Number(node.height || 0);
    return `<svg data-pen-node="${escapeHtml(node.id || "")}"${sectionAttr} style="${escapeHtml(styleText)}" viewBox="0 0 ${Math.max(
      width,
      1
    )} ${Math.max(
      height || strokeWidth,
      1
    )}" preserveAspectRatio="none"><line x1="0" y1="${strokeWidth / 2}" x2="${Math.max(width, 1)}" y2="${
      strokeWidth / 2
    }" stroke="${escapeHtml(strokeColor)}" stroke-width="${strokeWidth}" /></svg>`;
  }

  const childrenHtml = Array.isArray(node.children)
    ? await Promise.all(node.children.map((child) => renderNodeHtml(child, context, node, false)))
    : [];

  const rewrittenHref =
    typeof context.hrefTransform === "function" && typeof node.href === "string"
      ? context.hrefTransform(node.href, node)
      : node.href;
  const tag = rewrittenHref ? "a" : "div";
  const target =
    rewrittenHref && typeof context.linkTarget === "string" && context.linkTarget.trim()
      ? ` target="${escapeHtml(context.linkTarget)}"`
      : "";
  const rel = target ? ` rel="noopener noreferrer"` : "";
  const extra = rewrittenHref ? ` href="${escapeHtml(rewrittenHref)}"${target}${rel}` : "";
  return `<${tag} data-pen-node="${escapeHtml(node.id || "")}"${sectionAttr}${extra} style="${escapeHtml(styleText)}">${childrenHtml.join(
    ""
  )}</${tag}>`;
};

export const buildPenHtmlDocument = async (pageNode, size, assetRefs = [], options = {}) => {
  const overrideMap = new Map(
    Object.entries(options.overrideMap && typeof options.overrideMap === "object" ? options.overrideMap : {})
  );
  const resolvedPageNode = overrideMap.size ? applyNodeOverrides(pageNode, overrideMap) : pageNode;
  const pageWidth = Number(resolvedPageNode?.width || size?.width || 1);
  const pageHeight = Number(resolvedPageNode?.height || size?.height || 1);
  const scaleX = size.width / pageWidth;
  const scaleY = size.height / pageHeight;
  const assetMap = new Map(
    (Array.isArray(assetRefs) ? assetRefs : [])
      .filter((item) => item && typeof item === "object" && item.rawUrl && item.resolvedPath)
      .map((item) => [String(item.rawUrl), String(item.resolvedPath)])
  );
  const rootHtml = await renderNodeHtml(
    resolvedPageNode,
    {
      scaleX,
      scaleY,
      assetMap,
      hrefTransform: options.hrefTransform,
      linkTarget: options.linkTarget,
      sectionKindsById: new Map(
        Object.entries(options.sectionKindsById && typeof options.sectionKindsById === "object" ? options.sectionKindsById : {})
      ),
    },
    null,
    true
  );
  const extraHead = String(options.extraHeadHtml || "").trim();
  const runtimeHtml = buildInteractiveRuntimeHtml(options);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
    ${extraHead}
    <style>
      html, body { margin: 0; padding: 0; background: #ffffff; }
      body { position: relative; width: ${size.width}px; min-height: ${size.height}px; overflow-x: hidden; }
      a { color: inherit; text-decoration: none; }
      .pen-icon-svg svg { width: 100%; height: 100%; display: block; }
      .material-symbols-rounded { font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24; }
    </style>
  </head>
  <body>
    ${rootHtml}
    ${runtimeHtml}
  </body>
</html>`;
};

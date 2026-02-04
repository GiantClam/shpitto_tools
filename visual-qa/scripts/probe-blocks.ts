import type { Page } from "playwright";

export type BlockProbe = {
  blockType: string;
  blockId: string;
  variant?: string;
  bbox: { x: number; y: number; w: number; h: number };
  keyElements: {
    kind: "title" | "button" | "image";
    bbox: { x: number; y: number; w: number; h: number };
  }[];
  stats: {
    h1: number;
    h2: number;
    buttons: number;
    links: number;
    images: number;
    cards: number;
    forms: number;
    textLen: number;
  };
  tokensSample: {
    titleColor?: string;
    titleFont?: string;
    titleSize?: string;
    primaryBg?: string;
    radius?: string;
    shadow?: string;
  };
};

export async function probeBlocks(page: Page): Promise<BlockProbe[]> {
  const blocks = await page.$$('[data-block][data-block-id]');
  const out: BlockProbe[] = [];

  for (const b of blocks) {
    const box = await b.boundingBox();
    if (!box) continue;

    const data = await b.evaluate((el) => {
      const blockType = el.getAttribute("data-block") || "";
      const blockId = el.getAttribute("data-block-id") || "";
      const variant = el.getAttribute("data-block-variant") || undefined;

      const q = (s: string) => el.querySelectorAll(s).length;
      const textLen = (el.textContent || "").trim().length;

      const titleEl = (el.querySelector("h1") || el.querySelector("h2")) as
        | HTMLElement
        | null;
      const titleCs = titleEl ? window.getComputedStyle(titleEl) : null;
      const titleBox = titleEl ? titleEl.getBoundingClientRect() : null;

      const primaryBtn = (el.querySelector("button.bg-primary") ||
        el.querySelector("a.bg-primary") ||
        el.querySelector("[data-variant='default']")) as HTMLElement | null;
      const btnCs = primaryBtn ? window.getComputedStyle(primaryBtn) : null;
      const btnBox = primaryBtn ? primaryBtn.getBoundingClientRect() : null;

      const cardEl = (el.querySelector("[class*='card']") ||
        el.querySelector("article") ||
        el.querySelector("section")) as HTMLElement | null;
      const cardCs = cardEl ? window.getComputedStyle(cardEl) : null;

      return {
        blockType,
        blockId,
        variant,
        keyElements: [
          titleBox
            ? {
                kind: "title",
                bbox: {
                  x: titleBox.x,
                  y: titleBox.y,
                  w: titleBox.width,
                  h: titleBox.height,
                },
              }
            : null,
          btnBox
            ? {
                kind: "button",
                bbox: {
                  x: btnBox.x,
                  y: btnBox.y,
                  w: btnBox.width,
                  h: btnBox.height,
                },
              }
            : null,
        ].filter(Boolean),
        stats: {
          h1: q("h1"),
          h2: q("h2"),
          buttons: q("button"),
          links: q("a[href]"),
          images: q("img"),
          cards: q("[class*='card'], article"),
          forms: q("form, input, textarea, select"),
          textLen,
        },
        tokensSample: {
          titleColor: titleCs?.color,
          titleFont: titleCs?.fontFamily,
          titleSize: titleCs?.fontSize,
          primaryBg: btnCs?.backgroundColor,
          radius: cardCs?.borderRadius,
          shadow: cardCs?.boxShadow,
        },
      };
    });

    out.push({
      blockType: data.blockType,
      blockId: data.blockId,
      variant: data.variant,
      bbox: { x: box.x, y: box.y, w: box.width, h: box.height },
      keyElements: data.keyElements ?? [],
      stats: data.stats,
      tokensSample: data.tokensSample,
    });
  }

  return out;
}

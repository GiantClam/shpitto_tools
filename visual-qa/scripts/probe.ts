import type { Page } from "playwright";
import { probeBlocks, type BlockProbe } from "./probe-blocks.ts";

export type ProbeElement = {
  selector: string;
  tag: string;
  text?: string;
  href?: string;
  src?: string;
  bbox: { x: number; y: number; w: number; h: number };
  styles: {
    color?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    borderRadius?: string;
    boxShadow?: string;
    textAlign?: string;
  };
  meta: {
    visible: boolean;
    area: number;
  };
};

export type ProbeResult = {
  url: string;
  viewport: "desktop" | "mobile";
  doc: {
    width: number;
    height: number;
    title: string;
  };
  fonts: { family: string; status: "loaded" | "error" }[];
  network: { failedRequests: { url: string; errorText: string }[] };
  images: { src: string; complete: boolean; naturalWidth: number; naturalHeight: number }[];
  elements: ProbeElement[];
  blocks: BlockProbe[];
};

export async function probe(page: Page, viewport: "desktop" | "mobile"): Promise<ProbeResult> {
  const failed: { url: string; errorText: string }[] = [];
  page.on("requestfailed", (req) => {
    failed.push({ url: req.url(), errorText: req.failure()?.errorText ?? "unknown" });
  });

  const url = page.url();

  const doc = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    title: document.title ?? "",
  }));

  const fonts = await page.evaluate(async () => {
    // @ts-ignore
    if (!document.fonts) return [];
    // @ts-ignore
    const fontFaces = Array.from(document.fonts.values?.() ?? []);
    const out: { family: string; status: "loaded" | "error" }[] = [];
    for (const ff of fontFaces) {
      // @ts-ignore
      const family = ff.family ?? "";
      // @ts-ignore
      const status = ff.status === "loaded" ? "loaded" : "error";
      out.push({ family, status });
    }
    return out.slice(0, 20);
  });

  const images = await page.evaluate(() => {
    const imgs = Array.from(document.images ?? []);
    return imgs.slice(0, 40).map((img) => ({
      src: img.currentSrc || img.src || "",
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
  });

  const selectors = buildSelectors();
  const elements = await collectElements(page, selectors);
  const blocks = await probeBlocks(page);

  return {
    url,
    viewport,
    doc,
    fonts,
    network: { failedRequests: failed.slice(0, 50) },
    images,
    elements,
    blocks,
  };
}

function buildSelectors() {
  return [
    "header",
    "header nav",
    "nav",
    "main",
    "footer",
    "main h1",
    "main h2",
    "main h3",
    "main p",
    "main a[href]",
    "main button",
    "main img",
    "main form",
    "main input",
    "main textarea",
    "main section",
    "main article",
  ];
}

async function collectElements(page: Page, selectors: string[]): Promise<ProbeElement[]> {
  const results: ProbeElement[] = [];

  for (const sel of selectors) {
    const handles = await page.$$(sel);
    const limited = handles.slice(0, limitForSelector(sel));

    for (let i = 0; i < limited.length; i++) {
      const h = limited[i];
      const box = await h.boundingBox();
      if (!box) continue;

      const data = await h.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent ?? "").trim().slice(0, 160);
        const href = (el as HTMLAnchorElement).href || undefined;
        const src =
          (el as HTMLImageElement).currentSrc ||
          (el as HTMLImageElement).src ||
          undefined;

        return {
          tag,
          text: text.length ? text : undefined,
          href,
          src,
          styles: {
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            lineHeight: cs.lineHeight,
            borderRadius: cs.borderRadius,
            boxShadow: cs.boxShadow,
            textAlign: cs.textAlign,
          },
        };
      });

      const selector = `${sel}:nth-of-type(${i + 1})`;
      results.push({
        selector,
        tag: data.tag,
        text: data.text,
        href: data.href,
        src: data.src,
        bbox: { x: box.x, y: box.y, w: box.width, h: box.height },
        styles: data.styles,
        meta: { visible: box.width > 0 && box.height > 0, area: box.width * box.height },
      });
    }
  }

  return results
    .sort((a, b) => b.meta.area - a.meta.area)
    .slice(0, 80);
}

function limitForSelector(sel: string) {
  if (sel.endsWith("h1")) return 1;
  if (sel.endsWith("h2")) return 3;
  if (sel.endsWith("h3")) return 4;
  if (sel.endsWith("p")) return 6;
  if (sel.endsWith("a[href]")) return 6;
  if (sel.endsWith("button")) return 4;
  if (sel.endsWith("img")) return 8;
  if (sel.endsWith("section") || sel.endsWith("article")) return 8;
  return 3;
}

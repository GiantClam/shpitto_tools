import type { Page } from "playwright";
import fs from "fs";
import path from "path";

function loadEnv() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "..", ".env"),
  ];
  const envPath = candidates.find((p) => fs.existsSync(p));
  if (!envPath) return;
  const content = fs.readFileSync(envPath, "utf-8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const [keyRaw, ...rest] = trimmed.split("=");
    const key = keyRaw.trim();
    const value = rest.join("=").trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  });
}

loadEnv();

export async function stabilizePage(page: Page) {
  const stabilizeTimeout = Number(
    process.env.VISUAL_QA_STABILIZE_TIMEOUT_MS ?? "120000"
  );
  const waitUntil =
    (process.env.VISUAL_QA_WAIT_UNTIL as "load" | "domcontentloaded" | "networkidle") ??
    "load";
  await dismissCookieBanner(page);
  await waitForSiteReady(page);
  await page.addStyleTag({
    content: `
      * {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
      video, iframe { visibility: hidden !important; }
      [id*="cookie"], [class*="cookie"], [class*="Cookie"],
      [id*="consent"], [class*="consent"], [class*="Consent"],
      [id*="gdpr"], [class*="gdpr"], [class*="GDPR"],
      [id*="onetrust"], [class*="onetrust"],
      [id*="intercom"], [class*="intercom"],
      [id*="drift"], [class*="drift"],
      [id*="chat"], [class*="chat"] { display: none !important; }
    `,
  });

  await page.evaluate(async () => {
    // @ts-ignore
    if (document.fonts && document.fonts.ready) {
      // @ts-ignore
      await document.fonts.ready;
    }
  });

  try {
    await page.waitForLoadState(waitUntil, { timeout: stabilizeTimeout });
  } catch {}
  await autoScroll(page);
  try {
    await page.waitForLoadState(waitUntil, { timeout: stabilizeTimeout });
  } catch {}
  await page.waitForTimeout(500);
}

async function dismissCookieBanner(page: Page) {
  try {
    const acceptRe = /accept all|accept|agree|allow|consent|同意|接受|允许|继续/i;
    await page
      .getByRole("button", {
        name: acceptRe,
      })
      .first()
      .click({ timeout: 3000 });

    // Some sites (like kymetacorp.com) put the consent dialog in an iframe.
    for (const frame of page.frames()) {
      try {
        await frame
          .getByRole("button", { name: acceptRe })
          .first()
          .click({ timeout: 1500 });
        break;
      } catch {
        // Try next frame.
      }
    }

    // Fallback for shadow DOM / non-semantic buttons.
    await page.evaluate(() => {
      const re = /accept all|accept|agree|allow|consent|同意|接受|允许|继续/i;
      const buttons = Array.from(document.querySelectorAll("button, [role='button'], a"));
      for (const el of buttons) {
        const text = (el.textContent || "").trim();
        if (re.test(text)) {
          (el as HTMLElement).click();
          break;
        }
      }
    });
  } catch {
    // Ignore if no cookie banner.
  }
}

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(300, Math.floor(window.innerHeight * 0.7));
    let lastHeight = 0;
    let stableRounds = 0;

    for (let round = 0; round < 6; round++) {
      const total = document.body.scrollHeight;
      for (let y = 0; y < total; y += step) {
        window.scrollTo(0, y);
        await sleep(220);
      }
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(600);

      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) {
        stableRounds += 1;
      } else {
        stableRounds = 0;
      }
      lastHeight = newHeight;
      if (stableRounds >= 2) break;
    }

    const images = Array.from(document.images || []);
    if (images.length) {
      await Promise.race([
        Promise.all(
          images.map((img) =>
            img.complete ? Promise.resolve() : new Promise((r) => img.addEventListener("load", r, { once: true }))
          )
        ),
        sleep(1500),
      ]);
    } else {
      await sleep(300);
    }
    window.scrollTo(0, 0);
  });
}

async function waitForSiteReady(page: Page) {
  const stabilizeTimeout = Number(
    process.env.VISUAL_QA_STABILIZE_TIMEOUT_MS ?? "120000"
  );
  const host = new URL(page.url()).hostname;
  if (host.includes("kymetacorp.com")) {
    try {
      await page.waitForSelector("main section", { timeout: stabilizeTimeout });
      await page.waitForSelector("footer", { timeout: stabilizeTimeout });
    } catch {}
  }
}

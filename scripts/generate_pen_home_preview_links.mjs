import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_OUT_DIR, ensureDir, readJson, titleCase, writeJson } from "./lib/pen-exact-template-utils.mjs";
import { buildPenHtmlDocument } from "./lib/pen-page-html-render.mjs";

const parseArgs = (argv) => {
  const options = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = "true";
      continue;
    }
    options[key] = next;
    index += 1;
  }
  return options;
};

const walkFiles = async (rootDir, visit) => {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(target, visit);
      continue;
    }
    await visit(target);
  }
};

const variantSortValue = (variant = "") => (variant === "desktop" ? 0 : variant === "mobile" ? 1 : 9);

const buildSandboxComponentCode = () => `export const config = {
  fields: {
    title: { type: "text" },
    docHtml: { type: "textarea" },
    viewportWidth: { type: "number" },
    viewportHeight: { type: "number" },
    variant: { type: "text" },
    siteName: { type: "text" }
  },
  defaultProps: {
    title: "Home Preview",
    viewportWidth: 420,
    viewportHeight: 1800,
    variant: "desktop",
    siteName: "Site"
  }
};

export default function ExactPenHomePreview(props) {
  const {
    title = "Home Preview",
    docHtml = "",
    viewportWidth = 420,
    viewportHeight = 1800,
    variant = "desktop"
  } = props || {};

  const bleedStyle = {
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    background: "#ffffff"
  };

  return (
    <section style={bleedStyle} data-block="ExactPenHomePreview" data-variant={variant}>
        <iframe
          title={title}
          srcDoc={docHtml}
          style={{
            display: "block",
            width: "100%",
            minWidth: String(Math.max(Number(viewportWidth), 320)) + "px",
            height: String(Math.max(Number(viewportHeight), 640)) + "px",
            border: "0",
            background: "#ffffff"
          }}
          sandbox="allow-same-origin allow-scripts"
        />
    </section>
  );
}`;

const toPageParam = (value = "/") => {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "/") return "home";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const main = async () => {
  const options = parseArgs(process.argv);
  const outDir = path.resolve(options["out-dir"] || DEFAULT_OUT_DIR);
  const visualDir = path.join(outDir, "visual-validation");
  const repoRoot = path.resolve(outDir, "..", "..", "..");
  const sandboxRoot = path.join(repoRoot, "asset-factory", "out", "p2w");
  const sandboxBaseUrl = String(options["sandbox-base-url"] || process.env.BUILDER_BASE_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const pageCatalogPath = path.join(outDir, "page-catalog.json");
  const pageCatalog = await readJson(pageCatalogPath);
  const templateCache = new Map();

  const reports = new Map();
  await walkFiles(visualDir, async (filePath) => {
    if (path.basename(filePath) !== "report.json") return;
    const report = await readJson(filePath);
    const key = `${report.siteId}::${report.variant}::${report.pageId}`;
    reports.set(key, report);
  });

  const homePages = pageCatalog
    .filter((page) => page && page.pageType === "home")
    .sort((left, right) => {
      const siteCompare = String(left.siteId || "").localeCompare(String(right.siteId || ""));
      if (siteCompare !== 0) return siteCompare;
      return variantSortValue(left.variant) - variantSortValue(right.variant);
    });

  const componentCode = buildSandboxComponentCode();

  const rows = [];
  for (const page of homePages) {
    const key = `${page.siteId}::${page.variant}::${page.pageId}`;
    const report = reports.get(key);
    if (!report) {
      throw new Error(`Missing visual report for home page ${key}`);
    }
    const htmlPath = String(report.templateHtmlPath || "").trim();
    const imagePath = String(report.renderedPath || "").trim();
    const diffPath = String(report.diffPath || "").trim();
    const reportPath = path.join(path.dirname(htmlPath), "report.json");
    const variantTemplatePath = path.join(outDir, page.output?.templatePath || "");
    if (!templateCache.has(variantTemplatePath)) {
      templateCache.set(variantTemplatePath, await readJson(variantTemplatePath));
    }
    const variantTemplate = templateCache.get(variantTemplatePath);
    const templatePage = Array.isArray(variantTemplate?.pages)
      ? variantTemplate.pages.find((entry) => String(entry?.pageId || "") === String(page.pageId || ""))
      : null;
    if (!templatePage?.rawPageNode) {
      throw new Error(`Missing rawPageNode for ${page.siteId} ${page.variant} ${page.pageId}`);
    }
    const viewportWidth =
      Number(templatePage.rawPageNode?.width || report.width || (page.variant === "mobile" ? 390 : 1440)) ||
      (page.variant === "mobile" ? 390 : 1440);
    const viewportHeight = Number(templatePage.rawPageNode?.height || report.height || 1800) || 1800;
    const templateHtml = await buildPenHtmlDocument(
      templatePage.rawPageNode,
      { width: viewportWidth, height: viewportHeight },
      Array.isArray(templatePage.assetRefs) ? templatePage.assetRefs : []
    );
    const sandboxSiteKey = `pen-exact-home-${page.siteId}-${page.variant}`;
    const sandboxPayload = {
      components: [
        {
          name: "ExactPenHomePreview",
          code: componentCode,
        },
      ],
      pages: [
        {
          path: "/",
          name: page.pageName,
          data: {
            content: [
              {
                type: "ExactPenHomePreview",
                props: {
                  id: `ExactPenHomePreview-${page.siteId}-${page.variant}`,
                  title: page.pageName,
                  docHtml: templateHtml,
                  viewportWidth,
                  viewportHeight,
                  variant: page.variant,
                },
              },
            ],
            root: {
              props: {
                title: page.pageName,
              },
            },
          },
        },
      ],
      theme: {
        mode: "light",
        motion: "off",
        fontHeading: "Inter",
        fontBody: "Inter",
        radius: "18px",
      },
    };
    const sandboxDir = path.join(sandboxRoot, sandboxSiteKey, "sandbox");
    await ensureDir(sandboxDir);
    const sandboxPayloadPath = path.join(sandboxDir, "payload.json");
    await fs.writeFile(sandboxPayloadPath, `${JSON.stringify(sandboxPayload, null, 2)}\n`, "utf8");

    rows.push({
      siteId: page.siteId,
      siteName: page.siteName || titleCase(page.siteId),
      variant: page.variant,
      pageId: page.pageId,
      pageName: page.pageName,
      similarity: Number(report.similarity || 0),
      templatePath: page.output?.templatePath || "",
      previewHtmlPath: htmlPath,
      previewImagePath: imagePath,
      diffImagePath: diffPath,
      reportPath,
      relativePreviewHtmlPath: path.relative(outDir, htmlPath),
      relativePreviewImagePath: path.relative(outDir, imagePath),
      relativeDiffImagePath: path.relative(outDir, diffPath),
      relativeReportPath: path.relative(outDir, reportPath),
      sandboxSiteKey,
      sandboxPayloadPath,
      relativeSandboxPayloadPath: path.relative(repoRoot, sandboxPayloadPath),
      sandboxPreviewUrl: `${sandboxBaseUrl}/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(
        sandboxSiteKey
      )}&page=${encodeURIComponent(toPageParam("/"))}`,
    });
  }

  const grouped = [];
  const bySite = new Map();
  for (const row of rows) {
    if (!bySite.has(row.siteId)) {
      bySite.set(row.siteId, {
        siteId: row.siteId,
        siteName: row.siteName,
        variants: [],
      });
    }
    bySite.get(row.siteId).variants.push(row);
  }
  for (const entry of Array.from(bySite.values()).sort((left, right) => left.siteId.localeCompare(right.siteId))) {
    entry.variants.sort((left, right) => variantSortValue(left.variant) - variantSortValue(right.variant));
    grouped.push(entry);
  }

  const jsonOutput = {
    schemaVersion: "pen-home-preview-links.v2",
    generatedAt: new Date().toISOString(),
    outDir,
    sandboxBaseUrl,
    sandboxRoot,
    totalSites: grouped.length,
    totalHomePages: rows.length,
    sites: grouped,
  };

  const markdownLines = [
    "# Pen Exact Template Home Sandbox Preview Links",
    "",
    `Generated at: ${jsonOutput.generatedAt}`,
    "",
    `Total sites: ${jsonOutput.totalSites}`,
    `Total home previews: ${jsonOutput.totalHomePages}`,
    `Sandbox base URL: ${jsonOutput.sandboxBaseUrl}`,
    "",
  ];

  for (const site of grouped) {
    markdownLines.push(`## ${site.siteName} \`${site.siteId}\``);
    markdownLines.push("");
    for (const variant of site.variants) {
      markdownLines.push(
        `- ${variant.variant}: [sandbox preview](${variant.sandboxPreviewUrl}) | [sandbox payload](${variant.sandboxPayloadPath}) | [preview image](${variant.previewImagePath}) | [report](${variant.reportPath})`
      );
    }
    markdownLines.push("");
  }

  const htmlCards = grouped
    .map((site) => {
      const cards = site.variants
        .map(
          (variant) => `
        <article class="variant-card">
          <a class="thumb-link" href="${variant.sandboxPreviewUrl}">
            <img src="${variant.relativePreviewImagePath}" alt="${site.siteName} ${variant.variant} home preview" loading="lazy" />
          </a>
          <div class="variant-meta">
            <h3>${variant.variant}</h3>
            <p>${variant.pageName}</p>
            <p class="score">similarity ${variant.similarity.toFixed(3)}</p>
            <div class="links">
              <a href="${variant.sandboxPreviewUrl}">Open Sandbox</a>
              <a href="${variant.relativeSandboxPayloadPath}">Payload</a>
              <a href="${variant.relativePreviewImagePath}">PNG</a>
              <a href="${variant.relativeReportPath}">Report</a>
            </div>
          </div>
        </article>`
        )
        .join("\n");
      return `
      <section class="site-card">
        <header>
          <h2>${site.siteName}</h2>
          <p>${site.siteId}</p>
        </header>
        <div class="variant-grid">
${cards}
        </div>
      </section>`;
    })
    .join("\n");

  const htmlOutput = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pen Home Sandbox Preview Links</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f1ea;
        --surface: rgba(255,255,255,0.82);
        --text: #161616;
        --muted: #55514a;
        --line: rgba(22,22,22,0.12);
        --shadow: 0 16px 40px rgba(22,22,22,0.08);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.75), transparent 34%),
          linear-gradient(180deg, #f8f5ef 0%, var(--bg) 100%);
        color: var(--text);
      }
      main {
        width: min(1400px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 40px 0 72px;
      }
      .hero { margin-bottom: 32px; }
      .hero h1 {
        margin: 0 0 8px;
        font-size: clamp(32px, 4vw, 54px);
        line-height: 0.95;
      }
      .hero p {
        margin: 0 0 6px;
        color: var(--muted);
        font-size: 16px;
      }
      .site-list {
        display: grid;
        gap: 24px;
      }
      .site-card {
        padding: 20px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--surface);
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow);
      }
      .site-card header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
      }
      .site-card h2 {
        margin: 0;
        font-size: 24px;
      }
      .site-card header p {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .variant-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
      }
      .variant-card {
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.72);
      }
      .thumb-link {
        display: block;
        background: #e9e4db;
      }
      .thumb-link img {
        display: block;
        width: 100%;
        height: auto;
      }
      .variant-meta {
        padding: 14px 14px 16px;
      }
      .variant-meta h3 {
        margin: 0 0 4px;
        font-size: 16px;
        text-transform: capitalize;
      }
      .variant-meta p {
        margin: 0 0 6px;
        color: var(--muted);
        font-size: 13px;
      }
      .variant-meta .score {
        color: var(--text);
        font-weight: 600;
      }
      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 12px;
      }
      .links a {
        color: var(--text);
        text-decoration: none;
        border-bottom: 1px solid currentColor;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>Pen Exact Template Home Sandbox Previews</h1>
        <p>${jsonOutput.totalSites} sites, ${jsonOutput.totalHomePages} home pages.</p>
        <p>Each link opens the builder sandbox preview route backed by a generated local payload.</p>
      </section>
      <section class="site-list">
${htmlCards}
      </section>
    </main>
  </body>
</html>
`;

  await ensureDir(outDir);
  await writeJson(path.join(outDir, "home-preview-links.json"), jsonOutput);
  await fs.writeFile(path.join(outDir, "home-preview-links.md"), `${markdownLines.join("\n")}\n`, "utf8");
  await fs.writeFile(path.join(outDir, "home-preview-gallery.html"), htmlOutput, "utf8");

  console.log(
    JSON.stringify(
      {
        outDir,
        sandboxBaseUrl,
        sandboxRoot,
        totalSites: jsonOutput.totalSites,
        totalHomePages: jsonOutput.totalHomePages,
        jsonPath: path.join(outDir, "home-preview-links.json"),
        markdownPath: path.join(outDir, "home-preview-links.md"),
        galleryPath: path.join(outDir, "home-preview-gallery.html"),
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});

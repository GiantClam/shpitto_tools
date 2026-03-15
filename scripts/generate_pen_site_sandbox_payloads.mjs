import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_OUT_DIR, ensureDir, readJson, writeJson } from "./lib/pen-exact-template-utils.mjs";
import { buildPenHtmlDocument } from "./lib/pen-page-html-render.mjs";
import {
  buildPageEntries,
  buildInteractionEnhancements,
  collectLinkNodes,
  collectNodeIds,
  createHrefResolver,
  resolveVariantTemplatePath,
} from "./lib/pen-site-sandbox-utils.mjs";

const parseArgs = (argv) => {
  const options = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (!next || next.startsWith("--")) {
      options[key] = "true";
      continue;
    }
    options[key] = next;
    index += 1;
  }
  return options;
};

const buildSandboxComponentCode = () => `import { motion } from "framer-motion";
import { Particles } from "@/components/magic-exports";

export const config = {
  fields: {
    title: { type: "text" },
    docHtml: { type: "textarea" },
    viewportWidth: { type: "number" },
    viewportHeight: { type: "number" },
    variant: { type: "text" }
  },
  defaultProps: {
    title: "Page Preview",
    viewportWidth: 1440,
    viewportHeight: 1800,
    variant: "desktop"
  }
};

export default function ExactPenPagePreview(props) {
  const {
    title = "Page Preview",
    docHtml = "",
    viewportWidth = 1440,
    viewportHeight = 1800,
    variant = "desktop"
  } = props || {};

  return (
    <Particles density={96} color="rgba(148, 163, 184, 0.16)" className="w-screen -ml-[calc(50vw-50%)] -mr-[calc(50vw-50%)] bg-white">
      <motion.section
        data-block="ExactPenPagePreview"
        data-variant={variant}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", background: "#fff" }}
      >
        <iframe
          data-pen-preview-frame="true"
          title={title}
          srcDoc={docHtml}
          style={{
            display: "block",
            width: "100%",
            minWidth: String(Math.max(Number(viewportWidth), 320)) + "px",
            height: String(Math.max(Number(viewportHeight), 800)) + "px",
            border: "0",
            background: "#ffffff"
          }}
          sandbox="allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
        />
      </motion.section>
    </Particles>
  );
}`;

const main = async () => {
  const options = parseArgs(process.argv);
  const outDir = path.resolve(options["out-dir"] || DEFAULT_OUT_DIR);
  const skinOutDir = path.resolve(options["skin-out-dir"] || path.join(path.dirname(outDir), "pen-skinnable-templates"));
  const repoRoot = path.resolve(outDir, "..", "..", "..");
  const sandboxRoot = path.join(repoRoot, "asset-factory", "out", "p2w");
  const sandboxBaseUrl = String(options["sandbox-base-url"] || process.env.BUILDER_BASE_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
  const manifest = await readJson(path.join(outDir, "manifest.json"));
  const pageCatalog = await readJson(path.join(outDir, "page-catalog.json"));
  const pageCatalogMap = new Map(
    pageCatalog.map((page) => [`${page.siteId}::${page.variant}::${page.pageId}`, page])
  );

  const componentCode = buildSandboxComponentCode();
  const variantOutputs = [];

  for (const entry of manifest.entries || []) {
    const variantTemplatePath = resolveVariantTemplatePath(outDir, entry.siteId, entry.variant);
    const variantTemplate = await readJson(variantTemplatePath);
    const skinnableTemplate = await readJson(
      path.join(skinOutDir, "sites", entry.siteId, "variants", entry.variant, "template.skin.json")
    );
    const skinnablePageMap = new Map(
      (skinnableTemplate.pages || []).map((page) => [String(page.pageId || ""), page])
    );
    const pageEntries = buildPageEntries(variantTemplate.pages || []);
    const sandboxSiteKey = `pen-exact-site-${entry.siteId}-${entry.variant}`;
    const payloadPages = [];
    const pageAudit = [];

    for (const pageEntry of pageEntries) {
      const page = pageEntry.page;
      const currentNodeIds = collectNodeIds(page.rawPageNode, new Set());
      for (const section of page.sections || []) {
        if (section?.sectionId) currentNodeIds.add(String(section.sectionId));
      }
      const { resolveHref, stats } = createHrefResolver({
        siteKey: sandboxSiteKey,
        pageEntries,
        currentPageId: page.pageId,
        currentNodeIds,
      });
      const interactionEnhancements = buildInteractionEnhancements({
        siteId: entry.siteId,
        siteName: entry.siteName,
        siteKey: sandboxSiteKey,
        page,
        pageEntries,
      });
      const viewportWidth = Number(page.rawPageNode?.width || (entry.variant === "mobile" ? 390 : 1440)) || (entry.variant === "mobile" ? 390 : 1440);
      const viewportHeight = Number(page.rawPageNode?.height || 1800) || 1800;
      const docHtml = await buildPenHtmlDocument(
        page.rawPageNode,
        { width: viewportWidth, height: viewportHeight },
        Array.isArray(page.assetRefs) ? page.assetRefs : [],
        {
          hrefTransform: resolveHref,
          linkTarget: "_top",
          extraHeadHtml: '<base target="_top" />',
          interactionEnhancements: interactionEnhancements.enhancements,
          motionMode: "subtle",
          sectionKindsById: Object.fromEntries(
            (page.sections || []).map((section) => [String(section.sectionId || ""), String(section.sectionKind || "story")])
          ),
        }
      );

      payloadPages.push({
        path: pageEntry.pagePath,
        name: page.pageName,
        skinnable: skinnablePageMap.get(String(page.pageId || "")) || null,
        data: {
          content: [
            {
              type: "ExactPenPagePreview",
              props: {
                id: `ExactPenPagePreview-${entry.siteId}-${entry.variant}-${page.pageId}`,
                title: page.pageName,
                docHtml,
                viewportWidth,
                viewportHeight,
                variant: entry.variant,
              },
            },
          ],
          root: { props: { title: page.pageName } },
        },
      });

      const pageCatalogRow = pageCatalogMap.get(`${entry.siteId}::${entry.variant}::${page.pageId}`);
      const navSections = (page.sections || []).filter((section) => section?.sectionKind === "navigation");
      const footerSections = (page.sections || []).filter((section) => section?.sectionKind === "footer");
      const navLinks = navSections.flatMap((section) => collectLinkNodes(section.rawSectionNode, []));
      const footerLinks = footerSections.flatMap((section) => collectLinkNodes(section.rawSectionNode, []));

      pageAudit.push({
        siteId: entry.siteId,
        variant: entry.variant,
        pageId: page.pageId,
        pageName: page.pageName,
        pagePath: pageEntry.pagePath,
        pageType: page.pageType,
        viewportWidth,
        viewportHeight,
        navSectionCount: navSections.length,
        footerSectionCount: footerSections.length,
        navLinkCount: navLinks.length,
        footerLinkCount: footerLinks.length,
        rewrittenLinkStats: stats,
        inferredInteractionStats: interactionEnhancements.stats,
        interactionCoverage: interactionEnhancements.coverage,
        previewUrl: `${sandboxBaseUrl}/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(
          sandboxSiteKey
        )}&page=${encodeURIComponent(pageEntry.pageParam)}`,
        pageCatalog: pageCatalogRow || null,
      });
    }

    const payload = {
      components: [{ name: "ExactPenPagePreview", code: componentCode }],
      pages: payloadPages,
      theme: {
        mode: "light",
        motion: "subtle",
        fontHeading: "Inter",
        fontBody: "Inter",
        radius: "0px",
      },
    };
    const sandboxDir = path.join(sandboxRoot, sandboxSiteKey, "sandbox");
    await ensureDir(sandboxDir);
    const payloadPath = path.join(sandboxDir, "payload.json");
    await fs.writeFile(payloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    variantOutputs.push({
      siteId: entry.siteId,
      siteName: entry.siteName,
      variant: entry.variant,
      sandboxSiteKey,
      payloadPath,
      pageCount: payloadPages.length,
      pages: pageAudit,
    });
  }

  const output = {
    schemaVersion: "pen-site-sandbox-payloads.v1",
    generatedAt: new Date().toISOString(),
    outDir,
    sandboxRoot,
    sandboxBaseUrl,
    variantCount: variantOutputs.length,
    variants: variantOutputs,
  };
  await writeJson(path.join(outDir, "site-sandbox-payloads.json"), output);

  console.log(
    JSON.stringify(
      {
        outDir,
        skinOutDir,
        sandboxRoot,
        sandboxBaseUrl,
        variantCount: output.variantCount,
        pageCount: variantOutputs.reduce((sum, variant) => sum + Number(variant.pageCount || 0), 0),
        outputPath: path.join(outDir, "site-sandbox-payloads.json"),
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

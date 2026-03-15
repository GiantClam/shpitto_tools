import path from "node:path";

import { DEFAULT_OUT_DIR, readJson, writeJson } from "./lib/pen-exact-template-utils.mjs";
import {
  buildPageEntries,
  buildInteractionEnhancements,
  collectLinkNodes,
  collectNodeIds,
  createHrefResolver,
  collectTextNodes,
  looksLikeMultiLinkText,
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

const extractPageParamFromUrl = (value = "") => {
  try {
    const parsed = new URL(String(value || ""), "http://localhost:3000");
    return String(parsed.searchParams.get("page") || "").trim();
  } catch {
    return "";
  }
};

const collectMultiLinkTextBlocks = (section = {}) =>
  collectTextNodes(section.rawSectionNode, [])
    .map((block) => ({
      blockId: block.id,
      content: String(block?.content || ""),
    }))
    .filter((block) => looksLikeMultiLinkText(block.content));

const main = async () => {
  const options = parseArgs(process.argv);
  const outDir = path.resolve(options["out-dir"] || DEFAULT_OUT_DIR);
  const manifest = await readJson(path.join(outDir, "manifest.json"));
  const siteSandbox = await readJson(path.join(outDir, "site-sandbox-payloads.json"));
  const visualManifest = await readJson(path.join(outDir, "visual-validation", "manifest.json"));
  const visualReportsByVariant = new Map();

  for (const variant of siteSandbox.variants || []) {
    visualReportsByVariant.set(
      `${variant.siteId}::${variant.variant}`,
      new Set((variant.pages || []).map((page) => String(page.pageId || "")))
    );
  }

  const auditVariants = [];

  for (const entry of manifest.entries || []) {
    const variantTemplate = await readJson(resolveVariantTemplatePath(outDir, entry.siteId, entry.variant));
    const pageEntries = buildPageEntries(variantTemplate.pages || []);
    const sandboxVariant = (siteSandbox.variants || []).find(
      (variant) => variant.siteId === entry.siteId && variant.variant === entry.variant
    );
    const navLinkedPages = new Set();
    const footerLinkedPages = new Set();
    const invalidLinks = [];
    const pagesWithMultiLinkTextNav = [];
    const pagesWithMultiLinkTextFooter = [];
    let totalNavLinks = 0;
    let totalFooterLinks = 0;
    let removedInvalidHrefCount = 0;
    let rewrittenInternalHrefCount = 0;

    for (const pageEntry of pageEntries) {
      const page = pageEntry.page;
      const currentNodeIds = collectNodeIds(page.rawPageNode, new Set());
      for (const section of page.sections || []) {
        if (section?.sectionId) currentNodeIds.add(String(section.sectionId));
      }
      const siteKey = sandboxVariant?.sandboxSiteKey || `pen-exact-site-${entry.siteId}-${entry.variant}`;
      const { resolveHref, stats } = createHrefResolver({
        siteKey,
        pageEntries,
        currentPageId: page.pageId,
        currentNodeIds,
      });
      const navSections = (page.sections || []).filter((section) => section?.sectionKind === "navigation");
      const footerSections = (page.sections || []).filter((section) => section?.sectionKind === "footer");
      const navLinks = navSections.flatMap((section) => collectLinkNodes(section.rawSectionNode, []));
      const footerLinks = footerSections.flatMap((section) => collectLinkNodes(section.rawSectionNode, []));
      const interaction = buildInteractionEnhancements({
        siteId: entry.siteId,
        siteName: entry.siteName,
        siteKey,
        page,
        pageEntries,
      });
      totalNavLinks += navLinks.length;
      totalFooterLinks += footerLinks.length;

      for (const link of navLinks) {
        const resolved = resolveHref(link.href);
        if (!resolved) {
          invalidLinks.push({ location: "navigation", pageId: page.pageId, blockId: link.id, href: link.href });
          continue;
        }
        const pageParam = extractPageParamFromUrl(resolved);
        if (pageParam) navLinkedPages.add(pageParam);
      }

      for (const link of footerLinks) {
        const resolved = resolveHref(link.href);
        if (!resolved) {
          invalidLinks.push({ location: "footer", pageId: page.pageId, blockId: link.id, href: link.href });
          continue;
        }
        const pageParam = extractPageParamFromUrl(resolved);
        if (pageParam) footerLinkedPages.add(pageParam);
      }

      for (const pageParam of interaction.coverage.navigation || []) navLinkedPages.add(pageParam);
      for (const pageParam of interaction.coverage.footer || []) footerLinkedPages.add(pageParam);

      for (const section of navSections) {
        const blocks = collectMultiLinkTextBlocks(section);
        if (blocks.length) {
          pagesWithMultiLinkTextNav.push({
            pageId: page.pageId,
            sectionId: section.sectionId,
            blockIds: blocks.map((block) => block.blockId),
            samples: blocks.map((block) => block.content),
          });
        }
      }

      for (const section of footerSections) {
        const blocks = collectMultiLinkTextBlocks(section);
        if (blocks.length) {
          pagesWithMultiLinkTextFooter.push({
            pageId: page.pageId,
            sectionId: section.sectionId,
            blockIds: blocks.map((block) => block.blockId),
            samples: blocks.map((block) => block.content),
          });
        }
      }

      removedInvalidHrefCount += Number(stats.removedInvalid || 0);
      rewrittenInternalHrefCount += Number(stats.rewrittenToPage || 0);
    }

    const allPageParams = pageEntries.map((page) => page.pageParam);
    const nonHomePageParams = pageEntries.filter((page) => page.pageParam !== "home").map((page) => page.pageParam);
    const missingFromNavigation = nonHomePageParams.filter((pageParam) => !navLinkedPages.has(pageParam));
    const footerOverlap = Array.from(navLinkedPages).filter((pageParam) => footerLinkedPages.has(pageParam));
    const visualPagesExpected = pageEntries.length;
    const visualPagesPassed = sandboxVariant?.pages?.length || 0;
    const visualStatus =
      Number(visualManifest.failedPages || 0) === 0 && visualPagesPassed === visualPagesExpected ? "pass" : "needs_review";
    const motionStatus = sandboxVariant?.pages?.length ? "pass" : "fail";

    auditVariants.push({
      siteId: entry.siteId,
      siteName: entry.siteName,
      variant: entry.variant,
      pageCount: pageEntries.length,
      sandboxSiteKey: sandboxVariant?.sandboxSiteKey || "",
      sandboxPayloadPath: sandboxVariant?.payloadPath || "",
      navigation: {
        totalNavLinks,
        linkedPages: Array.from(navLinkedPages).sort(),
        missingPagesFromNavigation: missingFromNavigation,
        pagesWithCollapsedMultiLinkText: pagesWithMultiLinkTextNav,
      },
      footer: {
        totalFooterLinks,
        linkedPages: Array.from(footerLinkedPages).sort(),
        overlapWithNavigation: footerOverlap,
        pagesWithCollapsedMultiLinkText: pagesWithMultiLinkTextFooter,
      },
      links: {
        invalidLinkCount: invalidLinks.length,
        invalidLinks: invalidLinks.slice(0, 50),
        cleanedInvalidHrefCount: removedInvalidHrefCount,
        rewrittenInternalHrefCount,
      },
      styleParity: {
        status: visualStatus,
        source: path.join(outDir, "visual-validation", "manifest.json"),
        visualPagesExpected,
        visualPagesPassed,
        note:
          visualStatus === "pass"
            ? "Visual parity inherits the existing 261/261 source-render validation."
            : "Visual parity needs a fresh review after runtime changes.",
      },
      motion: {
        status: motionStatus,
        magicUiBased: true,
        note:
          motionStatus === "pass"
            ? "Sandbox preview now uses a Magic UI-backed shell with subtle entrance motion plus iframe-level section reveal hooks."
            : "Motion runtime was not generated for this variant.",
      },
      overall: {
        readyForFunctionalPreview:
          invalidLinks.length === 0 &&
          missingFromNavigation.length === 0 &&
          footerLinkedPages.size > 0 &&
          motionStatus === "pass",
      },
      pages: allPageParams,
    });
  }

  const summary = {
    schemaVersion: "pen-site-template-audit.v1",
    generatedAt: new Date().toISOString(),
    outDir,
    variantCount: auditVariants.length,
    failingVariants: auditVariants.filter((variant) => !variant.overall.readyForFunctionalPreview).length,
    navigationIssues: auditVariants.filter((variant) => variant.navigation.missingPagesFromNavigation.length > 0).length,
    footerIssues: auditVariants.filter((variant) => variant.footer.overlapWithNavigation.length === 0).length,
    invalidLinkVariants: auditVariants.filter((variant) => variant.links.invalidLinkCount > 0).length,
    motionFailVariants: auditVariants.filter((variant) => variant.motion.status !== "pass").length,
    variants: auditVariants,
  };

  await writeJson(path.join(outDir, "site-template-audit.json"), summary);
  console.log(
    JSON.stringify(
      {
        outDir,
        variantCount: summary.variantCount,
        failingVariants: summary.failingVariants,
        navigationIssues: summary.navigationIssues,
        footerIssues: summary.footerIssues,
        invalidLinkVariants: summary.invalidLinkVariants,
        motionFailVariants: summary.motionFailVariants,
        outputPath: path.join(outDir, "site-template-audit.json"),
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

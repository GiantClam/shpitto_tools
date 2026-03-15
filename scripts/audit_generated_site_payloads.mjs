import fs from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const P2W_ROOT = path.join(REPO_ROOT, "asset-factory", "out", "p2w");
const REPORT_PATH = path.join(REPO_ROOT, "asset-factory", "out", "site-payload-audit.json");

const walkPayloads = async (dir, hits = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkPayloads(fullPath, hits);
      continue;
    }
    if (entry.isFile() && fullPath.endsWith(`${path.sep}sandbox${path.sep}payload.json`)) {
      hits.push(fullPath);
    }
  }
  return hits;
};

const isExactPreviewPayload = (siteKey) =>
  siteKey.startsWith("pen-exact-site-") || siteKey.startsWith("pen-exact-home-");

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

const toBlockShape = (page) =>
  (Array.isArray(page?.data?.content) ? page.data.content : [])
    .map((block) => String(block?.type || "").trim())
    .filter(Boolean)
    .join(">");

const toRole = (type) => {
  if (!type) return "other";
  if (/FloatingWhatsApp|Atomic/i.test(type)) return "utility";
  if (/Navbar|Nav/i.test(type)) return "nav";
  if (/Footer/i.test(type)) return "footer";
  if (/Hero|IntroBand/i.test(type)) return "hero";
  if (/Contact|LeadCapture/i.test(type)) return "contact";
  if (/Cta|CTA|QuoteBand/i.test(type)) return "cta";
  if (/CaseStudies|Projects|Cases/i.test(type)) return "cases";
  if (/Testimonials|LogoCloud|Certification|Proof/i.test(type)) return "proof";
  if (/FeatureGrid|FeatureWithMedia|Capability|Metrics|Ops|ControlPanel|Comparison|FAQ/i.test(type)) return "features";
  if (/CardsGrid|Catalog|Product|ContentStory|Showcase|Pricing/i.test(type)) return "content";
  return "other";
};

const lcsLength = (left, right) => {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      dp[row][col] =
        left[row - 1] === right[col - 1]
          ? dp[row - 1][col - 1] + 1
          : Math.max(dp[row - 1][col], dp[row][col - 1]);
    }
  }
  return dp[left.length][right.length];
};

const sequenceSimilarity = (left, right) => {
  if (!left.length && !right.length) return 1;
  if (!left.length || !right.length) return 0;
  return (2 * lcsLength(left, right)) / (left.length + right.length);
};

const buildAudit = async () => {
  const payloadPaths = await walkPayloads(P2W_ROOT);
  const generated = [];
  const exactPreview = [];

  for (const payloadPath of payloadPaths) {
    const siteKey = payloadPath.split(`${path.sep}asset-factory${path.sep}out${path.sep}p2w${path.sep}`)[1]?.split(
      `${path.sep}sandbox${path.sep}payload.json`
    )[0];
    if (!siteKey) continue;
    const payload = await readJson(payloadPath);
    const pages = Array.isArray(payload?.pages) ? payload.pages : [];
    const pageShapes = pages.map((page) => ({
      path: page.path,
      name: page.name,
      shape: toBlockShape(page),
      blockTypes: (Array.isArray(page?.data?.content) ? page.data.content : []).map((block) =>
        String(block?.type || "").trim()
      ),
    })).map((page) => ({
      ...page,
      roles: page.blockTypes.map((type) => toRole(type)).filter((role) => !["nav", "footer", "utility"].includes(role)),
    })).map((page) => ({
      ...page,
      roleShape: page.roles.join(">"),
    }));

    if (isExactPreviewPayload(siteKey)) {
      exactPreview.push({
        siteKey,
        pageCount: pages.length,
        wrapperType: [...new Set(pageShapes.map((item) => item.shape))],
      });
      continue;
    }

    const usesCreationFallbackSection = pageShapes.some((page) => page.blockTypes.includes("CreationFallbackSection"));
    const sameAsHomeCount =
      pageShapes.length > 1 ? pageShapes.filter((page) => page.shape === pageShapes[0]?.shape).length : 0;
    const highTemplateReuse = pageShapes.length > 2 && sameAsHomeCount / pageShapes.length >= 0.8;
    const sameRoleShapeCount =
      pageShapes.length > 1 ? pageShapes.filter((page) => page.roleShape === pageShapes[0]?.roleShape).length : 0;
    const similarities = pageShapes.map((page) => sequenceSimilarity(pageShapes[0]?.roles || [], page.roles || []));
    const highlySimilarPageCount = similarities.filter((value) => value >= 0.9).length;
    const highStructuralSimilarity =
      pageShapes.length > 2 &&
      sameRoleShapeCount / pageShapes.length >= 0.8 &&
      highlySimilarPageCount / pageShapes.length >= 0.8;

    generated.push({
      siteKey,
      pageCount: pages.length,
      usesCreationFallbackSection,
      highTemplateReuse,
      highStructuralSimilarity,
      sameAsHomeCount,
      sameRoleShapeCount,
      averageRoleSimilarity:
        similarities.reduce((sum, value) => sum + value, 0) / Math.max(similarities.length, 1),
      highlySimilarPageCount,
      pageShapes,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    payloadCount: payloadPaths.length,
    exactPreviewCount: exactPreview.length,
    generatedSiteCount: generated.length,
    generatedProblemCount: generated.filter(
      (item) => item.usesCreationFallbackSection || item.highTemplateReuse || item.highStructuralSimilarity
    ).length,
    generatedProblems: generated.filter(
      (item) => item.usesCreationFallbackSection || item.highTemplateReuse || item.highStructuralSimilarity
    ),
    exactPreview,
  };
};

const main = async () => {
  const report = await buildAudit();
  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
};

await main();

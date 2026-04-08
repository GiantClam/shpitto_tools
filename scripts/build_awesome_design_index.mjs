#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

const REPO = "VoltAgent/awesome-design-md";
const README_URL = "https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/README.md";
const TREE_API_URL = `https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`;

function toSlugFromTreePath(treePath) {
  const parts = treePath.split("/");
  if (parts.length < 3) return null;
  if (parts[0] !== "design-md") return null;
  return parts[1];
}

function toSlugFromRepoUrl(url) {
  const marker = "/tree/main/design-md/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  const rest = url.slice(idx + marker.length);
  const slug = rest.split("/")[0];
  return slug || null;
}

function parseReadmeCollection(readme) {
  const lines = readme.split(/\r?\n/);
  const items = [];
  let currentCategory = "Uncategorized";

  for (const line of lines) {
    const categoryMatch = line.match(/^###\s+(.+)$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      continue;
    }

    const itemMatch = line.match(/^- \[\*\*(.+?)\*\*\]\((https:\/\/github\.com\/VoltAgent\/awesome-design-md\/tree\/main\/design-md\/.+?)\) - (.+)$/);
    if (!itemMatch) continue;

    const name = itemMatch[1].trim();
    const url = itemMatch[2].trim();
    const description = itemMatch[3].trim();
    const slug = toSlugFromRepoUrl(url);
    if (!slug) continue;

    items.push({
      name,
      slug,
      category: currentCategory,
      description,
      sourceUrl: url,
    });
  }

  return items;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "shpitto-tools-awesome-design-indexer",
      "Accept": "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch JSON ${url}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "shpitto-tools-awesome-design-indexer",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch text ${url}: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

function buildMarkdownIndex(indexData) {
  const { generatedAt, totalStyles, categories } = indexData;
  const lines = [];

  lines.push("# Awesome Design MD Index");
  lines.push("");
  lines.push(`- Generated at: ${generatedAt}`);
  lines.push(`- Total styles: ${totalStyles}`);
  lines.push("");
  lines.push("## Categories");
  lines.push("");

  for (const category of categories) {
    lines.push(`- ${category.name} (${category.styles.length})`);
  }

  lines.push("");

  for (const category of categories) {
    lines.push(`## ${category.name}`);
    lines.push("");
    for (const style of category.styles) {
      lines.push(`- **${style.name}** (${style.slug})`);
      lines.push(`  - ${style.description}`);
      lines.push(`  - DESIGN.md: https://raw.githubusercontent.com/${REPO}/main/design-md/${style.slug}/DESIGN.md`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function toCategoryFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "uncategorized";
}

async function main() {
  const cwd = process.cwd();
  const outputDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(cwd, ".cache", "awesome-design-md");

  const categoriesDir = path.join(outputDir, "categories");

  await fs.mkdir(categoriesDir, { recursive: true });

  const [readme, tree] = await Promise.all([
    fetchText(README_URL),
    fetchJson(TREE_API_URL),
  ]);

  const readmeItems = parseReadmeCollection(readme);

  const treeDesignEntries = (tree.tree || [])
    .filter((entry) => entry.type === "blob")
    .filter((entry) => entry.path.startsWith("design-md/"))
    .filter((entry) => entry.path.endsWith("/DESIGN.md"));

  const treeSlugSet = new Set(
    treeDesignEntries
      .map((entry) => toSlugFromTreePath(entry.path))
      .filter(Boolean)
  );

  const merged = new Map();

  for (const item of readmeItems) {
    merged.set(item.slug, {
      name: item.name,
      slug: item.slug,
      category: item.category,
      description: item.description,
      sourceUrl: item.sourceUrl,
      designMdUrl: `https://raw.githubusercontent.com/${REPO}/main/design-md/${item.slug}/DESIGN.md`,
      previewUrl: `https://github.com/${REPO}/tree/main/design-md/${item.slug}`,
    });
  }

  for (const slug of treeSlugSet) {
    if (merged.has(slug)) continue;
    merged.set(slug, {
      name: slug,
      slug,
      category: "Uncategorized",
      description: "Auto-discovered from repository tree.",
      sourceUrl: `https://github.com/${REPO}/tree/main/design-md/${slug}`,
      designMdUrl: `https://raw.githubusercontent.com/${REPO}/main/design-md/${slug}/DESIGN.md`,
      previewUrl: `https://github.com/${REPO}/tree/main/design-md/${slug}`,
    });
  }

  const styles = Array.from(merged.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "en")
  );

  const categoryMap = new Map();
  for (const style of styles) {
    if (!categoryMap.has(style.category)) categoryMap.set(style.category, []);
    categoryMap.get(style.category).push(style);
  }

  const categories = Array.from(categoryMap.entries())
    .map(([name, categoryStyles]) => ({
      name,
      styles: categoryStyles.sort((a, b) => a.name.localeCompare(b.name, "en")),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const indexData = {
    sourceRepo: `https://github.com/${REPO}`,
    generatedAt: new Date().toISOString(),
    totalStyles: styles.length,
    categories,
    styles,
  };

  await fs.writeFile(
    path.join(outputDir, "README.source.snapshot.md"),
    readme,
    "utf8"
  );

  await fs.writeFile(
    path.join(outputDir, "index.json"),
    `${JSON.stringify(indexData, null, 2)}\n`,
    "utf8"
  );

  await fs.writeFile(
    path.join(outputDir, "index.md"),
    buildMarkdownIndex(indexData),
    "utf8"
  );

  for (const category of categories) {
    const fileName = `${toCategoryFilename(category.name)}.md`;
    const lines = [];
    lines.push(`# ${category.name}`);
    lines.push("");
    lines.push(`- Style count: ${category.styles.length}`);
    lines.push("");
    for (const style of category.styles) {
      lines.push(`- **${style.name}** (${style.slug})`);
      lines.push(`  - ${style.description}`);
      lines.push(`  - ${style.designMdUrl}`);
    }
    lines.push("");

    await fs.writeFile(path.join(categoriesDir, fileName), `${lines.join("\n")}\n`, "utf8");
  }

  const summary = {
    outputDir,
    totalStyles: styles.length,
    categoryCount: categories.length,
    files: {
      indexJson: path.join(outputDir, "index.json"),
      indexMd: path.join(outputDir, "index.md"),
      categoriesDir,
      readmeSnapshot: path.join(outputDir, "README.source.snapshot.md"),
    },
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`[build_awesome_design_index] ${error.stack || error.message}\n`);
  process.exit(1);
});

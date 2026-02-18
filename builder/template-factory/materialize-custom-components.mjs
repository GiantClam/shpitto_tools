/**
 * materialize-custom-components.mjs
 *
 * Converts JIT components from payload.json into static .tsx files
 * registered in puck/config.ts. This bridges the gap between:
 *   - Development: compileJIT (runtime, @babel/standalone, 5.5MB)
 *   - Production: static .tsx files (build-time, SSR/SSG, Cloudflare Pages)
 *
 * Usage:
 *   node template-factory/materialize-custom-components.mjs --payload <path> [--site-id <id>]
 *   node template-factory/materialize-custom-components.mjs --run-dir <path>
 *
 * What it does:
 *   1. Reads components[].code from payload.json (or all payloads in a run dir)
 *   2. Normalizes each component (adds "use client", fixes imports, adds types)
 *   3. Writes to src/components/blocks/{kebab-name}/block.tsx
 *   4. Extracts Puck field definitions from props
 *   5. Appends registration to src/puck/config.generated.ts
 *   6. Outputs a manifest of materialized components
 */

import { promises as fs } from "fs";
import path from "path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, "..");

const resolveBuilderRoot = (root = "") => {
  const candidate = root ? path.resolve(root) : path.resolve(process.cwd());
  if (candidate.endsWith(`${path.sep}builder`)) return candidate;
  if (path.basename(candidate) === "builder") return candidate;
  return DEFAULT_ROOT;
};

const rootPaths = (root = "") => {
  const builderRoot = resolveBuilderRoot(root);
  return {
    root: builderRoot,
    blocksDir: path.join(builderRoot, "src", "components", "blocks"),
    generatedConfigPath: path.join(builderRoot, "src", "puck", "config.generated.ts"),
  };
};

const toKebab = (str) =>
  String(str || "")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const toPascal = (str) =>
  String(str || "")
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (_, c) => c.toUpperCase());

const toIdentifier = (value, fallback = "GeneratedBlock") => {
  const normalized = String(value || "")
    .replace(/[^a-zA-Z0-9_$]+/g, "_")
    .replace(/^[^a-zA-Z_$]+/, "");
  return normalized || fallback;
};

const codeSignature = (code) =>
  crypto.createHash("sha1").update(String(code || "").trim(), "utf8").digest("hex");

const resolveComponentIdentity = (name, code, registry = new Map()) => {
  const baseName = toIdentifier(name, "GeneratedBlock");
  const signature = codeSignature(code);
  const existing = registry.get(baseName);
  if (!existing) {
    registry.set(baseName, [{ signature, resolvedName: baseName }]);
    return { resolvedName: baseName, duplicate: false, signature };
  }
  const sameCode = existing.find((item) => item.signature === signature);
  if (sameCode) {
    return { resolvedName: sameCode.resolvedName, duplicate: true, signature };
  }

  let resolvedName = `${baseName}_${signature.slice(0, 8)}`;
  let nonce = 2;
  while (registry.has(resolvedName)) {
    resolvedName = `${baseName}_${signature.slice(0, 6)}_${nonce}`;
    nonce += 1;
  }
  registry.set(resolvedName, [{ signature, resolvedName }]);
  existing.push({ signature, resolvedName });
  return { resolvedName, duplicate: false, signature, collisionFrom: baseName };
};

/**
 * Detect editable props from component code by analyzing the destructured props.
 * Returns { fieldName: fieldType } map.
 */
const detectPropsFromCode = (code) => {
  const fields = {};

  // Match destructured props: ({ title, subtitle, items = [], ... })
  const propsMatch = code.match(/\(\s*\{([^}]{1,2000})\}\s*(?::\s*\w+)?\s*\)/);
  if (!propsMatch) return fields;

  const propsStr = propsMatch[1];
  const propNames = propsStr
    .split(",")
    .map((p) => p.trim().split(/[=:]/)[0].trim())
    .filter((p) => p && !p.startsWith("...") && p !== "id" && p !== "anchor" && p !== "__v");

  for (const prop of propNames) {
    // Guess field type from name
    if (/^(title|label|name|logo|logoText|eyebrow|badge|tag)$/i.test(prop)) {
      fields[prop] = "text";
    } else if (/^(subtitle|description|body|quote|legal|text)$/i.test(prop)) {
      fields[prop] = "textarea";
    } else if (/^(src|href|imageSrc|heroImageSrc|mobileHeroImageSrc|backgroundImage|dashboardImageSrc)$/i.test(prop)) {
      fields[prop] = "text";
    } else if (/^(items|links|ctas|columns|metrics|stats|plans|logos|chips|tabs|kpis|slides|heroSlides|badges)$/i.test(prop)) {
      fields[prop] = "list";
    } else if (/^(variant|background|paddingY|maxWidth|align|emphasis|density|cardStyle|columns)$/i.test(prop)) {
      fields[prop] = "select";
    } else if (/^(sticky|rounded|featured|highlighted|showIcon)$/i.test(prop)) {
      fields[prop] = "boolean";
    } else {
      fields[prop] = "text";
    }
  }

  return fields;
};

/**
 * Detect list item fields from code patterns like items.map(item => ... item.title ...)
 */
const detectListItemFields = (code, listPropName) => {
  const itemFields = {};
  // Look for item.xxx patterns after listPropName.map
  const mapPattern = new RegExp(
    `${listPropName}\\.map\\(\\(?\\s*(\\w+)`,
    "g"
  );
  const mapMatch = mapPattern.exec(code);
  if (!mapMatch) return itemFields;

  const itemVar = mapMatch[1];
  const fieldPattern = new RegExp(`${itemVar}\\.(\\w+)`, "g");
  let fieldMatch;
  const seen = new Set();
  while ((fieldMatch = fieldPattern.exec(code)) !== null) {
    const field = fieldMatch[1];
    if (seen.has(field)) continue;
    seen.add(field);
    if (/^(title|label|name|value|badge)$/i.test(field)) {
      itemFields[field] = "text";
    } else if (/^(description|subtitle|body|text|quote)$/i.test(field)) {
      itemFields[field] = "textarea";
    } else if (/^(src|href|imageSrc|icon|avatar|logo)$/i.test(field)) {
      itemFields[field] = "text";
    } else if (/^(variant|role|position)$/i.test(field)) {
      itemFields[field] = "text";
    }
  }
  return itemFields;
};

/**
 * Normalize component code for static file output.
 * - Ensures "use client" directive
 * - Fixes common import issues
 * - Adds export default if missing
 */
const normalizeForStatic = (code, componentName) => {
  let normalized = String(code || "").trim();

  // Ensure "use client" at top
  if (!normalized.startsWith('"use client"') && !normalized.startsWith("'use client'")) {
    normalized = `"use client";\n\n${normalized}`;
  }

  // Fix common import path issues
  normalized = normalized.replace(
    /@\/components\/ui\/(animated-beam|bento-grid|border-beam|carousel|comparison-slider|scene-switcher|glow-card|gradient-text|magnifier|marquee|number-ticker|particles|text-reveal)/g,
    "@/components/magic/$1"
  );

  // Ensure React import
  if (!/import\s+React/.test(normalized) && !/import\s+\*\s+as\s+React/.test(normalized)) {
    normalized = normalized.replace(
      /("use client";\s*\n)/,
      '$1\nimport React from "react";\n'
    );
  }

  // Ensure export default
  if (!/export\s+default\s/.test(normalized)) {
    // Check for named function/const that matches component name
    const funcPattern = new RegExp(
      `(?:function|const)\\s+${componentName}\\b`
    );
    if (funcPattern.test(normalized)) {
      normalized += `\n\nexport default ${componentName};\n`;
    }
  }

  return normalized;
};

/**
 * Generate Puck field adapter code from detected fields.
 */
const generateFieldCode = (fields, code) => {
  const lines = [];
  for (const [name, type] of Object.entries(fields)) {
    if (type === "text") {
      lines.push(`        ${name}: textField("${toPascal(name)}"),`);
    } else if (type === "textarea") {
      lines.push(`        ${name}: textareaField("${toPascal(name)}"),`);
    } else if (type === "boolean") {
      lines.push(`        ${name}: booleanField("${toPascal(name)}"),`);
    } else if (type === "select") {
      // Try to detect options from code
      const optMatch = code.match(
        new RegExp(`${name}\\s*===?\\s*["']([^"']+)["']`, "g")
      );
      const options = optMatch
        ? [...new Set(optMatch.map((m) => m.match(/["']([^"']+)["']/)?.[1]).filter(Boolean))]
        : ["default"];
      lines.push(
        `        ${name}: selectField("${toPascal(name)}", ${JSON.stringify(options)}),`
      );
    } else if (type === "list") {
      const itemFields = detectListItemFields(code, name);
      if (Object.keys(itemFields).length) {
        const itemLines = Object.entries(itemFields)
          .map(([k, t]) => {
            if (t === "textarea") return `          ${k}: textareaField("${toPascal(k)}"),`;
            return `          ${k}: textField("${toPascal(k)}"),`;
          })
          .join("\n");
        lines.push(
          `        ${name}: listField("${toPascal(name)}", {\n${itemLines}\n        }),`
        );
      } else {
        lines.push(
          `        ${name}: listField("${toPascal(name)}", {\n          label: textField("Label"),\n        }),`
        );
      }
    }
  }
  return lines.join("\n");
};

/**
 * Build default props from component code and page data.
 */
const buildDefaultProps = (componentName, pageData, fields, lookupNames = []) => {
  const defaults = { id: `${componentName}-1` };

  // Try to extract defaults from page data content
  if (pageData?.content) {
    const acceptedTypes = new Set([componentName, ...lookupNames].filter(Boolean));
    const block = pageData.content.find((item) => acceptedTypes.has(item?.type));
    if (block?.props) {
      for (const [key, value] of Object.entries(block.props)) {
        if (key !== "id" && key !== "__v" && value !== undefined) {
          defaults[key] = value;
        }
      }
    }
  }

  // Fill in missing defaults
  for (const [name, type] of Object.entries(fields)) {
    if (name in defaults) continue;
    if (type === "text") defaults[name] = "";
    else if (type === "textarea") defaults[name] = "";
    else if (type === "boolean") defaults[name] = false;
    else if (type === "list") defaults[name] = [];
    else if (type === "select") defaults[name] = "default";
  }

  return defaults;
};

/**
 * Materialize a single component.
 *
 * @returns {{ name, kebabName, blockDir, configEntry }}
 */
const materializeComponent = async ({
  name,
  sourceName = "",
  code,
  pageData = null,
  overwrite = false,
  root = "",
}) => {
  const { blocksDir } = rootPaths(root);
  const kebabName = toKebab(name);
  const blockDir = path.join(blocksDir, kebabName);
  const blockFile = path.join(blockDir, "block.tsx");

  // Detect fields/defaults up-front so existing blocks can still be registered.
  const fields = detectPropsFromCode(code);
  const defaultProps = buildDefaultProps(name, pageData, fields, [sourceName]);
  const fieldCode = generateFieldCode(fields, code);

  // Check if already exists
  try {
    await fs.access(blockFile);
    if (!overwrite) {
      console.log(`[materialize] skip ${name} → ${kebabName}/block.tsx (exists)`);
      return {
        name,
        kebabName,
        blockDir,
        blockFile,
        fields,
        defaultProps,
        fieldCode,
        skipped: true,
      };
    }
  } catch {
    // File doesn't exist, proceed
  }

  // Normalize and write
  const normalized = normalizeForStatic(code, name);
  await fs.mkdir(blockDir, { recursive: true });
  await fs.writeFile(blockFile, normalized);

  console.log(
    `[materialize] wrote ${name} → ${kebabName}/block.tsx (${Object.keys(fields).length} fields)`
  );

  return {
    name,
    kebabName,
    blockDir,
    blockFile,
    fields,
    defaultProps,
    fieldCode,
    skipped: false,
  };
};

/**
 * Generate the config.generated.ts file that registers all materialized components.
 */
const generateConfigFile = async (components, root = "") => {
  const { generatedConfigPath } = rootPaths(root);
  const deduped = new Map();
  for (const component of components || []) {
    if (!component?.name || !component?.kebabName) continue;
    deduped.set(component.name, component);
  }
  const active = [...deduped.values()].filter((c) => c.fieldCode && c.defaultProps);
  if (!active.length) {
    console.log("[materialize] no new components to register");
    return;
  }

  const imports = active
    .map(
      (c) =>
        `import * as ${c.name}BlockModule from "@/components/blocks/${c.kebabName}/block";`
    )
    .join("\n");

  const fieldImport = `import {\n  booleanField,\n  listField,\n  selectField,\n  textField,\n  textareaField,\n} from "@/puck/field-adapters";`;

  const renderHelper = `const resolveBlockComponent = (
  moduleExports: Record<string, unknown>,
  modulePath: string
): React.ComponentType<any> => {
  const directDefault = (moduleExports as { default?: unknown }).default;
  if (typeof directDefault === "function") {
    return directDefault as React.ComponentType<any>;
  }

  for (const candidate of Object.values(moduleExports || {})) {
    if (typeof candidate === "function") {
      return candidate as React.ComponentType<any>;
    }
  }

  console.warn(\`[config.generated] unable to resolve component export from \${modulePath}\`);
  return () => null;
};

const renderBlock = (Block: React.ComponentType<any>) => (props: any) =>
  React.createElement(Block, props);`;

  const registrations = active
    .map((c) => {
      const propsStr = JSON.stringify(c.defaultProps, null, 6)
        .split("\n")
        .map((line, i) => (i === 0 ? line : `      ${line}`))
        .join("\n");
      return `    ${c.name}: {
      render: renderBlock(
        resolveBlockComponent(
          ${c.name}BlockModule,
          "@/components/blocks/${c.kebabName}/block"
        )
      ),
      defaultProps: ${propsStr},
      fields: {
${c.fieldCode}
      },
    },`;
    })
    .join("\n");

  const content = `/**
 * Auto-generated by materialize-custom-components.mjs
 * DO NOT EDIT MANUALLY — re-run materialization to update.
 */

import React from "react";
${fieldImport}
${imports}

${renderHelper}

export const generatedComponents: Record<string, any> = {
${registrations}
};
`;

  await fs.writeFile(generatedConfigPath, content);
  console.log(
    `[materialize] wrote ${generatedConfigPath} (${active.length} components)`
  );
};

/**
 * Load payload.json and extract components + page data.
 */
const loadPayload = async (payloadPath) => {
  const raw = await fs.readFile(payloadPath, "utf8");
  const payload = JSON.parse(raw);
  const components = Array.isArray(payload?.components) ? payload.components : [];
  const pages = Array.isArray(payload?.pages) ? payload.pages : [];
  const homePageData = pages.find((p) => p?.path === "/" || p?.path === "home")?.data || pages[0]?.data || null;
  return { components, pages, homePageData };
};

/**
 * Find all payload.json files in a run directory.
 */
const findPayloads = async (runDir, root = "") => {
  const payloads = [];
  const { root: builderRoot } = rootPaths(root);
  const assetFactory = path.join(builderRoot, "..", "asset-factory", "out");
  try {
    const entries = await fs.readdir(assetFactory);
    for (const entry of entries) {
      const sandboxPayload = path.join(assetFactory, entry, "sandbox", "payload.json");
      try {
        await fs.access(sandboxPayload);
        payloads.push({ siteKey: entry, path: sandboxPayload });
      } catch {
        // No payload for this site
      }
    }
  } catch {
    // asset-factory/out doesn't exist
  }

  // Also check run dir for any saved payloads
  if (runDir) {
    try {
      const sitesDir = path.join(runDir, "sites");
      const sites = await fs.readdir(sitesDir);
      for (const site of sites) {
        const payloadPath = path.join(sitesDir, site, "payload.json");
        try {
          await fs.access(payloadPath);
          payloads.push({ siteKey: site, path: payloadPath });
        } catch {
          // No payload
        }
      }
    } catch {
      // No sites dir
    }
  }

  return payloads;
};

const materializeFromPayload = async (payloadPath, siteId = "", options = {}) => {
  const normalizedPayloadPath = path.resolve(payloadPath);
  const { components, pages } = await loadPayload(normalizedPayloadPath);
  const pageByPath = new Map((pages || []).map((page) => [String(page?.path || "/"), page?.data || null]));
  const homePageData = pageByPath.get("/") || pages?.[0]?.data || null;
  const materialized = [];
  const namingRegistry = options.namingRegistry instanceof Map ? options.namingRegistry : new Map();

  for (const comp of components) {
    if (!comp?.name || !comp?.code) continue;
    const identity = resolveComponentIdentity(comp.name, comp.code, namingRegistry);
    if (identity.duplicate) {
      continue;
    }
    const pageData =
      pageByPath.get(String(comp.pagePath || "")) ||
      pageByPath.get(String(comp.path || "")) ||
      homePageData;
    const result = await materializeComponent({
      name: identity.resolvedName,
      sourceName: comp.name,
      code: comp.code,
      pageData,
      overwrite: Boolean(options.overwrite),
      root: options.root || "",
    });
    if (identity.collisionFrom) {
      result.collisionFrom = identity.collisionFrom;
      result.signature = identity.signature;
    }
    materialized.push(result);
  }

  return {
    siteId,
    payloadPath: normalizedPayloadPath,
    components: materialized,
  };
};

const writeGeneratedConfig = async (components, options = {}) => {
  await generateConfigFile(components, options.root || "");
};

/**
 * Main entry point.
 */
const main = async () => {
  const args = process.argv.slice(2);
  let payloadPath = "";
  let runDir = "";
  let siteId = "";
  let overwrite = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--payload" && args[i + 1]) {
      payloadPath = path.resolve(args[++i]);
    } else if (args[i] === "--run-dir" && args[i + 1]) {
      runDir = path.resolve(args[++i]);
    } else if (args[i] === "--site-id" && args[i + 1]) {
      siteId = args[++i];
    } else if (args[i] === "--overwrite") {
      overwrite = true;
    }
  }

  const allComponents = [];
  const namingRegistry = new Map();

  if (payloadPath) {
    console.log(`[materialize] loading payload: ${payloadPath}`);
    const result = await materializeFromPayload(payloadPath, siteId, { overwrite, namingRegistry });
    allComponents.push(...result.components);
  } else if (runDir) {
    console.log(`[materialize] scanning run dir: ${runDir}`);
    const payloads = await findPayloads(runDir);
    for (const { siteKey, path: pPath } of payloads) {
      if (siteId && siteKey !== siteId) continue;
      console.log(`[materialize] processing ${siteKey}: ${pPath}`);
      const result = await materializeFromPayload(pPath, siteKey, { overwrite, namingRegistry });
      allComponents.push(...result.components);
    }
  } else {
    console.log(`[materialize] scanning asset-factory/out for payloads...`);
    const payloads = await findPayloads("");
    for (const { siteKey, path: pPath } of payloads) {
      console.log(`[materialize] processing ${siteKey}: ${pPath}`);
      const result = await materializeFromPayload(pPath, siteKey, { overwrite, namingRegistry });
      allComponents.push(...result.components);
    }
  }

  // Generate config registration file
  await writeGeneratedConfig(allComponents);

  // Write manifest
  const manifest = allComponents.map((c) => ({
    name: c.name,
    kebabName: c.kebabName,
    skipped: c.skipped || false,
    collisionFrom: c.collisionFrom || null,
    signature: c.signature || null,
    fields: c.skipped ? null : Object.keys(c.fields || {}),
  }));
  const manifestPath = runDir
    ? path.join(runDir, "materialized-components.json")
    : path.join(resolveBuilderRoot(), "template-factory", "materialized-components.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(
    `[materialize] done: ${allComponents.length} total, ${allComponents.filter((c) => !c.skipped).length} new → ${manifestPath}`
  );
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error("[materialize] fatal:", err);
    process.exit(1);
  });
}

export {
  materializeComponent,
  generateConfigFile,
  loadPayload,
  normalizeForStatic,
  detectPropsFromCode,
  materializeFromPayload,
  writeGeneratedConfig,
};

export type TemplateAdaptationRole =
  | "nav"
  | "hero"
  | "story"
  | "features"
  | "content"
  | "products"
  | "cases"
  | "contact"
  | "cta"
  | "footer"
  | "proof"
  | "utility"
  | "other";

export type KnownTemplateFamily =
  | "breton"
  | "pamamachinetools"
  | "sandvik"
  | "fptindustrie"
  | "carbon3d"
  | "plexus"
  | "ridecake"
  | "framework_new"
  | "kymeta"
  | "ionq"
  | "sixtine"
  | "transpa_rent"
  | "pagani"
  | "nothing_tech"
  | "vanmoof"
  | "analogue"
  | "teenage_engineering"
  | "siemens"
  | "audeze"
  | "devialet"
  | "unistellar"
  | "masterdynamic"
  | "unknown";

export type KnownSiteScenario =
  | "industrial_manufacturer"
  | "luxury_editorial"
  | "ai_saas"
  | "developer_tooling"
  | "design_led_ecommerce"
  | "generic";

export type TemplateAdaptationFinding = {
  severity: "error" | "warning";
  code: "scenario_page_contract_violation" | "template_semantic_mismatch" | "template_brand_residue";
  message: string;
  details?: Record<string, unknown>;
};

export type TemplateAdaptationPageDescriptor = {
  path: string;
  name: string;
  pageType:
    | "home"
    | "about"
    | "solutions"
    | "products"
    | "pricing"
    | "cases"
    | "contact"
    | "faq"
    | "support"
    | "blog"
    | "careers"
    | "legal"
    | "generic";
  blockTypes: string[];
  allRoles: TemplateAdaptationRole[];
  contentRoles: TemplateAdaptationRole[];
  roleShape: string;
  textSnippets: string[];
};

export type TemplateAdaptationSummary = {
  scenario: KnownSiteScenario;
  templateFamily: KnownTemplateFamily;
  referenceMode: boolean;
  findings: TemplateAdaptationFinding[];
  pageContracts: Array<{
    path: string;
    pageType: TemplateAdaptationPageDescriptor["pageType"];
    satisfied: boolean;
    required: string[];
    actual: TemplateAdaptationRole[];
  }>;
};

type PayloadBlockLike = { type?: unknown; props?: unknown };
type PayloadPageLike = { path?: unknown; name?: unknown; data?: { content?: PayloadBlockLike[] } };

const normalizePath = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
};

const normalizeText = (value: string) => value.trim().toLowerCase().normalize("NFKC");

const inferPageType = (pathValue: string, nameValue: string): TemplateAdaptationPageDescriptor["pageType"] => {
  const token = `${pathValue} ${nameValue}`.toLowerCase();
  if (!pathValue || pathValue === "/") return "home";
  if (/(about|company|story|mission|vision|who|team)/.test(token)) return "about";
  if (/(careers?|jobs?|hiring|join[-\s]?us|talent|recruit)/.test(token)) return "careers";
  if (/(privacy|legal|term|policy|cookie)/.test(token)) return "legal";
  if (/(pricing|plans?|tiers?|subscription|quote|cost|套餐|报价|价格)/.test(token)) return "pricing";
  if (/(faq|frequently asked|questions?|q&a|qanda|常见问题|问答)/.test(token)) return "faq";
  if (/(contact|quote|inquir|demo|consult|book)/.test(token)) return "contact";
  if (/(support|docs|documentation|knowledge|help|guide)/.test(token)) return "support";
  if (/(blog|news|article|journal|insight|newsroom)/.test(token)) return "blog";
  if (/(case|portfolio|reference|success|use-case|usecase)/.test(token)) return "cases";
  if (/(solution|service|workflow|custom|capabilit|integration)/.test(token)) return "solutions";
  if (/(product|catalog|collection|machine|machines|device|hardware)/.test(token)) return "products";
  return "generic";
};

const toRole = (type: string): TemplateAdaptationRole => {
  if (!type) return "other";
  if (/FloatingWhatsApp|Atomic/i.test(type)) return "utility";
  if (/Navbar|Nav/i.test(type)) return "nav";
  if (/Footer/i.test(type)) return "footer";
  if (/Hero|IntroBand|PageHero/i.test(type)) return "hero";
  if (/ContentStory/i.test(type)) return "content";
  if (/FactoryStory|Story|About/i.test(type)) return "story";
  if (/SolutionsRail|FeatureGrid|FeatureWithMedia|Capability|Metrics|Ops|ControlPanel|Comparison|FAQ|Process|Workflow|Approach/i.test(type))
    return "features";
  if (/Product|Catalog/i.test(type)) return "products";
  if (/CaseStudies|Projects|Cases|CaseStrip/i.test(type)) return "cases";
  if (/Contact|LeadCapture|Quote/i.test(type)) return "contact";
  if (/Cta|CTA|QuoteBand/i.test(type)) return "cta";
  if (/Testimonials|LogoCloud|Certification|Proof/i.test(type)) return "proof";
  if (/Cards?Grid|Content/i.test(type)) return "content";
  return "other";
};

const collectTextSnippets = (value: unknown, bucket: string[] = []) => {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (normalized) bucket.push(normalized);
    return bucket;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectTextSnippets(entry, bucket));
    return bucket;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      if (key.startsWith("__")) return;
      if (/template(meta)?|profileid|publishedoriginaltype/i.test(key)) return;
      collectTextSnippets(entry, bucket);
    });
  }
  return bucket;
};

export const normalizePayloadPagesForAdaptation = (pages: unknown[]): TemplateAdaptationPageDescriptor[] =>
  (Array.isArray(pages) ? pages : []).map((page) => {
    const record = (page && typeof page === "object" ? page : {}) as PayloadPageLike;
    const path = normalizePath(record.path);
    const name = (typeof record.name === "string" && record.name.trim()) || (path === "/" ? "Home" : path);
    const blocks = Array.isArray(record.data?.content) ? record.data.content : [];
    const blockTypes = blocks.map((block) => String(block?.type || "").trim()).filter(Boolean);
    const allRoles = blockTypes.map((type) => toRole(type));
    const contentRoles = allRoles.filter((role) => role !== "nav" && role !== "footer" && role !== "utility");
    const textSnippets = blocks.flatMap((block) => collectTextSnippets((block && typeof block === "object" ? block.props : {}) ?? {}));
    return {
      path,
      name,
      pageType: inferPageType(path, name),
      blockTypes,
      allRoles,
      contentRoles,
      roleShape: contentRoles.join(">"),
      textSnippets,
    };
  });

export const inferTemplateFamily = (profileId: unknown): KnownTemplateFamily => {
  const token = normalizeText(String(profileId || ""));
  if (!token) return "unknown";
  if (token.includes("breton")) return "breton";
  if (token.includes("pamamachinetools") || token.includes("pama")) return "pamamachinetools";
  if (token.includes("sandvik")) return "sandvik";
  if (token.includes("fptindustrie") || token.includes("fpt")) return "fptindustrie";
  if (token.includes("carbon3d") || token.includes("carbon")) return "carbon3d";
  if (token.includes("plexus")) return "plexus";
  if (token.includes("ridecake")) return "ridecake";
  if (token.includes("framework_new") || token.includes("framework-new") || token.includes("framework")) return "framework_new";
  if (token.includes("kymeta")) return "kymeta";
  if (token.includes("ionq")) return "ionq";
  if (token.includes("sixtine")) return "sixtine";
  if (token.includes("transpa-rent") || token.includes("transparent")) return "transpa_rent";
  if (token.includes("pagani")) return "pagani";
  if (token.includes("nothing-tech") || token.includes("nothing_tech") || token.includes("nothing")) return "nothing_tech";
  if (token.includes("vanmoof")) return "vanmoof";
  if (token.includes("analogue")) return "analogue";
  if (token.includes("teenage-engineering") || token.includes("teenage_engineering")) return "teenage_engineering";
  if (token.includes("auto_siemens") || token.includes("siemens")) return "siemens";
  if (token.includes("auto_audeze") || token.includes("audeze")) return "audeze";
  if (token.includes("auto_devialet") || token.includes("devialet")) return "devialet";
  if (token.includes("unistellar")) return "unistellar";
  if (token.includes("masterdynamic") || token.includes("master_dynamic")) return "masterdynamic";
  return "unknown";
};

const familyPromptTokens: Record<KnownTemplateFamily, string> = {
  breton: "breton",
  pamamachinetools: "pama|pamamachinetools",
  sandvik: "sandvik",
  fptindustrie: "fpt|fptindustrie",
  carbon3d: "carbon3d|carbon 3d|carbon",
  plexus: "plexus",
  ridecake: "ridecake",
  framework_new: "framework",
  kymeta: "kymeta",
  ionq: "ionq",
  sixtine: "sixtine",
  transpa_rent: "transparent|transpa[ -]?rent",
  pagani: "pagani",
  nothing_tech: "nothing|nothing[ -]?tech|cmf",
  vanmoof: "vanmoof",
  analogue: "analogue",
  teenage_engineering: "teenage[ -]?engineering",
  siemens: "siemens",
  audeze: "audeze",
  devialet: "devialet",
  unistellar: "unistellar",
  masterdynamic: "master(?:\\s|&|and|-)*dynamic",
  unknown: "",
};

export const inferKnownSiteScenario = (prompt: string, pages: TemplateAdaptationPageDescriptor[]): KnownSiteScenario => {
  const token = normalizeText(
    [prompt, ...pages.flatMap((page) => [page.path, page.name, ...page.textSnippets.slice(0, 12)])].join(" ")
  );
  if (
    /(ecommerce|shop|store|brand campaign|direct to consumer|d2c|consumer tech|consumer hardware|audio hardware|urban mobility|e-bike|ebike|smartphone|wearable|speaker brand|headphones?|earbuds?|hi[- ]?fi|home audio|premium audio|telescope|smart telescope|astrophotography|astronomy gear)/.test(
      token
    )
  )
    return "design_led_ecommerce";
  if (
    /(industrial|manufacturer|manufacturing|factory|cnc|machine tool|machining|equipment|automation|3c|3d printing|additive manufacturing|digital manufacturing|electronics manufacturing|contract manufacturing|precision engineering)/.test(
      token
    )
  ) {
    return "industrial_manufacturer";
  }
  if (/(luxury|editorial|interior|residence|gallery|spatial|studio)/.test(token)) return "luxury_editorial";
  if (/(saas|software|platform|workflow automation|ai agent|b2b software|\bcloud\b|cloud platform|cloud software)/.test(token))
    return "ai_saas";
  if (/(developer|tooling|api|sdk|platform engineering|command line|cli)/.test(token)) return "developer_tooling";
  return "generic";
};

const isReferenceMode = (prompt: string, family: KnownTemplateFamily) => {
  const token = normalizeText(prompt);
  if (!token || family === "unknown") return false;
  const familyToken = familyPromptTokens[family] || family.replace(/_/g, " ");
  return new RegExp(
    `(?:like|inspired by|reference|similar to|based on|using|with|template base|视觉模板|风格参考|类似|参考|对标)[\\s\\S]{0,24}${familyToken}`,
    "i"
  ).test(token);
};

const pageRuleDefinitions: Record<
  KnownSiteScenario,
  Partial<
    Record<
      TemplateAdaptationPageDescriptor["pageType"],
      { required: TemplateAdaptationRole[]; anyOf?: TemplateAdaptationRole[][] }
    >
  >
> = {
  industrial_manufacturer: {
    home: { required: ["footer"], anyOf: [["hero", "story", "content"], ["products", "features", "content"], ["cta", "contact", "proof"]] },
    products: { required: ["footer"], anyOf: [["hero", "story", "content"], ["products", "features", "content"]] },
    pricing: { required: ["footer"], anyOf: [["products", "content"], ["cta", "contact", "proof"]] },
    solutions: { required: ["footer"], anyOf: [["hero", "story", "content"], ["features", "content"], ["cta", "contact", "proof"]] },
    cases: { required: ["footer"], anyOf: [["hero", "story", "content"], ["cases", "content", "proof"]] },
    about: { required: ["footer"], anyOf: [["hero", "story", "content"], ["story", "content", "proof"]] },
    support: { required: ["footer"], anyOf: [["content", "contact", "proof"]] },
    blog: { required: ["hero", "footer"], anyOf: [["content", "proof"]] },
    contact: { required: ["footer"], anyOf: [["contact", "cta"]] },
  },
  luxury_editorial: {
    home: { required: ["hero", "footer"], anyOf: [["content", "proof"]] },
    about: { required: ["hero", "footer"], anyOf: [["story", "content"]] },
    cases: { required: ["hero", "footer"], anyOf: [["content", "cases", "proof"]] },
    contact: { required: ["footer"], anyOf: [["contact", "cta"]] },
  },
  ai_saas: {
    home: { required: ["hero", "footer"], anyOf: [["features", "content"], ["cta", "proof"]] },
    products: { required: ["hero", "footer"], anyOf: [["features", "content"]] },
    pricing: { required: ["hero", "footer"], anyOf: [["products", "features"], ["cta", "contact", "proof"]] },
    faq: { required: ["footer"], anyOf: [["features", "content"], ["contact", "cta"]] },
    solutions: { required: ["hero", "footer"], anyOf: [["features", "content"], ["proof", "cta"]] },
    about: { required: ["hero", "footer"], anyOf: [["story", "proof", "content"]] },
    contact: { required: ["footer"], anyOf: [["contact", "cta"]] },
    blog: { required: ["hero", "footer"], anyOf: [["content", "proof"]] },
    careers: { required: ["footer"], anyOf: [["story", "content"], ["proof", "cta"]] },
  },
  developer_tooling: {
    home: { required: ["hero", "footer"], anyOf: [["features", "content"], ["cta", "proof"]] },
    products: { required: ["hero", "footer"], anyOf: [["features", "content", "products"]] },
    pricing: { required: ["hero", "footer"], anyOf: [["products", "features"], ["cta", "contact"]] },
    faq: { required: ["footer"], anyOf: [["content", "features"], ["contact", "cta"]] },
    support: { required: ["footer"], anyOf: [["content", "contact", "proof"]] },
    about: { required: ["hero", "footer"], anyOf: [["story", "proof", "content"]] },
    contact: { required: ["footer"], anyOf: [["contact", "cta"]] },
    blog: { required: ["hero", "footer"], anyOf: [["content", "proof"]] },
    careers: { required: ["footer"], anyOf: [["story", "content"], ["proof", "cta"]] },
  },
  design_led_ecommerce: {
    home: { required: ["hero", "footer"], anyOf: [["products", "content"], ["cta", "proof"]] },
    products: { required: ["hero", "footer"], anyOf: [["products", "content"]] },
    pricing: { required: ["hero", "footer"], anyOf: [["products", "cta"], ["proof", "content"]] },
    about: { required: ["hero", "footer"], anyOf: [["story", "content"]] },
    contact: { required: ["footer"], anyOf: [["contact", "cta"]] },
  },
  generic: {},
};

const normalizeComparableToken = (value: string) => normalizeText(value).replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");

const referenceStopWords = new Set([
  "template",
  "style",
  "visual",
  "website",
  "landing",
  "page",
  "site",
  "brand",
  "company",
  "official",
  "web",
  "design",
  "like",
  "similar",
  "inspired",
  "reference",
  "based",
  "using",
  "new",
  "tech",
  "auto",
  "home",
  "desktop",
]);

const tokenizeReferencePhrase = (value: string) =>
  String(value || "")
    .split(/[^A-Za-z0-9\u4e00-\u9fff]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3 && !referenceStopWords.has(normalizeText(item)));

const extractReferenceTermsFromPrompt = (prompt: string): string[] => {
  const text = String(prompt || "");
  const phrases = new Set<string>();
  const regex =
    /(?:like|inspired by|reference(?:d)? from|similar to|based on|using|with|视觉模板|风格参考|类似|参考|对标)\s+([A-Za-z\u4e00-\u9fff][A-Za-z0-9\u4e00-\u9fff&.'’\-\s]{1,64})/gi;
  Array.from(text.matchAll(regex)).forEach((match) => {
    const raw = String(match[1] || "")
      .trim()
      .split(/[.!?。！]/)[0]
      .replace(/[,:;，；：]+$/g, "")
      .trim();
    if (raw) phrases.add(raw);
  });
  const direct = Array.from(phrases).flatMap((phrase) => [phrase, ...tokenizeReferencePhrase(phrase)]);
  return Array.from(
    new Set(
      direct
        .map((item) => item.trim())
        .filter((item) => item.length >= 3 && !referenceStopWords.has(normalizeText(item)))
    )
  ).slice(0, 24);
};

export const getTemplateFamilyBrandTerms = (family: KnownTemplateFamily) => {
  if (!family || family === "unknown") return [];
  const plain = family.replace(/_/g, " ").trim();
  const compact = family.replace(/_/g, "").trim();
  const splitTokens = tokenizeReferencePhrase(plain);
  const alphaOnly = compact.replace(/[0-9]+/g, "").trim();
  return Array.from(new Set([plain, compact, alphaOnly, ...splitTokens]))
    .map((item) => item.trim())
    .filter((item) => item.length >= 3 && !referenceStopWords.has(normalizeText(item)));
};

const includesTerm = (snippets: string[], term: string) => {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return false;
  return snippets.some((snippet) => normalizeText(snippet).includes(normalizedTerm));
};

const blockContainsReference = (blockType: string, term: string) => {
  const normalizedType = normalizeComparableToken(blockType);
  const normalizedTerm = normalizeComparableToken(term);
  if (!normalizedType || !normalizedTerm) return false;
  const normalizedAlphaTerm = normalizedTerm.replace(/[0-9]+/g, "");
  return (
    normalizedType.includes(normalizedTerm) ||
    (normalizedAlphaTerm.length >= 3 && normalizedType.includes(normalizedAlphaTerm))
  );
};

export const buildTemplateAdaptationSummary = (input: {
  prompt?: string;
  profileId?: unknown;
  pages?: unknown[];
}): TemplateAdaptationSummary => {
  const descriptors = normalizePayloadPagesForAdaptation(Array.isArray(input.pages) ? input.pages : []);
  const templateFamily = inferTemplateFamily(input.profileId);
  const scenario = inferKnownSiteScenario(String(input.prompt || ""), descriptors);
  const referenceMode = isReferenceMode(String(input.prompt || ""), templateFamily);
  const enforceSemanticMismatch =
    referenceMode || (templateFamily !== "unknown" && scenario !== "generic");
  const referenceTerms = Array.from(
    new Set([
      ...extractReferenceTermsFromPrompt(String(input.prompt || "")),
      ...(referenceMode ? getTemplateFamilyBrandTerms(templateFamily) : []),
    ])
  );
  const findings: TemplateAdaptationFinding[] = [];
  const pageContracts = descriptors
    .map((page) => {
      const rule = pageRuleDefinitions[scenario]?.[page.pageType];
      if (!rule) return null;
      const required = rule.required.map((role) => `required:${role}`);
      if (Array.isArray(rule.anyOf)) {
        rule.anyOf.forEach((group) => required.push(`anyOf:${group.join("|")}`));
      }
      const hasRequired = rule.required.every((role) => page.allRoles.includes(role));
      const hasAnyOf = (rule.anyOf ?? []).every((group) => group.some((role) => page.allRoles.includes(role)));
      const satisfied = hasRequired && hasAnyOf;
      if (!satisfied) {
        findings.push({
          severity: "error",
          code: "scenario_page_contract_violation",
          message: `Page ${page.path} does not satisfy the ${scenario} page contract for ${page.pageType}`,
          details: {
            path: page.path,
            pageType: page.pageType,
            actual: page.allRoles,
            required,
          },
        });
      }
      return {
        path: page.path,
        pageType: page.pageType,
        satisfied,
        required,
        actual: page.allRoles,
      };
    })
    .filter(Boolean) as TemplateAdaptationSummary["pageContracts"];

  if (referenceMode || enforceSemanticMismatch) {
    descriptors.forEach((page) => {
      const residueTerms = referenceMode ? referenceTerms.filter((term) => includesTerm(page.textSnippets, term)) : [];
      if (referenceMode && residueTerms.length) {
        findings.push({
          severity: "error",
          code: "template_brand_residue",
          message: `Page ${page.path} still contains source-reference terms: ${residueTerms.join(", ")}`,
          details: { path: page.path, family: templateFamily, residueTerms },
        });
      }
      const forbiddenBlocks = page.blockTypes.filter((type) =>
        referenceTerms.some((term) => blockContainsReference(type, term))
      );
      if (forbiddenBlocks.length) {
        findings.push({
          severity: "error",
          code: "template_semantic_mismatch",
          message: `Page ${page.path} still carries reference-specific block identities`,
          details: { path: page.path, family: templateFamily, forbiddenBlocks, referenceTerms },
        });
      }
    });
  }

  return {
    scenario,
    templateFamily,
    referenceMode,
    findings,
    pageContracts,
  };
};

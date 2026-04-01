const BRAND_STRUCTURAL_TOKENS = new Set([
  "navigation",
  "navbar",
  "header",
  "hero",
  "footer",
  "contact",
  "about",
  "products",
  "solutions",
  "cases",
  "privacy",
  "legal",
  "page",
  "section",
  "requiredsectionkinds",
  "ragqueries",
  "cta",
]);

const BRAND_EXACT_STOPWORDS = /^(brand|company|enterprise|website|official|官网|网站|公司|企业|品牌|品牌名|品牌名称|公司名|公司名称|名称|信息|中文|英文)$/i;

const BRAND_TRAILING_SCOPE_PATTERN_ZH =
  /(有限公司|有限责任公司|股份有限公司|集团(?:公司)?|公司)\s*(?:行业解决方案|解决方案|企业官网|官网|官方网站|网站).*$/u;
const BRAND_TRAILING_SCOPE_PATTERN_EN = /\b(?:industry\s+solutions?|solutions?|official\s+site|website)\b.*$/i;
const BRAND_LEGAL_ENTITY_PATTERN = /^(.+?(?:有限责任公司|股份有限公司|有限公司|集团(?:公司)?|公司))(.*)$/u;
const BRAND_LEGAL_TRAILING_NOISE =
  /^(?:[（(]?[A-Za-z0-9&._\-\s]{1,14}[)）]?\s*)?(?:行业|产业|解决方案|官网|官方网站|网站|产品|服务|案例|方案|站点|页面|首页|主页|展示).*/iu;

export const sanitizeBrandCandidate = (value: string): string => {
  const cleaned = String(value || "")
    .replace(/^["'“”‘’「『]+|["'“”‘’」』]+$/g, "")
    .trim();
  if (!cleaned) return "";
  const firstToken = cleaned.split(/[\n,，。;；|｜]/)[0]?.trim() || "";
  if (!firstToken) return "";

  let normalized = firstToken
    .replace(/\s*[-—–]\s*(?:定位|受众|目标|页面|导航|方案|官网|网站|生成|构建|设计|需求).*/i, "")
    .replace(/\s*[-—–]\s*[A-Za-z\u4e00-\u9fff]{0,20}\s*[:：].*$/, "")
    .trim();

  const firstOpen = Math.min(
    ...["（", "("]
      .map((ch) => normalized.indexOf(ch))
      .filter((idx) => idx >= 0)
      .concat([Number.POSITIVE_INFINITY])
  );
  const hasMatchingPair =
    (normalized.includes("（") && normalized.includes("）")) || (normalized.includes("(") && normalized.includes(")"));
  if (!hasMatchingPair && Number.isFinite(firstOpen)) {
    normalized = normalized.slice(0, firstOpen).trim();
  }

  normalized = normalized
    .replace(/[（(]([A-Za-z0-9\s.&_-]{1,12})[）)]/g, "")
    .replace(BRAND_TRAILING_SCOPE_PATTERN_ZH, "$1")
    .replace(BRAND_TRAILING_SCOPE_PATTERN_EN, "")
    .replace(/[:：\-—–|｜]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const legal = normalized.match(BRAND_LEGAL_ENTITY_PATTERN);
  if (legal) {
    const legalName = String(legal[1] || "").trim();
    const trailing = String(legal[2] || "").trim();
    if (!trailing || BRAND_LEGAL_TRAILING_NOISE.test(trailing)) {
      normalized = legalName;
    }
  }

  if (!normalized || normalized.length < 2) return "";
  const lowered = normalized.toLowerCase();
  const compactAlpha = lowered.replace(/[^a-z]/g, "");
  if (compactAlpha && BRAND_STRUCTURAL_TOKENS.has(compactAlpha)) return "";
  if (BRAND_EXACT_STOPWORDS.test(lowered)) return "";
  return normalized;
};

export const extractBrandNameFromPrompt = (prompt: string): string => {
  const raw = String(prompt || "");
  const quoted = raw.match(/["“”「『]([^"“”」』]{1,60})["”」』]/);
  if (quoted) {
    const candidate = sanitizeBrandCandidate(quoted[1]);
    if (candidate) return candidate;
  }
  const chinese = raw.match(
    /为\s*["“”「『]?\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s\-()（）]{1,64}?)\s*["”」』]?\s*(?:生成|制作|创建|构建|设计)/i
  );
  if (chinese) {
    const candidate = sanitizeBrandCandidate(chinese[1]);
    if (candidate) return candidate;
  }
  const labeled = raw.match(
    /(?:品牌(?:名称|名)?|公司(?:名称|名)?|企业(?:名称|名)?|Company(?:\s+name)?|Brand(?:\s+name)?)\s*[：:]\s*([^\n]{1,80})/i
  );
  if (labeled) {
    const candidate = sanitizeBrandCandidate(labeled[1]);
    if (candidate) return candidate;
  }
  const english = raw.match(/for\s+([A-Za-z][A-Za-z0-9&.\s-]{1,48})\s+(?:generate|build|create|design)/i);
  if (english) {
    const candidate = sanitizeBrandCandidate(english[1]);
    if (candidate) return candidate;
  }
  const named = raw.match(
    /(?:叫|called|named|品牌名(?:为|是)?|公司名(?:为|是)?|企业名(?:为|是)?)\s*[：:]?\s*([A-Za-z\u4e00-\u9fff][\w\u4e00-\u9fff\s]{0,48})/i
  );
  if (named) {
    const candidate = sanitizeBrandCandidate(named[1]);
    if (candidate) return candidate;
  }
  return "";
};

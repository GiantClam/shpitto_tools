export type OutputLanguage = "zh-CN" | "en-US";

const explicitChinesePattern =
  /(中文|简体|繁體|繁体|简中|中文网站|中文官网|汉语|汉字|chinese|mandarin|zh-cn|zh-hans|zh-hant)/i;
const explicitEnglishPattern = /(英文|英语|english|en-us|en-gb|\benglish\b)/i;

const countMatches = (value: string, pattern: RegExp) => {
  const matches = value.match(pattern);
  return Array.isArray(matches) ? matches.length : 0;
};

const LANGUAGE_SEED_SPLITTER =
  /\n\s*#\s*(?:Page Scoped Fact Pack|Page Builder Skill|Page Contract|Structured Input Contract|Compact Tool Context|Context)\b/i;

const extractLanguageSeed = (raw: string) => {
  const normalized = String(raw || "");
  if (!normalized.trim()) return "";
  const chunks = normalized.split(LANGUAGE_SEED_SPLITTER);
  const head = String(chunks[0] || "").trim();
  if (head) return head;
  const fallback = normalized
    .split(/\r?\n/)
    .slice(0, 6)
    .join(" ")
    .trim();
  return fallback || normalized.trim();
};

export const resolveOutputLanguage = (prompt: string): OutputLanguage => {
  const raw = extractLanguageSeed(String(prompt || ""));
  if (!raw.trim()) return "en-US";

  const explicitChinese = explicitChinesePattern.test(raw);
  const explicitEnglish = explicitEnglishPattern.test(raw);
  if (explicitChinese && !explicitEnglish) return "zh-CN";
  if (explicitEnglish && !explicitChinese) return "en-US";

  const cjkCount = countMatches(raw, /[\u3400-\u9fff]/g);
  const latinCount = countMatches(raw, /[A-Za-z]/g);
  const hasCjk = cjkCount > 0;

  // Chinese-heavy prompts should default to Chinese output even without explicit "中文" tokens.
  if (cjkCount >= 24) return "zh-CN";
  if (cjkCount >= 10 && cjkCount >= latinCount * 0.6) return "zh-CN";
  // Mixed-language prompts (URL + Chinese business brief) should still stay Chinese.
  if (!explicitEnglish && hasCjk && (cjkCount >= 6 || cjkCount >= latinCount * 0.15)) return "zh-CN";
  // Short Chinese briefs should not be flipped to English by a few Latin tokens.
  if (!explicitEnglish && cjkCount >= 3 && latinCount <= 18) return "zh-CN";

  return "en-US";
};

export const shouldUseChineseContent = (prompt: string) => resolveOutputLanguage(prompt) === "zh-CN";

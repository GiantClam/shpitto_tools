export type OutputLanguage = "zh-CN" | "en-US";

const explicitChinesePattern =
  /(中文|简体|繁體|繁体|简中|中文网站|中文官网|汉语|汉字|chinese|mandarin|zh-cn|zh-hans|zh-hant)/i;
const explicitEnglishPattern = /(英文|英语|english|en-us|en-gb|\benglish\b)/i;

const countMatches = (value: string, pattern: RegExp) => {
  const matches = value.match(pattern);
  return Array.isArray(matches) ? matches.length : 0;
};

export const resolveOutputLanguage = (prompt: string): OutputLanguage => {
  const raw = String(prompt || "");
  if (!raw.trim()) return "en-US";

  const explicitChinese = explicitChinesePattern.test(raw);
  const explicitEnglish = explicitEnglishPattern.test(raw);
  if (explicitChinese && !explicitEnglish) return "zh-CN";
  if (explicitEnglish && !explicitChinese) return "en-US";

  const cjkCount = countMatches(raw, /[\u3400-\u9fff]/g);
  const latinCount = countMatches(raw, /[A-Za-z]/g);

  // Chinese-heavy prompts should default to Chinese output even without explicit "中文" tokens.
  if (cjkCount >= 24) return "zh-CN";
  if (cjkCount >= 10 && cjkCount >= latinCount * 0.6) return "zh-CN";

  return "en-US";
};

export const shouldUseChineseContent = (prompt: string) => resolveOutputLanguage(prompt) === "zh-CN";


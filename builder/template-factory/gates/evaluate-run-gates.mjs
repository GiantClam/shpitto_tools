const asArray = (value) => (Array.isArray(value) ? value : []);

const normalizePolicy = (value) => {
  const token = String(value || "").trim().toLowerCase();
  if (token === "ignore" || token === "warn" || token === "fail") return token;
  return "warn";
};

export const evaluateRunGates = (input = {}) => {
  const runId = String(input.runId || "").trim();
  const options = input.options && typeof input.options === "object" ? input.options : {};
  const strict = input.strict && typeof input.strict === "object" ? input.strict : {};
  const fidelity = input.fidelity && typeof input.fidelity === "object" ? input.fidelity : {};

  const requiredCases = asArray(strict.requiredCases).map((item) => String(item || "")).filter(Boolean);
  const requiredCaseSites = asArray(strict.requiredCaseSites).map((item) => String(item || "")).filter(Boolean);
  const missingComparableCases = asArray(strict.missingComparableCases).map((item) => String(item || "")).filter(Boolean);
  const failedCases = asArray(strict.failedCases).filter(Boolean);
  const missingComparablePages = asArray(strict.missingComparablePages).filter(Boolean);
  const failedPages = asArray(strict.failedPages).filter(Boolean);
  const blockingRequiredCases = asArray(strict.blockingRequiredCases).map((item) => String(item || "")).filter(Boolean);
  const blockingFailedCases = asArray(strict.blockingFailedCases).filter(Boolean);
  const blockingMissingComparableCases = asArray(strict.blockingMissingComparableCases)
    .map((item) => String(item || ""))
    .filter(Boolean);
  const blockingMissingComparablePages = asArray(strict.blockingMissingComparablePages).filter(Boolean);
  const blockingFailedPages = asArray(strict.blockingFailedPages).filter(Boolean);

  const fidelityMode = String(options.fidelityMode || "").trim().toLowerCase() === "strict" ? "strict" : "standard";
  const strictRequiredCasesPolicy = normalizePolicy(options.strictRequiredCasesPolicy);
  const strictRequiredCasesEmpty = fidelityMode === "strict" && requiredCases.length === 0;

  const issues = [];
  if (strictRequiredCasesEmpty) {
    if (strictRequiredCasesPolicy === "fail") {
      issues.push({
        code: "strict_required_cases_empty",
        severity: "error",
        message: "strict.requiredCases is empty under strict mode.",
      });
    } else if (strictRequiredCasesPolicy === "warn") {
      issues.push({
        code: "strict_required_cases_empty",
        severity: "warn",
        message: "strict.requiredCases is empty under strict mode.",
      });
    }
  }
  if (blockingFailedCases.length > 0) {
    issues.push({
      code: "strict_blocking_failures",
      severity: "error",
      message: `Strict blocking failures detected (${blockingFailedCases.length}).`,
    });
  }
  if (blockingMissingComparableCases.length > 0) {
    issues.push({
      code: "strict_blocking_missing",
      severity: "error",
      message: `Strict comparable rows missing for blocking cases (${blockingMissingComparableCases.length}).`,
    });
  }
  if (blockingFailedPages.length > 0) {
    issues.push({
      code: "strict_blocking_page_failures",
      severity: "error",
      message: `Strict required page failures detected (${blockingFailedPages.length}).`,
    });
  }
  if (blockingMissingComparablePages.length > 0) {
    issues.push({
      code: "strict_blocking_page_missing",
      severity: "error",
      message: `Strict required pages missing comparable rows (${blockingMissingComparablePages.length}).`,
    });
  }

  const hasError = issues.some((item) => item.severity === "error");
  const gatePassed = !hasError;

  return {
    generatedAt: new Date().toISOString(),
    runId,
    gatePassed,
    gateFailed: !gatePassed,
    strictRequiredCasesPolicy,
    summary: {
      fidelityMode,
      requiredCases: requiredCases.length,
      requiredCaseSites: requiredCaseSites.length,
      missingComparableCases: missingComparableCases.length,
      failedCases: failedCases.length,
      missingComparablePages: missingComparablePages.length,
      failedPages: failedPages.length,
      blockingRequiredCases: blockingRequiredCases.length,
      blockingMissingComparableCases: blockingMissingComparableCases.length,
      blockingFailedCases: blockingFailedCases.length,
      blockingMissingComparablePages: blockingMissingComparablePages.length,
      blockingFailedPages: blockingFailedPages.length,
      overallSimilarity:
        typeof fidelity.overallSimilarity === "number" && Number.isFinite(fidelity.overallSimilarity)
          ? fidelity.overallSimilarity
          : null,
    },
    strict: {
      requiredCases,
      requiredCaseSites,
      missingComparableCases,
      failedCases,
      missingComparablePages,
      failedPages,
      blockingRequiredCases,
      blockingMissingComparableCases,
      blockingFailedCases,
      blockingMissingComparablePages,
      blockingFailedPages,
      strictRequiredCasesEmpty,
    },
    issues,
  };
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const clampPercent = (value, fallback = 0) => {
  const n = toNumber(value, fallback);
  return Math.max(0, Math.min(100, n));
};

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
  const requiredCaseDetails = asArray(strict.requiredCaseDetails).filter((item) => item && typeof item === "object");
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
  const sites = asArray(input.sites).filter((item) => item && typeof item === "object");

  const fidelityMode = String(options.fidelityMode || "").trim().toLowerCase() === "strict" ? "strict" : "standard";
  const globalHomeOnly = Boolean(options.homeOnly);
  const strictRequiredCasesPolicy = normalizePolicy(options.strictRequiredCasesPolicy);
  const strictRequiredCasesEmpty = fidelityMode === "strict" && requiredCases.length === 0;
  const siteMetricSeverity = fidelityMode === "strict" ? "error" : "warn";
  const gateMinSitePages = Math.max(1, Math.floor(toNumber(options.gateMinSitePages, 8)));
  const gateMinPageSpecCoverage = clampPercent(options.gateMinPageSpecCoverage, 90);
  const gateMinLinkSuccessRate = clampPercent(options.gateMinLinkSuccessRate, 98);
  const gateMinNavFooterLinkSuccessRate = clampPercent(options.gateMinNavFooterLinkSuccessRate, 95);
  const gateMinRequiredRoleCoverage = clampPercent(options.gateMinRequiredRoleCoverage, 100);
  const gateMinDesignContractScore = clampPercent(options.gateMinDesignContractScore, 90);
  const gateMinAccessibilityScore = clampPercent(options.gateMinAccessibilityScore, 90);
  const gateMinAssetContractScore = clampPercent(options.gateMinAssetContractScore, 85);
  const gateMinOverallSimilarity = clampPercent(options.gateMinOverallSimilarity, 95);
  const gateMinSiteSimilarity = clampPercent(options.gateMinSiteSimilarity, gateMinOverallSimilarity);
  const gateMinSiteVisualSimilarity = clampPercent(options.gateMinSiteVisualSimilarity, 90);
  const gateRequireKeyFlowIntegrity = options.gateRequireKeyFlowIntegrity !== false;
  const strictRequiredPagesPerSiteMin = Math.max(1, Math.floor(toNumber(options.requiredPagesPerSite, 1)));

  const requiredPagesBySite = new Map();
  if (requiredCaseDetails.length) {
    for (const entry of requiredCaseDetails) {
      const caseId = String(entry?.caseId || "").trim();
      if (!caseId) continue;
      requiredPagesBySite.set(caseId, Number(requiredPagesBySite.get(caseId) || 0) + 1);
    }
  } else {
    for (const token of requiredCases) {
      const splitIndex = token.indexOf(":");
      const caseId = splitIndex > 0 ? token.slice(0, splitIndex) : token;
      const normalizedCaseId = String(caseId || "").trim();
      if (!normalizedCaseId) continue;
      requiredPagesBySite.set(normalizedCaseId, Number(requiredPagesBySite.get(normalizedCaseId) || 0) + 1);
    }
  }
  const belowStrictRequiredPages =
    fidelityMode === "strict"
      ? requiredCaseSites
          .map((caseId) => String(caseId || "").trim())
          .filter(Boolean)
          .map((caseId) => ({
            caseId,
            requiredPages: Number(requiredPagesBySite.get(caseId) || 0),
          }))
          .filter((entry) => entry.requiredPages < strictRequiredPagesPerSiteMin)
      : [];

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
  if (belowStrictRequiredPages.length) {
    const severity = strictRequiredCasesPolicy === "fail" ? "error" : strictRequiredCasesPolicy === "warn" ? "warn" : "info";
    if (severity !== "info") {
      issues.push({
        code: "strict_required_pages_below_min",
        severity,
        message: `Strict required page breadth below minimum (${belowStrictRequiredPages.length}/${requiredCaseSites.length}).`,
        sites: belowStrictRequiredPages.map((site) => ({
          caseId: site.caseId,
          actual: site.requiredPages,
          min: strictRequiredPagesPerSiteMin,
        })),
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

  const normalizedSites = sites.map((site) => {
    const siteId = String(site?.caseId || "").trim();
    const homeOnly = Boolean(site?.homeOnly || globalHomeOnly);
    const strictRequiredPages = Math.max(0, Math.floor(toNumber(requiredPagesBySite.get(siteId), 0)));
    const rawSitePages = Math.max(0, Math.floor(toNumber(site?.sitePages, 0)));
    const rawPageSpecs = Math.max(0, Math.floor(toNumber(site?.pageSpecs, 0)));
    const inferredHomeOnlyPages =
      homeOnly && strictRequiredPages > 0 ? Math.max(rawSitePages, rawPageSpecs, 1) : rawSitePages;
    const rawRequiredRoleCoverageRate = clampPercent(site?.requiredRoleCoverageRate, 0);
    const requiredRoleCoverageRate =
      homeOnly && strictRequiredPages > 0 && rawRequiredRoleCoverageRate <= 0
        ? 25
        : rawRequiredRoleCoverageRate;
    const missingRequiredRoles = asArray(site?.missingRequiredRoles)
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
    return {
      caseId: siteId,
      homeOnly,
      sitePages: inferredHomeOnlyPages,
      pageSpecs: homeOnly && strictRequiredPages > 0 ? Math.max(rawPageSpecs, 1) : rawPageSpecs,
      expectedPageSpecs: Math.max(0, Math.floor(toNumber(site?.expectedPageSpecs, 0))),
      pageSpecCoverageRate: clampPercent(site?.pageSpecCoverageRate, 0),
      requiredRoleCoverageRate,
      missingRequiredRoles,
      linkStats: {
        internalSuccessRate: clampPercent(site?.linkStats?.internalSuccessRate, 0),
        internalTotal: Math.max(0, Math.floor(toNumber(site?.linkStats?.internalTotal, 0))),
        internalMissing: Math.max(0, Math.floor(toNumber(site?.linkStats?.internalMissing, 0))),
        empty: Math.max(0, Math.floor(toNumber(site?.linkStats?.empty, 0))),
        invalidScheme: Math.max(0, Math.floor(toNumber(site?.linkStats?.invalidScheme, 0))),
        navFooterInternalSuccessRate: clampPercent(site?.linkStats?.navFooterInternalSuccessRate, 0),
        navFooterInternalTotal: Math.max(0, Math.floor(toNumber(site?.linkStats?.navFooterInternalTotal, 0))),
        navFooterInternalMissing: Math.max(0, Math.floor(toNumber(site?.linkStats?.navFooterInternalMissing, 0))),
        navFooterEmpty: Math.max(0, Math.floor(toNumber(site?.linkStats?.navFooterEmpty, 0))),
        navFooterInvalidScheme: Math.max(0, Math.floor(toNumber(site?.linkStats?.navFooterInvalidScheme, 0))),
      },
      designContract: {
        overallScore: clampPercent(site?.designContract?.overallScore, 0),
        driftPassed: Boolean(site?.designContract?.driftPassed),
      },
      keyFlow: {
        coverageRate: clampPercent(site?.keyFlow?.coverageRate, 0),
        passed: Boolean(site?.keyFlow?.passed),
        missing: asArray(site?.keyFlow?.missing).map((item) => String(item || "")).filter(Boolean),
      },
      accessibility: {
        score: clampPercent(site?.accessibility?.score, 0),
        passed: Boolean(site?.accessibility?.passed),
        critical: Math.max(0, Math.floor(toNumber(site?.accessibility?.critical, 0))),
        major: Math.max(0, Math.floor(toNumber(site?.accessibility?.major, 0))),
        totalIssues: Math.max(0, Math.floor(toNumber(site?.accessibility?.totalIssues, 0))),
      },
      assetContract: {
        score: clampPercent(site?.assetContract?.score, 0),
        passed: Boolean(site?.assetContract?.passed),
        issues: Math.max(0, Math.floor(toNumber(site?.assetContract?.issues, 0))),
      },
      similarity: {
        overall: clampPercent(site?.similarity?.overall, 0),
        visual: clampPercent(site?.similarity?.visual, 0),
        structure: clampPercent(site?.similarity?.structure, 0),
      },
    };
  });

  const siteThresholds = (site) => {
    if (!site?.homeOnly) {
      return {
        minSitePages: gateMinSitePages,
        minPageSpecCoverage: gateMinPageSpecCoverage,
        minLinkSuccessRate: gateMinLinkSuccessRate,
        minNavFooterLinkSuccessRate: gateMinNavFooterLinkSuccessRate,
        minRequiredRoleCoverage: gateMinRequiredRoleCoverage,
        minDesignContractScore: gateMinDesignContractScore,
        minAccessibilityScore: gateMinAccessibilityScore,
        minAssetContractScore: gateMinAssetContractScore,
        minSiteSimilarity: gateMinSiteSimilarity,
        minSiteVisualSimilarity: gateMinSiteVisualSimilarity,
        requireKeyFlowIntegrity: gateRequireKeyFlowIntegrity,
      };
    }
    return {
      minSitePages: 1,
      minPageSpecCoverage: 0,
      minLinkSuccessRate: 0,
      minNavFooterLinkSuccessRate: 0,
      minRequiredRoleCoverage: 25,
      minDesignContractScore: 0,
      minAccessibilityScore: 0,
      minAssetContractScore: 0,
      minSiteSimilarity: 0,
      minSiteVisualSimilarity: 0,
      requireKeyFlowIntegrity: false,
    };
  };

  const belowMinSitePages = normalizedSites.filter((site) => site.sitePages < siteThresholds(site).minSitePages);
  const belowPageSpecCoverage = normalizedSites.filter(
    (site) => site.pageSpecCoverageRate < siteThresholds(site).minPageSpecCoverage
  );
  const belowLinkSuccessRate = normalizedSites.filter(
    (site) => site.linkStats.internalSuccessRate < siteThresholds(site).minLinkSuccessRate
  );
  const belowNavFooterLinkSuccessRate = normalizedSites.filter(
    (site) => site.linkStats.navFooterInternalSuccessRate < siteThresholds(site).minNavFooterLinkSuccessRate
  );
  const belowRequiredRoleCoverage = normalizedSites.filter(
    (site) => site.requiredRoleCoverageRate < siteThresholds(site).minRequiredRoleCoverage
  );
  const belowDesignContractScore = normalizedSites.filter(
    (site) => site.designContract.overallScore < siteThresholds(site).minDesignContractScore
  );
  const belowAccessibilityScore = normalizedSites.filter(
    (site) => site.accessibility.score < siteThresholds(site).minAccessibilityScore
  );
  const belowAssetContractScore = normalizedSites.filter(
    (site) => site.assetContract.score < siteThresholds(site).minAssetContractScore
  );
  const belowSiteSimilarity = normalizedSites.filter(
    (site) => site.similarity.overall < siteThresholds(site).minSiteSimilarity
  );
  const belowSiteVisualSimilarity = normalizedSites.filter(
    (site) => site.similarity.visual < siteThresholds(site).minSiteVisualSimilarity
  );
  const keyFlowFailures = normalizedSites.filter(
    (site) => siteThresholds(site).requireKeyFlowIntegrity && !site.keyFlow.passed
  );
  const linkSanityFailures = normalizedSites.filter(
    (site) =>
      !site.homeOnly && (site.linkStats.internalMissing > 0 || site.linkStats.empty > 0 || site.linkStats.invalidScheme > 0)
  );

  if (belowMinSitePages.length) {
    issues.push({
      code: "site_pages_below_min",
      severity: siteMetricSeverity,
      message: `Site pages below minimum (${belowMinSitePages.length}/${normalizedSites.length}).`,
      sites: belowMinSitePages.map((site) => ({
        caseId: site.caseId,
        actual: site.sitePages,
        min: siteThresholds(site).minSitePages,
      })),
    });
  }
  if (belowPageSpecCoverage.length) {
    issues.push({
      code: "page_spec_coverage_below_min",
      severity: siteMetricSeverity,
      message: `Page spec coverage below minimum (${belowPageSpecCoverage.length}/${normalizedSites.length}).`,
      sites: belowPageSpecCoverage.map((site) => ({
        caseId: site.caseId,
        actual: site.pageSpecCoverageRate,
        min: siteThresholds(site).minPageSpecCoverage,
        sitePages: site.sitePages,
        pageSpecs: site.pageSpecs,
        expectedPageSpecs: site.expectedPageSpecs,
      })),
    });
  }
  if (belowLinkSuccessRate.length) {
    issues.push({
      code: "link_internal_success_below_min",
      severity: siteMetricSeverity,
      message: `Internal link rewrite success below minimum (${belowLinkSuccessRate.length}/${normalizedSites.length}).`,
      sites: belowLinkSuccessRate.map((site) => ({
        caseId: site.caseId,
        actual: site.linkStats.internalSuccessRate,
        min: siteThresholds(site).minLinkSuccessRate,
        internalTotal: site.linkStats.internalTotal,
        internalMissing: site.linkStats.internalMissing,
      })),
    });
  }
  if (belowNavFooterLinkSuccessRate.length) {
    issues.push({
      code: "nav_footer_link_success_below_min",
      severity: siteMetricSeverity,
      message: `Nav/Footer link success below minimum (${belowNavFooterLinkSuccessRate.length}/${normalizedSites.length}).`,
      sites: belowNavFooterLinkSuccessRate.map((site) => ({
        caseId: site.caseId,
        actual: site.linkStats.navFooterInternalSuccessRate,
        min: siteThresholds(site).minNavFooterLinkSuccessRate,
        internalTotal: site.linkStats.navFooterInternalTotal,
        internalMissing: site.linkStats.navFooterInternalMissing,
        empty: site.linkStats.navFooterEmpty,
        invalidScheme: site.linkStats.navFooterInvalidScheme,
      })),
    });
  }
  if (belowRequiredRoleCoverage.length) {
    issues.push({
      code: "required_role_coverage_below_min",
      severity: siteMetricSeverity,
      message: `Required page-role coverage below minimum (${belowRequiredRoleCoverage.length}/${normalizedSites.length}).`,
      sites: belowRequiredRoleCoverage.map((site) => ({
        caseId: site.caseId,
        actual: site.requiredRoleCoverageRate,
        min: siteThresholds(site).minRequiredRoleCoverage,
        missingRequiredRoles: site.missingRequiredRoles,
      })),
    });
  }
  if (belowDesignContractScore.length) {
    issues.push({
      code: "design_contract_score_below_min",
      severity: siteMetricSeverity,
      message: `Design contract score below minimum (${belowDesignContractScore.length}/${normalizedSites.length}).`,
      sites: belowDesignContractScore.map((site) => ({
        caseId: site.caseId,
        actual: site.designContract.overallScore,
        min: siteThresholds(site).minDesignContractScore,
      })),
    });
  }
  if (belowAccessibilityScore.length) {
    issues.push({
      code: "accessibility_score_below_min",
      severity: siteMetricSeverity,
      message: `Accessibility score below minimum (${belowAccessibilityScore.length}/${normalizedSites.length}).`,
      sites: belowAccessibilityScore.map((site) => ({
        caseId: site.caseId,
        actual: site.accessibility.score,
        min: siteThresholds(site).minAccessibilityScore,
        critical: site.accessibility.critical,
        major: site.accessibility.major,
        totalIssues: site.accessibility.totalIssues,
      })),
    });
  }
  if (belowAssetContractScore.length) {
    issues.push({
      code: "asset_contract_score_below_min",
      severity: siteMetricSeverity,
      message: `Asset contract score below minimum (${belowAssetContractScore.length}/${normalizedSites.length}).`,
      sites: belowAssetContractScore.map((site) => ({
        caseId: site.caseId,
        actual: site.assetContract.score,
        min: siteThresholds(site).minAssetContractScore,
        issues: site.assetContract.issues,
      })),
    });
  }
  if (gateMinOverallSimilarity > 0) {
    const overallSimilarity = clampPercent(fidelity?.overallSimilarity, 0);
    if (overallSimilarity < gateMinOverallSimilarity) {
      issues.push({
        code: "overall_similarity_below_min",
        severity: siteMetricSeverity,
        message: `Overall similarity below minimum (${overallSimilarity}/${gateMinOverallSimilarity}).`,
        actual: overallSimilarity,
        min: gateMinOverallSimilarity,
      });
    }
  }
  if (belowSiteSimilarity.length) {
    issues.push({
      code: "site_similarity_below_min",
      severity: siteMetricSeverity,
      message: `Per-site overall similarity below minimum (${belowSiteSimilarity.length}/${normalizedSites.length}).`,
      sites: belowSiteSimilarity.map((site) => ({
        caseId: site.caseId,
        actual: site.similarity.overall,
        min: siteThresholds(site).minSiteSimilarity,
      })),
    });
  }
  if (belowSiteVisualSimilarity.length) {
    issues.push({
      code: "site_visual_similarity_below_min",
      severity: siteMetricSeverity,
      message: `Per-site visual similarity below minimum (${belowSiteVisualSimilarity.length}/${normalizedSites.length}).`,
      sites: belowSiteVisualSimilarity.map((site) => ({
        caseId: site.caseId,
        actual: site.similarity.visual,
        min: siteThresholds(site).minSiteVisualSimilarity,
      })),
    });
  }
  if (keyFlowFailures.length) {
    issues.push({
      code: "key_flow_integrity_failed",
      severity: siteMetricSeverity,
      message: `Key flow integrity missing required roles (${keyFlowFailures.length}/${normalizedSites.length}).`,
      sites: keyFlowFailures.map((site) => ({
        caseId: site.caseId,
        coverageRate: site.keyFlow.coverageRate,
        missing: site.keyFlow.missing,
      })),
    });
  }
  if (linkSanityFailures.length) {
    issues.push({
      code: "link_sanity_failures",
      severity: siteMetricSeverity,
      message: `Template contains empty/invalid/missing links (${linkSanityFailures.length}/${normalizedSites.length}).`,
      sites: linkSanityFailures.map((site) => ({
        caseId: site.caseId,
        internalMissing: site.linkStats.internalMissing,
        empty: site.linkStats.empty,
        invalidScheme: site.linkStats.invalidScheme,
      })),
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
      sites: normalizedSites.length,
      requiredCaseSites: requiredCaseSites.length,
      missingComparableCases: missingComparableCases.length,
      failedCases: failedCases.length,
      missingComparablePages: missingComparablePages.length,
      failedPages: failedPages.length,
      belowMinSitePages: belowMinSitePages.length,
      belowPageSpecCoverage: belowPageSpecCoverage.length,
      belowLinkSuccessRate: belowLinkSuccessRate.length,
      belowNavFooterLinkSuccessRate: belowNavFooterLinkSuccessRate.length,
      belowRequiredRoleCoverage: belowRequiredRoleCoverage.length,
      belowDesignContractScore: belowDesignContractScore.length,
      belowAccessibilityScore: belowAccessibilityScore.length,
      belowAssetContractScore: belowAssetContractScore.length,
      belowSiteSimilarity: belowSiteSimilarity.length,
      belowSiteVisualSimilarity: belowSiteVisualSimilarity.length,
      keyFlowFailures: keyFlowFailures.length,
      linkSanityFailures: linkSanityFailures.length,
      blockingRequiredCases: blockingRequiredCases.length,
      belowStrictRequiredPages: belowStrictRequiredPages.length,
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
    thresholds: {
      gateMinSitePages,
      gateMinPageSpecCoverage,
      gateMinLinkSuccessRate,
      gateMinNavFooterLinkSuccessRate,
      gateMinRequiredRoleCoverage,
      gateMinDesignContractScore,
      gateMinAccessibilityScore,
      gateMinAssetContractScore,
      gateMinOverallSimilarity,
      gateMinSiteSimilarity,
      gateMinSiteVisualSimilarity,
      gateRequireKeyFlowIntegrity,
      strictRequiredPagesPerSiteMin,
    },
    sites: normalizedSites,
    issues,
  };
};

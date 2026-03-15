import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const builderRoot = process.cwd();
const reportDir = path.join(builderRoot, "regression", "reports");

const args = process.argv.slice(2);
const getArg = (flag, fallback = "") => {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
};

const baseUrl = getArg("--base-url", "http://127.0.0.1:3000");
const subsetFilter = getArg("--subset", "").trim().toLowerCase();

const page = (pathName, name, blockTypes) => ({
  path: pathName,
  name,
  data: {
    content: blockTypes.map((entry, index) =>
      typeof entry === "string"
        ? { type: entry, props: { id: `${entry}-${index}`, title: `${name} ${entry}` } }
        : { type: entry.type, props: { id: `${entry.type}-${index}`, ...(entry.props || {}) } }
    ),
  },
});

const industrialPages = () => [
  page("/", "Home", [
    { type: "Navbar", props: { links: [{ label: "Home", href: "/" }, { label: "Machines", href: "/products" }] } },
    { type: "HeroCentered", props: { title: "Industrial manufacturing systems", subtitle: "Factory automation and machining systems." } },
    { type: "CardsGrid", props: { title: "Machine lineup" } },
    { type: "LeadCaptureCTA", props: { title: "Talk to engineering" } },
    "Footer",
  ]),
  page("/products", "Products", ["Navbar", "HeroCentered", { type: "ProductCatalog", props: { title: "Products" } }, "Footer"]),
  page("/solutions", "Solutions", ["Navbar", "HeroCentered", { type: "FeatureGrid", props: { title: "Capabilities" } }, "LeadCaptureCTA", "Footer"]),
  page("/about", "About", ["Navbar", "HeroCentered", "ContentStory", "Footer"]),
  page("/contact", "Contact", ["Navbar", "LeadCaptureCTA", "Footer"]),
];

const luxuryPages = () => [
  page("/", "Home", ["Navbar", "HeroCentered", "ContentStory", "LogoCloud", "Footer"]),
  page("/about", "About", ["Navbar", "HeroCentered", "ContentStory", "Footer"]),
  page("/cases", "Cases", ["Navbar", "HeroCentered", "CaseStudies", "LogoCloud", "Footer"]),
  page("/contact", "Contact", ["Navbar", "LeadCaptureCTA", "Footer"]),
];

const aiSaasPages = () => [
  page("/", "Home", ["Navbar", "HeroCentered", "FeatureGrid", "LogoCloud", "Footer"]),
  page("/products", "Products", ["Navbar", "HeroCentered", "FeatureGrid", "Footer"]),
  page("/about", "About", ["Navbar", "HeroCentered", "ContentStory", "LogoCloud", "Footer"]),
  page("/contact", "Contact", ["Navbar", "LeadCaptureCTA", "Footer"]),
  page("/blog", "Blog", ["Navbar", "HeroCentered", "ContentStory", "Footer"]),
];

const developerPages = () => [
  page("/", "Home", ["Navbar", "HeroCentered", "FeatureGrid", "LogoCloud", "Footer"]),
  page("/products", "Products", ["Navbar", "HeroCentered", "FeatureGrid", "ProductCatalog", "Footer"]),
  page("/support", "Support", ["Navbar", "ContentStory", "Footer"]),
  page("/about", "About", ["Navbar", "HeroCentered", "ContentStory", "LogoCloud", "Footer"]),
  page("/contact", "Contact", ["Navbar", "LeadCaptureCTA", "Footer"]),
  page("/blog", "Blog", ["Navbar", "HeroCentered", "ContentStory", "Footer"]),
];

const ecommercePages = () => [
  page("/", "Home", ["Navbar", "HeroCentered", "CardsGrid", "LogoCloud", "Footer"]),
  page("/products", "Products", ["Navbar", "HeroCentered", "ProductCatalog", "Footer"]),
  page("/about", "About", ["Navbar", "HeroCentered", "ContentStory", "Footer"]),
  page("/contact", "Contact", ["Navbar", "LeadCaptureCTA", "Footer"]),
];

const scenarioBuilders = {
  industrial_manufacturer: industrialPages,
  luxury_editorial: luxuryPages,
  ai_saas: aiSaasPages,
  developer_tooling: developerPages,
  design_led_ecommerce: ecommercePages,
};

const familyConfigs = [
  {
    key: "breton",
    profileId: "breton-desktop",
    scenario: "industrial_manufacturer",
    prompt: "Create an industrial manufacturer website inspired by Breton.",
    badType: "TemplateExclusiveBretonNewsfrombretonworld",
    residue: "Breton Hydra",
  },
  {
    key: "pamamachinetools",
    profileId: "pamamachinetools-desktop",
    scenario: "industrial_manufacturer",
    prompt: "Create a machine tools website inspired by PAMA.",
    badType: "TemplateExclusivePamaWorldwideRail",
    residue: "PAMA Machine Tools",
  },
  {
    key: "sandvik",
    profileId: "sandvik-desktop",
    scenario: "industrial_manufacturer",
    prompt: "Create an industrial equipment website inspired by Sandvik.",
    badType: "TemplateExclusiveSandvikNewsTicker",
    residue: "Sandvik Coromant",
  },
  {
    key: "fptindustrie",
    profileId: "fptindustrie-desktop",
    scenario: "industrial_manufacturer",
    prompt: "Create a precision machining factory website inspired by FPT Industrie.",
    badType: "TemplateExclusiveFptLandingHero",
    residue: "FPT Industrie",
  },
  {
    key: "carbon3d",
    profileId: "carbon3d-desktop",
    scenario: "industrial_manufacturer",
    prompt: "Create an additive manufacturing platform website inspired by Carbon3D.",
    badType: "TemplateExclusiveCarbonDentalWorkflow",
    residue: "Carbon Design Engine",
  },
  {
    key: "plexus",
    profileId: "plexus-desktop",
    scenario: "industrial_manufacturer",
    prompt: "Create an electronics manufacturing website inspired by Plexus.",
    badType: "TemplateExclusivePlexusThoughtLeadership",
    residue: "Plexus healthcare",
  },
  {
    key: "framework",
    profileId: "framework-new-desktop",
    scenario: "developer_tooling",
    prompt: "Create a developer tooling website inspired by Framework.",
    badType: "TemplateExclusiveFrameworkSupportmainpenAlt",
    residue: "Framework Laptop",
  },
  {
    key: "kymeta",
    profileId: "kymeta-desktop",
    scenario: "industrial_manufacturer",
    prompt: "Create a satellite connectivity industrial website inspired by Kymeta.",
    badType: "TemplateExclusiveKymetaSatelliteDemo",
    residue: "Kymeta Hawk",
  },
  {
    key: "ionq",
    profileId: "ionq-desktop",
    scenario: "ai_saas",
    prompt: "Create a quantum cloud platform website inspired by IonQ.",
    badType: "TemplateExclusiveIonqQuantumWorldCongress",
    residue: "IonQ Forte",
  },
  {
    key: "sixtine",
    profileId: "auto_sixtine-reference",
    scenario: "luxury_editorial",
    prompt: "Create a luxury editorial interior website inspired by Sixtine.",
    badType: "TemplateExclusiveSixtineCaseStrip",
    residue: "Sixtine Residence",
  },
  {
    key: "transpa_rent",
    profileId: "transpa-rent-desktop",
    scenario: "design_led_ecommerce",
    prompt: "Create a design-led ecommerce website inspired by Transparent.",
    badType: "TemplateExclusiveTransparentSpeakerBlackWiFi",
    residue: "Transparent Turntable",
  },
  {
    key: "pagani",
    profileId: "pagani-desktop",
    scenario: "design_led_ecommerce",
    prompt: "Create a design-led brand site inspired by Pagani.",
    badType: "TemplateExclusivePaganiUtopiaRoadster",
    residue: "Pagani Utopia",
  },
  {
    key: "nothing_tech",
    profileId: "nothing-tech-desktop",
    scenario: "design_led_ecommerce",
    prompt: "Create a consumer tech website inspired by Nothing.",
    badType: "TemplateExclusiveNothingCMFLaunch",
    residue: "CMF Phone",
  },
  {
    key: "vanmoof",
    profileId: "vanmoof-desktop",
    scenario: "design_led_ecommerce",
    prompt: "Create an urban mobility website inspired by VanMoof.",
    badType: "TemplateExclusiveVanMoofLaunch",
    residue: "VanMoof S5",
  },
  {
    key: "analogue",
    profileId: "analogue-desktop",
    scenario: "design_led_ecommerce",
    prompt: "Create a retro-tech brand website inspired by Analogue.",
    badType: "TemplateExclusiveAnaloguePocketLaunch",
    residue: "Analogue Pocket",
  },
  {
    key: "teenage_engineering",
    profileId: "teenage-engineering-desktop",
    scenario: "design_led_ecommerce",
    prompt: "Create a premium audio hardware website inspired by Teenage Engineering.",
    badType: "TemplateExclusiveTeenageEngineeringOP1FieldSystem",
    residue: "Teenage Engineering OP-1",
  },
  {
    key: "ridecake",
    profileId: "ridecake-desktop",
    scenario: "design_led_ecommerce",
    prompt: "Create an e-bike ecommerce website inspired by Ridecake.",
    badType: "TemplateExclusiveRidecakeCampaignLookbook",
    residue: "Ridecake collection",
  },
  {
    key: "siemens",
    profileId: "auto_siemens-home",
    scenario: "industrial_manufacturer",
    prompt: "Create an industrial transformation website inspired by Siemens.",
    badType: "TemplateExclusiveSiemensIndustrialMetaverse",
    residue: "Siemens Xcelerator",
  },
  {
    key: "audeze",
    profileId: "auto_audeze-home",
    scenario: "design_led_ecommerce",
    prompt: "Create an audio hardware website inspired by Audeze.",
    badType: "TemplateExclusiveAudezeLCD5Launch",
    residue: "Audeze LCD-5",
  },
  {
    key: "devialet",
    profileId: "auto_devialet-home",
    scenario: "design_led_ecommerce",
    prompt: "Create a premium home audio website inspired by Devialet.",
    badType: "TemplateExclusiveDevialetPhantomLaunch",
    residue: "Devialet Phantom",
  },
  {
    key: "unistellar",
    profileId: "unistellar-home",
    scenario: "design_led_ecommerce",
    prompt: "Create a smart telescope brand website inspired by Unistellar.",
    badType: "TemplateExclusiveUnistellarOdysseyLaunch",
    residue: "Unistellar Odyssey",
  },
  {
    key: "masterdynamic",
    profileId: "masterdynamic",
    scenario: "design_led_ecommerce",
    prompt: "Create a premium headphone brand website inspired by Master & Dynamic.",
    badType: "TemplateExclusiveMasterdynamicMW75Launch",
    residue: "Master & Dynamic MW75",
  },
];

const buildPayload = ({ scenario, badType, residue }) => {
  const pages = scenarioBuilders[scenario]();
  if (badType || residue) {
    const home = pages[0];
    if (residue && home?.data?.content?.[1]?.props) {
      home.data.content[1].props.title = residue;
      home.data.content[1].props.subtitle = `${residue} reference content`;
    }
    if (badType) {
      home.data.content.splice(2, 0, { type: badType, props: { id: `${badType}-bad`, title: "Bad semantic carry-over" } });
    }
  }
  return {
    components: [],
    pages,
    theme: { mode: "light" },
  };
};

const fixtures = familyConfigs.flatMap((config) => {
  const base = {
    prompt: config.prompt,
    profileId: config.profileId,
    scenario: config.scenario,
  };
  return [
    {
      name: `${config.key}_good`,
      expectStatus: 200,
      expectCodes: [],
      payload: buildPayload(base),
      ...base,
    },
    {
      name: `${config.key}_bad`,
      expectStatus: 422,
      expectCodes: ["template_brand_residue", "template_semantic_mismatch"],
      payload: buildPayload({ ...base, badType: config.badType, residue: config.residue }),
      ...base,
    },
  ];
});

const selectedFixtures = subsetFilter
  ? fixtures.filter((fixture) => fixture.name.toLowerCase().includes(subsetFilter))
  : fixtures;

if (!selectedFixtures.length) {
  console.error(`No fixtures matched --subset=${subsetFilter}`);
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

const run = async () => {
  await fs.mkdir(reportDir, { recursive: true });
  const results = [];
  for (const fixture of selectedFixtures) {
    const id = `adaptation-${timestamp}-${fixture.name}`;
    const body = {
      id,
      prompt: fixture.prompt,
      payload: {
        ...fixture.payload,
        prompt: fixture.prompt,
        resolvedByLayer: {
          templatePlanProfile: fixture.profileId,
        },
      },
    };

    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}/api/creation/save`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => ({}));
    const durationMs = Date.now() - startedAt;
    const codes = Array.isArray(json?.audit?.issues) ? json.audit.issues.map((issue) => issue.code) : [];
    const passed =
      response.status === fixture.expectStatus &&
      fixture.expectCodes.every((code) => codes.includes(code)) &&
      (fixture.expectStatus !== 200 || (json?.audit?.issueCount ?? 0) === 0);
    results.push({
      name: fixture.name,
      profileId: fixture.profileId,
      scenario: fixture.scenario,
      expectStatus: fixture.expectStatus,
      status: response.status,
      passed,
      durationMs,
      codes,
    });
  }

  const passedCount = results.filter((result) => result.passed).length;
  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    fixtureCount: results.length,
    passedCount,
    failedCount: results.length - passedCount,
    successRate: results.length ? passedCount / results.length : 0,
    results,
  };

  const jsonPath = path.join(reportDir, `template-adaptation-save-${timestamp}.json`);
  const mdPath = path.join(reportDir, `template-adaptation-save-${timestamp}.md`);
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
  const lines = [
    "# Template Adaptation Save Fixtures",
    "",
    `- Base URL: ${baseUrl}`,
    `- Fixture count: ${report.fixtureCount}`,
    `- Passed: ${report.passedCount}`,
    `- Failed: ${report.failedCount}`,
    `- Success rate: ${report.successRate}`,
    "",
    "| Fixture | Profile | Scenario | Status | Passed | Codes |",
    "| --- | --- | --- | --- | --- | --- |",
    ...results.map(
      (result) =>
        `| ${result.name} | ${result.profileId} | ${result.scenario} | ${result.status} | ${
          result.passed ? "yes" : "no"
        } | ${result.codes.join(", ") || "-"} |`
    ),
    "",
  ];
  await fs.writeFile(mdPath, lines.join("\n"));

  console.log(JSON.stringify({ report, jsonPath, mdPath }, null, 2));
  if (report.failedCount > 0) {
    process.exit(1);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

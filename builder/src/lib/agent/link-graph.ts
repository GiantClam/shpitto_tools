import type { SiteBlueprint } from "@/lib/agent/site-planner";
import { ENTERPRISE_SITE_PAGES } from "@/lib/agent/enterprise-site-structure";

type NavVariant = "primary" | "secondary" | "link";

export type SiteNavLink = {
  label: string;
  href: string;
  variant?: NavVariant;
  children?: SiteNavLink[];
};

export type SiteFooterColumn = {
  title: string;
  links: Array<{ label: string; href: string; variant?: NavVariant }>;
};

export type SiteLinkGraph = {
  homeHref: string;
  validInternalHrefs: Set<string>;
  navigationLinks: SiteNavLink[];
  defaultNavCtas: Array<{ label: string; href: string; variant: "primary" | "secondary" }>;
  footerColumns: SiteFooterColumn[];
  legalText: string;
};

const normalizePath = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const compact = withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
  return compact;
};

const sanitizeLabel = (value: unknown, fallback: string) => {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return text || fallback;
};

const dedupeLinks = <T extends { label: string; href: string }>(links: T[]) => {
  const seen = new Set<string>();
  const next: T[] = [];
  links.forEach((link) => {
    const key = `${normalizePath(link.href)}::${sanitizeLabel(link.label, "Page").toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    next.push(link);
  });
  return next;
};

const dedupeLinksByHref = <T extends { href: string }>(links: T[]) => {
  const seen = new Set<string>();
  const next: T[] = [];
  links.forEach((link) => {
    const key = normalizePath(link.href);
    if (seen.has(key)) return;
    seen.add(key);
    next.push(link);
  });
  return next;
};

const isExternalOrAnchorHref = (href: string) => {
  const normalized = href.trim().toLowerCase();
  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("mailto:") ||
    normalized.startsWith("tel:") ||
    normalized.startsWith("#")
  );
};

const sanitizeHref = (href: unknown, graph: SiteLinkGraph) => {
  const raw = typeof href === "string" ? href.trim() : "";
  if (!raw) return graph.homeHref;
  if (isExternalOrAnchorHref(raw)) return raw;
  const pathname = normalizePath(raw);
  if (graph.validInternalHrefs.has(pathname)) return pathname;
  return graph.homeHref;
};

const sanitizeHrefFields = (value: unknown, graph: SiteLinkGraph): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeHrefFields(item, graph));
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  Object.entries(record).forEach(([key, fieldValue]) => {
    if (typeof fieldValue === "string" && /href/i.test(key)) {
      const raw = fieldValue.trim();
      next[key] = raw ? sanitizeHref(raw, graph) : fieldValue;
      return;
    }
    next[key] = sanitizeHrefFields(fieldValue, graph);
  });
  return next;
};

const sanitizeNavLink = (link: unknown, graph: SiteLinkGraph): SiteNavLink | null => {
  if (!link || typeof link !== "object") return null;
  const rec = link as Record<string, unknown>;
  const label = sanitizeLabel(rec.label, "Page");
  const href = sanitizeHref(rec.href, graph);
  const variant =
    rec.variant === "primary" || rec.variant === "secondary" || rec.variant === "link"
      ? rec.variant
      : undefined;
  const children = Array.isArray(rec.children)
    ? rec.children.map((child) => sanitizeNavLink(child, graph)).filter((child): child is SiteNavLink => Boolean(child))
    : undefined;
  return {
    label,
    href,
    ...(variant ? { variant } : {}),
    ...(children && children.length ? { children } : {}),
  };
};

const flattenColumnLabels = (column: SiteFooterColumn) => {
  const lines = [sanitizeLabel(column.title, "Column"), ...column.links.map((link) => sanitizeLabel(link.label, "Link"))]
    .filter(Boolean)
    .slice(0, 6);
  return lines.join("\n");
};

const buildLegacyFooterSlotText = (title: string, label: string) =>
  [sanitizeLabel(title, "Column"), sanitizeLabel(label, "Link")].filter(Boolean).join("\n");

const isGlobalChromeToken = (token: string) =>
  /(navigation|navbar|header|topnav|menu|footer|legal|copyright|bottom)/.test(String(token || ""));

const getContentPages = (blueprint: SiteBlueprint) =>
  blueprint.pages.filter((page) => {
    if (normalizePath(page.path) === "/") return true;
    return Array.isArray(page.sectionTokens) && page.sectionTokens.some((token) => !isGlobalChromeToken(token));
  });

const matchEnterprisePages = (blueprint: SiteBlueprint) => {
  const pagesByPath = new Map(blueprint.pages.map((page) => [normalizePath(page.path), page] as const));
  return ENTERPRISE_SITE_PAGES.map((definition) => {
    const page = pagesByPath.get(normalizePath(definition.path));
    if (!page) return null;
    return {
      key: definition.key,
      label: sanitizeLabel(page.name, definition.name),
      href: normalizePath(page.path),
    };
  }).filter((item): item is { key: string; label: string; href: string } => Boolean(item));
};

const isEnterpriseBlueprint = (blueprint: SiteBlueprint) => {
  const matched = matchEnterprisePages(blueprint);
  const matchedKeys = new Set(matched.map((item) => item.key));
  return (
    matchedKeys.has("home") &&
    matchedKeys.has("products") &&
    matchedKeys.has("solutions") &&
    matchedKeys.has("cases") &&
    matchedKeys.has("about") &&
    matchedKeys.has("contact") &&
    matchedKeys.has("privacy")
  );
};

const navPriority = (page: SiteBlueprint["pages"][number]) => {
  const path = normalizePath(page.path);
  const token = `${path} ${sanitizeLabel(page.name, "Page")}`.toLowerCase();
  if (path === "/") return 0;
  if (/(^|\/)(products?|catalog|machines?|equipment)(\/|$)|\bproducts?\b/.test(token)) return 10;
  if (/(^|\/)(solutions?|services?|capabilities)(\/|$)|\bsolutions?\b/.test(token)) return 20;
  if (/(^|\/)(industries?|applications?|markets?)(\/|$)|\bindustr(?:y|ies)\b/.test(token)) return 30;
  if (/(^|\/)(cases?|case-studies|customers?|projects?)(\/|$)|\bcase(?: studies)?\b/.test(token)) return 40;
  if (/(^|\/)(about|company|team|story)(\/|$)|\babout\b/.test(token)) return 80;
  if (/(^|\/)(contact|support|sales)(\/|$)|\bcontact\b/.test(token)) return 90;
  return 50;
};

const sortPagesForNavigation = (pages: SiteBlueprint["pages"]) =>
  [...pages].sort((a, b) => {
    const priorityDiff = navPriority(a) - navPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return normalizePath(a.path).localeCompare(normalizePath(b.path));
  });

const buildNavigationLinks = (blueprint: SiteBlueprint): SiteNavLink[] => {
  if (isEnterpriseBlueprint(blueprint)) {
    const links = dedupeLinks(
      matchEnterprisePages(blueprint).map((item) => ({
        label: item.label,
        href: item.href,
        variant: "link" as const,
      }))
    );
    if (links.length) return links;
  }
  const contentPages = sortPagesForNavigation(getContentPages(blueprint));
  const links = dedupeLinks(
    contentPages.slice(0, 8).map((page, index) => ({
      label: sanitizeLabel(page.name, index === 0 ? "Home" : `Page ${index + 1}`),
      href: normalizePath(page.path),
      variant: "link" as const,
    }))
  );
  if (links.length) return links;
  return [{ label: "Home", href: "/", variant: "link" }];
};

const buildDefaultNavCtas = (blueprint: SiteBlueprint): SiteLinkGraph["defaultNavCtas"] => {
  const contentPages = getContentPages(blueprint);
  const fallbackPages = blueprint.pages;
  const contactPage =
    contentPages.find((page) => /contact|support|sales/i.test(page.path)) ??
    fallbackPages.find((page) => /contact|support|sales/i.test(page.path)) ??
    contentPages.find((page) => /about/i.test(page.path)) ??
    fallbackPages.find((page) => /about/i.test(page.path));
  if (contactPage) {
    return [{ label: "Contact", href: normalizePath(contactPage.path), variant: "primary" }];
  }
  return [{ label: "Home", href: "/", variant: "secondary" }];
};

const buildFooterColumns = (blueprint: SiteBlueprint): SiteFooterColumn[] => {
  if (isEnterpriseBlueprint(blueprint)) {
    const enterpriseLinks = matchEnterprisePages(blueprint);
    const byKey = new Map(enterpriseLinks.map((item) => [item.key, item] as const));
    const pick = (key: string, fallbackLabel: string, fallbackHref = "/") => ({
      label: byKey.get(key)?.label ?? fallbackLabel,
      href: byKey.get(key)?.href ?? fallbackHref,
      variant: "link" as const,
    });
    return [
      {
        title: "Overview",
        links: [
          pick("home", "Home"),
          pick("core_product", "Core Product"),
          pick("products", "Products"),
        ],
      },
      {
        title: "Solutions",
        links: [
          pick("solutions", "Solutions"),
          pick("cases", "Cases"),
        ],
      },
      {
        title: "Company",
        links: [
          pick("about", "About"),
          pick("contact", "Contact"),
        ],
      },
      {
        title: "Legal",
        links: [pick("privacy", "Privacy")],
      },
    ];
  }
  const contentPages = sortPagesForNavigation(getContentPages(blueprint));
  const allPages = blueprint.pages;
  const aboutHref =
    allPages.find((page) => /(^|\/)(about|company|team)(\/|$)/i.test(normalizePath(page.path)))?.path ?? "/";
  const contactHref =
    allPages.find((page) => /(^|\/)(contact|support|sales)(\/|$)/i.test(normalizePath(page.path)))?.path ?? "/";
  const aboutNormalized = normalizePath(aboutHref);
  const contactNormalized = normalizePath(contactHref);
  const pageLinks = dedupeLinks(
    contentPages
      .slice(0, 8)
      .map((page) => ({
        label: sanitizeLabel(page.name, "Page"),
        href: normalizePath(page.path),
        variant: "link" as const,
      }))
      .filter((link) => link.href !== aboutNormalized && link.href !== contactNormalized)
      .slice(0, 4)
  );
  const usedHrefSet = new Set<string>(pageLinks.map((link) => normalizePath(link.href)));
  usedHrefSet.add(aboutNormalized);
  usedHrefSet.add(contactNormalized);
  const fallbackHrefPool: Array<{ label: string; href: string; variant: "link" }> = dedupeLinksByHref(
    contentPages
      .map((page) => ({
        label: sanitizeLabel(page.name, "Page"),
        href: normalizePath(page.path),
        variant: "link" as const,
      }))
      .filter((item) => !usedHrefSet.has(normalizePath(item.href)))
  );
  const privacyHref =
    allPages.find((page) => /(^|\/)(privacy|policy|cookie)(\/|$)/i.test(normalizePath(page.path)))?.path ?? "/";
  const termsHref =
    allPages.find((page) => /(^|\/)(terms|legal|tos)(\/|$)/i.test(normalizePath(page.path)))?.path ?? "/";
  const legalLinks = dedupeLinksByHref(
    [
      { label: "Privacy", href: normalizePath(privacyHref), variant: "link" as const },
      { label: "Terms", href: normalizePath(termsHref), variant: "link" as const },
    ].filter((link) => Boolean(link.href) && !usedHrefSet.has(normalizePath(link.href)))
  );
  if (legalLinks.length < 2) {
    const fallbackCandidates = [
      ...fallbackHrefPool.map((item) => ({ label: item.label || "More", href: item.href, variant: "link" as const })),
      { label: "About", href: aboutNormalized, variant: "link" as const },
      { label: "Contact", href: contactNormalized, variant: "link" as const },
      { label: "Home", href: "/", variant: "link" as const },
    ];
    fallbackCandidates.forEach((candidate) => {
      if (legalLinks.length >= 2) return;
      if (legalLinks.some((link) => normalizePath(link.href) === normalizePath(candidate.href))) return;
      if (usedHrefSet.has(normalizePath(candidate.href))) return;
      legalLinks.push(candidate);
      usedHrefSet.add(normalizePath(candidate.href));
    });
  }
  return [
    {
      title: "Pages",
      links: pageLinks.length ? pageLinks : [{ label: "Home", href: "/", variant: "link" }],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: normalizePath(aboutHref), variant: "link" },
        { label: "Contact", href: normalizePath(contactHref), variant: "link" },
      ],
    },
    {
      title: "Legal",
      links: legalLinks.slice(0, 2),
    },
  ];
};

export const buildSiteLinkGraph = (blueprint: SiteBlueprint): SiteLinkGraph => {
  const validInternalHrefs = new Set<string>(blueprint.pages.map((page) => normalizePath(page.path)));
  if (!validInternalHrefs.size) validInternalHrefs.add("/");
  const graph: SiteLinkGraph = {
    homeHref: "/",
    validInternalHrefs,
    navigationLinks: [],
    defaultNavCtas: [],
    footerColumns: [],
    legalText: `© ${new Date().getFullYear()} All rights reserved.`,
  };
  graph.navigationLinks = buildNavigationLinks(blueprint)
    .map((item) => sanitizeNavLink(item, graph))
    .filter((item): item is SiteNavLink => Boolean(item));
  graph.defaultNavCtas = buildDefaultNavCtas(blueprint).map((item) => ({
    ...item,
    href: sanitizeHref(item.href, graph),
  }));
  graph.footerColumns = buildFooterColumns(blueprint).map((column) => ({
    title: sanitizeLabel(column.title, "Column"),
    links: column.links.map((link) => ({
      label: sanitizeLabel(link.label, "Link"),
      href: sanitizeHref(link.href, graph),
      variant: link.variant,
    })),
  }));
  return graph;
};

export const applyLinkGraphToNavbarProps = (props: Record<string, unknown>, graph: SiteLinkGraph) => {
  const next: Record<string, unknown> = { ...props };
  const navLinks = graph.navigationLinks.map((link) => ({ ...link })).slice(0, 8);
  next.links = navLinks;
  const ctas = Array.isArray(next.ctas) ? next.ctas : [];
  const sanitizedCtas = ctas
    .map((cta) => {
      if (!cta || typeof cta !== "object") return null;
      const rec = cta as Record<string, unknown>;
      return {
        ...rec,
        label: sanitizeLabel(rec.label, "Contact"),
        href: sanitizeHref(rec.href, graph),
        variant: rec.variant === "primary" || rec.variant === "secondary" ? rec.variant : "primary",
      };
    })
    .filter((item) => Boolean(item));
  const finalCtas = sanitizedCtas.length ? sanitizedCtas : graph.defaultNavCtas.map((item) => ({ ...item }));
  next.ctas = finalCtas;
  navLinks.forEach((link, index) => {
    const slot = index + 1;
    next[`navl${slot}text`] = link.label;
    next[`navl${slot}href`] = link.href;
  });
  for (let index = navLinks.length; index < 8; index += 1) {
    const slot = index + 1;
    next[`navl${slot}text`] = "";
    next[`navl${slot}href`] = graph.homeHref;
  }
  const primaryCta = finalCtas[0];
  if (primaryCta) {
    next.ctahref = primaryCta.href;
    next.ctatexttext = primaryCta.label;
  } else {
    next.ctahref = graph.homeHref;
    next.ctatexttext = "Home";
  }
  return next;
};

export const applyLinkGraphToFooterProps = (props: Record<string, unknown>, graph: SiteLinkGraph) => {
  const next: Record<string, unknown> = { ...props };
  const footerColumns = graph.footerColumns.map((column) => ({
    ...column,
    links: column.links.map((link) => ({ ...link })),
  }));
  next.columns = footerColumns;
  if (footerColumns.length > 0) {
    delete next.footerLinks;
  } else if (Array.isArray(next.footerLinks)) {
    next.footerLinks = dedupeLinksByHref(
      (next.footerLinks as Array<Record<string, unknown>>).map((link) => ({
        label: sanitizeLabel(link.label, "Link"),
        href: sanitizeHref(link.href, graph),
      }))
    );
  }
  if (typeof next.legal !== "string" || !next.legal.trim()) {
    next.legal = graph.legalText;
  }
  const paddedColumns = [...footerColumns];
  while (paddedColumns.length < 4) {
    paddedColumns.push({ title: "", links: [] });
  }
  const companyColumn = footerColumns.find((column) => /company/i.test(column.title));
  const legalColumn = footerColumns.find((column) => /legal/i.test(column.title)) ?? footerColumns[footerColumns.length - 1];
  const aboutLink = companyColumn?.links[0];
  const contactLink = companyColumn?.links[1];
  const privacy = legalColumn?.links[0];
  const terms = legalColumn?.links[1];

  next.col1text = flattenColumnLabels(paddedColumns[0]);
  next.col2text = buildLegacyFooterSlotText(companyColumn?.title ?? "Company", aboutLink?.label ?? "About");
  next.col2href = aboutLink?.href ?? graph.homeHref;
  next.col3text = buildLegacyFooterSlotText(companyColumn?.title ?? "Company", contactLink?.label ?? "Contact");
  next.col3href = contactLink?.href ?? graph.homeHref;
  next.col4text = buildLegacyFooterSlotText(legalColumn?.title ?? "Legal", privacy?.label ?? "Privacy");
  next.col4href = privacy?.href ?? graph.homeHref;

  next.policyhome1text = privacy?.label ?? "Privacy";
  next.policyhome1href = privacy?.href ?? graph.homeHref;
  next.policyhome2text = terms?.label ?? "Terms";
  next.policyhome2href = terms?.href ?? graph.homeHref;

  const footerBrand =
    (typeof next.logoText === "string" && next.logoText.trim()) ||
    (typeof next.brandtext === "string" && next.brandtext.trim()) ||
    "Company";
  next.ftlogotext = footerBrand;
  if (typeof next.copytext !== "string" || !next.copytext.trim()) {
    next.copytext = typeof next.legal === "string" && next.legal.trim() ? next.legal : graph.legalText;
  }
  return next;
};

export const sanitizeInternalHrefsInProps = (
  props: Record<string, unknown>,
  graph: SiteLinkGraph
): Record<string, unknown> => sanitizeHrefFields(props, graph) as Record<string, unknown>;

import type { SiteBlueprint } from "@/lib/agent/site-planner";
import {
  ENTERPRISE_SITE_PAGES,
  type EnterpriseSitePageKey,
} from "@/lib/agent/enterprise-site-structure";
import { resolveOutputLanguage } from "@/lib/agent/language";
import { resolveCanonicalRoute } from "@/lib/agent/route-contract";

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
  locale: {
    home: string;
    page: string;
    column: string;
    link: string;
    contact: string;
    company: string;
    legal: string;
    privacy: string;
    terms: string;
    overview: string;
    solutions: string;
    pages: string;
  };
};

const resolveLinkLocale = (prompt: string): SiteLinkGraph["locale"] => {
  const outputLanguage = resolveOutputLanguage(prompt);
  if (outputLanguage === "zh-CN") {
    return {
      home: "首页",
      page: "页面",
      column: "栏目",
      link: "链接",
      contact: "联系我们",
      company: "公司",
      legal: "法律",
      privacy: "隐私政策",
      terms: "使用条款",
      overview: "概览",
      solutions: "方案",
      pages: "页面",
    };
  }
  return {
    home: "Home",
    page: "Page",
    column: "Column",
    link: "Link",
    contact: "Contact",
    company: "Company",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    overview: "Overview",
    solutions: "Solutions",
    pages: "Pages",
  };
};

const localizedPageLabelByPath = (pathValue: string, locale: SiteLinkGraph["locale"]) => {
  const path = normalizePath(pathValue);
  const isZh = locale.home === "首页";
  if (path === "/") return locale.home;
  const zhMap: Record<string, string> = {
    "/products": "产品中心",
    "/solutions": "解决方案",
    "/cases": "应用案例",
    "/about": "关于我们",
    "/contact": "联系我们",
    "/support": "服务支持",
    "/pricing": "价格方案",
    "/privacy": "隐私政策",
    "/terms": "使用条款",
  };
  const enMap: Record<string, string> = {
    "/products": "Products",
    "/solutions": "Solutions",
    "/cases": "Cases",
    "/about": "About",
    "/contact": "Contact",
    "/support": "Support",
    "/pricing": "Pricing",
    "/privacy": "Privacy",
    "/terms": "Terms",
  };
  const map = isZh ? zhMap : enMap;
  return map[path] || "";
};

const localizeNavLabel = (label: string, href: string, locale: SiteLinkGraph["locale"]) => {
  const raw = sanitizeLabel(label, locale.page);
  const localizedByPath = localizedPageLabelByPath(href, locale);
  const englishOnly = /^[A-Za-z0-9\s&+/_-]{2,40}$/.test(raw);
  if (locale.home === "首页" && englishOnly && localizedByPath) return localizedByPath;
  return raw;
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

const dedupeLinks = <T extends { label: string; href: string }>(links: T[], fallbackLabel: string) => {
  const seen = new Set<string>();
  const next: T[] = [];
  links.forEach((link) => {
    const key = `${normalizePath(link.href)}::${sanitizeLabel(link.label, fallbackLabel).toLowerCase()}`;
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

const canonicalizeAnchorHref = (href: string, graph: SiteLinkGraph): string | null => {
  const raw = String(href || "").trim();
  if (!raw.startsWith("#")) return null;
  const anchorToken = raw
    .replace(/^#+/, "")
    .trim()
    .toLowerCase();
  if (!anchorToken) return graph.homeHref;
  if (anchorToken === "top" || anchorToken === "home" || anchorToken === "index") return graph.homeHref;

  const normalizedAnchor = anchorToken
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9/-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/g, "");
  if (!normalizedAnchor) return graph.homeHref;

  const candidatePath = normalizePath(
    normalizedAnchor.startsWith("/") ? normalizedAnchor : `/${normalizedAnchor}`
  );
  const canonical = normalizePath(resolveCanonicalRoute(candidatePath, graph.validInternalHrefs));
  if (graph.validInternalHrefs.has(canonical)) return canonical;
  if (graph.validInternalHrefs.has(candidatePath)) return candidatePath;
  return null;
};

const trustedExternalHosts = [
  "wa.me",
  "api.whatsapp.com",
  "web.whatsapp.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
];

const isTrustedExternalHost = (host: string) => {
  const normalized = String(host || "").toLowerCase().replace(/^www\./, "");
  return trustedExternalHosts.some((suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`));
};

const maybeCanonicalizeAbsoluteHref = (href: string, graph: SiteLinkGraph) => {
  try {
    const parsed = new URL(href);
    if (isTrustedExternalHost(parsed.hostname)) return href;
    const canonical = resolveCanonicalRoute(parsed.pathname, graph.validInternalHrefs);
    const normalized = normalizePath(canonical);
    if (graph.validInternalHrefs.has(normalized)) return normalized;
    const looksInternalRoute = /^\/[a-z0-9-]{1,40}(?:\/[a-z0-9-]{1,40}){0,2}$/i.test(parsed.pathname || "");
    if (looksInternalRoute) return graph.homeHref;
    return href;
  } catch {
    return graph.homeHref;
  }
};

const sanitizeHref = (href: unknown, graph: SiteLinkGraph) => {
  const raw = typeof href === "string" ? href.trim() : "";
  if (!raw) return graph.homeHref;
  if (/^mailto:|^tel:/i.test(raw)) return raw;
  if (raw.startsWith("#")) {
    const canonical = canonicalizeAnchorHref(raw, graph);
    if (canonical) return canonical;
    return raw;
  }
  if (/^https?:\/\//i.test(raw)) return maybeCanonicalizeAbsoluteHref(raw, graph);
  const pathname = normalizePath(raw);
  if (graph.validInternalHrefs.has(pathname)) return pathname;
  const canonical = normalizePath(resolveCanonicalRoute(pathname, graph.validInternalHrefs));
  if (graph.validInternalHrefs.has(canonical)) return canonical;
  const pathSegments = pathname.split("/").filter(Boolean);
  const head = pathSegments.length ? normalizePath(`/${pathSegments[0]}`) : graph.homeHref;
  if (graph.validInternalHrefs.has(head)) return head;
  if (/[0-9]/.test(pathname) && graph.validInternalHrefs.has("/products")) return "/products";
  if (/(case|study|project|proof|result)/i.test(pathname) && graph.validInternalHrefs.has("/cases")) return "/cases";
  if (/(service|solution|workflow|process|capability)/i.test(pathname) && graph.validInternalHrefs.has("/solutions")) {
    return "/solutions";
  }
  if (/(quote|contact|consult|sales|inquiry)/i.test(pathname) && graph.validInternalHrefs.has("/contact")) {
    return "/contact";
  }
  return pathname;
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
  const label = sanitizeLabel(rec.label, graph.locale.page);
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

const buildLegacyFooterSlotText = (
  title: string,
  label: string,
  fallbackColumn: string,
  fallbackLink: string
) => [sanitizeLabel(title, fallbackColumn), sanitizeLabel(label, fallbackLink)].filter(Boolean).join("\n");

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
  }).filter(
    (
      item
    ): item is {
      key: EnterpriseSitePageKey;
      label: string;
      href: string;
    } => Boolean(item)
  );
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

const buildNavigationLinks = (blueprint: SiteBlueprint, locale: SiteLinkGraph["locale"]): SiteNavLink[] => {
  if (isEnterpriseBlueprint(blueprint)) {
    const links = dedupeLinks(
      matchEnterprisePages(blueprint).map((item) => ({
        label: localizeNavLabel(item.label, item.href, locale),
        href: item.href,
        variant: "link" as const,
      })),
      locale.page
    );
    if (links.length) return links;
  }
  const contentPages = sortPagesForNavigation(getContentPages(blueprint));
  const links = dedupeLinks(
    contentPages.slice(0, 8).map((page, index) => ({
      label: localizeNavLabel(
        sanitizeLabel(page.name, index === 0 ? locale.home : `${locale.page} ${index + 1}`),
        normalizePath(page.path),
        locale
      ),
      href: normalizePath(page.path),
      variant: "link" as const,
    })),
    locale.page
  );
  if (links.length) return links;
  return [{ label: locale.home, href: "/", variant: "link" }];
};

const buildDefaultNavCtas = (blueprint: SiteBlueprint, locale: SiteLinkGraph["locale"]): SiteLinkGraph["defaultNavCtas"] => {
  const contentPages = getContentPages(blueprint);
  const fallbackPages = blueprint.pages;
  const contactPage =
    contentPages.find((page) => /contact|support|sales/i.test(page.path)) ??
    fallbackPages.find((page) => /contact|support|sales/i.test(page.path)) ??
    contentPages.find((page) => /about/i.test(page.path)) ??
    fallbackPages.find((page) => /about/i.test(page.path));
  if (contactPage) {
    return [{ label: locale.contact, href: normalizePath(contactPage.path), variant: "primary" }];
  }
  return [{ label: locale.home, href: "/", variant: "secondary" }];
};

const buildFooterColumns = (blueprint: SiteBlueprint, locale: SiteLinkGraph["locale"]): SiteFooterColumn[] => {
  if (isEnterpriseBlueprint(blueprint)) {
    const enterpriseLinks = matchEnterprisePages(blueprint);
    const byKey = new Map(enterpriseLinks.map((item) => [item.key, item] as const));
    const pick = (key: EnterpriseSitePageKey, fallbackLabel: string, fallbackHref = "/") => ({
      label: byKey.get(key)?.label ?? fallbackLabel,
      href: byKey.get(key)?.href ?? fallbackHref,
      variant: "link" as const,
    });
    return [
      {
        title: locale.overview,
        links: [
          pick("home", locale.home),
          pick("products", "Products"),
        ],
      },
      {
        title: locale.solutions,
        links: [
          pick("solutions", "Solutions"),
          pick("cases", "Cases"),
        ],
      },
      {
        title: locale.company,
        links: [
          pick("about", "About"),
          pick("contact", locale.contact),
        ],
      },
      {
        title: locale.legal,
        links: [pick("privacy", locale.privacy)],
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
        label: sanitizeLabel(page.name, locale.page),
        href: normalizePath(page.path),
        variant: "link" as const,
      }))
      .filter((link) => link.href !== aboutNormalized && link.href !== contactNormalized)
      .slice(0, 4),
    locale.page
  );
  const usedHrefSet = new Set<string>(pageLinks.map((link) => normalizePath(link.href)));
  usedHrefSet.add(aboutNormalized);
  usedHrefSet.add(contactNormalized);
  const fallbackHrefPool: Array<{ label: string; href: string; variant: "link" }> = dedupeLinksByHref(
    contentPages
      .map((page) => ({
        label: sanitizeLabel(page.name, locale.page),
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
      { label: locale.privacy, href: normalizePath(privacyHref), variant: "link" as const },
      { label: locale.terms, href: normalizePath(termsHref), variant: "link" as const },
    ].filter((link) => Boolean(link.href) && !usedHrefSet.has(normalizePath(link.href)))
  );
  if (legalLinks.length < 2) {
    const fallbackCandidates = [
      ...fallbackHrefPool.map((item) => ({ label: item.label || "More", href: item.href, variant: "link" as const })),
      { label: locale.company, href: aboutNormalized, variant: "link" as const },
      { label: locale.contact, href: contactNormalized, variant: "link" as const },
      { label: locale.home, href: "/", variant: "link" as const },
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
      title: locale.pages,
      links: pageLinks.length ? pageLinks : [{ label: locale.home, href: "/", variant: "link" }],
    },
    {
      title: locale.company,
      links: [
        { label: locale.company, href: normalizePath(aboutHref), variant: "link" },
        { label: locale.contact, href: normalizePath(contactHref), variant: "link" },
      ],
    },
    {
      title: locale.legal,
      links: legalLinks.slice(0, 2),
    },
  ];
};

export const buildSiteLinkGraph = (blueprint: SiteBlueprint, prompt = ""): SiteLinkGraph => {
  const validInternalHrefs = new Set<string>(blueprint.pages.map((page) => normalizePath(page.path)));
  if (!validInternalHrefs.size) validInternalHrefs.add("/");
  const locale = resolveLinkLocale(prompt);
  const graph: SiteLinkGraph = {
    homeHref: "/",
    validInternalHrefs,
    navigationLinks: [],
    defaultNavCtas: [],
    footerColumns: [],
    legalText:
      resolveOutputLanguage(prompt) === "zh-CN"
        ? `© ${new Date().getFullYear()} 保留所有权利。`
        : `© ${new Date().getFullYear()} All rights reserved.`,
    locale,
  };
  graph.navigationLinks = buildNavigationLinks(blueprint, locale)
    .map((item) => sanitizeNavLink(item, graph))
    .filter((item): item is SiteNavLink => Boolean(item));
  graph.defaultNavCtas = buildDefaultNavCtas(blueprint, locale).map((item) => ({
    ...item,
    href: sanitizeHref(item.href, graph),
  }));
  graph.footerColumns = buildFooterColumns(blueprint, locale).map((column) => ({
    title: sanitizeLabel(column.title, locale.column),
    links: column.links.map((link) => ({
      label: sanitizeLabel(link.label, locale.link),
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
        label: sanitizeLabel(rec.label, graph.locale.contact),
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
    next.ctatexttext = graph.locale.home;
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
  next.col2text = buildLegacyFooterSlotText(
    companyColumn?.title ?? graph.locale.company,
    aboutLink?.label ?? graph.locale.company,
    graph.locale.column,
    graph.locale.link
  );
  next.col2href = aboutLink?.href ?? graph.homeHref;
  next.col3text = buildLegacyFooterSlotText(
    companyColumn?.title ?? graph.locale.company,
    contactLink?.label ?? graph.locale.contact,
    graph.locale.column,
    graph.locale.link
  );
  next.col3href = contactLink?.href ?? graph.homeHref;
  next.col4text = buildLegacyFooterSlotText(
    legalColumn?.title ?? graph.locale.legal,
    privacy?.label ?? graph.locale.privacy,
    graph.locale.column,
    graph.locale.link
  );
  next.col4href = privacy?.href ?? graph.homeHref;

  next.policyhome1text = privacy?.label ?? graph.locale.privacy;
  next.policyhome1href = privacy?.href ?? graph.homeHref;
  next.policyhome2text = terms?.label ?? graph.locale.terms;
  next.policyhome2href = terms?.href ?? graph.homeHref;

  const footerBrand =
    (typeof next.logoText === "string" && next.logoText.trim()) ||
    (typeof next.brandtext === "string" && next.brandtext.trim()) ||
    graph.locale.company;
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

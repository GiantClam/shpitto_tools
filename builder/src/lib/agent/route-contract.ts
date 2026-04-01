export type CanonicalRoute =
  | "/"
  | "/products"
  | "/solutions"
  | "/cases"
  | "/about"
  | "/contact"
  | "/pricing"
  | "/support"
  | "/blog"
  | "/privacy"
  | "/terms";

type RouteContractEntry = {
  canonical: CanonicalRoute;
  aliases: string[];
};

export const ROUTE_CONTRACT: RouteContractEntry[] = [
  { canonical: "/", aliases: ["/home", "/index"] },
  { canonical: "/products", aliases: ["/product", "/catalog", "/machines", "/3c-machines", "/core-product", "/coreproduct", "/flagship-products"] },
  { canonical: "/solutions", aliases: ["/solution", "/custom-solutions", "/services", "/capabilities"] },
  { canonical: "/cases", aliases: ["/case", "/case-studies", "/applications"] },
  { canonical: "/about", aliases: ["/about-us", "/company"] },
  { canonical: "/contact", aliases: ["/get-in-touch", "/quote"] },
  { canonical: "/pricing", aliases: ["/price", "/plans"] },
  { canonical: "/support", aliases: ["/help", "/faq", "/docs"] },
  { canonical: "/blog", aliases: ["/news", "/insights"] },
  { canonical: "/privacy", aliases: ["/privacy-policy"] },
  { canonical: "/terms", aliases: ["/terms-of-service", "/tos"] },
];

const normalizeRoutePath = (rawPath: string) => {
  const trimmed = String(rawPath || "").trim().toLowerCase();
  if (!trimmed || trimmed === "home" || trimmed === "index") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/g, "") || "/";
};

const aliasToCanonical = ROUTE_CONTRACT.reduce((acc, entry) => {
  const canonical = normalizeRoutePath(entry.canonical);
  acc.set(canonical, canonical as CanonicalRoute);
  entry.aliases.forEach((alias) => {
    acc.set(normalizeRoutePath(alias), canonical as CanonicalRoute);
  });
  return acc;
}, new Map<string, CanonicalRoute>());

export const resolveCanonicalRoute = (
  rawPath: string,
  availableRoutes?: Iterable<string>
): string => {
  const normalized = normalizeRoutePath(rawPath);
  let canonical = aliasToCanonical.get(normalized) || normalized;
  if (canonical === normalized && normalized !== "/") {
    const segments = normalized.split("/").filter(Boolean);
    if (segments.length > 1) {
      const topLevel = normalizeRoutePath(`/${segments[0]}`);
      const topLevelCanonical = aliasToCanonical.get(topLevel) || topLevel;
      // Preserve nested routes (e.g. /products/page-2, /products/{slug}) and only
      // canonicalize the head segment when it's an alias (e.g. /product/{slug} -> /products/{slug}).
      if (topLevelCanonical && topLevelCanonical !== topLevel) {
        canonical = `${topLevelCanonical}/${segments.slice(1).join("/")}`.replace(/\/{2,}/g, "/");
      }
    }
  }
  if (!availableRoutes) return canonical;
  const available = new Set(Array.from(availableRoutes, (item) => normalizeRoutePath(String(item || ""))));
  if (available.has(canonical)) return canonical;
  if (available.has(normalized)) return normalized;
  return canonical;
};

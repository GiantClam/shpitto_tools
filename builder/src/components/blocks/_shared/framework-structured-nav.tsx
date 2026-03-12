"use client";

import React from "react";
import { buildPenThemeCssVars, resolvePenTheme } from "@/components/blocks/_shared/pen-theme";

const KNOWN_NAV_LINKS: Record<string, string> = {
  framework: "/",
  products: "/products",
  solution: "/products",
  solutions: "/products",
  support: "/support",
  about: "/about",
  "about us": "/about",
  blog: "/blog",
  "our blog": "/blog",
  contact: "/contact",
  "contact us": "/contact",
  business: "/products",
  "for business": "/products",
};

const VALID_PAGE_PATHS = new Set(["/", "/products", "/support", "/about", "/blog", "/contact"]);

const REQUIRED_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "Support", href: "/support" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

type NavItem = {
  label: string;
  href?: string;
};

const splitGroupedText = (value: unknown): string[] =>
  String(value || "")
    .split(/\s{2,}|\n+/)
    .map((token) => token.trim())
    .filter(Boolean);

const resolveKnownHref = (label: string): string =>
  KNOWN_NAV_LINKS[String(label || "").trim().toLowerCase()] || "";

const resolvePageHref = (explicitHref?: unknown): string => {
  const normalized = normalizePath(String(explicitHref || "").trim());
  return VALID_PAGE_PATHS.has(normalized) ? normalized : "";
};

const resolveLogoHref = (label: string, explicitHref?: unknown): string => {
  return resolveKnownHref(label) || resolvePageHref(explicitHref) || "/";
};

const normalizeItems = (candidate: unknown, fallbackText: unknown): NavItem[] => {
  if (Array.isArray(candidate)) {
    const items = candidate
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const label = String((entry as { label?: unknown }).label || "").trim();
        const href = resolveKnownHref(label) || resolvePageHref((entry as { href?: unknown }).href);
        if (!label) return null;
        if (!href) return null;
        return {
          label,
          href,
        };
      })
      .filter(Boolean) as NavItem[];
    if (items.length) return items;
  }
  return splitGroupedText(fallbackText)
    .map((label) => ({
      label,
      href: resolveKnownHref(label),
    }))
    .filter((item) => item.href);
};

const buildPrimaryNavItems = (candidate: unknown, fallbackText: unknown): NavItem[] => {
  const candidateItems = normalizeItems(candidate, fallbackText);
  const merged = candidateItems.length ? candidateItems : [...REQUIRED_NAV_ITEMS];
  const seen = new Set<string>();
  return merged.filter((item) => {
    const href = String(item.href || "").trim();
    const label = String(item.label || "").trim().toLowerCase();
    const key = `${label}::${href}`;
    if (!href || !label || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizePath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  try {
    const parsed = new URL(raw, "https://template.local");
    let pathname = String(parsed.pathname || "/");
    pathname = pathname.replace(/\/+/g, "/");
    if (pathname !== "/") pathname = pathname.replace(/\/+$/g, "");
    return pathname || "/";
  } catch {
    return raw.startsWith("/") ? raw : "/";
  }
};

const linkStyle = (isActive: boolean, tone: "primary" | "secondary"): React.CSSProperties => ({
  color: isActive
    ? "var(--pen-theme-text, #111111)"
    : tone === "primary"
      ? "var(--pen-theme-text-secondary, #4A4A4A)"
      : "var(--pen-theme-text-secondary, #666666)",
  fontFamily: "var(--pen-font-body, Inter), sans-serif",
  fontSize: tone === "primary" ? 14 : 13,
  fontWeight: isActive ? 600 : tone === "primary" ? 500 : 400,
  letterSpacing: "0.01em",
  lineHeight: 1.2,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "color 180ms ease",
});

export function renderFrameworkStructuredNav({
  sectionId,
  merged,
  currentPathToken,
  sectionClassName,
  sectionStyle,
  revealRef,
}: {
  sectionId: string;
  merged: Record<string, any>;
  currentPathToken: string;
  sectionClassName: string;
  sectionStyle: React.CSSProperties | undefined;
  revealRef?: React.Ref<HTMLElement>;
}) {
  const theme = resolvePenTheme(merged?.theme);
  const themeVars = buildPenThemeCssVars(theme);
  const navItems = buildPrimaryNavItems(merged.navItems, merged.centernavtext);
  const utilityItems = normalizeItems(merged.utilityItems, merged.rightnavtext).filter(
    (item) =>
      !navItems.some(
        (navItem) =>
          navItem.href === item.href && String(navItem.label || "").trim().toLowerCase() === String(item.label || "").trim().toLowerCase()
      )
  );
  const logoHref = resolveLogoHref(String(merged.logotext || "Framework"), merged.logohref);

  return (
    <section
      id={sectionId}
      data-pen-section-kind="navigation"
      className={sectionClassName}
      style={{ ...(sectionStyle || {}), ...themeVars }}
      ref={revealRef}
    >
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: 24,
          rowGap: 16,
          width: "100%",
          minHeight: 64,
          padding: "0 clamp(20px, 3.4vw, 48px)",
          background: "var(--pen-theme-bg, #F3F3EF)",
        }}
      >
        <a
          href={logoHref || "/"}
          style={{
            color: "var(--pen-theme-text, #111111)",
            fontFamily: "var(--pen-font-heading, Inter), sans-serif",
            fontSize: 18,
            fontWeight: 700,
            textDecoration: "none",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {String(merged.logotext || "Framework")}
        </a>

        <nav
          aria-label="Primary"
          style={{
            display: "flex",
            flex: "1 1 460px",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "14px clamp(28px, 3vw, 42px)",
            minWidth: 0,
          }}
        >
          {navItems.map((item, index) => {
            const itemPath = normalizePath(item.href || "");
            const isActive = Boolean(item.href) && itemPath === currentPathToken;
            return (
              <a href={item.href} aria-current={isActive ? "page" : undefined} style={linkStyle(isActive, "primary")} key={`${item.label}-${index}`}>
                {item.label}
              </a>
            );
          })}
        </nav>

        {utilityItems.length ? (
          <nav
            aria-label="Utility"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px clamp(18px, 2vw, 28px)",
              flex: "0 1 auto",
            }}
          >
            {utilityItems.map((item, index) => {
              const itemPath = normalizePath(item.href || "");
              const isActive = Boolean(item.href) && itemPath === currentPathToken;
              return (
                <a href={item.href} aria-current={isActive ? "page" : undefined} style={linkStyle(isActive, "secondary")} key={`${item.label}-${index}`}>
                  {item.label}
                </a>
              );
            })}
          </nav>
        ) : null}
      </div>
    </section>
  );
}

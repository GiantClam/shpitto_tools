"use client";

import React from "react";
import { buildPenThemeCssVars, resolvePenTheme } from "@/components/blocks/_shared/pen-theme";

type FooterLink = {
  label: string;
  href?: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const KNOWN_LINKS: Record<string, string> = {
  framework: "/",
  products: "/products",
  support: "/support",
  about: "/about",
  "about us": "/about",
  blog: "/blog",
  "our blog": "/blog",
  "contact us": "/contact",
  contact: "/contact",
  business: "/products",
  "for business": "/products",
  "view all": "/products",
};

const VALID_PAGE_PATHS = new Set(["/", "/products", "/support", "/about", "/blog", "/contact"]);

const splitGroupedText = (value: unknown): string[] =>
  String(value || "")
    .split(/\n+/)
    .map((token) => token.trim())
    .filter(Boolean);

const normalizePath = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw, "https://template.local");
    let pathname = String(parsed.pathname || "/").replace(/\/+/g, "/");
    if (pathname !== "/") pathname = pathname.replace(/\/+$/g, "");
    return pathname || "/";
  } catch {
    return raw.startsWith("/") ? raw : "";
  }
};

const resolveKnownFooterHref = (label: string): string =>
  KNOWN_LINKS[String(label || "").trim().toLowerCase()] || "";

const resolvePageHref = (explicitHref?: unknown): string => {
  const normalized = normalizePath(String(explicitHref || "").trim());
  return VALID_PAGE_PATHS.has(normalized) ? normalized : "";
};

const buildColumn = (title: unknown, groupedText: unknown, explicitHref?: unknown): FooterColumn => {
  const links = splitGroupedText(groupedText).map((label) => ({
    label,
    href: resolveKnownFooterHref(label),
  }));
  return {
    title: String(title || "").trim(),
    links,
  };
};

export function renderFrameworkStructuredFooter({
  sectionId,
  sectionClassName,
  sectionStyle,
  revealRef,
  columns,
  subscribeTitle,
  subscribeBody,
  subscribeBodyHref,
  subscribeInputPlaceholder,
  subscribeInputHref,
  subscribeButtonLabel,
  legal,
  currency,
  theme,
}: {
  sectionId: string;
  sectionClassName: string;
  sectionStyle?: React.CSSProperties;
  revealRef?: React.Ref<HTMLElement>;
  columns: FooterColumn[];
  subscribeTitle?: string;
  subscribeBody?: string;
  subscribeBodyHref?: string;
  subscribeInputPlaceholder?: string;
  subscribeInputHref?: string;
  subscribeButtonLabel?: string;
  legal?: string;
  currency?: string;
  theme?: Record<string, any>;
}) {
  const resolvedTheme = resolvePenTheme(theme);
  const themeVars = buildPenThemeCssVars(resolvedTheme);
  const normalizedColumns = columns
    .map((column) => ({
      title: String(column.title || "").trim(),
      links: (column.links || [])
        .map((link) => ({
          label: String(link.label || "").trim(),
          href: resolveKnownFooterHref(String(link.label || "")),
        }))
        .filter((link) => link.label),
    }))
    .filter((column) => column.title || column.links.length);

  const bodyHref = resolveKnownFooterHref(subscribeBody || "") || resolvePageHref(subscribeBodyHref);
  const inputHref = resolvePageHref(subscribeInputHref);

  return (
    <section
      id={sectionId}
      data-pen-section-kind="footer"
      className={sectionClassName}
      style={{ ...(sectionStyle || {}), ...themeVars }}
      ref={revealRef}
    >
      <div
        style={{
          background: "var(--pen-theme-inverse-surface, #16181D)",
          color: "var(--pen-theme-on-inverse, #D5D9DE)",
          width: "100%",
          padding: "44px clamp(28px, 5.833vw, 84px) 24px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "24px 20px",
            alignItems: "start",
          }}
        >
          {normalizedColumns.map((column, index) => {
            const width = index < 2 ? 180 : 220;
            return (
              <div
                key={`${column.title}-${index}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  width,
                  maxWidth: "100%",
                  flex: `0 1 ${width}px`,
                }}
              >
                {column.title ? (
                  <div style={{ color: "var(--pen-theme-on-inverse, #FFFFFF)", fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{column.title}</div>
                ) : null}
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {column.links.map((link, linkIndex) =>
                    link.href ? (
                      <a
                        key={`${link.label}-${linkIndex}`}
                        href={link.href}
                        style={{
                          color: "var(--pen-theme-on-inverse, #C5CBD3)",
                          textDecoration: "none",
                          fontSize: 20,
                          fontWeight: 400,
                          lineHeight: 1.8,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span
                        key={`${link.label}-${linkIndex}`}
                        style={{
                          color: "var(--pen-theme-on-inverse, #C5CBD3)",
                          fontSize: 20,
                          fontWeight: 400,
                          lineHeight: 1.8,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {link.label}
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: 360,
              maxWidth: "100%",
              flex: "1 1 360px",
            }}
          >
            {subscribeTitle ? (
              <div style={{ color: "var(--pen-theme-on-inverse, #FFFFFF)", fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{subscribeTitle}</div>
            ) : null}
            {subscribeBody ? (
              bodyHref ? (
                <a
                  href={bodyHref}
                  style={{
                    color: "var(--pen-theme-on-inverse, #C5CBD3)",
                    textDecoration: "none",
                    fontSize: 20,
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}
                >
                  {subscribeBody}
                </a>
              ) : (
                <p style={{ color: "var(--pen-theme-on-inverse, #C5CBD3)", fontSize: 20, fontWeight: 400, lineHeight: 1.4, margin: 0 }}>
                  {subscribeBody}
                </p>
              )
            ) : null}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                width: "100%",
                minHeight: 52,
              }}
            >
              {inputHref ? (
                <a
                  href={inputHref}
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    width: 250,
                    minHeight: 52,
                    borderRadius: 12,
                    background: "var(--pen-theme-bg, #F3F3EF)",
                    color: "var(--pen-theme-text-secondary, #8C9198)",
                    textDecoration: "none",
                    fontSize: 16,
                    fontWeight: 400,
                    flex: "1 1 250px",
                  }}
                >
                  {subscribeInputPlaceholder || ""}
                </a>
              ) : (
                <div
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    width: 250,
                    minHeight: 52,
                    borderRadius: 12,
                    background: "var(--pen-theme-bg, #F3F3EF)",
                    color: "var(--pen-theme-text-secondary, #8C9198)",
                    fontSize: 16,
                    fontWeight: 400,
                    flex: "1 1 250px",
                  }}
                >
                  {subscribeInputPlaceholder || ""}
                </div>
              )}
              <div
                style={{
                  boxSizing: "border-box",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 100,
                  minHeight: 52,
                  borderRadius: 26,
                  background: "var(--pen-theme-accent, #F46E35)",
                  color: "var(--pen-theme-on-accent, #111111)",
                  fontSize: 22,
                  fontWeight: 700,
                  flex: "0 0 100px",
                }}
              >
                {subscribeButtonLabel || ""}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 1,
            background: "color-mix(in srgb, var(--pen-theme-on-inverse, #D5D9DE) 16%, transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            minHeight: 34,
          }}
        >
          <div
            style={{
              color: "color-mix(in srgb, var(--pen-theme-on-inverse, #D5D9DE) 58%, transparent)",
              fontSize: 14,
              fontWeight: 400,
              whiteSpace: "pre-line",
            }}
          >
            {legal}
          </div>
          {currency ? (
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 86,
                minHeight: 34,
                borderRadius: 18,
                border: "1px solid color-mix(in srgb, var(--pen-theme-on-inverse, #D5D9DE) 45%, transparent)",
                color: "var(--pen-theme-on-inverse, #D5D9DE)",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {currency}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { buildColumn };

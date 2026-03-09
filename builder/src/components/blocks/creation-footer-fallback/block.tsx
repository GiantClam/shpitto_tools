"use client";

import * as React from "react";

export const config = {
  fields: {
    logoText: { type: "text" },
    legal: { type: "text" },
    columns: {
      type: "array",
      arrayFields: {
        title: { type: "text" }
      }
    }
  },
  defaultProps: {
    logoText: "Company",
    legal: "© 2026 All rights reserved.",
    columns: [
      {
        title: "Products",
        links: [{ label: "Catalog", href: "#products" }, { label: "Cases", href: "#cases" }]
      },
      {
        title: "Support",
        links: [{ label: "Contact", href: "#contact" }, { label: "Request Quote", href: "#contact" }]
      },
      {
        title: "Legal",
        links: [{ label: "Privacy", href: "#privacy" }, { label: "Sitemap", href: "#top" }]
      }
    ]
  }
};

export default function CreationFooterFallback(props) {
  const {
    anchor = "footer",
    logoText = "Company",
    legal = "© 2026 All rights reserved.",
    columns = []
  } = props || {};
  const safeColumns = Array.isArray(columns) ? columns.slice(0, 4) : [];

  return (
    <footer id={anchor} className="border-t border-border bg-background py-12">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="text-base font-semibold">{logoText || "Company"}</div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
            {safeColumns.map((col, index) => (
              <div key={`${index}-${col?.title || "col"}`}>
                <div className="text-sm font-medium">{col?.title || "Links"}</div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(Array.isArray(col?.links) ? col.links : []).slice(0, 10).map((link, linkIndex) => (
                    <li key={`${index}-${linkIndex}`}>
                      <a href={link?.href || "#"} className="hover:text-foreground transition-colors">
                        {link?.label || "Link"}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">{legal}</div>
      </div>
    </footer>
  );
}
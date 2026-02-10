"use client";

import React from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Puck, Render, type Config, type Data } from "@measured/puck";
import "@measured/puck/puck.css";

import { compileJIT } from "@/lib/runtime";
import { MotionProvider } from "@/components/theme/motion";
import { normalizePuckData } from "@/lib/design-system-enforcer";

const DEFAULT_THEME_LIGHT = {
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  muted: "210 40% 96%",
  mutedForeground: "215 16% 47%",
  border: "214 32% 91%",
  card: "0 0% 100%",
};

const DEFAULT_THEME_DARK = {
  background: "222 47% 8%",
  foreground: "210 40% 98%",
  muted: "220 15% 16%",
  mutedForeground: "215 20% 65%",
  border: "220 13% 24%",
  card: "222 47% 10%",
};

const hexToHsl = (hex?: string) => {
  if (!hex) return null;
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    if (max === g) h = (b - r) / delta + 2;
    if (max === b) h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const buildThemeCss = (theme?: Record<string, any>) => {
  const mode = theme?.mode === "dark" ? "dark" : "light";
  const base = mode === "dark" ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT;
  const primary =
    hexToHsl(theme?.primaryColor) || (mode === "dark" ? "262 83% 62%" : "222 89% 52%");
  const primaryForeground =
    Number(primary.split(" ")[2]?.replace("%", "")) > 60 ? "222 47% 11%" : "210 40% 98%";
  const accent = primary;
  const accentForeground = primaryForeground;
  const radius = theme?.radius || "14px";
  const fontHeading = theme?.fontHeading || "Inter";
  const fontBody = theme?.fontBody || "Inter";
  return `:root{--background:${base.background};--foreground:${base.foreground};--muted:${base.muted};--muted-foreground:${base.mutedForeground};--border:${base.border};--primary:${primary};--primary-foreground:${primaryForeground};--accent:${accent};--accent-foreground:${accentForeground};--card:${base.card};--radius:${radius};--font-heading:${fontHeading};--font-body:${fontBody};--space-1:0.25rem;--space-2:0.5rem;--space-3:0.75rem;--space-4:1rem;--space-6:1.5rem;--space-8:2rem;--space-12:3rem;}body{background:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-body),ui-sans-serif,system-ui;} .font-heading{font-family:var(--font-heading),var(--font-body),ui-sans-serif,system-ui;} .font-body{font-family:var(--font-body),ui-sans-serif,system-ui;}`;
};

const tailwindRuntimeConfigScript = `
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  }
};
console.info("[creation:sandbox] tailwind_runtime_config_loaded", {
  tokens: ["background", "foreground", "muted", "primary", "accent", "border", "card"]
});
`;

type IncomingMessage =
  | {
      type: "puck:load";
      payload: {
        components: Array<{ name: string; code: string }>;
        page: { data: Data };
        theme?: Record<string, any>;
        pageIndex?: number;
      };
    }
  | { type: "puck:ping" };

export default function CreationSandboxClient() {
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("mode") === "edit";
  const [config, setConfig] = React.useState<Config | null>(null);
  const [data, setData] = React.useState<Data | null>(null);
  const [themeCss, setThemeCss] = React.useState<string>("");
  const [motionMode, setMotionMode] = React.useState<"off" | "subtle" | "showcase">("showcase");
  const [pageKey, setPageKey] = React.useState<string>("page-0");
  const pageIndexRef = React.useRef<number>(0);
  const postToHost = React.useCallback((message: unknown) => {
    window.parent?.postMessage(message, "*");
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(message, "*");
    }
  }, []);

  React.useEffect(() => {
    console.info("[creation:sandbox] preview_mode", { mode: isEdit ? "edit" : "preview" });
  }, [isEdit]);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent<IncomingMessage>) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "puck:load") {
        const payload = event.data.payload;
        pageIndexRef.current = payload.pageIndex ?? 0;
        setPageKey(`page-${pageIndexRef.current}`);
        const nextConfig: Config = { components: {} };
        const failures: string[] = [];
        payload.components.forEach((component) => {
          const compiled = compileJIT(component.code);
          if (!compiled) {
            failures.push(component.name);
            return;
          }
          nextConfig.components[component.name] = {
            render: compiled.render,
            ...(compiled.config ?? {}),
          } as any;
        });
        if (failures.length) {
          postToHost({ type: "puck:compile", payload: { failures } });
        }
        setConfig(nextConfig);
        setData(normalizePuckData(payload.page.data, { logChanges: true }));
        setThemeCss(buildThemeCss(payload.theme));
        setMotionMode((payload.theme?.motion as any) || "showcase");
        document.documentElement.classList.toggle("dark", payload.theme?.mode === "dark");
        return;
      }
      if (event.data.type === "puck:ping") {
        postToHost({ type: "puck:ready" });
      }
    };
    window.addEventListener("message", onMessage);
    postToHost({ type: "puck:ready" });
    return () => window.removeEventListener("message", onMessage);
  }, [postToHost]);

  const handlePublish = React.useCallback(
    (nextData: Data) => {
      setData(nextData);
      postToHost({ type: "puck:update", payload: { data: nextData, pageIndex: pageIndexRef.current } });
    },
    [postToHost]
  );

  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <Script id="tailwind-runtime-config" strategy="beforeInteractive">
        {tailwindRuntimeConfigScript}
      </Script>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
      {config && data ? (
        <MotionProvider mode={motionMode}>
          {isEdit ? (
            <Puck
              key={pageKey}
              config={config}
              data={normalizePuckData(data, { logChanges: true })}
              onPublish={handlePublish}
            />
          ) : (
            <main>
              <Render config={config} data={normalizePuckData(data, { logChanges: true }) as any} />
            </main>
          )}
        </MotionProvider>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          等待生成内容…
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import type { Data } from "@measured/puck";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type GeneratedComponent = {
  name: string;
  code: string;
};

type GeneratedPage = {
  path: string;
  name: string;
  data: Data;
};

type GenerationResponse = {
  id: string;
  prompt: string;
  blueprint?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  components: GeneratedComponent[];
  pages: GeneratedPage[];
  errors?: string[];
};

export default function CreationClient() {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<GenerationResponse | null>(null);
  const [pages, setPages] = React.useState<GeneratedPage[]>([]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [compileFailures, setCompileFailures] = React.useState<string[]>([]);
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const iframeReadyRef = React.useRef(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const previewWindowRef = React.useRef<Window | null>(null);
  const previewReadyRef = React.useRef(false);

  const currentPage = pages[pageIndex];

  const buildLoadPayload = React.useCallback(() => {
    if (!result || !currentPage) return null;
    return {
      components: result.components,
      page: currentPage,
      theme: result.theme,
      pageIndex,
    };
  }, [result, currentPage, pageIndex]);

  const postToPreview = React.useCallback(
    (payload: ReturnType<typeof buildLoadPayload>) => {
      const previewWindow = previewWindowRef.current;
      if (!previewWindow || previewWindow.closed || !payload) return;
      previewWindow.postMessage({ type: "puck:load", payload }, "*");
    },
    [buildLoadPayload]
  );

  React.useEffect(() => {
    if (result?.pages) {
      const normalizeItems = (items: any[], prefix: string) => {
        const seen = new Set<string>();
        return items.map((item, index) => {
          const baseKey =
            typeof item?._key === "string" && item._key
              ? item._key
              : `${prefix}-${item?.type ?? "block"}-${index}`;
          let key = baseKey;
          while (seen.has(key)) {
            key = `${baseKey}-${Math.random().toString(36).slice(2, 6)}`;
          }
          seen.add(key);
          const props = { ...(item?.props ?? {}) } as Record<string, unknown>;
          if (typeof props.id !== "string" || !props.id) {
            props.id = key;
          }
          return { ...item, _key: key, props };
        });
      };

      const normalized = result.pages.map((page) => {
        const content = Array.isArray(page.data?.content)
          ? normalizeItems(page.data.content as any[], `content-${page.path}`)
          : [];
        const zones = page.data?.zones
          ? Object.fromEntries(
              Object.entries(page.data.zones as Record<string, any[]>).map(([zoneKey, zoneItems]) => [
                zoneKey,
                Array.isArray(zoneItems) ? normalizeItems(zoneItems, `zone-${page.path}-${zoneKey}`) : [],
              ])
            )
          : page.data?.zones;
        return { ...page, data: { ...(page.data as any), content, zones } } as GeneratedPage;
      });
      setPages(normalized);
      setPageIndex(0);
    }
  }, [result]);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "puck:ready") {
        const payload = buildLoadPayload();
        if (event.source === iframeRef.current?.contentWindow) {
          iframeReadyRef.current = true;
          if (payload) {
            iframeRef.current?.contentWindow?.postMessage({ type: "puck:load", payload }, "*");
          }
        } else if (event.source === previewWindowRef.current) {
          previewReadyRef.current = true;
          postToPreview(payload);
        }
        return;
      }
      if (event.data.type === "puck:compile") {
        const failures = event.data.payload?.failures || [];
        setCompileFailures(failures);
        return;
      }
      if (event.data.type === "puck:update") {
        const updated = event.data.payload?.data as Data | undefined;
        const idx = event.data.payload?.pageIndex ?? pageIndex;
        if (updated) {
          setPages((prev) => prev.map((page, index) => (index === idx ? { ...page, data: updated } : page)));
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [buildLoadPayload, currentPage, pageIndex, postToPreview, result]);

  React.useEffect(() => {
    if (!iframeReadyRef.current) return;
    const payload = buildLoadPayload();
    if (!payload) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "puck:load", payload }, "*");
  }, [buildLoadPayload]);

  React.useEffect(() => {
    if (!previewReadyRef.current) return;
    postToPreview(buildLoadPayload());
  }, [buildLoadPayload, postToPreview]);

  const handleGenerate = async () => {
    setError(null);
    if (!prompt.trim()) {
      setError("请输入一句话描述");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/creation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, persist: true }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error ?? "generation_failed");
      }
      setResult(payload);
    } catch (err: any) {
      setError(err?.message ?? "generation_failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setError(null);
    try {
      const payload = { ...result, pages };
      const res = await fetch("/api/creation/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.id, payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error ?? "save_failed");
      }
    } catch (err: any) {
      setError(err?.message ?? "save_failed");
    }
  };

  const handleOpenPreview = React.useCallback(() => {
    if (!result || !currentPage) return;
    const previewWindow = window.open("/creation/sandbox?mode=preview", "puck-preview");
    if (!previewWindow) {
      setError("请允许浏览器打开新标签页");
      return;
    }
    previewWindowRef.current = previewWindow;
    previewReadyRef.current = false;
    const payload = buildLoadPayload();
    if (payload) {
      previewWindow.postMessage({ type: "puck:load", payload }, "*");
    }
  }, [buildLoadPayload, currentPage, result]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border/60 px-6 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Shipitto Creation
            </p>
            <h1 className="text-2xl font-semibold">一句话生成多页面 Puck 项目</h1>
          </div>
          <div className="flex w-full max-w-2xl items-center gap-2">
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="例如：做一个极简但科技感十足的 AI 视频生成工具官网"
            />
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "生成中…" : "立即生成"}
            </Button>
            <Button onClick={handleSave} disabled={!result || loading} variant="secondary">
              保存
            </Button>
            <Button onClick={handleOpenPreview} disabled={!result || loading} variant="ghost">
              新标签预览
            </Button>
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "border-r border-border/60 p-4 transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-80"
          )}
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                {!sidebarCollapsed ? (
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Pages</p>
                ) : (
                  <span className="text-xs text-muted-foreground">P</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? "›" : "‹"}
                </Button>
              </div>
              <div className={cn("mt-3 space-y-2", sidebarCollapsed && "hidden")}>
                {pages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">尚未生成</p>
                ) : (
                  pages.map((page, index) => (
                    <button
                      key={page.path}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-left text-sm",
                        index === pageIndex
                          ? "border-primary/60 bg-primary/10"
                          : "border-border/60 hover:bg-muted/40"
                      )}
                      onClick={() => setPageIndex(index)}
                    >
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-muted-foreground">{page.path}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
            {result?.blueprint ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Blueprint</p>
                <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">
                  {JSON.stringify(result.blueprint, null, 2)}
                </pre>
              </div>
            ) : null}
            {result?.errors && result.errors.length ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Errors</p>
                <ul className="mt-2 space-y-1 text-xs text-red-500">
                  {result.errors.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {compileFailures.length ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compile</p>
                <ul className="mt-2 space-y-1 text-xs text-amber-500">
                  {compileFailures.map((item) => (
                    <li key={item}>Failed: {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 min-w-0">
            <iframe
              ref={iframeRef}
              className="h-full w-full border-0"
              src="/creation/sandbox?mode=preview"
              title="Creation Sandbox"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => {
                iframeReadyRef.current = true;
                iframeRef.current?.contentWindow?.postMessage({ type: "puck:ping" }, "*");
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

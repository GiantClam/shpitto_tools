"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";

import { puckConfig } from "@/puck/config";
import { MotionProvider, type MotionMode } from "@/components/theme/motion";
import { normalizePuckData } from "@/lib/design-system-enforcer";

type EditorData = Data;

const resolveMotionMode = (value: unknown): MotionMode => {
  if (value === "off" || value === "subtle" || value === "showcase") {
    return value;
  }
  return "subtle";
};

const isEditorData = (value: unknown): value is EditorData => {
  if (!value || typeof value !== "object") return false;
  const content = (value as { content?: unknown }).content;
  return Array.isArray(content);
};

export default function EditorClient() {
  const searchParams = useSearchParams();
  const siteKey = searchParams.get("siteKey") ?? searchParams.get("site") ?? "demo";
  const page = searchParams.get("page") ?? "home";
  const iter = searchParams.get("iter") ?? "";
  const sourceUrl = siteKey.startsWith("http") ? siteKey : `https://${siteKey}`;
  const [data, setData] = React.useState<EditorData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ siteKey, page });
    if (iter) query.set("iter", iter);
    setLoading(true);
    setError(null);
    fetch(`/api/puck?${query.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`load_failed_${res.status}`);
        }
        return res.json();
      })
      .then((payload) => {
        if (isEditorData(payload)) {
          // Clean up data: remove dangling slots and ensure unique keys
          const cleanContent = payload.content.map((item) => {
            const { slots, ...rest } = item as any;
            return {
              ...rest,
              _key: rest._key || Math.random().toString(36).slice(2),
            };
          });
          setData(normalizePuckData({ ...payload, content: cleanContent }, { logChanges: true }));
        } else {
          setError("invalid_editor_data");
          setData(null);
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError("load_failed");
        setData(null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [siteKey, page, iter]);

  const handlePublish = React.useCallback(
    async (nextData: EditorData) => {
      setError(null);
      const res = await fetch("/api/puck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteKey, page, data: nextData }),
      });
      if (!res.ok) {
        setError("save_failed");
        return;
      }
      setData(nextData);
    },
    [siteKey, page]
  );

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading editor…</div>;
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {error === "load_failed" ? "Failed to load editor data." : "No editor data found."}
      </div>
    );
  }

  const motionMode = resolveMotionMode(
    (data as { root?: { props?: { theme?: { motion?: unknown } } } }).root?.props?.theme?.motion
  );

  return (
    <div className="flex h-screen w-full min-w-0">
      <div className="flex-1 min-w-0 border-r">
        <iframe className="h-full w-full" src={sourceUrl} title="Source Site" />
      </div>
      <div className="flex-1 min-w-0">
        <MotionProvider mode={motionMode}>
          <div className="h-full">
            <Puck
              config={puckConfig}
              data={normalizePuckData(data, { logChanges: true })}
              onPublish={handlePublish}
            />
          </div>
        </MotionProvider>
      </div>
    </div>
  );
}

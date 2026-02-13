import { promises as fs } from "fs";
import path from "path";

import CreationSandboxClient from "@/app/creation/sandbox-client";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };
type PageProps = { searchParams?: Promise<SearchParams> };

type SandboxPayload = {
  components?: Array<{ name?: string; code?: string }>;
  pages?: Array<{ path?: string; name?: string; data?: unknown }>;
  theme?: Record<string, unknown>;
};

const normalizePagePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "home" || trimmed === "index") return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const normalizeSiteKey = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

async function loadSandboxPayload(siteKey: string): Promise<SandboxPayload | null> {
  const filePath = path.join(
    process.cwd(),
    "..",
    "asset-factory",
    "out",
    siteKey,
    "sandbox",
    "payload.json"
  );
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as SandboxPayload;
  } catch {
    return null;
  }
}

export default async function CreationSandboxPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const siteKeyRaw = params?.siteKey;
  const siteKey = typeof siteKeyRaw === "string" ? normalizeSiteKey(siteKeyRaw) : "";
  const requestedPageRaw = params?.page;
  const requestedPage =
    typeof requestedPageRaw === "string" && requestedPageRaw.trim()
      ? normalizePagePath(requestedPageRaw)
      : "/";

  let initialPayload:
    | {
        components: Array<{ name: string; code: string }>;
        page: { path: string; name: string; data: any };
        theme?: Record<string, unknown>;
        pageIndex: number;
      }
    | undefined;

  if (siteKey) {
    const payload = await loadSandboxPayload(siteKey);
    const components = Array.isArray(payload?.components)
      ? payload.components
          .filter(
            (item): item is { name: string; code: string } =>
              typeof item?.name === "string" && item.name.length > 0 && typeof item?.code === "string"
          )
          .map((item) => ({ name: item.name, code: item.code }))
      : [];
    const pages = Array.isArray(payload?.pages)
      ? payload.pages
          .filter(
            (item): item is { path: string; name: string; data: any } =>
              typeof item?.path === "string" && typeof item?.name === "string" && typeof item?.data === "object"
          )
          .map((item) => ({ path: item.path, name: item.name, data: item.data }))
      : [];
    if (components.length && pages.length) {
      const requestedPageIndex = pages.findIndex((page) => normalizePagePath(page.path) === requestedPage);
      const pageIndex = requestedPageIndex >= 0 ? requestedPageIndex : 0;
      initialPayload = {
        components,
        page: pages[pageIndex],
        theme: payload?.theme && typeof payload.theme === "object" ? payload.theme : undefined,
        pageIndex,
      };
    }
  }

  return <CreationSandboxClient initialPayload={initialPayload} />;
}

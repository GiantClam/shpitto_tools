export type SandboxPayload = {
  components?: Array<{ name?: string; code?: string }>;
  pages?: Array<{ path?: string; name?: string; data?: unknown }>;
  theme?: Record<string, unknown>;
};

export type SandboxInitialPayload = {
  components: Array<{ name: string; code: string }>;
  page: { path: string; name: string; data: any };
  availablePagePaths?: string[];
  theme?: Record<string, unknown>;
  pageIndex: number;
};

export type MotionMode = "off" | "subtle" | "showcase";

export const normalizePagePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "home" || trimmed === "index") return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

export const normalizeSiteKey = (value: string, fallback = "") => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

export const parseMotionMode = (value?: string): MotionMode | undefined => {
  if (value === "off" || value === "subtle" || value === "showcase") return value;
  return undefined;
};

const normalizeBaseUrl = (value?: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
};

const loadJsonFromUrl = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
};

const loadJsonFromFile = async <T>(filePath: string): Promise<T | null> => {
  try {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const getLocalPayloadPathCandidates = async (siteKey: string): Promise<string[]> => {
  try {
    const pathMod = await import("path");
    return [
      pathMod.join(process.cwd(), "..", "asset-factory", "out", siteKey, "sandbox", "payload.json"),
      pathMod.join(process.cwd(), "public", "generated-sites", siteKey, "sandbox", "payload.json"),
    ];
  } catch {
    return [];
  }
};

export async function loadSandboxPayload(siteKey: string): Promise<SandboxPayload | null> {
  if (!siteKey) return null;
  const baseUrl = normalizeBaseUrl(process.env.BUILDER_SANDBOX_PAYLOAD_BASE_URL);
  if (baseUrl) {
    const remoteUrl = `${baseUrl}/${encodeURIComponent(siteKey)}/sandbox/payload.json`;
    const remote = await loadJsonFromUrl<SandboxPayload>(remoteUrl);
    if (remote) return remote;
  }

  const filePathCandidates = await getLocalPayloadPathCandidates(siteKey);
  for (const filePath of filePathCandidates) {
    const local = await loadJsonFromFile<SandboxPayload>(filePath);
    if (local) return local;
  }
  return null;
}

export const buildSandboxInitialPayload = (
  payload: SandboxPayload | null,
  requestedPage: string,
  requestedMotion?: MotionMode
): SandboxInitialPayload | undefined => {
  const components = Array.isArray(payload?.components)
    ? payload.components
        .filter(
          (item): item is { name: string; code: string } =>
            typeof item?.name === "string" &&
            item.name.length > 0 &&
            typeof item?.code === "string"
        )
        .map((item) => ({ name: item.name, code: item.code }))
    : [];
  const pages = Array.isArray(payload?.pages)
    ? payload.pages
        .filter(
          (item): item is { path: string; name: string; data: any } =>
            typeof item?.path === "string" &&
            typeof item?.name === "string" &&
            typeof item?.data === "object"
        )
        .map((item) => ({ path: item.path, name: item.name, data: item.data }))
    : [];
  if (!components.length || !pages.length) return undefined;
  const availablePagePaths = Array.from(
    new Set(
      pages
        .map((page) => normalizePagePath(page.path))
        .filter((item) => typeof item === "string" && item.length > 0)
    )
  );

  const requestedPageIndex = pages.findIndex((page) => normalizePagePath(page.path) === requestedPage);
  const pageIndex = requestedPageIndex >= 0 ? requestedPageIndex : 0;
  const theme = payload?.theme && typeof payload.theme === "object" ? { ...payload.theme } : undefined;
  if (theme && requestedMotion) theme.motion = requestedMotion;

  return {
    components,
    page: pages[pageIndex],
    availablePagePaths,
    theme,
    pageIndex,
  };
};

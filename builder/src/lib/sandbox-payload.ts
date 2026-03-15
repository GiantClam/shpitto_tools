export type SandboxPayload = {
  components?: Array<{ name?: string; code?: string }>;
  pages?: Array<{ path?: string; name?: string; data?: unknown; skinnable?: unknown }>;
  theme?: Record<string, unknown>;
};

export type SandboxEditableTextSlot = {
  slotId: string;
  kind: "text";
  label: string;
  nodeId: string;
  nodeType?: string;
  defaultValue: string;
};

export type SandboxEditableImageSlot = {
  slotId: string;
  kind: "image";
  label: string;
  nodeId: string;
  nodeType?: string;
  defaultUrl: string;
  defaultMode?: string;
};

export type SandboxEditableLinkSlot = {
  slotId: string;
  kind: "link";
  label: string;
  nodeId: string;
  nodeType?: string;
  defaultHref: string;
};

export type SandboxEditableStyleSlot = {
  slotId: string;
  kind: "style" | "section-style";
  label: string;
  nodeId: string;
  nodeType?: string;
  scope?: string;
  defaults?: Record<string, unknown>;
};

export type SandboxPageSkinnable = {
  pageId: string;
  pageName: string;
  pageType?: string;
  counts?: Record<string, number>;
  capabilities?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  editable: {
    textSlots: SandboxEditableTextSlot[];
    imageSlots: SandboxEditableImageSlot[];
    linkSlots: SandboxEditableLinkSlot[];
    styleSlots: SandboxEditableStyleSlot[];
  };
};

export type SandboxInitialPayload = {
  components: Array<{ name: string; code: string }>;
  page: { path: string; name: string; data: any; skinnable?: SandboxPageSkinnable };
  availablePagePaths?: string[];
  theme?: Record<string, unknown>;
  pageIndex: number;
};

const injectThemeIntoPageContent = (
  page: { path: string; name: string; data: any },
  theme?: Record<string, unknown>
) => {
  if (!theme || typeof theme !== "object") return page;
  const rawContent = Array.isArray(page?.data?.content) ? page.data.content : [];
  const nextContent = rawContent.map((item: any) => {
    if (!item || typeof item !== "object") return item;
    const props = item.props && typeof item.props === "object" ? { ...item.props } : {};
    if (!props.theme) props.theme = theme;
    return {
      ...item,
      props,
    };
  });
  return {
    ...page,
    data: {
      ...(page?.data || {}),
      content: nextContent,
    },
  };
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

const toString = (value: unknown) => (typeof value === "string" ? value : "");

const toNumberRecord = (value: unknown) =>
  value && typeof value === "object"
    ? Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .filter(([, entry]) => typeof entry === "number" && Number.isFinite(entry))
          .map(([key, entry]) => [key, Number(entry)])
      )
    : undefined;

const toObjectRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? ({ ...(value as Record<string, unknown>) }) : undefined;

const toTextSlot = (value: unknown): SandboxEditableTextSlot | null => {
  if (!value || typeof value !== "object") return null;
  const slot = value as Record<string, unknown>;
  const slotId = toString(slot.slotId).trim();
  const label = toString(slot.label).trim();
  const nodeId = toString(slot.nodeId).trim();
  const defaultValue = toString(slot.defaultValue);
  if (!slotId || !label || !nodeId) return null;
  return { slotId, kind: "text", label, nodeId, nodeType: toString(slot.nodeType).trim() || undefined, defaultValue };
};

const toImageSlot = (value: unknown): SandboxEditableImageSlot | null => {
  if (!value || typeof value !== "object") return null;
  const slot = value as Record<string, unknown>;
  const slotId = toString(slot.slotId).trim();
  const label = toString(slot.label).trim();
  const nodeId = toString(slot.nodeId).trim();
  const defaultUrl = toString(slot.defaultUrl);
  if (!slotId || !label || !nodeId) return null;
  return {
    slotId,
    kind: "image",
    label,
    nodeId,
    nodeType: toString(slot.nodeType).trim() || undefined,
    defaultUrl,
    defaultMode: toString(slot.defaultMode).trim() || undefined,
  };
};

const toLinkSlot = (value: unknown): SandboxEditableLinkSlot | null => {
  if (!value || typeof value !== "object") return null;
  const slot = value as Record<string, unknown>;
  const slotId = toString(slot.slotId).trim();
  const label = toString(slot.label).trim();
  const nodeId = toString(slot.nodeId).trim();
  const defaultHref = toString(slot.defaultHref);
  if (!slotId || !label || !nodeId) return null;
  return { slotId, kind: "link", label, nodeId, nodeType: toString(slot.nodeType).trim() || undefined, defaultHref };
};

const toStyleSlot = (value: unknown): SandboxEditableStyleSlot | null => {
  if (!value || typeof value !== "object") return null;
  const slot = value as Record<string, unknown>;
  const slotId = toString(slot.slotId).trim();
  const label = toString(slot.label).trim();
  const nodeId = toString(slot.nodeId).trim();
  const kind = toString(slot.kind).trim();
  if (!slotId || !label || !nodeId || (kind !== "style" && kind !== "section-style")) return null;
  return {
    slotId,
    kind,
    label,
    nodeId,
    nodeType: toString(slot.nodeType).trim() || undefined,
    scope: toString(slot.scope).trim() || undefined,
    defaults: toObjectRecord(slot.defaults),
  };
};

const toSandboxPageSkinnable = (value: unknown): SandboxPageSkinnable | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const pageId = toString(record.pageId).trim();
  const pageName = toString(record.pageName).trim();
  if (!pageId || !pageName) return undefined;
  const editableRecord =
    record.editable && typeof record.editable === "object" ? (record.editable as Record<string, unknown>) : {};
  return {
    pageId,
    pageName,
    pageType: toString(record.pageType).trim() || undefined,
    counts: toNumberRecord(record.counts),
    capabilities: toObjectRecord(record.capabilities),
    theme: toObjectRecord(record.theme),
    editable: {
      textSlots: Array.isArray(editableRecord.textSlots)
        ? editableRecord.textSlots.map((item) => toTextSlot(item)).filter(Boolean) as SandboxEditableTextSlot[]
        : [],
      imageSlots: Array.isArray(editableRecord.imageSlots)
        ? editableRecord.imageSlots.map((item) => toImageSlot(item)).filter(Boolean) as SandboxEditableImageSlot[]
        : [],
      linkSlots: Array.isArray(editableRecord.linkSlots)
        ? editableRecord.linkSlots.map((item) => toLinkSlot(item)).filter(Boolean) as SandboxEditableLinkSlot[]
        : [],
      styleSlots: Array.isArray(editableRecord.styleSlots)
        ? editableRecord.styleSlots.map((item) => toStyleSlot(item)).filter(Boolean) as SandboxEditableStyleSlot[]
        : [],
    },
  };
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
      pathMod.join(process.cwd(), "..", "asset-factory", "out", "p2w", siteKey, "sandbox", "payload.json"),
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
          (item): item is { path: string; name: string; data: any; skinnable?: unknown } =>
            typeof item?.path === "string" &&
            typeof item?.name === "string" &&
            typeof item?.data === "object"
        )
        .map((item) => ({
          path: item.path,
          name: item.name,
          data: item.data,
          skinnable: toSandboxPageSkinnable(item.skinnable),
        }))
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
  const selectedPage = pages[pageIndex];
  const resolvedCurrentPath = normalizePagePath(selectedPage.path);
  const pageContent = Array.isArray(selectedPage?.data?.content) ? selectedPage.data.content : [];
  const pageWithCurrentPath = {
    ...selectedPage,
    data: {
      ...(selectedPage?.data && typeof selectedPage.data === "object" ? selectedPage.data : {}),
      content: pageContent.map((item: any) => {
        const props = item?.props && typeof item.props === "object" ? item.props : {};
        const currentPath =
          typeof props.currentPath === "string" && props.currentPath.trim().length > 0
            ? props.currentPath
            : resolvedCurrentPath;
        return {
          ...(item && typeof item === "object" ? item : {}),
          props: {
            ...props,
            currentPath,
          },
        };
      }),
    },
  };
  const requiredTypes = new Set(
    (Array.isArray(pageWithCurrentPath?.data?.content) ? pageWithCurrentPath.data.content : [])
      .map((item: any) => (typeof item?.type === "string" ? item.type.trim() : ""))
      .filter(Boolean)
  );
  const pageScopedComponents = components.filter((component) => requiredTypes.has(component.name));
  const resolvedComponents = pageScopedComponents.length ? pageScopedComponents : components;
  const theme = payload?.theme && typeof payload.theme === "object" ? { ...payload.theme } : undefined;
  if (theme && requestedMotion) theme.motion = requestedMotion;

  return {
    components: resolvedComponents,
    page: injectThemeIntoPageContent(pageWithCurrentPath, theme),
    availablePagePaths,
    theme,
    pageIndex,
  };
};

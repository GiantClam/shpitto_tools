import CreationSandboxClient from "@/app/creation/sandbox-client";
import {
  buildSandboxInitialPayload,
  loadSandboxPayload,
  normalizePagePath,
  normalizeSiteKey,
  parseMotionMode,
} from "@/lib/sandbox-payload";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };
type PageProps = { searchParams?: Promise<SearchParams> };

export default async function CreationSandboxPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const siteKeyRaw = params?.siteKey;
  const siteKey = typeof siteKeyRaw === "string" ? normalizeSiteKey(siteKeyRaw, "") : "";
  const requestedPageRaw = params?.page;
  const requestedPage =
    typeof requestedPageRaw === "string" && requestedPageRaw.trim()
      ? normalizePagePath(requestedPageRaw)
      : "/";
  const requestedMotion = parseMotionMode(
    typeof params?.motion === "string" ? params.motion.trim() : undefined
  );
  const payload = siteKey ? await loadSandboxPayload(siteKey) : null;
  const initialPayload = buildSandboxInitialPayload(payload, requestedPage, requestedMotion);

  return <CreationSandboxClient initialPayload={initialPayload} />;
}

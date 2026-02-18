#!/usr/bin/env python3
"""Hybrid Crawl4AI + Playwright pipeline for template-factory.

Stage 1: Crawl content pages and markdown (Crawl4AI first, urllib fallback).
Stage 2: Capture visual signals and screenshots (Playwright when available).
Stage 3: Fuse style signals into a single style_fused.json artifact.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from collections import Counter, deque
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)

SKIPPED_EXT_RE = re.compile(
    r"\.(?:jpg|jpeg|png|gif|webp|svg|ico|css|js|mjs|map|pdf|zip|rar|7z|mp4|webm|mp3|wav|woff|woff2|ttf|otf|xml|rss|txt)$",
    re.I,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def slug(value: str) -> str:
    return (
        re.sub(
            r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", (value or "").lower().strip())
        )
        or "site"
    )


def dedupe(values: list[str], limit: int = 200) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        token = (value or "").strip()
        if not token:
            continue
        key = token.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(token)
        if len(out) >= limit:
            break
    return out


def strip_html(value: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", " ", value or "", flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def host_allowed(host: str, base_host: str) -> bool:
    host_value = (host or "").lower().strip()
    base_value = (base_host or "").lower().strip()
    if not host_value or not base_value:
        return False
    if host_value == base_value or host_value.endswith(f".{base_value}"):
        return True
    if base_value.startswith("www."):
        bare = base_value[4:]
        if host_value == bare or host_value.endswith(f".{bare}"):
            return True
    if host_value.startswith("www."):
        bare_host = host_value[4:]
        if bare_host == base_value or bare_host.endswith(f".{base_value}"):
            return True
    return False


def normalize_internal_url(value: str, root_origin: str, base_url: str) -> str:
    if not value:
        return ""
    try:
        absolute = urlparse(urljoin(base_url, value.strip()))
    except Exception:
        return ""
    if absolute.scheme not in {"http", "https"}:
        return ""
    root_parsed = urlparse(root_origin)
    if not host_allowed(absolute.netloc, root_parsed.netloc):
        return ""
    if SKIPPED_EXT_RE.search(absolute.path or ""):
        return ""
    path = (absolute.path or "/").rstrip("/") or "/"
    path_lower = path.lower()
    if (
        "/login" in path_lower
        or "/auth" in path_lower
        or "/signin" in path_lower
        or "/signup" in path_lower
    ):
        return ""
    return f"{root_origin}{path}"


def classify_page(url: str, title: str) -> str:
    value = f"{url} {title}".lower()
    mapping = {
        "hero": ["home", "index"],
        "pricing": ["pricing", "plan", "cost"],
        "about": ["about", "company", "team", "story"],
        "contact": ["contact", "support", "reach"],
        "products": ["product", "solution", "platform", "services"],
        "blog": ["blog", "news", "insight"],
    }
    for label, keywords in mapping.items():
        if any(token in value for token in keywords):
            return label
    return "story"


def heading_matches(html: str, tag: str, limit: int) -> list[str]:
    pattern = re.compile(rf"<{tag}[^>]*>([\\s\\S]*?)</{tag}>", re.I)
    return dedupe(
        [
            strip_html(m.group(1))
            for m in pattern.finditer(html)
            if strip_html(m.group(1))
        ],
        limit=limit,
    )


def extract_image_urls(html: str, page_url: str) -> list[str]:
    urls: list[str] = []
    for match in re.finditer(
        r"<(?:img|source)[^>]+(?:src|srcset)=[\"']([^\"']+)[\"']", html, flags=re.I
    ):
        raw = (match.group(1) or "").split(",")[0].split(" ")[0].strip()
        if not raw:
            continue
        try:
            urls.append(urljoin(page_url, raw))
        except Exception:
            continue
    return dedupe(urls, 40)


def fetch_html_sync(url: str, timeout_s: int) -> tuple[int, str, str]:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=timeout_s) as response:
        status = int(getattr(response, "status", 200) or 200)
        final_url = str(getattr(response, "url", url) or url)
        body = response.read().decode("utf-8", errors="replace")
        return status, final_url, body


@dataclass
class CrawlRuntime:
    use_crawl4ai: bool = False
    crawler: Any | None = None
    run_config: Any | None = None
    warnings: list[str] | None = None


async def create_crawl_runtime() -> CrawlRuntime:
    runtime = CrawlRuntime(use_crawl4ai=False, warnings=[])
    try:
        from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig

        runtime.use_crawl4ai = True
        runtime.run_config = CrawlerRunConfig(
            remove_overlay_elements=True,
            cache_mode=CacheMode.BYPASS,
            word_count_threshold=10,
            page_timeout=30000,
        )
        runtime.crawler = AsyncWebCrawler()
        await runtime.crawler.start()
    except Exception as exc:
        runtime.warnings.append(f"crawl4ai_unavailable: {exc}")
    return runtime


async def close_crawl_runtime(runtime: CrawlRuntime) -> None:
    if runtime.crawler is not None:
        await runtime.crawler.close()


async def crawl_one_page(
    url: str, runtime: CrawlRuntime, timeout_ms: int
) -> dict[str, Any]:
    html = ""
    markdown = ""
    status = 0
    final_url = url
    error = ""
    crawl4ai_links: list[str] = []

    if runtime.use_crawl4ai and runtime.crawler is not None:
        try:
            result = await runtime.crawler.arun(url=url, config=runtime.run_config)
            if result and getattr(result, "success", False):
                markdown = getattr(result, "markdown", "") or ""
                html = getattr(result, "html", "") or ""
                status = int(getattr(result, "status_code", 200) or 200)
                final_url = str(getattr(result, "url", url) or url)
                raw_links = getattr(result, "links", None)
                if isinstance(raw_links, dict):
                    for section in raw_links.values():
                        if isinstance(section, list):
                            for item in section:
                                if isinstance(item, dict):
                                    href = str(
                                        item.get("href") or item.get("url") or ""
                                    ).strip()
                                    if href:
                                        crawl4ai_links.append(href)
                elif isinstance(raw_links, list):
                    for item in raw_links:
                        if isinstance(item, dict):
                            href = str(
                                item.get("href") or item.get("url") or ""
                            ).strip()
                            if href:
                                crawl4ai_links.append(href)
            else:
                error = str(
                    getattr(result, "error_message", "crawl4ai_failed")
                    or "crawl4ai_failed"
                )
        except Exception as exc:
            error = str(exc)

    if not html:
        try:
            status, final_url, html = await asyncio.to_thread(
                fetch_html_sync, url, max(5, timeout_ms // 1000)
            )
            if not markdown:
                markdown = strip_html(html)[:12000]
        except Exception as exc:
            error = error or str(exc)

    title = ""
    title_match = re.search(r"<title[^>]*>([\s\S]*?)</title>", html, flags=re.I)
    if title_match:
        title = strip_html(title_match.group(1))
    h1 = heading_matches(html, "h1", 6)
    h2 = heading_matches(html, "h2", 12)
    anchor_labels = heading_matches(html, "a", 24)
    links_out = []
    for match in re.finditer(r"<a[^>]+href=[\"']([^\"']+)[\"']", html, flags=re.I):
        links_out.append(match.group(1))
    links_out.extend(crawl4ai_links)
    images = extract_image_urls(html, final_url)

    return {
        "requested_url": url,
        "url": final_url,
        "status": status,
        "title": title,
        "h1": h1,
        "h2": h2,
        "links": anchor_labels,
        "links_out_raw": links_out,
        "images": images,
        "markdown": markdown[:20000],
        "html_chars": len(html),
        "error": error,
        "heroPresentation": {
            "mode": "background_text"
            if ("hero" in html.lower() or len(images) > 0)
            else "split",
            "hasHeading": bool(h1),
            "hasForegroundImage": bool(images),
            "hasBackgroundImage": "background" in html.lower(),
        },
        "heroCarousel": {
            "enabled": len(images) >= 2
            and any(
                token in html.lower()
                for token in ["swiper", "carousel", "slider", "splide"]
            ),
            "signalCount": 1 if len(images) >= 2 else 0,
            "signals": ["multi-image"] if len(images) >= 2 else [],
            "images": images[:12],
        },
    }


async def crawl_site(
    url: str,
    max_pages: int,
    max_depth: int,
    timeout_ms: int,
    concurrency: int,
    prefer_language: str = "en",
) -> tuple[dict[str, Any], list[str]]:
    parsed = urlparse(url if url.startswith("http") else f"https://{url}")
    root_origin = f"{parsed.scheme}://{parsed.netloc}"
    start_url = (
        normalize_internal_url(parsed.geturl(), root_origin, root_origin)
        or parsed.geturl()
    )
    runtime = await create_crawl_runtime()

    if prefer_language and prefer_language.lower() not in ("en", "any", "none"):
        print(
            f"[hybrid-crawl] probing for {prefer_language} language entry...",
            flush=True,
        )
        probe_url = start_url
        try:
            from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig

            probe_crawler = AsyncWebCrawler()
            await probe_crawler.start()
            probe_result = await probe_crawler.arun(
                url=probe_url,
                config=CrawlerRunConfig(
                    remove_overlay_elements=True,
                    cache_mode=CacheMode.BYPASS,
                    word_count_threshold=10,
                ),
            )
            if probe_result and getattr(probe_result, "success", False):
                raw_html = getattr(probe_result, "html", "") or ""
                if raw_html:
                    href_values = []
                    for match in re.finditer(
                        r"<a[^>]+href=[\"']([^\"']+)[\"']", raw_html, flags=re.I
                    ):
                        href_values.append(match.group(1))

                    language_links = []
                    for href in href_values:
                        normalized = normalize_internal_url(
                            href, root_origin, probe_url
                        )
                        if normalized:
                            path_lower = normalized.lower()
                            if (
                                f"/{prefer_language.lower()}/" in path_lower
                                or path_lower.endswith(f"/{prefer_language.lower()}")
                            ):
                                language_links.append(normalized)

                    if language_links:
                        start_url = language_links[0]
                        print(
                            f"[hybrid-crawl] language preference: using {start_url}",
                            flush=True,
                        )
            await probe_crawler.close()
        except Exception as e:
            print(f"[hybrid-crawl] language probe failed: {e}", flush=True)

    if runtime.use_crawl4ai:
        print(
            f"[hybrid-crawl] using crawl4ai entry={start_url} max_pages={max_pages} max_depth={max_depth}",
            flush=True,
        )
    else:
        print(
            f"[hybrid-crawl] crawl4ai unavailable, fallback to urllib entry={start_url}",
            flush=True,
        )

    queue: deque[tuple[str, int, str]] = deque([(start_url, 0, "")])
    seen = {start_url}
    pages: list[dict[str, Any]] = []
    edges: list[dict[str, str]] = []
    errors: list[dict[str, str]] = []
    sem = asyncio.Semaphore(max(1, concurrency))

    per_page_timeout_s = max(10, timeout_ms // 1000) + 15

    async def process_page(
        item: tuple[str, int, str],
    ) -> tuple[dict[str, Any], int, str]:
        page_url, depth, from_url = item
        async with sem:
            try:
                page = await asyncio.wait_for(
                    crawl_one_page(page_url, runtime, timeout_ms),
                    timeout=per_page_timeout_s,
                )
            except asyncio.TimeoutError:
                print(
                    f"[hybrid-crawl] page timeout ({per_page_timeout_s}s) url={page_url}",
                    flush=True,
                )
                page = {
                    "requested_url": page_url,
                    "url": page_url,
                    "status": 0,
                    "title": "",
                    "h1": [],
                    "h2": [],
                    "links": [],
                    "links_out_raw": [],
                    "images": [],
                    "markdown": "",
                    "html_chars": 0,
                    "error": f"timeout_after_{per_page_timeout_s}s",
                    "heroPresentation": {
                        "mode": "split",
                        "hasHeading": False,
                        "hasForegroundImage": False,
                        "hasBackgroundImage": False,
                    },
                    "heroCarousel": {
                        "enabled": False,
                        "signalCount": 0,
                        "signals": [],
                        "images": [],
                    },
                }
        return page, depth, from_url

    try:
        while queue and len(pages) < max_pages:
            batch: list[tuple[str, int, str]] = []
            while (
                queue
                and len(batch) < max(1, concurrency)
                and (len(pages) + len(batch)) < max_pages
            ):
                batch.append(queue.popleft())
            if not batch:
                break
            for page, depth, from_url in await asyncio.gather(
                *(process_page(entry) for entry in batch)
            ):
                requested_url = str(page.get("requested_url") or "")
                final_url = str(page.get("url") or "")
                page_url = requested_url or final_url
                category = classify_page(page_url, str(page.get("title") or ""))
                normalized_links = [
                    normalize_internal_url(link, root_origin, page_url)
                    for link in page.get("links_out_raw") or []
                ]
                links_out = dedupe([link for link in normalized_links if link], 100)

                pages.append(
                    {
                        "url": page_url,
                        "finalUrl": final_url,
                        "requestedUrl": str(page.get("requested_url") or page_url),
                        "depth": depth,
                        "from": from_url,
                        "status": int(page.get("status") or 0),
                        "title": str(page.get("title") or ""),
                        "h1": page.get("h1") or [],
                        "h2": page.get("h2") or [],
                        "links": page.get("links") or [],
                        "images": page.get("images") or [],
                        "footerLinks": [],
                        "navMenuDepth": 1,
                        "heroPresentation": page.get("heroPresentation")
                        or {
                            "mode": "split",
                            "hasHeading": False,
                            "hasForegroundImage": False,
                            "hasBackgroundImage": False,
                        },
                        "heroCarousel": page.get("heroCarousel")
                        or {
                            "enabled": False,
                            "signalCount": 0,
                            "signals": [],
                            "images": [],
                        },
                        "htmlChars": int(page.get("html_chars") or 0),
                        "internalLinksCount": len(links_out),
                        "error": str(page.get("error") or ""),
                        "category": category,
                        "markdown": str(page.get("markdown") or ""),
                        "links_out": links_out,
                    }
                )
                print(
                    f"[hybrid-crawl] crawled depth={depth} url={page_url} links={len(links_out)} error={str(page.get('error') or '')[:120]}",
                    flush=True,
                )

                if from_url and page_url:
                    edges.append({"from": from_url, "to": page_url})

                if page.get("error"):
                    errors.append(
                        {
                            "url": page_url or from_url,
                            "error": str(page.get("error") or "error"),
                        }
                    )

                if depth >= max_depth:
                    continue
                for next_url in links_out:
                    if next_url in seen:
                        continue
                    seen.add(next_url)
                    queue.append((next_url, depth + 1, page_url))
    finally:
        await close_crawl_runtime(runtime)

    discovered_urls = dedupe(list(seen), 1000)
    visual_targets = []
    for wanted in ["hero", "pricing", "products", "about", "contact", "blog"]:
        match = next((page for page in pages if page.get("category") == wanted), None)
        if match:
            visual_targets.append(str(match.get("url") or ""))
    if start_url not in visual_targets:
        visual_targets.insert(0, start_url)
    visual_targets = dedupe([v for v in visual_targets if v], 8)

    crawl_result = {
        "version": "1.0",
        "run_id": f"{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}_{slug(parsed.netloc)}",
        "source_url": start_url,
        "meta": {
            "crawler": "crawl4ai+fallback",
            "max_pages": max_pages,
            "max_depth": max_depth,
            "success_pages": len([p for p in pages if not p.get("error")]),
            "failed_pages": len([p for p in pages if p.get("error")]),
        },
        "pages": [
            {
                "url": page.get("url", ""),
                "title": page.get("title", ""),
                "category": page.get("category", "story"),
                "markdown": page.get("markdown", ""),
                "links_out": page.get("links_out", []),
                "hash": f"len:{len(str(page.get('markdown') or ''))}",
            }
            for page in pages
        ],
        "site_graph": edges,
        "assets": {"visual_targets": visual_targets},
    }

    crawl_report = {
        "enabled": True,
        "entryUrl": start_url,
        "origin": root_origin,
        "maxPages": max_pages,
        "maxDepth": max_depth,
        "discoveredUrls": discovered_urls,
        "stats": {
            "discovered": len(discovered_urls),
            "crawled": len(pages),
            "failed": len(errors),
        },
        "pages": pages,
        "errors": errors,
        "blocked": False,
        "antiCrawl": None,
    }

    return {
        "crawl_result": crawl_result,
        "crawl_report": crawl_report,
    }, runtime.warnings or []


def pick_visual_targets(crawl_result: dict[str, Any]) -> list[str]:
    targets = (
        ((crawl_result.get("assets") or {}).get("visual_targets") or [])
        if isinstance(crawl_result, dict)
        else []
    )
    return dedupe([str(item) for item in targets if item], 8)


async def run_playwright_visual(
    crawl_result: dict[str, Any], output_dir: Path
) -> tuple[dict[str, Any], list[str]]:
    warnings: list[str] = []
    screenshot_dir = output_dir / "screenshots"
    screenshot_dir.mkdir(parents=True, exist_ok=True)

    targets = pick_visual_targets(crawl_result)
    screenshots: list[dict[str, Any]] = []
    page_profiles: list[dict[str, Any]] = []
    dom_snapshots: list[dict[str, Any]] = []

    try:
        from playwright.async_api import async_playwright
    except Exception as exc:
        warnings.append(f"playwright_unavailable: {exc}")
        return {
            "version": "1.0",
            "run_id": crawl_result.get("run_id"),
            "screenshots": [],
            "style_profile": {
                "colors": [],
                "fonts": [],
                "font_sizes": [],
                "spacing": [],
                "radius": [],
            },
            "page_style_profile": [],
            "dom_snapshots": [],
            "quality_flags": ["playwright_unavailable"],
        }, warnings

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            for url in targets:
                for viewport_name, viewport in [
                    ("desktop", {"width": 1440, "height": 2200}),
                    ("mobile", {"width": 390, "height": 844}),
                ]:
                    context = await browser.new_context(
                        viewport=viewport, user_agent=USER_AGENT
                    )
                    page = await context.new_page()
                    try:
                        await page.goto(
                            url, wait_until="domcontentloaded", timeout=30000
                        )
                        await page.wait_for_timeout(800)
                        shot_name = f"{slug(urlparse(url).path or 'home')}_{viewport_name}_full.png"
                        shot_path = screenshot_dir / shot_name
                        await page.screenshot(path=str(shot_path), full_page=True)
                        screenshots.append(
                            {
                                "url": url,
                                "viewport": viewport_name,
                                "section": "fullpage",
                                "path": str(shot_path),
                            }
                        )

                        styles = await page.evaluate(
                            """
                            () => {
                              const elems = Array.from(document.querySelectorAll('body *')).slice(0, 900);
                              const colorCount = {};
                              const fontCount = {};
                              const fontSizeCount = {};
                              const spacingCount = {};
                              const radiusCount = {};
                              const bump = (obj, key) => { if (!key) return; obj[key] = (obj[key] || 0) + 1; };
                              elems.forEach((el) => {
                                const st = getComputedStyle(el);
                                bump(colorCount, st.color);
                                bump(colorCount, st.backgroundColor);
                                bump(fontCount, st.fontFamily);
                                bump(fontSizeCount, st.fontSize);
                                bump(spacingCount, st.marginTop);
                                bump(spacingCount, st.paddingTop);
                                bump(radiusCount, st.borderRadius);
                              });
                              const take = (obj, limit = 16) => Object.entries(obj)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, limit)
                                .map(([k, v]) => ({value: k, count: v}));
                              const semantic = Array.from(document.querySelectorAll('header,main,section,article,footer,nav')).slice(0, 80);
                              const nodes = semantic.map((el) => {
                                const st = getComputedStyle(el);
                                const r = el.getBoundingClientRect();
                                return {
                                  tag: el.tagName.toLowerCase(),
                                  role: el.getAttribute('role') || '',
                                  text_len: (el.innerText || '').trim().length,
                                  class_hash: (el.className || '').toString().slice(0, 120),
                                  bbox: {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)},
                                  styles: {
                                    color: st.color,
                                    fontFamily: st.fontFamily,
                                    fontSize: st.fontSize,
                                    paddingTop: st.paddingTop,
                                    backgroundColor: st.backgroundColor
                                  }
                                };
                              });
                              return {
                                colors: take(colorCount),
                                fonts: take(fontCount),
                                font_sizes: take(fontSizeCount),
                                spacing: take(spacingCount),
                                radius: take(radiusCount),
                                nodes,
                              };
                            }
                            """
                        )

                        page_profiles.append(
                            {
                                "url": url,
                                "viewport": viewport_name,
                                "colors": styles.get("colors", []),
                                "fonts": styles.get("fonts", []),
                                "font_sizes": styles.get("font_sizes", []),
                                "spacing": styles.get("spacing", []),
                                "radius": styles.get("radius", []),
                            }
                        )
                        dom_snapshots.append(
                            {
                                "url": url,
                                "viewport": viewport_name,
                                "nodes": styles.get("nodes", []),
                            }
                        )
                    except Exception as exc:
                        warnings.append(
                            f"playwright_capture_failed:{url}:{viewport_name}:{exc}"
                        )
                    finally:
                        await context.close()
        finally:
            await browser.close()

    def aggregate(
        counter_rows: list[dict[str, Any]], key: str, top_n: int = 16
    ) -> list[dict[str, Any]]:
        counter = Counter()
        for row in counter_rows:
            for entry in row.get(key, []):
                value = str(entry.get("value") or "").strip()
                count = int(entry.get("count") or 0)
                if value and count > 0:
                    counter[value] += count
        return [
            {"value": value, "count": count}
            for value, count in counter.most_common(top_n)
        ]

    style_profile = {
        "colors": aggregate(page_profiles, "colors", 24),
        "fonts": aggregate(page_profiles, "fonts", 12),
        "font_sizes": aggregate(page_profiles, "font_sizes", 12),
        "spacing": aggregate(page_profiles, "spacing", 16),
        "radius": aggregate(page_profiles, "radius", 12),
    }

    quality_flags = []
    if len(style_profile["fonts"]) > 8:
        quality_flags.append("font_system_mixed")
    if not style_profile["colors"]:
        quality_flags.append("missing_color_profile")

    return {
        "version": "1.0",
        "run_id": crawl_result.get("run_id"),
        "screenshots": screenshots,
        "style_profile": style_profile,
        "page_style_profile": page_profiles,
        "dom_snapshots": dom_snapshots,
        "quality_flags": quality_flags,
    }, warnings


def infer_colors_from_screenshots(screenshots: list[dict[str, Any]]) -> list[str]:
    try:
        from PIL import Image
    except Exception:
        return []
    colors: list[str] = []
    for shot in screenshots[:6]:
        path = Path(str(shot.get("path") or ""))
        if not path.exists():
            continue
        try:
            img = Image.open(path).convert("RGB").resize((120, 120))
            palette = img.convert("P", palette=Image.ADAPTIVE, colors=6).convert("RGB")
            extracted = sorted(
                (palette.getcolors(120 * 120) or []), key=lambda x: x[0], reverse=True
            )[:5]
            for _, rgb in extracted:
                colors.append("#%02x%02x%02x" % rgb)
        except Exception:
            continue
    return dedupe([item.lower() for item in colors], 24)


def build_component_mapping(crawl_result: dict[str, Any]) -> list[dict[str, Any]]:
    mapping: list[dict[str, Any]] = []
    category_to_component = {
        "hero": "HeroSplit",
        "pricing": "pricing_card",
        "about": "FeatureWithMedia",
        "products": "CardsGrid",
        "contact": "LeadCaptureCTA",
        "blog": "ContentStory",
    }
    for page in crawl_result.get("pages") or []:
        category = str(page.get("category") or "")
        component = category_to_component.get(category)
        if not component:
            continue
        mapping.append(
            {
                "component": component,
                "source": "json",
                "confidence": 0.86,
                "evidence": [f"category:{category}", f"url:{page.get('url', '')}"],
            }
        )
    return mapping[:20]


def fuse_styles(
    crawl_result: dict[str, Any], visual_analysis: dict[str, Any]
) -> dict[str, Any]:
    json_colors = [
        str(entry.get("value") or "").strip().lower()
        for entry in (visual_analysis.get("style_profile") or {}).get("colors", [])
    ]
    image_colors = infer_colors_from_screenshots(
        visual_analysis.get("screenshots") or []
    )
    fused_colors = dedupe([*json_colors, *image_colors], 24)
    tokens = {
        "colors": [
            {"value": value, "source": "json" if value in json_colors else "image"}
            for value in fused_colors
        ],
        "typography": (visual_analysis.get("style_profile") or {}).get("fonts", []),
        "spacing": (visual_analysis.get("style_profile") or {}).get("spacing", []),
        "radius": (visual_analysis.get("style_profile") or {}).get("radius", []),
        "shadow": [],
    }

    conflicts = []
    if json_colors and image_colors and json_colors[0] != image_colors[0]:
        conflicts.append(
            {
                "type": "primary_color_mismatch",
                "json_value": json_colors[0],
                "image_value": image_colors[0],
                "severity": "low",
            }
        )

    return {
        "version": "1.0",
        "run_id": crawl_result.get("run_id"),
        "fusion_policy": {"json_weight": 0.7, "image_weight": 0.3},
        "tokens": tokens,
        "component_mapping": build_component_mapping(crawl_result),
        "conflicts": conflicts,
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def main_async(args: argparse.Namespace) -> int:
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    started_at = datetime.now(timezone.utc)

    crawl_payload, crawl_warnings = await crawl_site(
        url=args.url,
        max_pages=max(1, args.max_pages),
        max_depth=max(0, args.max_depth),
        timeout_ms=max(1000, args.timeout_ms),
        concurrency=max(1, args.concurrency),
        prefer_language=getattr(args, "prefer_language", "en") or "en",
    )
    crawl_result = crawl_payload["crawl_result"]
    crawl_report = crawl_payload["crawl_report"]

    visual_analysis, visual_warnings = await run_playwright_visual(
        crawl_result, output_dir
    )
    style_fused = fuse_styles(crawl_result, visual_analysis)

    duration_ms = int((datetime.now(timezone.utc) - started_at).total_seconds() * 1000)
    crawl_result.setdefault("meta", {})["duration_ms"] = duration_ms

    crawl_result_path = output_dir / "crawl_result.json"
    crawl_report_path = output_dir / "crawl_report.json"
    visual_analysis_path = output_dir / "visual_analysis.json"
    style_fused_path = output_dir / "style_fused.json"

    write_json(crawl_result_path, crawl_result)
    write_json(crawl_report_path, crawl_report)
    write_json(visual_analysis_path, visual_analysis)
    write_json(style_fused_path, style_fused)

    response = {
        "ok": True,
        "url": args.url,
        "output_dir": str(output_dir),
        "crawl_result_path": str(crawl_result_path),
        "crawl_report_path": str(crawl_report_path),
        "visual_analysis_path": str(visual_analysis_path),
        "style_fused_path": str(style_fused_path),
        "stats": crawl_report.get("stats", {}),
        "warnings": [*crawl_warnings, *visual_warnings],
        "generated_at": now_iso(),
    }
    print(json.dumps(response, ensure_ascii=False))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run hybrid Crawl4AI + Playwright pipeline"
    )
    parser.add_argument("--url", required=True, help="Entry URL")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--max-pages", type=int, default=16)
    parser.add_argument("--max-depth", type=int, default=1)
    parser.add_argument("--concurrency", type=int, default=3)
    parser.add_argument("--timeout-ms", type=int, default=20000)
    parser.add_argument(
        "--prefer-language",
        type=str,
        default="en",
        help="Preferred language code (en, zh, etc)",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return asyncio.run(main_async(args))
    except Exception as exc:  # pragma: no cover - CLI safety
        print(json.dumps({"ok": False, "error": str(exc)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

from __future__ import annotations

import asyncio
import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, CacheMode, CrawlerRunConfig


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv()

def _normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    return url


PRICE_RE = re.compile(
    r"(?:[$€£]\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?(?:usd|eur|gbp))", re.I
)
INDUSTRY_KEYWORDS = {
    "defense": ["defense", "military", "mission", "tactical", "secure"],
    "aerospace": ["satellite", "orbit", "space", "aerospace"],
    "telecom": ["telecom", "network", "connectivity", "wireless", "broadband"],
    "energy": ["energy", "power", "grid", "utility"],
    "manufacturing": ["manufacturing", "industrial", "factory", "production"],
    "healthcare": ["healthcare", "medical", "clinical", "patient"],
    "finance": ["finance", "bank", "fintech", "payment", "compliance"],
    "education": ["education", "learning", "school", "university"],
    "logistics": ["logistics", "supply chain", "shipping", "fleet"],
    "security": ["security", "surveillance", "risk", "threat"],
    "enterprise": ["enterprise", "platform", "operations", "workflow"],
}


def _extract_prices(text: str) -> list[str]:
    return list(dict.fromkeys([match.group(0).strip() for match in PRICE_RE.finditer(text)]))

def _download_font_css(urls: list[str]) -> str:
    if not urls:
        return ""
    import urllib.request
    import base64
    import mimetypes
    from urllib.parse import urlparse

    css_parts: list[str] = []
    for url in urls[:4]:
        try:
            with urllib.request.urlopen(url, timeout=10) as resp:
                if resp.status and (resp.status < 200 or resp.status >= 400):
                    continue
                data = resp.read()
            if data:
                text = data.decode("utf-8", errors="ignore")
                if len(text) > 200_000:
                    text = text[:200_000]
                css_parts.append(text)
        except Exception:
            continue
    css = "\n".join(css_parts)
    if not css:
        return css
    url_re = re.compile(r"url\\(['\\\"]?(https?://[^'\\\")]+)['\\\"]?\\)")
    cache: dict[str, str] = {}

    def replace(match: re.Match) -> str:
        font_url = match.group(1)
        if font_url in cache:
            return f"url('{cache[font_url]}')"
        try:
            with urllib.request.urlopen(font_url, timeout=10) as resp:
                if resp.status and (resp.status < 200 or resp.status >= 400):
                    return match.group(0)
                data = resp.read()
            if not data or len(data) > 1_000_000:
                return match.group(0)
            mime = mimetypes.guess_type(urlparse(font_url).path)[0] or "font/woff2"
            encoded = base64.b64encode(data).decode("ascii")
            data_url = f"data:{mime};base64,{encoded}"
            cache[font_url] = data_url
            return f"url('{data_url}')"
        except Exception:
            return match.group(0)

    css = url_re.sub(replace, css)
    return css


def _is_button(el) -> bool:
    if el.name == "button":
        return True
    if el.name == "input" and el.get("type") in {"submit", "button"}:
        return True
    if el.name == "a":
        role = (el.get("role") or "").lower()
        cls = (el.get("class") or [])
        cls_text = " ".join(cls).lower() if isinstance(cls, list) else str(cls).lower()
        return role == "button" or "btn" in cls_text or "button" in cls_text
    return False


def _build_section_payload(
    title: str,
    texts: list[str],
    buttons: list[dict],
    links: list[dict],
    lists: list[list[str]],
    prices: list[str],
    images: list[dict],
    videos: list[dict],
    backgrounds: list[dict],
) -> dict:
    section_text = " ".join([title] + texts).strip()
    list_items = sum(len(items) for items in lists if isinstance(items, list))
    text_value = " ".join(texts).strip()
    payload = {
        "title": title,
        "texts": texts,
        "buttons": buttons,
        "links": links,
        "lists": lists,
        "prices": list(dict.fromkeys(prices)),
        "images": images,
        "videos": videos,
        "backgrounds": backgrounds,
        "text": section_text,
    }
    payload["content"] = {
        "headings": [title] if title else [],
        "texts": texts,
        "buttons": buttons,
        "links": links,
        "lists": lists,
        "images": images,
        "videos": videos,
        "backgrounds": backgrounds,
        "prices": list(dict.fromkeys(prices)),
    }
    payload["metrics"] = {
        "title_len": len(title),
        "text_len": len(text_value),
        "text_count": len(texts),
        "list_count": len(lists),
        "list_items": list_items,
        "button_count": len(buttons),
        "link_count": len(links),
        "image_count": len(images),
        "video_count": len(videos),
        "background_count": len(backgrounds),
    }
    return payload


def _extract_backgrounds_from_style(style: str) -> list[str]:
    if not style:
        return []
    urls = re.findall(r"url\\([\"']?([^\"')]+)[\"']?\\)", style)
    return [url.strip() for url in urls if url.strip()]


def _parse_srcset(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        return ""
    parts = [p.strip() for p in value.split(",") if p.strip()]
    for p in parts:
        url = p.split()[0].strip()
        if url:
            return url
    return ""


def _resolve_image_src(node) -> tuple[str, str]:
    if not getattr(node, "get", None):
        return "", ""
    alt = node.get("alt") or ""
    src = node.get("src") or ""
    if not src:
        for key in [
            "data-src",
            "data-original",
            "data-lazy-src",
            "data-image",
            "data-io-src",
        ]:
            val = node.get(key) or ""
            if isinstance(val, str) and val.strip():
                src = val.strip()
                break
    if not src:
        srcset = node.get("srcset") or node.get("data-srcset") or ""
        if srcset:
            src = _parse_srcset(srcset)
    return src, alt


def _collect_picture_images(root) -> list[dict]:
    items: list[dict] = []
    for pic in root.find_all("picture"):
        chosen = ""
        for source in pic.find_all("source"):
            srcset = source.get("srcset") or source.get("data-srcset") or ""
            candidate = _parse_srcset(srcset)
            if candidate:
                chosen = candidate
                break
        if chosen:
            img = pic.find("img")
            alt = (img.get("alt") if img and getattr(img, "get", None) else "") or ""
            items.append({"src": chosen, "alt": alt})
            continue
        img = pic.find("img")
        if img:
            src, alt = _resolve_image_src(img)
            if src:
                items.append({"src": src, "alt": alt})
    return items


def _collect_section(root) -> dict:
    title_el = root.find(["h1", "h2", "h3"])
    title = title_el.get_text(strip=True) if title_el else ""
    texts = [
        item.get_text(strip=True)
        for item in root.find_all(["p", "span"])
        if item.get_text(strip=True)
    ]
    buttons: list[dict] = []
    links: list[dict] = []
    lists: list[list[str]] = []
    images: list[dict] = []
    videos: list[dict] = []
    backgrounds: list[dict] = []
    prices: list[str] = []
    for list_el in root.find_all(["ul", "ol"]):
        items = [li.get_text(strip=True) for li in list_el.find_all("li")]
        items = [item for item in items if item]
        if items:
            lists.append(items)
            for item in items:
                prices.extend(_extract_prices(item))
    for img in root.find_all("img"):
        src, alt = _resolve_image_src(img)
        if src:
            images.append({"src": src, "alt": alt})
    picture_items = _collect_picture_images(root)
    if picture_items:
        images.extend(picture_items)
    for video in root.find_all("video"):
        src = video.get("src") or ""
        if not src:
            source = video.find("source")
            if source:
                src = source.get("src") or ""
        if src:
            videos.append(
                {"src": src, "poster": video.get("poster") or "", "kind": "video"}
            )
    for iframe in root.find_all("iframe"):
        src = iframe.get("src") or ""
        if src and any(host in src for host in ["youtube", "vimeo", "wistia"]):
            videos.append({"src": src, "poster": "", "kind": "iframe"})
    style = root.get("style") or ""
    for url in _extract_backgrounds_from_style(style):
        backgrounds.append({"src": url, "kind": "background"})
    for styled in root.find_all(style=True):
        if len(backgrounds) >= 6:
            break
        for url in _extract_backgrounds_from_style(styled.get("style") or ""):
            if url:
                backgrounds.append({"src": url, "kind": "background"})
    for el in root.find_all(True):
        for key in ["data-bg", "data-background", "data-background-image"]:
            val = el.get(key) or ""
            if isinstance(val, str) and val.strip():
                backgrounds.append({"src": val.strip(), "kind": "background"})
    for anchor in root.find_all("a"):
        label = anchor.get_text(strip=True)
        href = anchor.get("href") or ""
        if not label and not href:
            continue
        payload = {"label": label, "href": href}
        if _is_button(anchor):
            buttons.append(payload)
        else:
            links.append(payload)
    for button in root.find_all("button"):
        label = button.get_text(strip=True)
        if label:
            buttons.append({"label": label, "href": ""})
    for text in texts:
        prices.extend(_extract_prices(text))
    return _build_section_payload(
        title=title,
        texts=texts,
        buttons=buttons,
        links=links,
        lists=lists,
        prices=prices,
        images=images,
        videos=videos,
        backgrounds=backgrounds,
    )


def _extract_sections(soup: BeautifulSoup) -> list[dict]:
    sections = []
    section_roots = soup.find_all("section")
    if section_roots:
        for root in section_roots:
            payload = _collect_section(root)
            if payload.get("title") or payload.get("texts") or payload.get("lists"):
                sections.append(payload)
        if sections:
            return sections
    headings = soup.find_all(["h1", "h2", "h3"])
    for heading in headings:
        title = heading.get_text(strip=True)
        texts: list[str] = []
        buttons: list[dict] = []
        links: list[dict] = []
        lists: list[list[str]] = []
        images: list[dict] = []
        videos: list[dict] = []
        backgrounds: list[dict] = []
        prices: list[str] = []
        for sibling in heading.next_siblings:
            if getattr(sibling, "name", None) in {"h1", "h2", "h3"}:
                break
            if not getattr(sibling, "name", None):
                continue
            if sibling.name in {"p", "span"}:
                text = sibling.get_text(strip=True)
                if text:
                    texts.append(text)
                    prices.extend(_extract_prices(text))
            if sibling.name in {"ul", "ol"}:
                items = [li.get_text(strip=True) for li in sibling.find_all("li")]
                items = [item for item in items if item]
                if items:
                    lists.append(items)
                    for item in items:
                        prices.extend(_extract_prices(item))
            if sibling.name == "img":
                src, alt = _resolve_image_src(sibling)
                if src:
                    images.append({"src": src, "alt": alt})
            if sibling.name == "picture":
                for item in _collect_picture_images(sibling):
                    images.append(item)
            if sibling.name == "video":
                src = sibling.get("src") or ""
                if not src:
                    source = sibling.find("source")
                    if source:
                        src = source.get("src") or ""
                if src:
                    videos.append(
                        {
                            "src": src,
                            "poster": sibling.get("poster") or "",
                            "kind": "video",
                        }
                    )
            if sibling.name == "iframe":
                src = sibling.get("src") or ""
                if src and any(host in src for host in ["youtube", "vimeo", "wistia"]):
                    videos.append({"src": src, "poster": "", "kind": "iframe"})
            style = sibling.get("style") if hasattr(sibling, "get") else ""
            if style:
                for url in _extract_backgrounds_from_style(style):
                    if url:
                        backgrounds.append({"src": url, "kind": "background"})
            for anchor in sibling.find_all("a"):
                label = anchor.get_text(strip=True)
                href = anchor.get("href") or ""
                if not label and not href:
                    continue
                payload = {"label": label, "href": href}
                if _is_button(anchor):
                    buttons.append(payload)
                else:
                    links.append(payload)
            for button in sibling.find_all("button"):
                label = button.get_text(strip=True)
                if label:
                    buttons.append({"label": label, "href": ""})
        sections.append(
            _build_section_payload(
                title=title,
                texts=texts,
                buttons=buttons,
                links=links,
                lists=lists,
                prices=prices,
                images=images,
                videos=videos,
                backgrounds=backgrounds,
            )
        )
    return sections


def _infer_industry_tags(text_blob: str) -> list[str]:
    tags: list[str] = []
    for tag, keywords in INDUSTRY_KEYWORDS.items():
        if any(keyword in text_blob for keyword in keywords):
            tags.append(tag)
    return tags


def _top_terms(headings: list[str], paragraphs: list[str], limit: int = 8) -> list[str]:
    text = " ".join([*headings, *paragraphs]).lower()
    words = re.findall(r"[a-z0-9]{3,}", text)
    stopwords = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "this",
        "that",
        "your",
        "you",
        "our",
        "are",
        "was",
        "were",
        "can",
        "will",
        "have",
        "has",
        "how",
        "why",
        "all",
        "more",
        "use",
        "about",
        "into",
        "over",
        "than",
        "new",
        "best",
        "get",
        "learn",
        "support",
    }
    counts: dict[str, int] = {}
    for word in words:
        if word in stopwords:
            continue
        counts[word] = counts.get(word, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [word for word, _ in ranked[:limit]]


def _tone_hints(text_blob: str) -> list[str]:
    hints: list[str] = []
    patterns = {
        "trust": ["secure", "compliance", "reliable", "trusted", "risk"],
        "innovation": ["innovative", "cutting-edge", "next-gen", "ai", "automation"],
        "performance": ["fast", "performance", "scale", "uptime", "latency"],
        "simplicity": ["simple", "easy", "intuitive", "streamline"],
        "expertise": ["expert", "proven", "certified", "award"],
    }
    for key, tokens in patterns.items():
        if any(token in text_blob for token in tokens):
            hints.append(key)
    return hints


def _compute_copy_assets(
    headings: list[str],
    paragraphs: list[str],
    sections: list[dict],
    buttons: list[dict],
    links: list[dict],
    prices: list[str],
) -> dict:
    text_blob = " ".join([*headings, *paragraphs]).lower()
    signals = {
        "pricing": bool(re.search(r"\bpricing|price|plan|/mo|/yr|\$\d", text_blob)),
        "faq": bool(re.search(r"\bfaq|question|answers?\b", text_blob)),
        "trust": bool(
            re.search(
                r"\b(testimonial|case study|logo cloud|trusted by|customers?)\b",
                text_blob,
            )
        ),
        "conversion": bool(
            re.search(
                r"\b(contact|demo|get started|signup|sign up|book|trial)\b", text_blob
            )
        ),
    }
    cta_labels = [
        (item.get("label") or "").strip().lower()
        for item in [*buttons, *links]
        if isinstance(item, dict)
    ]
    strong_cta_keywords = {"get started", "request demo", "contact us", "buy now"}
    weak_cta_keywords = {"learn more", "read more", "more", "details"}
    cta_strong = any(label in strong_cta_keywords for label in cta_labels)
    cta_weak = any(label in weak_cta_keywords for label in cta_labels)
    totals = {
        "headings": len(headings),
        "paragraphs": len(paragraphs),
        "sections": len(sections),
        "buttons": len(buttons),
        "links": len(links),
        "prices": len(prices),
        "cta_strong": int(cta_strong),
        "cta_weak": int(cta_weak),
    }
    industry_tags = _infer_industry_tags(text_blob)
    top_terms = _top_terms(headings, paragraphs)
    tone_hints = _tone_hints(text_blob)
    template_hints: list[str] = []
    if signals["pricing"]:
        template_hints.append("use_pricing_table")
    if signals["faq"]:
        template_hints.append("use_faq_section")
    if signals["conversion"]:
        template_hints.append("use_primary_cta")
    if signals["trust"]:
        template_hints.append("use_proof_section")
    cta_samples = [label for label in cta_labels if label][:6]
    recommendations: list[str] = []
    if not cta_strong:
        recommendations.append("add_strong_cta")
    if not signals["trust"]:
        recommendations.append("add_proof_section")
    if signals["pricing"] and not prices:
        recommendations.append("clarify_pricing_details")
    if totals["paragraphs"] > 20 and totals["sections"] < 4:
        recommendations.append("split_long_text_into_sections")
    if not headings:
        recommendations.append("add_hero_heading")
    return {
        "signals": signals,
        "totals": totals,
        "industry_tags": industry_tags,
        "top_terms": top_terms,
        "tone_hints": tone_hints,
        "cta_samples": cta_samples,
        "template_hints": template_hints,
        "recommendations": recommendations,
    }

async def extract_site(url: str, output_root: Path) -> dict:
    url = _normalize_url(url)
    domain = urlparse(url).netloc or url.replace("https://", "").split("/")[0]
    site_dir = output_root / domain
    extract_dir = site_dir / "extract"
    extract_dir.mkdir(parents=True, exist_ok=True)
    crawl_home = site_dir / ".crawl4ai"
    crawl_home.mkdir(parents=True, exist_ok=True)
    original_home = os.environ.get("HOME", "")
    if not os.environ.get("PLAYWRIGHT_BROWSERS_PATH") and original_home:
        os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(
            Path(original_home) / "Library" / "Caches" / "ms-playwright"
        )
    os.environ["HOME"] = str(site_dir)
    os.environ["XDG_CACHE_HOME"] = str(crawl_home)

    config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        remove_overlay_elements=True,
        word_count_threshold=5,
    )

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, config=config)

    markdown = result.markdown or ""
    html = result.html or ""
    soup = BeautifulSoup(html, "html.parser")

    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"])][:20]
    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")][:30]
    font_links: list[str] = []
    for link in soup.find_all("link"):
        rel = " ".join(link.get("rel") or []).lower()
        href = link.get("href") or ""
        if "stylesheet" in rel and href:
            href_lower = href.lower()
            if (
                "fonts.googleapis.com" in href_lower
                or "use.typekit.net" in href_lower
                or "fonts.cdnfonts.com" in href_lower
                or "fonts." in href_lower
            ):
                font_links.append(href)
    for style in soup.find_all("style"):
        text = style.get_text() or ""
        for match in re.findall(r"@import\\s+url\\(['\\\"]?(.*?)['\\\"]?\\)", text):
            href_lower = match.lower()
            if (
                "fonts.googleapis.com" in href_lower
                or "use.typekit.net" in href_lower
                or "fonts.cdnfonts.com" in href_lower
                or "fonts." in href_lower
            ):
                font_links.append(match)
    sections = _extract_sections(soup)
    texts = [item for section in sections for item in section.get("texts", [])]
    buttons = [item for section in sections for item in section.get("buttons", [])]
    links = [item for section in sections for item in section.get("links", [])]
    lists = [item for section in sections for item in section.get("lists", [])]
    prices = [item for section in sections for item in section.get("prices", [])]
    images = [item for section in sections for item in section.get("images", [])]
    font_links = list(dict.fromkeys(font_links))
    font_css = _download_font_css(font_links)
    content_assets = _compute_copy_assets(
        headings, paragraphs, sections, buttons, links, prices
    )

    payload = {
        "url": url,
        "domain": domain,
        "title": title,
        "headings": headings,
        "paragraphs": paragraphs,
        "font_links": font_links,
        "font_css": font_css,
        "sections": sections,
        "texts": texts,
        "buttons": buttons,
        "links": links,
        "lists": lists,
        "prices": prices,
        "images": images,
        "markdown": markdown[:12000],
        "html": html[:12000],
        "content_assets": content_assets,
    }

    output_path = extract_dir / "extract.json"
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return payload


def extract_site_sync(url: str, output_root: Path) -> dict:
    return asyncio.run(extract_site(url, output_root))

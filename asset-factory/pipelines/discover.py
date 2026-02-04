from __future__ import annotations

import xml.etree.ElementTree as ET
import json
from pathlib import Path
from urllib.parse import urlparse, urljoin
from urllib.request import urlopen

from bs4 import BeautifulSoup


def _normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    return url


def _same_domain(base: str, target: str) -> bool:
    return urlparse(base).netloc == urlparse(target).netloc


def _fetch(url: str) -> str:
    with urlopen(url, timeout=20) as response:
        return response.read().decode("utf-8", errors="ignore")


def _parse_sitemap(xml_content: str) -> list[str]:
    urls = []
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError:
        return urls
    for loc in root.iter():
        if loc.tag.endswith("loc") and loc.text:
            urls.append(loc.text.strip())
    return urls


def discover_urls(base_url: str, max_pages: int = 10) -> list[str]:
    base_url = _normalize_url(base_url)
    domain = urlparse(base_url).netloc
    discovered: list[str] = []

    sitemap_urls = []
    try:
        robots = _fetch(urljoin(base_url, "/robots.txt"))
        for line in robots.splitlines():
            if line.lower().startswith("sitemap:"):
                sitemap_urls.append(line.split(":", 1)[1].strip())
    except Exception:
        sitemap_urls = []

    if not sitemap_urls:
        sitemap_urls = [urljoin(base_url, "/sitemap.xml")]

    for sitemap_url in sitemap_urls:
        try:
            sitemap_xml = _fetch(sitemap_url)
            for url in _parse_sitemap(sitemap_xml):
                if _same_domain(base_url, url):
                    discovered.append(url)
        except Exception:
            continue

    if not discovered:
        try:
            html = _fetch(base_url)
            soup = BeautifulSoup(html, "html.parser")
            for link in soup.find_all("a"):
                href = link.get("href")
                if not href:
                    continue
                absolute = urljoin(base_url, href)
                if _same_domain(base_url, absolute):
                    discovered.append(absolute)
        except Exception:
            discovered = [base_url]

    unique = []
    seen = set()
    for url in discovered:
        parsed = urlparse(url)
        if parsed.netloc != domain:
            continue
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
        if normalized in seen:
            continue
        seen.add(normalized)
        unique.append(normalized)
        if len(unique) >= max_pages:
            break

    return unique or [base_url]


def write_discovered(urls: list[str], output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "urls.json"
    output_path.write_text(
        json.dumps({"urls": urls}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return output_path

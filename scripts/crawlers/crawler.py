"""
Web Crawler and Page Analyzer for Template Generation

This module crawls websites, discovers key pages, analyzes structure/content/visuals,
and generates page/section templates.
"""

import asyncio
import json
import re
import hashlib
import ssl
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse

import aiohttp
from bs4 import BeautifulSoup


# Create unverified SSL context for local crawling
SSL_CONTEXT = ssl.create_default_context()
SSL_CONTEXT.check_hostname = False
SSL_CONTEXT.verify_mode = ssl.CERT_NONE


@dataclass
class PageAnalysis:
    """Analysis result for a single page."""

    url: str
    page_type: str  # home, product, about, pricing, case, careers, docs, etc.
    title: str
    description: str
    h1: str
    headings: list  # {'h1': [], 'h2': [], 'h3': [], 'h4': []}
    paragraphs: list
    ctas: list  # [{'text': str, 'url': str, 'type': str}]
    links: list  # Internal navigation links
    images: list  # [{'src': str, 'alt': str, 'type': str}]
    form_count: int
    has_chat_widget: bool
    has_analytics: bool
    visual_features: dict  # Colors, fonts, layout patterns
    content_structure: list  # Section breakdown
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class WebsiteAnalysis:
    """Complete analysis for a website."""

    base_url: str
    domain: str
    pages: list = field(default_factory=list)
    navigation_structure: dict = field(default_factory=dict)
    global_visual_features: dict = field(default_factory=dict)
    key_sections: list = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


class WebsiteCrawler:
    """Crawler that discovers and analyzes website pages."""

    # Page type patterns for classification
    PAGE_TYPE_PATTERNS = {
        "home": ["home", "index", ""],
        "product": [
            "product",
            "products",
            "solutions",
            "systems",
            "platform",
            "technology",
        ],
        "about": ["about", "company", "mission", "story", "team", "culture"],
        "pricing": ["pricing", "price", "plans", "pricing", "cost", "purchase"],
        "case": ["case", "customer", "success", "stories", "work", "portfolio"],
        "careers": ["careers", "jobs", "join", "positions", "openings", "talent"],
        "docs": ["docs", "documentation", "developer", "api", "guides", "learn"],
        "contact": ["contact", "reach", "get", "touch", "support"],
        "blog": ["blog", "news", "updates", "journal", "insights"],
    }

    def __init__(self, max_concurrent: int = 3, timeout: int = 30):
        self.max_concurrent = max_concurrent
        self.timeout = timeout
        self.session: Optional[aiohttp.ClientSession] = None
        self.visited_urls: set = set()

    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        connector = aiohttp.TCPConnector(ssl=SSL_CONTEXT)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            connector=connector,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def normalize_url(self, url: str, base_url: str) -> Optional[str]:
        """Normalize and validate URL."""
        if not url:
            return None
        url = url.strip()
        if url.startswith("javascript:") or url.startswith("mailto:"):
            return None
        if url.startswith("//"):
            url = "https:" + url
        elif not url.startswith("http"):
            url = urljoin(base_url, url)
        parsed = urlparse(url)
        if parsed.netloc != urlparse(base_url).netloc:
            return None
        return url

    def classify_page_type(self, url: str, title: str, nav_links: list) -> str:
        """Classify page type based on URL, title, and navigation."""
        url_lower = url.lower()
        title_lower = title.lower()

        # Check URL patterns
        for page_type, patterns in self.PAGE_TYPE_PATTERNS.items():
            for pattern in patterns:
                if pattern in url_lower or pattern in title_lower:
                    return page_type

        # Check navigation context
        nav_texts = " ".join([link.get("text", "").lower() for link in nav_links])
        for page_type, patterns in self.PAGE_TYPE_PATTERNS.items():
            if page_type in ["home", "contact", "blog"]:
                continue
            for pattern in patterns:
                if pattern in nav_texts:
                    return page_type

        return "landing"  # Default for home/main landing pages

    def extract_colors(self, soup: BeautifulSoup) -> dict:
        """Extract color-related visual features."""
        colors = {
            "background": None,
            "text": None,
            "primary": None,
            "secondary": None,
            "accent": None,
        }

        # Check body styles
        body = soup.find("body")
        if body:
            style = body.get("style", "")
            colors["background"] = self._extract_color(style)

        # Check for common color classes - convert soup to string once
        html = str(soup)

        color_patterns = [
            ("dark", ["bg-slate-900", "bg-gray-900", "bg-black", "dark"]),
            ("light", ["bg-white", "bg-gray-50", "bg-slate-50"]),
            ("blue", ["bg-blue-", "text-blue-"]),
            ("green", ["bg-green-", "text-green-"]),
            ("orange", ["bg-orange-", "text-orange-"]),
            ("purple", ["bg-purple-", "text-purple-"]),
        ]

        for color_name, patterns in color_patterns:
            for pattern in patterns:
                if pattern in html:
                    colors["accent"] = color_name
                    break

        return colors

    def _extract_color(self, style: str) -> Optional[str]:
        """Extract color from style string."""
        color_match = re.search(r"#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)", style)
        return color_match.group(0) if color_match else None

    def extract_fonts(self, soup: BeautifulSoup) -> dict:
        """Extract font-related features."""
        fonts = {
            "heading_font": None,
            "body_font": None,
            "font_weights": [],
        }

        # Check for font-family in styles
        html = str(soup)
        font_families = re.findall(r"font-family:\s*([^;]+)", html)
        if font_families:
            fonts["heading_font"] = font_families[0].strip().strip("'\"")

        # Check common font patterns
        font_patterns = {
            "sans-serif": ["Inter", "Roboto", "Space Grotesk", "Oswald", "Helvetica"],
            "serif": ["Cormorant Garamond", "Playfair", "Merriweather"],
            "mono": ["Space Mono", "JetBrains Mono", "Fira Code"],
        }

        for font_type, fonts_list in font_patterns.items():
            for font in fonts_list:
                if font in html:
                    fonts["heading_font"] = font
                    break

        return fonts

    def analyze_structure(self, soup: BeautifulSoup) -> list:
        """Analyze page structure and identify sections."""
        sections = []

        # Look for semantic sections
        section_tags = ["section", "article", "main", "div"]
        for tag in soup.find_all(section_tags):
            classes = tag.get("class", [])
            tag_id = tag.get("id", "")

            # Identify section type
            section_type = "content"
            if any(c in classes or tag_id for c in ["hero", "header", "banner"]):
                section_type = "hero"
            elif any(c in classes or tag_id for c in ["features", "benefits"]):
                section_type = "features"
            elif any(c in classes or tag_id for c in ["pricing", "plans"]):
                section_type = "pricing"
            elif any(c in classes or tag_id for c in ["testimonials", "reviews"]):
                section_type = "testimonials"
            elif any(c in classes or tag_id for c in ["cta", "call-to-action"]):
                section_type = "cta"
            elif any(c in classes or tag_id for c in ["footer"]):
                section_type = "footer"

            # Extract section content
            h = tag.find(["h1", "h2", "h3"])
            p_tags = tag.find_all("p")

            sections.append(
                {
                    "type": section_type,
                    "heading": h.get_text(strip=True) if h else None,
                    "paragraph_count": len(p_tags),
                    "has_cta": bool(tag.find(["a", "button"])),
                }
            )

        return sections

    async def crawl_page(self, url: str) -> Optional[PageAnalysis]:
        """Crawl and analyze a single page."""
        if url in self.visited_urls:
            return None
        self.visited_urls.add(url)

        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    return None

                html = await response.text()
                soup = BeautifulSoup(html, "html.parser")

                # Extract basic info
                title = soup.title.string if soup.title else ""
                meta_desc = soup.find("meta", {"name": "description"})
                description = meta_desc.get("content", "") if meta_desc else ""
                h1 = soup.find("h1")
                h1_text = h1.get_text(strip=True) if h1 else ""

                # Extract headings
                headings = {"h1": [], "h2": [], "h3": [], "h4": []}
                for level in headings:
                    for h in soup.find_all(level):
                        text = h.get_text(strip=True)
                        if text:
                            headings[level].append(text)

                # Extract paragraphs
                paragraphs = [
                    p.get_text(strip=True)
                    for p in soup.find_all("p")
                    if p.get_text(strip=True)
                ]

                # Extract CTAs
                ctas = []
                for a in soup.find_all("a", href=True):
                    text = a.get_text(strip=True)
                    if text and len(text) < 100:
                        ctas.append(
                            {
                                "text": text,
                                "url": a["href"],
                                "type": self._classify_cta(text),
                            }
                        )

                # Extract navigation links
                nav_links = []
                for nav in soup.find_all("nav"):
                    for a in nav.find_all("a", href=True):
                        href = self.normalize_url(a["href"], url)
                        if href:
                            nav_links.append(
                                {"text": a.get_text(strip=True)[:50], "url": href}
                            )

                # Extract images
                images = []
                for img in soup.find_all("img", src=True):
                    src = img.get("src", "")
                    if src:
                        images.append(
                            {
                                "src": src,
                                "alt": img.get("alt", "")[:100],
                                "type": self._classify_image(img.get("class", [])),
                            }
                        )

                # Extract forms and widgets
                form_count = len(soup.find_all("form"))
                html_lower = html.lower()
                chat_patterns = [
                    "intercom",
                    "crisp",
                    "tawk.to",
                    "livechat",
                    "drift",
                    "chatwoot",
                    "zendesk",
                    "hubspot",
                ]
                has_chat_widget = any(
                    pattern in html_lower for pattern in chat_patterns
                )
                analytics_patterns = [
                    "google-analytics.com",
                    "gtag(",
                    "gtm.js",
                    "googletagmanager",
                    "hm.baidu.com",
                    "baidu.com/hm",
                ]
                has_analytics = any(
                    pattern in html_lower for pattern in analytics_patterns
                )

                # Extract visual features
                visual_features = {
                    "colors": self.extract_colors(soup),
                    "fonts": self.extract_fonts(soup),
                    "layout_patterns": self._detect_layout_patterns(soup),
                }

                # Analyze structure
                content_structure = self.analyze_structure(soup)

                # Classify page type
                page_type = self.classify_page_type(url, title, nav_links)

                return PageAnalysis(
                    url=url,
                    page_type=page_type,
                    title=title,
                    description=description,
                    h1=h1_text,
                    headings=headings,
                    paragraphs=paragraphs[:20],
                    ctas=ctas[:10],
                    links=nav_links[:20],
                    images=images[:10],
                    form_count=form_count,
                    has_chat_widget=has_chat_widget,
                    has_analytics=has_analytics,
                    visual_features=visual_features,
                    content_structure=content_structure,
                )

        except Exception as e:
            print(f"Error crawling {url}: {e}")
            return None

    def to_dict(self, analysis: PageAnalysis) -> dict:
        """Convert PageAnalysis to dict for JSON serialization."""
        return {
            "url": analysis.url,
            "page_type": analysis.page_type,
            "title": analysis.title,
            "description": analysis.description,
            "h1": analysis.h1,
            "headings": analysis.headings,
            "paragraphs": analysis.paragraphs,
            "ctas": analysis.ctas,
            "links": analysis.links,
            "images": analysis.images,
            "form_count": analysis.form_count,
            "has_chat_widget": analysis.has_chat_widget,
            "has_analytics": analysis.has_analytics,
            "visual_features": analysis.visual_features,
            "content_structure": analysis.content_structure,
            "created_at": analysis.created_at,
        }

    def _classify_cta(self, text: str) -> str:
        """Classify CTA type based on text."""
        text_lower = text.lower()
        if any(w in text_lower for w in ["buy", "purchase", "order", "shop"]):
            return "primary"
        if any(w in text_lower for w in ["demo", "trial", "try"]):
            return "secondary"
        if any(w in text_lower for w in ["contact", "get", "touch"]):
            return "contact"
        if any(w in text_lower for w in ["learn", "read", "more"]):
            return "info"
        return "general"

    def _classify_image(self, classes: list) -> str:
        """Classify image type based on classes."""
        classes_str = " ".join(classes).lower()
        if any(c in classes_str for c in ["logo", "brand"]):
            return "logo"
        if any(c in classes_str for c in ["hero", "banner", "header"]):
            return "hero"
        if any(c in classes_str for c in ["product", "device", "machine"]):
            return "product"
        if any(c in classes_str for c in ["team", "people", "portrait"]):
            return "team"
        return "general"

    def _detect_layout_patterns(self, soup: BeautifulSoup) -> dict:
        """Detect layout patterns from page structure."""
        patterns = {
            "has_grid": False,
            "has_flex": False,
            "has_sidebar": False,
            "max_width": None,
            "section_count": 0,
        }

        html = str(soup)

        # Check for CSS Grid patterns in HTML and classes
        grid_patterns = [
            "display: grid",
            "grid-template",
            "grid-cols-",
            "grid-gap-",
            "gap-x-",
        ]
        if any(p in html for p in grid_patterns):
            patterns["has_grid"] = True

        # Check for Flexbox patterns
        flex_patterns = [
            "display: flex",
            "justify-content",
            "align-items",
            "flex-wrap",
            "flex-direction",
        ]
        if any(p in html for p in flex_patterns):
            patterns["has_flex"] = True

        # Check for sidebar
        if soup.find(["aside", "sidebar"]) or "sidebar" in html:
            patterns["has_sidebar"] = True

        # Count sections
        patterns["section_count"] = len(soup.find_all("section"))

        # Extract max-width
        max_width_match = re.search(r"max-width:\s*(\d+)px", html)
        if max_width_match:
            patterns["max_width"] = int(max_width_match.group(1))

        return patterns

    async def crawl_website(
        self, base_url: str, max_pages: int = 20
    ) -> WebsiteAnalysis:
        """Crawl entire website and discover key pages."""
        # Ensure URL has protocol first
        if not base_url.startswith("http"):
            base_url = "https://" + base_url

        domain = urlparse(base_url).netloc

        # First, crawl the homepage
        homepage_analysis = await self.crawl_page(base_url)
        pages = []

        if homepage_analysis:
            pages.append(homepage_analysis)

        # Discover navigation links
        if homepage_analysis and homepage_analysis.links:
            nav_urls = [link["url"] for link in homepage_analysis.links[:15]]

            # Crawl key pages discovered from navigation
            semaphore = asyncio.Semaphore(self.max_concurrent)

            async def crawl_with_limit(url):
                async with semaphore:
                    return await self.crawl_page(url)

            tasks = [crawl_with_limit(url) for url in nav_urls]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in results:
                if isinstance(result, PageAnalysis) and result:
                    # Avoid duplicates
                    if not any(p.url == result.url for p in pages):
                        pages.append(result)

        # Classify pages and identify key sections
        page_types = {}
        for page in pages:
            if page.page_type not in page_types:
                page_types[page.page_type] = []
            page_types[page.page_type].append(page)

        # Extract global visual features from homepage
        global_visual = {}
        if homepage_analysis:
            global_visual = homepage_analysis.visual_features

        # Identify key sections across all pages
        key_sections = []
        for page in pages:
            for section in page.content_structure:
                if section["type"] not in ["content", "footer"]:
                    if not any(s["type"] == section["type"] for s in key_sections):
                        key_sections.append(section)

        return WebsiteAnalysis(
            base_url=base_url,
            domain=domain,
            pages=[asdict(p) for p in pages],
            navigation_structure=page_types,
            global_visual_features=global_visual,
            key_sections=key_sections,
        )


async def main():
    """Main entry point for testing."""
    urls = [
        "kymetacorp.com",
        "varda.com",
        "carbon3d.com",
        "boomsupersonic.com",
        "anduril.com",
    ]

    async with WebsiteCrawler() as crawler:
        for url in urls:
            print(f"\nCrawling {url}...")
            analysis = await crawler.crawl_website(url)

            output_path = Path(
                f"/Users/beihuang/Documents/opencode/shpitto/output/crawled/{analysis.domain}.json"
            )
            output_path.parent.mkdir(exist_ok=True)

            with output_path.open("w", encoding="utf-8") as f:
                json.dump(asdict(analysis), f, ensure_ascii=False, indent=2)

            print(f"  Found {len(analysis.pages)} pages")
            print(f"  Page types: {list(analysis.navigation_structure.keys())}")


if __name__ == "__main__":
    asyncio.run(main())

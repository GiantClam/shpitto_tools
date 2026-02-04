"""
Web Crawler and Page Analyzer for Template Generation

Uses Crawl4AI for intelligent web crawling with LLM-friendly output.
Supports JavaScript rendering and generates markdown for easier analysis.
"""

import asyncio
import json
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse, urljoin

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode


@dataclass
class PageAnalysis:
    """Analysis result for a single page."""

    url: str
    page_type: str
    title: str
    description: str
    h1: str
    headings: dict
    paragraphs: list
    ctas: list
    links: list
    images: list
    form_count: int
    has_chat_widget: bool
    has_analytics: bool
    visual_features: dict
    content_structure: list
    markdown: str
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


class Crawl4AICrawler:
    """Crawler using Crawl4AI for intelligent web crawling."""

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
        "pricing": ["pricing", "price", "plans", "cost", "purchase"],
        "case": ["case", "customer", "success", "stories", "work", "portfolio"],
        "careers": ["careers", "jobs", "join", "positions", "openings", "talent"],
        "docs": ["docs", "documentation", "developer", "api", "guides", "learn"],
        "contact": ["contact", "reach", "get", "touch", "support"],
        "blog": ["blog", "news", "updates", "journal", "insights"],
    }

    def __init__(self, max_concurrent: int = 3):
        self.max_concurrent = max_concurrent
        self.session: Optional[AsyncWebCrawler] = None
        self.visited_urls: set = set()

    async def __aenter__(self):
        config = CrawlerRunConfig(
            remove_overlay_elements=True,
            cache_mode=CacheMode.BYPASS,
        )
        self.session = AsyncWebCrawler()
        await self.session.start()
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

        for page_type, patterns in self.PAGE_TYPE_PATTERNS.items():
            for pattern in patterns:
                if pattern in url_lower or pattern in title_lower:
                    return page_type

        nav_texts = " ".join([link.get("text", "").lower() for link in nav_links])
        for page_type, patterns in self.PAGE_TYPE_PATTERNS.items():
            if page_type in ["home", "contact", "blog"]:
                continue
            for pattern in patterns:
                if pattern in nav_texts:
                    return page_type

        return "landing"

    def extract_colors_from_markdown(self, markdown: str) -> dict:
        """Extract color-related visual features from markdown/HTML."""
        colors = {
            "background": None,
            "text": None,
            "primary": None,
            "secondary": None,
            "accent": None,
        }

        color_patterns = [
            (
                "dark",
                [
                    "bg-slate-900",
                    "bg-gray-900",
                    "bg-black",
                    "dark",
                    "#0f172a",
                    "#1e293b",
                ],
            ),
            ("light", ["bg-white", "bg-gray-50", "bg-slate-50", "#ffffff", "#f8fafc"]),
            ("blue", ["bg-blue-", "text-blue-", "#0066ff", "#3b82f6", "#1d4ed8"]),
            ("green", ["bg-green-", "text-green-", "#10b981", "#059669"]),
            ("orange", ["bg-orange-", "text-orange-", "#f97316", "#ea580c"]),
            ("purple", ["bg-purple-", "text-purple-", "#8b5cf6", "#7c3aed"]),
        ]

        for color_name, patterns in color_patterns:
            for pattern in patterns:
                if pattern in markdown.lower():
                    colors["accent"] = color_name
                    break

        return colors

    def extract_fonts_from_markdown(self, markdown: str) -> dict:
        """Extract font-related features from markdown/HTML."""
        fonts = {
            "heading_font": None,
            "body_font": None,
            "font_weights": [],
        }

        font_patterns = {
            "sans-serif": [
                "Inter",
                "Roboto",
                "Space Grotesk",
                "Oswald",
                "Helvetica",
                "sans-serif",
            ],
            "serif": ["Cormorant Garamond", "Playfair", "Merriweather", "serif"],
            "mono": ["Space Mono", "JetBrains Mono", "Fira Code", "mono"],
        }

        markdown_lower = markdown.lower()
        for font_type, fonts_list in font_patterns.items():
            for font in fonts_list:
                if font.lower() in markdown_lower:
                    fonts["heading_font"] = font
                    break

        if not fonts["heading_font"]:
            fonts["heading_font"] = "Inter"

        return fonts

    def analyze_structure(self, markdown: str, html: str) -> list:
        """Analyze page structure and identify sections."""
        sections = []

        section_patterns = {
            "hero": ["hero", "header", "banner", "jumbotron"],
            "features": ["features", "benefits", "why us", "what we do"],
            "pricing": ["pricing", "plans", "pricing table", "get started"],
            "testimonials": ["testimonials", "reviews", "what they say", "customer"],
            "cta": ["cta", "call to action", "get started", "sign up"],
            "footer": ["footer", "links", "contact us"],
        }

        markdown_lower = markdown.lower()
        html_lower = html.lower()

        for section_type, keywords in section_patterns.items():
            if any(kw in markdown_lower or kw in html_lower for kw in keywords):
                sections.append(
                    {
                        "type": section_type,
                        "heading": None,
                        "paragraph_count": 1,
                        "has_cta": section_type == "cta",
                    }
                )

        return (
            sections
            if sections
            else [
                {
                    "type": "content",
                    "heading": None,
                    "paragraph_count": 1,
                    "has_cta": False,
                }
            ]
        )

    def extract_ctas(self, markdown: str, html: str) -> list:
        """Extract CTAs from markdown/HTML."""
        ctas = []

        cta_patterns = [
            (r"\[([^\]]+)\]\(([^)]+)\)", "link"),
            (r"<a[^>]+href=\"([^\"]+)\"[^>]*>([^<]+)</a>", "link"),
        ]

        for pattern, cta_type in cta_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for url, text in matches[:10]:
                if text and len(text) < 100:
                    cta_type = self.classify_cta(text)
                    ctas.append({"text": text.strip(), "url": url, "type": cta_type})

        return ctas[:10]

    def classify_cta(self, text: str) -> str:
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

    def extract_links(self, html: str, base_url: str) -> list:
        """Extract internal navigation links."""
        links = []

        link_patterns = [
            r'<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>',
            r"\[([^\]]+)\]\(([^)]+)\)",
        ]

        for pattern in link_patterns:
            matches = re.findall(pattern, html)
            for url, text in matches:
                normalized = self.normalize_url(url, base_url)
                if normalized and text.strip():
                    links.append(
                        {
                            "text": text.strip()[:50],
                            "url": normalized,
                        }
                    )

        return links[:20]

    def extract_images(self, html: str) -> list:
        """Extract images."""
        images = []

        img_pattern = r'<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>'
        matches = re.findall(img_pattern, html)

        for src, alt in matches[:10]:
            if src:
                images.append(
                    {
                        "src": src,
                        "alt": alt.strip()[:100],
                        "type": self.classify_image(alt),
                    }
                )

        return images

    def classify_image(self, alt: str) -> str:
        """Classify image type based on alt text."""
        alt_lower = alt.lower()
        if any(c in alt_lower for c in ["logo", "brand"]):
            return "logo"
        if any(c in alt_lower for c in ["hero", "banner", "header"]):
            return "hero"
        if any(c in alt_lower for c in ["product", "device", "machine"]):
            return "product"
        if any(c in alt_lower for c in ["team", "people", "portrait"]):
            return "team"
        return "general"

    async def crawl_page(self, url: str) -> Optional[PageAnalysis]:
        """Crawl and analyze a single page using Crawl4AI."""
        if url in self.visited_urls:
            return None
        self.visited_urls.add(url)

        if not self.session:
            return None

        try:
            result = await self.session.arun(
                url=url,
                config=CrawlerRunConfig(
                    remove_overlay_elements=True,
                    cache_mode=CacheMode.BYPASS,
                    word_count_threshold=10,
                ),
            )

            if not result.success:
                return None

            markdown = result.markdown or ""
            html = result.html or ""

            from bs4 import BeautifulSoup

            soup = BeautifulSoup(html, "html.parser")

            title = soup.title.string if soup.title else ""
            meta_desc = soup.find("meta", {"name": "description"})
            description = meta_desc.get("content", "") if meta_desc else ""

            h1 = soup.find("h1")
            h1_text = h1.get_text(strip=True) if h1 else ""

            headings = {"h1": [], "h2": [], "h3": [], "h4": []}
            for level in headings:
                for h in soup.find_all(level):
                    text = h.get_text(strip=True)
                    if text:
                        headings[level].append(text)

            paragraphs = [
                p.get_text(strip=True)
                for p in soup.find_all("p")
                if p.get_text(strip=True)
            ]

            ctas = self.extract_ctas(markdown, html)
            links = self.extract_links(html, url)
            images = self.extract_images(html)

            visual_features = {
                "colors": self.extract_colors_from_markdown(markdown),
                "fonts": self.extract_fonts_from_markdown(markdown),
                "layout_patterns": {
                    "has_grid": "grid" in markdown.lower()
                    or "display: grid" in html.lower(),
                    "has_flex": "flex" in markdown.lower()
                    or "display: flex" in html.lower(),
                },
            }

            content_structure = self.analyze_structure(markdown, html)

            page_type = self.classify_page_type(url, title, links)

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
            has_chat_widget = any(p in html.lower() for p in chat_patterns)

            analytics_patterns = [
                "google-analytics.com",
                "gtag(",
                "gtm.js",
                "googletagmanager",
                "hm.baidu.com",
            ]
            has_analytics = any(p in html.lower() for p in analytics_patterns)

            form_count = len(soup.find_all("form"))

            return PageAnalysis(
                url=url,
                page_type=page_type,
                title=title,
                description=description,
                h1=h1_text,
                headings=headings,
                paragraphs=paragraphs[:20],
                ctas=ctas[:10],
                links=links[:20],
                images=images[:10],
                form_count=form_count,
                has_chat_widget=has_chat_widget,
                has_analytics=has_analytics,
                visual_features=visual_features,
                content_structure=content_structure,
                markdown=markdown[:2000],
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
            "markdown": analysis.markdown,
            "created_at": analysis.created_at,
        }

    async def crawl_website(
        self, base_url: str, max_pages: int = 20
    ) -> WebsiteAnalysis:
        """Crawl entire website and discover key pages."""
        if not base_url.startswith("http"):
            base_url = "https://" + base_url

        domain = urlparse(base_url).netloc

        homepage_analysis = await self.crawl_page(base_url)
        pages = []

        if homepage_analysis:
            pages.append(homepage_analysis)

        if homepage_analysis and homepage_analysis.links:
            nav_urls = [link["url"] for link in homepage_analysis.links[:15]]
            semaphore = asyncio.Semaphore(self.max_concurrent)

            async def crawl_with_limit(url):
                async with semaphore:
                    return await self.crawl_page(url)

            tasks = [crawl_with_limit(url) for url in nav_urls[:max_pages]]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in results:
                if isinstance(result, PageAnalysis) and result:
                    if not any(p.url == result.url for p in pages):
                        pages.append(result)

        page_types = {}
        for page in pages:
            if page.page_type not in page_types:
                page_types[page.page_type] = []
            page_types[page.page_type].append(page)

        global_visual = {}
        if homepage_analysis:
            global_visual = homepage_analysis.visual_features

        key_sections = []
        for page in pages:
            for section in page.content_structure:
                if section["type"] not in ["content", "footer"]:
                    if not any(s["type"] == section["type"] for s in key_sections):
                        key_sections.append(section)

        return WebsiteAnalysis(
            base_url=base_url,
            domain=domain,
            pages=[self.to_dict(p) for p in pages],
            navigation_structure=page_types,
            global_visual_features=global_visual,
            key_sections=key_sections,
        )


async def main():
    """Main entry point for testing."""
    urls = [
        "https://kymetacorp.com",
        "https://varda.com",
        "https://carbon3d.com",
    ]

    async with Crawl4AICrawler() as crawler:
        for url in urls:
            print(f"\nCrawling: {url}")
            analysis = await crawler.crawl_website(url)

            output_path = Path(
                f"/Users/beihuang/Documents/opencode/shpitto/output/crawled/{analysis.domain}.json"
            )
            output_path.parent.mkdir(exist_ok=True)

            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(asdict(analysis), f, ensure_ascii=False, indent=2)

            print(f"  Found {len(analysis.pages)} pages")
            print(f"  Page types: {list(analysis.navigation_structure.keys())}")


if __name__ == "__main__":
    asyncio.run(main())

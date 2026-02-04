"""
Template Generator from Crawled Website Analysis

This module generates page and section templates from analyzed websites.
"""

import json
import re
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional


@dataclass
class GeneratedPageTemplate:
    """Generated page template from website analysis."""

    name: str
    slug: str
    source_url: str
    template_type: str = "page"
    template_kind: str = "landing"
    template_source: str = "crawled"
    description: str = ""
    raw_description: str = ""
    visual_spec: dict = None
    interaction_spec: dict = None
    copy_spec: dict = None
    puck_data: dict = None
    created_at: str = None


@dataclass
class GeneratedSectionTemplate:
    """Generated section template from website analysis."""

    name: str
    slug: str
    source_url: str
    template_type: str = "section"
    template_kind: str = "hero"
    template_source: str = "crawled"
    description: str = ""
    visual_spec: dict = None
    puck_data: dict = None
    created_at: str = None


class TemplateGenerator:
    """Generates page and section templates from crawled analysis."""

    PAGE_TYPE_MAPPING = {
        "home": "landing",
        "product": "product",
        "about": "about",
        "pricing": "pricing",
        "case": "case-study",
        "careers": "careers",
        "docs": "docs",
        "landing": "landing",
    }

    SECTION_TYPE_MAPPING = {
        "hero": "hero",
        "features": "value-props",
        "feature-highlight": "feature-highlight",
        "product": "product-preview",
        "testimonials": "testimonials",
        "pricing": "pricing",
        "cta": "cta",
        "logos": "logos",
        "faq": "faq",
        "footer": "footer",
    }

    def __init__(self):
        self.generated_pages = []
        self.generated_sections = []

    def slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug."""
        if not text:
            return "untitled"
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s-]", "", text)
        text = re.sub(r"[\s-]+", "-", text)
        return text.strip("-")

    def extract_palette_from_analysis(self, visual_features: dict) -> dict:
        """Extract color palette from visual analysis."""
        colors = visual_features.get("colors", {})
        accent = colors.get("accent") or "blue"

        palette_map = {
            "blue": {"primary": "#0b1020", "accent": "#38bdf8"},
            "green": {"primary": "#0f172a", "accent": "#22c55e"},
            "orange": {"primary": "#1f2937", "accent": "#f97316"},
            "purple": {"primary": "#111827", "accent": "#a855f7"},
            "red": {"primary": "#1f2937", "accent": "#ef4444"},
            "yellow": {"primary": "#1f2937", "accent": "#eab308"},
            "white": {"primary": "#111827", "accent": "#ffffff"},
            "dark": {"primary": "#0a0f1f", "accent": "#60a5fa"},
        }

        return palette_map.get(accent, {"primary": "#0f172a", "accent": "#2563eb"})

    def extract_font_from_analysis(self, visual_features: dict) -> str:
        """Extract font family from visual analysis."""
        fonts = visual_features.get("fonts", {})
        font = fonts.get("heading_font") or ""

        font_map = {
            "space": "Space Grotesk",
            "oswald": "Oswald",
            "inter": "Inter",
            "helvetica": "Helvetica Neue",
            "cormorant": "Cormorant Garamond",
            "space mono": "Space Mono",
        }

        font_lower = font.lower()
        for key, value in font_map.items():
            if key in font_lower:
                return value

        return "Space Grotesk"  # Default industrial font

    def determine_layout_from_analysis(self, analysis: dict) -> dict:
        """Determine layout properties from analysis."""
        patterns = analysis.get("visual_features", {}).get("layout_patterns", {})

        return {
            "aspect_ratio": "16:9",
            "resolution": "1920x1080",
            "radius": "md",
            "has_grid": patterns.get("has_grid", False),
            "has_flex": patterns.get("has_flex", False),
        }

    def build_puck_content_from_page(self, analysis: dict) -> list:
        """Build Puck content array from page analysis."""
        content = []

        # Hero section
        hero = self._build_hero_from_analysis(analysis)
        if hero:
            content.append(hero)

        # Stats if present
        if analysis.get("headings", {}).get("h2"):
            stats = self._build_stats_from_analysis(analysis)
            if stats:
                content.append(stats)

        # Features / Value Props
        if analysis.get("content_structure"):
            features = self._build_features_from_analysis(analysis)
            content.extend(features)

        # Testimonials
        testimonials = self._build_testimonials_from_analysis(analysis)
        if testimonials:
            content.append(testimonials)

        # CTA
        cta = self._build_cta_from_analysis(analysis)
        if cta:
            content.append(cta)

        return self._ensure_required_sections(content, analysis)

    def _ensure_required_sections(self, content: list, analysis: dict) -> list:
        """Ensure core conversion sections exist."""
        existing_types = {block.get("type") for block in content if block}

        if "Hero" not in existing_types:
            content.insert(0, self._build_hero_from_analysis(analysis))

        if "ValuePropositions" not in existing_types:
            content.append(self._default_features())

        if "Testimonials" not in existing_types:
            content.append(self._default_testimonial())

        if "CTASection" not in existing_types:
            content.append(self._default_cta())

        return [block for block in content if block]

    def _build_hero_from_analysis(self, analysis: dict) -> Optional[dict]:
        """Build Hero component from analysis."""
        h1 = analysis.get("h1", "")
        paragraphs = analysis.get("paragraphs", [])
        description = paragraphs[0] if paragraphs else analysis.get("description", "")

        ctas = analysis.get("ctas", [])
        primary_cta = next(
            (c for c in ctas if c.get("type") == "primary"), ctas[0] if ctas else None
        )

        visual = analysis.get("visual_features", {})
        colors = visual.get("colors", {})

        # Determine theme
        theme = "dark"
        bg = colors.get("background", "")
        if bg and ("white" in bg.lower() or "#fff" in bg.lower()):
            theme = "light"
        elif "glass" in str(analysis.get("content_structure", [])).lower():
            theme = "glass"

        return {
            "type": "Hero",
            "props": {
                "title": h1[:80] if h1 else "Industrial Systems",
                "description": description[:300] if description else "",
                "ctaText": primary_cta.get("text", "Learn More")
                if primary_cta
                else "Learn More",
                "theme": theme,
                "align": "text-center",
                "effect": "none",
            },
        }

    def _build_stats_from_analysis(self, analysis: dict) -> Optional[dict]:
        """Build Stats component from analysis."""
        h2_headings = analysis.get("headings", {}).get("h2", [])
        paragraphs = analysis.get("paragraphs", [])

        # Try to extract numeric values from headings
        items = []
        for h in h2_headings[:4]:
            match = re.search(r"([\d]+[kKmM%]?)", h)
            label = re.sub(r"^[\d]+[kKmM%]+", "", h).strip(": ") or "Metric"
            items.append(
                {
                    "label": label[:20],
                    "value": match.group(1) if match else "0",
                    "suffix": "%"
                    if "%" in (h if match else "")
                    else ("+" if any(c in h for c in ["+", "more"]) else ""),
                }
            )

        if not items:
            items = [
                {"label": "Reliability", "value": "99", "suffix": "%"},
                {"label": "Deployments", "value": "50", "suffix": "+"},
                {"label": "Efficiency", "value": "35", "suffix": "%"},
                {"label": "Growth", "value": "2x", "suffix": ""},
            ]

        return {"type": "Stats", "props": {"items": items}}

    def _build_features_from_analysis(self, analysis: dict) -> list:
        """Build feature/value prop sections from analysis."""
        features = []
        h2_headings = analysis.get("headings", {}).get("h2", [])
        paragraphs = analysis.get("paragraphs", [])

        # Group h2 with following paragraphs
        i = 0
        paragraph_idx = 0
        for h2 in h2_headings[:3]:
            feature_paragraphs = []
            while paragraph_idx < len(paragraphs) and len(feature_paragraphs) < 2:
                if len(paragraphs[paragraph_idx]) > 50:
                    feature_paragraphs.append(paragraphs[paragraph_idx])
                paragraph_idx += 1

            features.append(
                {
                    "type": "ValuePropositions",
                    "props": {
                        "title": h2[:50],
                        "items": [
                            {
                                "title": h2[:30],
                                "description": feature_paragraphs[0][:150]
                                if feature_paragraphs
                                else "",
                            },
                        ],
                    },
                }
            )

        return features

    def _build_testimonials_from_analysis(self, analysis: dict) -> Optional[dict]:
        """Build Testimonials component from analysis."""
        paragraphs = analysis.get("paragraphs", [])

        # Look for quote-like content
        quotes = [
            p
            for p in paragraphs
            if any(
                q in p for q in ['"', '"', '"', "—", "–", "customer", "client", "user"]
            )
        ]

        if not quotes:
            return None

        return {
            "type": "Testimonials",
            "props": {
                "title": "What They Say",
                "items": [
                    {
                        "content": quotes[0][:200],
                        "author": "Operations Lead",
                        "role": "Industrial Systems",
                    }
                ],
            },
        }

    def _build_cta_from_analysis(self, analysis: dict) -> Optional[dict]:
        """Build CTA component from analysis."""
        ctas = analysis.get("ctas", [])
        primary_cta = next(
            (c for c in ctas if c.get("type") == "primary"), ctas[0] if ctas else None
        )

        if not primary_cta:
            return None

        return {
            "type": "CTASection",
            "props": {
                "title": "Ready to Get Started?",
                "description": "Explore our systems and deploy with confidence.",
                "ctaText": primary_cta.get("text", "Contact Us"),
                "ctaLink": primary_cta.get("url", "#"),
                "variant": "simple",
            },
        }

    def generate_from_crawled_data(self, crawled_data: dict) -> tuple:
        """Generate templates from crawled website data."""
        domain = crawled_data.get("domain", "")
        base_url = crawled_data.get("base_url", "")
        pages = crawled_data.get("pages", [])
        navigation = crawled_data.get("navigation_structure", {})
        global_visual = crawled_data.get("global_visual_features", {})

        pages_generated = 0
        sections_generated = 0

        for page in pages:
            page_type = page.get("page_type", "landing")
            # Make slug unique by including full URL path hash
            page_url = page.get("url", base_url)
            page_url_hash = hash(page_url) & 0xFFFFFF  # More bits for uniqueness
            slug = f"{domain}-{page_type}-{page_url_hash:06x}"

            # Build visual spec
            palette = self.extract_palette_from_analysis(
                page.get("visual_features", global_visual)
            )
            font = self.extract_font_from_analysis(
                page.get("visual_features", global_visual)
            )
            layout = self.determine_layout_from_analysis(page)

            visual_spec = {
                "typography": {
                    "heading": "48px",
                    "body": "16px",
                    "font": font,
                },
                "layout": layout,
                "flow_name": page.get("title", domain)[:30],
                "theme": "dark",
                "palette": palette,
                "align": "text-center",
                "effect": "none",
                "raw_segments": page.get("paragraphs", [])[:5],
            }

            # Build Puck content
            puck_content = self.build_puck_content_from_page(page)

            puck_data = {
                "root": {
                    "props": {
                        "title": page.get("title", domain)[:30],
                        "branding": {
                            "name": domain.capitalize(),
                            "colors": palette,
                            "style": {
                                "typography": font,
                                "borderRadius": layout.get("radius", "md"),
                            },
                        },
                    },
                },
                "content": puck_content,
            }

            copy_spec = {
                "tone": self._infer_tone_from_content(page),
                "vocabulary": page.get("paragraphs", [])[:10],
                "raw_description": page.get("description", "")[:500],
            }

            interaction_spec = {
                "raw_segments": [],
            }

            # Create page template
            page_template = GeneratedPageTemplate(
                name=f"{domain.title()} {page_type.title()} Page",
                slug=self.slugify(slug),
                source_url=page.get("url", base_url),
                template_type="page",
                template_kind=self.PAGE_TYPE_MAPPING.get(page_type, page_type),
                template_source="crawled",
                description=page.get("description", "")[:200],
                raw_description=f"Crawled from {base_url} - {page.get('title', '')}",
                visual_spec=visual_spec,
                interaction_spec=interaction_spec,
                copy_spec=copy_spec,
                puck_data=puck_data,
                created_at=datetime.now().isoformat(),
            )

            self.generated_pages.append(asdict(page_template))
            pages_generated += 1

            # Generate section templates from page structure
            for idx, section in enumerate(page.get("content_structure", [])):
                if section["type"] in self.SECTION_TYPE_MAPPING:
                    section_kind = self.SECTION_TYPE_MAPPING[section["type"]]
                    # Make section slug unique with page index
                    page_url = page.get("url", base_url)
                    section_url_hash = hash(page_url) & 0xFFFFFF
                    section_slug = (
                        f"{domain}-{section['type']}-{section_url_hash:06x}-{idx}"
                    )

                    section_template = GeneratedSectionTemplate(
                        name=f"{domain.title()} {section['type'].title()} Section",
                        slug=self.slugify(section_slug),
                        source_url=page.get("url", base_url),
                        template_type="section",
                        template_kind=section_kind,
                        template_source="crawled",
                        description=f"Section extracted from {base_url}",
                        visual_spec=visual_spec,
                        puck_data={
                            "root": puck_data["root"],
                            "content": [self._build_section_content(section, page)],
                        },
                        created_at=datetime.now().isoformat(),
                    )

                    self.generated_sections.append(asdict(section_template))
                    sections_generated += 1

        return pages_generated, sections_generated

    def _build_section_content(self, section: dict, page: dict) -> dict:
        """Build section content block."""
        section_type = section["type"]

        if section_type == "hero":
            return self._build_hero_from_analysis(page)
        elif section_type == "features":
            return (
                self._build_features_from_analysis(page)[0]
                if self._build_features_from_analysis(page)
                else None
            )
        elif section_type == "testimonials":
            return (
                self._build_testimonials_from_analysis(page)
                or self._default_testimonial()
            )
        elif section_type == "cta":
            return self._build_cta_from_analysis(page) or self._default_cta()
        else:
            return self._default_content_section(section, page)

    def _default_testimonial(self) -> dict:
        return {
            "type": "Testimonials",
            "props": {
                "title": "Customer Perspectives",
                "items": [
                    {
                        "content": "Outstanding performance and reliability across our deployment.",
                        "author": "Systems Lead",
                        "role": "Operations",
                    }
                ],
            },
        }

    def _default_features(self) -> dict:
        return {
            "type": "ValuePropositions",
            "props": {
                "title": "Why Teams Choose Us",
                "items": [
                    {
                        "title": "Proven Reliability",
                        "description": "Field-tested systems with consistent uptime.",
                    },
                    {
                        "title": "Fast Deployment",
                        "description": "Streamlined onboarding and clear rollout steps.",
                    },
                    {
                        "title": "Dedicated Support",
                        "description": "Expert guidance from planning to launch.",
                    },
                ],
            },
        }

    def _default_cta(self) -> dict:
        return {
            "type": "CTASection",
            "props": {
                "title": "Ready to Deploy?",
                "description": "Contact our team to discuss your requirements.",
                "ctaText": "Contact Us",
                "ctaLink": "#",
                "variant": "simple",
            },
        }

    def _default_content_section(self, section: dict, page: dict) -> dict:
        h2 = page.get("headings", {}).get("h2", [])
        return {
            "type": "FeatureHighlight",
            "props": {
                "title": section.get("heading", h2[0] if h2 else "Feature"),
                "description": page.get("paragraphs", [""])[0][:200]
                if page.get("paragraphs")
                else "",
                "align": "left",
                "features": [],
            },
        }

    def _infer_tone_from_content(self, page: dict) -> str:
        """Infer copy tone from page content."""
        text = " ".join(page.get("paragraphs", [])[:5]).lower()

        if any(
            w in text for w in ["revolutionary", "transform", "breakthrough", "future"]
        ):
            return "visionary"
        if any(w in text for w in ["precision", "reliable", "proven", "trusted"]):
            return "professional"
        if any(w in text for w in ["simple", "easy", "quick", "fast"]):
            return "accessible"
        if any(w in text for w in ["powerful", "robust", "heavy", "industrial"]):
            return "industrial"
        return "professional"

    def save_templates(
        self,
        output_dir: str = "/Users/beihuang/Documents/opencode/shpitto/output/templates",
    ):
        """Save all generated templates."""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        # Combine all templates
        all_templates = self.generated_pages + self.generated_sections

        # Save as JSON
        output_file = output_path / "crawled_templates.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_templates, f, ensure_ascii=False, indent=2)

        print(f"Saved {len(all_templates)} templates to {output_file}")
        return str(output_file)


async def process_all_crawled_data():
    """Process all crawled website data."""
    crawled_dir = Path("/Users/beihuang/Documents/opencode/shpitto/output/crawled")

    generator = TemplateGenerator()

    for crawled_file in crawled_dir.glob("*.json"):
        print(f"\nProcessing {crawled_file.name}...")

        with open(crawled_file, "r", encoding="utf-8") as f:
            crawled_data = json.load(f)

        pages, sections = generator.generate_from_crawled_data(crawled_data)
        print(f"  Generated {pages} page templates, {sections} section templates")

    output_file = generator.save_templates()
    print(
        f"\nTotal: {len(generator.generated_pages)} pages, {len(generator.generated_sections)} sections"
    )
    print(f"Output: {output_file}")

    return generator


if __name__ == "__main__":
    import asyncio

    asyncio.run(process_all_crawled_data())

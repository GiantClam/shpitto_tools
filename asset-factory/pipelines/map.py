from __future__ import annotations

import base64
import json
import mimetypes
import os
import re
import urllib.request
from urllib.parse import urlparse
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

REPO_ROOT = Path(__file__).resolve().parents[2]
ASSET_FACTORY_ROOT = REPO_ROOT / "asset-factory"

from classifier import classify_section
from embeddings import (
    build_variant_embeddings,
    get_image_embedding,
    get_text_embedding,
    select_variant,
)

DEFAULT_PLACEHOLDER_IMAGE = (
    "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271200%27%20height=%26600%27%20viewBox=%270%200%201200%20600%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%25%27%20y1=%270%25%27%20x2=%27100%25%27%20y2=%27100%25%27%3E%3Cstop%20offset=%270%25%27%20stop-color=%27%23e5e7eb%27/%3E%3Cstop%20offset=%27100%25%27%20stop-color=%27%23cbd5e1%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%271200%27%20height=%27600%27%20fill=%27url(%23g)%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dominant-baseline=%27middle%27%20text-anchor=%27middle%27%20font-size=%2748%27%20fill=%27%236b7280%27%20font-family=%27system-ui%27%3EPlaceholder%3C/text%3E%3C/svg%3E"
)
DEFAULT_PLACEHOLDER_LOGO = (
    "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27120%27%20height=%2740%27%20viewBox=%270%200%20120%2040%27%3E%3Crect%20rx=%276%27%20width=%27120%27%20height=%2740%27%20fill=%27%23e5e7eb%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dominant-baseline=%27middle%27%20text-anchor=%27middle%27%20font-size=%2712%27%20fill=%27%236b7280%27%20font-family=%27system-ui%27%3ELOGO%3C/text%3E%3C/svg%3E"
)
DEFAULT_PLACEHOLDER_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"


SECTION_KEYWORDS = {
    "hero": "HeroCentered.v1",
    "feature": "FeatureGrid.v1",
    "benefit": "FeatureGrid.v1",
    "solution": "UseCases.v1",
    "use case": "UseCases.v1",
    "latest": "CardsGrid.v1",
    "news": "CardsGrid.v1",
    "press": "CardsGrid.v1",
    "military": "CardsGrid.v1",
    "maritime": "CardsGrid.v1",
    "land": "CardsGrid.v1",
    "pricing": "PricingCards.v1",
    "price": "PricingCards.v1",
    "faq": "FAQAccordion.v1",
    "question": "FAQAccordion.v1",
    "testimonial": "TestimonialsGrid.v1",
    "case": "CaseStudies.v1",
    "logo": "LogoCloud.v1",
    "customer": "LogoCloud.v1",
    "team": "CardsGrid.v1",
    "leadership": "CardsGrid.v1",
    "people": "CardsGrid.v1",
    "board": "CardsGrid.v1",
    "product": "CardsGrid.v1",
    "products": "CardsGrid.v1",
    "news": "CardsGrid.v1",
    "press": "CardsGrid.v1",
    "contact": "ContactSection.v1",
    "support": "SupportLinks.v1",
    "integration": "IntegrationsGrid.v1",
    "compare": "ComparisonTable.v1",
    "comparison": "ComparisonTable.v1",
    "stats": "StatsKPI.v1",
    "timeline": "StepsTimeline.v1",
    "process": "StepsTimeline.v1",
}

def _load_puck_blocks_from_config() -> set[str]:
    config_path = REPO_ROOT / "builder" / "src" / "puck" / "config.ts"
    if not config_path.exists():
        return set()
    content = config_path.read_text(encoding="utf-8")
    match = re.search(r"\bcomponents\s*:\s*\{", content)
    if not match:
        return set()
    brace_start = match.end() - 1
    names: set[str] = set()
    depth = 0
    for line in content[brace_start:].splitlines():
        current_depth = depth
        if current_depth == 1:
            match = re.match(r"\s*([A-Za-z0-9]+)\s*:\s*\{", line)
            if match:
                names.add(f"{match.group(1)}.v1")
        depth += line.count("{") - line.count("}")
        if depth <= 0 and current_depth > 0:
            break
    return names


def _load_puck_blocks_from_schemas() -> set[str]:
    blocks_root = REPO_ROOT / "builder" / "src" / "components" / "blocks"
    if not blocks_root.exists():
        return set()
    names: set[str] = set()
    for schema_path in blocks_root.rglob("schema.v1.json"):
        try:
            data = json.loads(schema_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        title = data.get("title")
        if isinstance(title, str) and title:
            names.add(title)
    return names

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


def _select_block_type_from_text(text: str, available_blocks: set[str]) -> str | None:
    if not text:
        return None
    lower = text.lower()
    if "case study" in lower and "CaseStudies.v1" in available_blocks:
        return "CaseStudies.v1"
    if "testimonial" in lower and "TestimonialsGrid.v1" in available_blocks:
        return "TestimonialsGrid.v1"
    if ("logo" in lower or "trusted" in lower) and "LogoCloud.v1" in available_blocks:
        return "LogoCloud.v1"
    if (
        "pricing" in lower
        or "price" in lower
        or "plan" in lower
        or "subscription" in lower
    ) and "PricingCards.v1" in available_blocks:
        return "PricingCards.v1"
    if re.search(r"faq|question", lower) and "FAQAccordion.v1" in available_blocks:
        return "FAQAccordion.v1"
    if "CardsGrid.v1" in available_blocks:
        if any(
            key in lower
            for key in [
                "team",
                "leadership",
                "people",
                "board",
                "profile",
                "member",
                "speaker",
                "product",
                "products",
                "portfolio",
                "collection",
                "case study",
                "news",
                "press",
                "article",
                "blog",
                "latest",
            ]
        ):
            return "CardsGrid.v1"
    if any(key in lower for key in ["contact", "demo", "get started", "signup", "sign up", "book"]):
        if "LeadCaptureCTA.v1" in available_blocks:
            return "LeadCaptureCTA.v1"
        if "ContactSection.v1" in available_blocks:
            return "ContactSection.v1"
    for key, block_type in SECTION_KEYWORDS.items():
        if key in lower and block_type in available_blocks:
            return block_type
    return None


def _load_registry(registry_path: Path) -> dict:
    data = json.loads(registry_path.read_text(encoding="utf-8"))
    return {
        "types": {block["type"] for block in data.get("blocks", [])},
        "base": data.get("baseProps", {}),
    }


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _base_props(block_id: str, anchor: str | None = None) -> dict:
    return {
        "id": block_id,
        "anchor": anchor,
        "paddingY": "lg",
        "background": "none",
        "align": "left",
        "maxWidth": "xl",
        "emphasis": "normal",
    }


def _infer_variant(block_type: str, section: dict) -> str:
    if block_type == "HeroSplit.v1":
        return "image"
    if block_type == "HeroCentered.v1":
        return "textOnly"
    if block_type == "HeroSplit.v1":
        return "image"
    if block_type == "LogoCloud.v1":
        return "grid"
    if block_type == "TestimonialsGrid.v1":
        return "2col"
    if block_type == "FeatureGrid.v1":
        return "3col"
    if block_type == "PricingCards.v1":
        return "3up"
    if block_type == "FAQAccordion.v1":
        return "singleOpen"
    if block_type == "CaseStudies.v1":
        return "cards"
    if block_type == "StatsKPI.v1":
        return "grid"
    if block_type == "StepsTimeline.v1":
        return "vertical"
    if block_type == "CardsGrid.v1":
        source = str(section.get("source") or "").lower()
        if "latest" in source:
            return "media"
        return "product"
    return "simple"


def _infer_cards_variant(text: str) -> str:
    lower = text.lower()
    if any(key in lower for key in ["team", "leadership", "board", "founder", "executive", "speaker"]):
        return "person"
    if any(key in lower for key in ["news", "press", "article", "blog", "media"]):
        return "media"
    if any(key in lower for key in ["poster", "campaign", "launch", "event"]):
        return "poster"
    if any(key in lower for key in ["doc", "documentation", "spec", "api", "guide", "manual"]):
        return "imageText"
    return "product"


def _infer_cards_columns(count: int) -> str:
    if count <= 2:
        return "2col"
    if count >= 4:
        return "4col"
    return "3col"


def _build_cards_items(content: dict, max_items: int = 8) -> list[dict]:
    images = content.get("images") if isinstance(content.get("images"), list) else []
    headings = content.get("headings") if isinstance(content.get("headings"), list) else []
    texts = content.get("texts") if isinstance(content.get("texts"), list) else []
    lists = content.get("lists") if isinstance(content.get("lists"), list) else []
    prices = content.get("prices") if isinstance(content.get("prices"), list) else []
    buttons = content.get("buttons") if isinstance(content.get("buttons"), list) else []
    atoms = content.get("atoms") if isinstance(content.get("atoms"), list) else []

    atom_images = [
        atom for atom in atoms if isinstance(atom, dict) and atom.get("kind") == "image" and atom.get("src")
    ]
    atom_headings = [
        atom.get("text")
        for atom in atoms
        if isinstance(atom, dict)
        and atom.get("kind") == "heading"
        and isinstance(atom.get("text"), str)
        and atom.get("text").strip()
    ]
    atom_texts = [
        atom.get("text")
        for atom in atoms
        if isinstance(atom, dict)
        and atom.get("kind") in {"text", "link", "button"}
        and isinstance(atom.get("text"), str)
        and atom.get("text").strip()
    ]
    atom_links = [
        atom.get("href")
        for atom in atoms
        if isinstance(atom, dict)
        and atom.get("kind") == "link"
        and isinstance(atom.get("href"), str)
        and atom.get("href").strip()
    ]

    list_items: list[str] = []
    for item in lists:
        if isinstance(item, list):
            list_items.extend([value for value in item if isinstance(value, str) and value.strip()])

    title_candidates = [value for value in atom_headings if isinstance(value, str) and value.strip()]
    if not title_candidates:
        title_candidates = [value for value in headings if isinstance(value, str) and value.strip()]
    title_candidates.extend(list_items)
    text_candidates = [value for value in atom_texts if isinstance(value, str) and value.strip()]
    if not text_candidates:
        text_candidates = [value for value in texts if isinstance(value, str) and value.strip()]

    images = _filter_images(images)
    target = max(len(atom_images), len(images), len(list_items), 3)
    target = min(max_items, max(2, target))

    items: list[dict] = []
    for idx in range(target):
        title = None
        if idx < len(title_candidates):
            title = title_candidates[idx]
        elif idx < len(text_candidates):
            title = text_candidates[idx][:60]
        else:
            title = f"Item {idx + 1}"

        description = None
        if idx < len(text_candidates):
            description = text_candidates[idx]
        elif text_candidates:
            description = text_candidates[0]

        image_data = atom_images[idx] if idx < len(atom_images) else (images[idx] if idx < len(images) else None)
        image_src = image_data.get("src") if isinstance(image_data, dict) else None
        image_alt = image_data.get("alt") if isinstance(image_data, dict) else None

        item: dict[str, Any] = {"title": title}
        if description:
            item["description"] = description
        if image_src:
            item["image"] = {"src": image_src, "alt": image_alt or title}
        if idx < len(prices):
            item["price"] = prices[idx]
        if idx < len(atom_links) and atom_links[idx]:
            item["cta"] = {"label": "Learn more", "href": atom_links[idx], "variant": "link"}
        if idx < len(buttons):
            button = buttons[idx]
            if isinstance(button, dict) and button.get("label") and button.get("href"):
                item["cta"] = {
                    "label": button["label"],
                    "href": button["href"],
                    "variant": button.get("variant") or "link",
                }
        items.append(item)
    return items


def _build_cards_items_media(content: dict, max_items: int = 8) -> list[dict]:
    images = content.get("images") if isinstance(content.get("images"), list) else []
    headings = content.get("headings") if isinstance(content.get("headings"), list) else []
    texts = content.get("texts") if isinstance(content.get("texts"), list) else []
    links = content.get("links") if isinstance(content.get("links"), list) else []
    images = _filter_images(images)
    max_len = min(max(len(images), len(headings), len(texts), len(links), 3), max_items)
    items: list[dict] = []
    for idx in range(max_len):
        title = headings[idx] if idx < len(headings) else ""
        desc = texts[idx] if idx < len(texts) else ""
        link = links[idx] if idx < len(links) else {}
        image = images[idx] if idx < len(images) else {}
        item = {
            "title": title or (link.get("label") if isinstance(link, dict) else "") or f"Item {idx + 1}",
            "description": _truncate_text(desc, 160),
            "meta": (link.get("href") if isinstance(link, dict) else "") or "",
        }
        if isinstance(image, dict) and image.get("src"):
            item["imageSrc"] = image.get("src")
            item["imageAlt"] = image.get("alt") or ""
        if isinstance(link, dict) and link.get("href"):
            item["cta"] = {"label": "Read more", "href": link.get("href"), "variant": "link"}
        items.append(item)
    return items


def _is_placeholder_image(src: str) -> bool:
    if not isinstance(src, str) or not src:
        return True
    if src == DEFAULT_PLACEHOLDER_IMAGE:
        return True
    lower = src.lower()
    if lower.startswith("data:image/svg+xml") and "placeholder" in lower:
        return True
    return False


def _filter_images(images: list[dict]) -> list[dict]:
    if not images:
        return []
    filtered: list[dict] = []
    for item in images:
        if not isinstance(item, dict):
            continue
        src = item.get("src")
        if isinstance(src, str) and src.strip() and not _is_placeholder_image(src):
            filtered.append(item)
    return filtered


def _fill_cards_images(items: list[dict], images: list[dict]) -> list[dict]:
    if not items or not images:
        return items
    hydrated: list[dict] = []
    image_index = 0
    for item in items:
        if not isinstance(item, dict):
            hydrated.append(item)
            continue
        image = item.get("image")
        image_src = image.get("src") if isinstance(image, dict) else None
        if isinstance(image_src, str) and image_src.strip() and not _is_placeholder_image(image_src):
            hydrated.append(item)
            continue
        picked = None
        while image_index < len(images):
            candidate = images[image_index]
            image_index += 1
            src = candidate.get("src") if isinstance(candidate, dict) else None
            if isinstance(src, str) and src.strip() and not _is_placeholder_image(src):
                picked = candidate
                break
        if picked:
            updated = dict(item)
            alt = picked.get("alt") if isinstance(picked, dict) else ""
            updated["image"] = {"src": picked.get("src"), "alt": alt or updated.get("title") or ""}
            hydrated.append(updated)
        else:
            hydrated.append(item)
    return hydrated


def _props_from_text(block_type: str, title: str, summary: str) -> dict:
    ctas = [{"label": "Contact Us", "href": "#contact", "variant": "primary"}]
    if block_type == "Navbar.v1":
        return {
            "logo": {"src": "", "alt": title or "Site"},
            "links": [
                {"label": "Home", "href": "#top"},
                {"label": "About", "href": "#about"},
                {"label": "Contact", "href": "#contact"},
            ],
            "ctas": ctas,
            "sticky": True,
        }
    if block_type == "HeroCentered.v1":
        return {"title": title, "subtitle": summary, "ctas": ctas}
    if block_type == "HeroSplit.v1":
        return {
            "title": title,
            "subtitle": summary,
            "ctas": ctas,
            "mediaPosition": "right",
            "media": {"kind": "image", "src": DEFAULT_PLACEHOLDER_IMAGE, "alt": ""},
        }
    if block_type == "FeatureGrid.v1":
        items = [
            {"title": item[:60], "desc": item} for item in summary.split(".") if item
        ]
        return {"title": "Features", "subtitle": "", "items": items[:3]}
    if block_type == "UseCases.v1":
        items = [
            {"title": item[:60], "desc": ""} for item in summary.split(".") if item
        ]
        return {"title": "Use Cases", "items": items[:3]}
    if block_type == "PricingCards.v1":
        return {
            "title": "Pricing",
            "plans": [
                {
                    "name": "Standard",
                    "price": "$99",
                    "features": ["Feature A", "Feature B"],
                    "cta": {"label": "Get Started", "href": "#", "variant": "primary"},
                    "highlighted": True,
                }
            ],
        }
    if block_type == "FAQAccordion.v1":
        return {
            "title": "FAQ",
            "items": [
                {"q": "What is included?", "a": ""},
                {"q": "How to start?", "a": ""},
            ],
        }
    if block_type == "TestimonialsGrid.v1":
        return {
            "items": [{"quote": summary or "", "name": "Customer", "role": ""}],
        }
    if block_type == "LogoCloud.v1":
        return {"logos": [{"src": DEFAULT_PLACEHOLDER_LOGO, "alt": "Logo"}]}
    if block_type == "CaseStudies.v1":
        return {
            "items": [
                {
                    "title": "Case Study",
                    "summary": summary,
                    "href": "#",
                }
            ]
        }
    if block_type == "StatsKPI.v1":
        return {
            "items": [
                {"label": "Metric", "value": "99%", "note": ""},
                {"label": "Clients", "value": "120+", "note": ""},
            ]
        }
    if block_type == "SupportLinks.v1":
        return {
            "links": [
                {"label": "Docs", "href": "#", "desc": ""},
                {"label": "Support", "href": "#", "desc": ""},
            ]
        }
    if block_type == "LeadCaptureCTA.v1":
        return {
            "title": "Get a demo",
            "subtitle": summary,
            "cta": {"label": "Request Demo", "href": "#"},
        }
    if block_type == "ContactSection.v1":
        return {
            "title": "Contact",
            "form": {
                "fields": [
                    {"name": "name", "label": "Name", "type": "text"},
                    {"name": "email", "label": "Email", "type": "email"},
                ],
                "submitText": "Send",
            },
        }
    if block_type == "Footer.v1":
        return {
            "columns": [
                {"title": "Company", "links": [{"label": "About", "href": "#"}]},
                {"title": "Support", "links": [{"label": "Contact", "href": "#"}]},
            ]
        }
    return {}


def _pick_nav_logo(extract_data: dict) -> dict | None:
    sections = extract_data.get("sections", [])
    for section in sections:
        if not isinstance(section, dict):
            continue
        images = section.get("images") or []
        if not images:
            content = section.get("content") or {}
            images = content.get("images") or []
        for image in images:
            if not isinstance(image, dict):
                continue
            src = str(image.get("src") or "")
            alt = str(image.get("alt") or "")
            if "logo" in src.lower() or "logo" in alt.lower():
                return {"src": src, "alt": alt or "Logo"}
    return None


def _build_nav_links(section_titles: list[str]) -> list[dict]:
    output: list[dict] = []
    for title in section_titles[1:6]:
        label = str(title).strip()
        if not label:
            continue
        slug = _slugify(label)
        if not slug:
            continue
        if any(item.get("label") == label for item in output):
            continue
        output.append({"label": label, "href": f"#{slug}"})
    return output


def _pick_nav_cta(extract_data: dict) -> dict:
    sections = extract_data.get("sections", [])
    for section in sections:
        if not isinstance(section, dict):
            continue
        buttons = section.get("buttons") or []
        if not buttons:
            content = section.get("content") or {}
            buttons = content.get("buttons") or []
        for button in buttons:
            if not isinstance(button, dict):
                continue
            label = str(button.get("label") or "").strip()
            href = str(button.get("href") or "").strip()
            if label and href:
                return {"label": label, "href": href, "variant": "primary"}
    return {"label": "Contact Us", "href": "#contact", "variant": "primary"}


def _compute_structure_features(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    return {
        "headings": len(soup.find_all(["h1", "h2", "h3"])) if html else 0,
        "links": len(soup.find_all("a")) if html else 0,
        "buttons": len(soup.find_all(["button", "input"])) if html else 0,
        "images": len(soup.find_all("img")) if html else 0,
    }


def _normalize_section_content(section_content: dict | None) -> dict:
    if not isinstance(section_content, dict):
        return {}
    content = section_content.get("content")
    if isinstance(content, dict):
        merged = dict(section_content)
        for key, value in content.items():
            if value is None:
                continue
            if isinstance(value, (list, dict, str)) and not value:
                continue
            merged[key] = value
        return merged
    return section_content


def _most_common(values: list[str]) -> str | None:
    if not values:
        return None
    counts: dict[str, int] = {}
    for value in values:
        counts[value] = counts.get(value, 0) + 1
    return max(counts.items(), key=lambda item: item[1])[0]


def _parse_px(value: str | None) -> float | None:
    if not isinstance(value, str):
        return None
    match = re.search(r"([0-9]+(?:\\.[0-9]+)?)px", value)
    if not match:
        return None
    try:
        return float(match.group(1))
    except Exception:
        return None


def _style_hints(
    section_content: dict | None, layout: dict | None, viewport_height: float
) -> dict:
    content = _normalize_section_content(section_content)
    computed_styles = (
        content.get("computed_styles")
        if isinstance(content, dict)
        else None
    )
    nodes = computed_styles.get("nodes") if isinstance(computed_styles, dict) else []
    align_counts: dict[str, int] = {}
    heading_fonts: list[str] = []
    body_fonts: list[str] = []
    heading_sizes: list[float] = []
    body_sizes: list[float] = []
    for node in nodes if isinstance(nodes, list) else []:
        if not isinstance(node, dict):
            continue
        styles = node.get("styles")
        if not isinstance(styles, dict):
            continue
        tag = str(node.get("tag") or "").lower()
        text = str(node.get("text") or "")
        align = styles.get("textAlign")
        if text.strip() and isinstance(align, str) and align:
            align_counts[align] = align_counts.get(align, 0) + 1
        font = styles.get("fontFamily")
        if isinstance(font, str) and font:
            if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
                heading_fonts.append(font)
            elif tag in {"p", "span", "li", "a", "button"}:
                body_fonts.append(font)
        font_size = _parse_px(styles.get("fontSize"))
        if font_size:
            if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
                heading_sizes.append(font_size)
            elif tag in {"p", "span", "li"}:
                body_sizes.append(font_size)
    align_choice = _most_common(list(align_counts.keys()))
    resolved_align = None
    if align_choice in {"center", "left", "right", "start"}:
        resolved_align = "center" if align_choice == "center" else "left"
    padding = None
    if isinstance(layout, dict):
        height = layout.get("height")
        if isinstance(height, (int, float)) and height > 0:
            if height <= viewport_height * 0.33:
                padding = "sm"
            elif height <= viewport_height * 0.6:
                padding = "md"
            else:
                padding = "lg"
    computed_styles = content.get("computed_styles") if isinstance(content, dict) else None
    padding_samples = (computed_styles.get("summary") or {}).get("padding") if isinstance(computed_styles, dict) else None
    if isinstance(padding_samples, list) and padding_samples:
        top = padding_samples[0].get("value") if isinstance(padding_samples[0], dict) else None
        px = _parse_px(top) if isinstance(top, str) else None
        if px:
            if px <= 16:
                padding = "sm"
            elif px <= 28:
                padding = "md"
            else:
                padding = "lg"
    background_gradients = (
        content.get("background_gradients")
        if isinstance(content, dict)
        else None
    )
    has_gradient = isinstance(background_gradients, list) and len(background_gradients) > 0
    def _size_token(values: list[float], kind: str) -> str | None:
        if not values:
            return None
        median = sorted(values)[len(values) // 2]
        if kind == "heading":
            if median <= 20:
                return "sm"
            if median <= 28:
                return "md"
            return "lg"
        if median <= 14:
            return "sm"
        if median <= 18:
            return "md"
        return "lg"
    return {
        "align": resolved_align,
        "paddingY": padding,
        "headingFont": _most_common(heading_fonts),
        "bodyFont": _most_common(body_fonts),
        "headingSize": _size_token(heading_sizes, "heading"),
        "bodySize": _size_token(body_sizes, "body"),
        "hasGradient": has_gradient,
    }


def _section_text(section_content: dict | None) -> str:
    if not section_content:
        return ""
    content = _normalize_section_content(section_content)
    texts = content.get("texts") or []
    if isinstance(texts, str):
        texts = [texts]
    lists = content.get("lists") or []
    list_text = " ".join([" ".join(items) for items in lists if isinstance(items, list)])
    buttons = content.get("buttons") or []
    links = content.get("links") or []
    button_text = " ".join(
        [
            item.get("label")
            for item in buttons
            if isinstance(item, dict) and item.get("label")
        ]
    )
    link_text = " ".join(
        [
            item.get("label")
            for item in links
            if isinstance(item, dict) and item.get("label")
        ]
    )
    title = content.get("title") or ""
    headings = content.get("headings") or []
    if not title and isinstance(headings, list) and headings:
        title = headings[0]
    return (
        " ".join([title, *texts, list_text, button_text, link_text]).strip().strip()
    )


def _pick_media(content: dict | None, fallback_image: str | None) -> dict | None:
    if not isinstance(content, dict):
        return None
    videos = content.get("videos") or []
    for item in videos:
        if not isinstance(item, dict):
            continue
        if item.get("kind") == "iframe":
            continue
        src = item.get("src")
        if src:
            return {
                "kind": "video",
                "src": _inline_local_media(str(src)),
                "alt": item.get("alt") or item.get("poster") or "",
            }
    images = content.get("images") or []
    for item in images:
        if not isinstance(item, dict):
            continue
        src = item.get("src")
        if src:
            return {
                "kind": "image",
                "src": _inline_local_media(str(src), allow_remote_image=True),
                "alt": item.get("alt") or "",
            }
    if fallback_image:
        return {
            "kind": "image",
            "src": _inline_local_media(str(fallback_image), allow_remote_image=True),
            "alt": "",
        }
    return None


def _is_background_candidate(src: str) -> bool:
    value = src.lower()
    if value.startswith("data:image/svg+xml"):
        return False
    if any(token in value for token in ["icon", "icons/", "sprite", "close", "logo", "favicon", "badge", "arrow"]):
        return False
    if value.endswith(".svg"):
        return any(token in value for token in ["bg", "background", "hero", "pattern", "texture", "grid"])
    return True


def _pick_background_media(content: dict | None, fallback_image: str | None = None) -> dict | None:
    if not isinstance(content, dict):
        return None
    backgrounds = content.get("backgrounds") or []
    for item in backgrounds:
        if not isinstance(item, dict):
            continue
        src = item.get("src")
        if src and _is_background_candidate(str(src)):
            return {"kind": "image", "src": _inline_local_media(str(src), allow_remote_image=True), "alt": ""}
    videos = content.get("videos") or []
    for item in videos:
        if not isinstance(item, dict):
            continue
        if item.get("kind") == "iframe":
            continue
        src = item.get("src")
        if src:
            return {
                "kind": "video",
                "src": _inline_local_media(str(src)),
                "alt": item.get("alt") or item.get("poster") or "",
                "poster": _inline_local_media(str(item.get("poster") or ""), allow_remote_image=True)
                if item.get("poster")
                else "",
            }
    if fallback_image:
        return {
            "kind": "image",
            "src": _inline_local_media(str(fallback_image), allow_remote_image=True),
            "alt": "",
        }
    return None


def _wants_video(content: dict) -> bool:
    videos = content.get("videos") or []
    if isinstance(videos, list) and videos:
        return True
    text_blob = " ".join(
        [
            content.get("title") or "",
            " ".join(content.get("texts") or []) if isinstance(content.get("texts"), list) else "",
        ]
    ).lower()
    return any(key in text_blob for key in ["video", "watch", "demo"])


def _ensure_default_media(block_type: str, props: dict, content: dict, index: int) -> tuple[dict, str | None]:
    updated = dict(props)
    variant_override: str | None = None

    if block_type == "HeroCentered.v1":
        # 仅为首屏 Hero 注入兜底媒体；后续合成 Hero 维持 textOnly
        if index == 0 and not updated.get("media"):
            if _wants_video(content):
                updated["media"] = {"kind": "video", "src": DEFAULT_PLACEHOLDER_VIDEO, "alt": ""}
            else:
                updated["media"] = {"kind": "image", "src": DEFAULT_PLACEHOLDER_IMAGE, "alt": ""}
            variant_override = "withMedia"
        return updated, variant_override

    if block_type == "FeatureWithMedia.v1":
        has_media = updated.get("media") or updated.get("mediaSrc")
        if not has_media:
            if _wants_video(content):
                updated["mediaKind"] = "video"
                updated["mediaSrc"] = DEFAULT_PLACEHOLDER_VIDEO
                updated["mediaAlt"] = ""
            else:
                updated["mediaKind"] = "image"
                updated["mediaSrc"] = DEFAULT_PLACEHOLDER_IMAGE
                updated["mediaAlt"] = ""
        return updated, variant_override

    if block_type == "CaseStudies.v1":
        items = updated.get("items")
        if isinstance(items, list) and items:
            for item in items:
                if isinstance(item, dict) and not item.get("cover"):
                    item["cover"] = {"src": DEFAULT_PLACEHOLDER_IMAGE, "alt": "Case study"}
        return updated, variant_override

    if block_type == "TestimonialsGrid.v1":
        items = updated.get("items")
        if isinstance(items, list) and items:
            for item in items:
                if isinstance(item, dict) and not item.get("avatar"):
                    item["avatar"] = {"src": DEFAULT_PLACEHOLDER_LOGO, "alt": "Avatar"}
        return updated, variant_override

    if block_type == "LogoCloud.v1":
        logos = updated.get("logos")
        if not isinstance(logos, list) or not logos:
            updated["logos"] = [{"src": DEFAULT_PLACEHOLDER_LOGO, "alt": "Logo"} for _ in range(6)]
        else:
            for logo in logos:
                if isinstance(logo, dict) and not logo.get("src"):
                    logo["src"] = DEFAULT_PLACEHOLDER_LOGO
                    logo["alt"] = logo.get("alt") or "Logo"
        return updated, variant_override

    if block_type == "CardsGrid.v1":
        items = updated.get("items")
        if isinstance(items, list) and items:
            for item in items:
                if not isinstance(item, dict):
                    continue
                image = item.get("image")
                if not isinstance(image, dict) or not image.get("src"):
                    item["image"] = {"src": DEFAULT_PLACEHOLDER_IMAGE, "alt": item.get("title") or "Card"}
        return updated, variant_override

    if block_type == "Footer.v1":
        if not updated.get("logo"):
            updated["logo"] = {"src": DEFAULT_PLACEHOLDER_LOGO, "alt": "Logo"}
        return updated, variant_override

    return updated, variant_override


def _inline_local_media(src: str, allow_remote_image: bool = False) -> str:
    if not src or src.startswith("data:"):
        return src
    if src.startswith("http://") or src.startswith("https://"):
        if not allow_remote_image:
            return src
        try:
            with urllib.request.urlopen(src, timeout=8) as resp:
                content_type = resp.headers.get("content-type", "")
                if "image" not in content_type:
                    return src
                data = resp.read()
            if not data or len(data) > 1_000_000:
                return src
            encoded = base64.b64encode(data).decode("ascii")
            mime = content_type.split(";")[0] if content_type else "image/png"
            return f"data:{mime};base64,{encoded}"
        except Exception:
            return src
    if src.startswith("/assets/"):
        return src
    path = Path(src)
    if not path.exists():
        return src
    mime = mimetypes.guess_type(path.name)[0] or "image/png"
    data = path.read_bytes()
    if len(data) > 2_000_000:
        return src
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def _merge_section_content(
    primary: dict | None, fallback: dict | None
) -> dict:
    if not primary and not fallback:
        return {}
    if not primary:
        return _normalize_section_content(fallback)
    if not fallback:
        return _normalize_section_content(primary)
    prefer_capture = os.environ.get("HIGH_FIDELITY", "0") == "1"
    if prefer_capture:
        primary_norm = _normalize_section_content(fallback)
        fallback_norm = _normalize_section_content(primary)
    else:
        primary_norm = _normalize_section_content(primary)
        fallback_norm = _normalize_section_content(fallback)
    merged = {**fallback_norm, **primary_norm}
    for key in [
        "title",
        "texts",
        "lists",
        "buttons",
        "links",
        "images",
        "videos",
        "backgrounds",
        "background_gradients",
        "prices",
        "headings",
        "text",
        "atoms",
        "computed_styles",
    ]:
        if not primary_norm.get(key) and fallback_norm.get(key):
            merged[key] = fallback_norm.get(key)
    content = {}
    primary_content = primary_norm.get("content")
    fallback_content = fallback_norm.get("content")
    if isinstance(fallback_content, dict):
        content.update(fallback_content)
    if isinstance(primary_content, dict):
        content.update(primary_content)
    if content:
        merged["content"] = content
    return merged


def _load_atoms_dsl(output_root: Path, domain: str, page_slug: str | None) -> dict[int, dict]:
    if not page_slug:
        page_slug = "home"
    path = output_root / domain / "atoms" / page_slug / "atoms_dsl.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    sections = data.get("sections") if isinstance(data, dict) else []
    out: dict[int, dict] = {}
    for item in sections or []:
        if not isinstance(item, dict):
            continue
        idx = item.get("index")
        if isinstance(idx, int):
            out[idx] = item
    return out


def _load_semantic_tags(output_root: Path, domain: str, page_slug: str | None) -> dict[int, dict]:
    if not page_slug:
        page_slug = "home"
    path = output_root / domain / "semantic" / page_slug / "semantic.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    out: dict[int, dict] = {}
    for item in data.get("sections", []) or []:
        if not isinstance(item, dict):
            continue
        idx = item.get("index")
        if isinstance(idx, int):
            out[idx] = item
    return out


def _load_section_groups(output_root: Path, domain: str, page_slug: str | None) -> dict[int, dict]:
    if not page_slug:
        page_slug = "home"
    path = output_root / domain / "capture" / page_slug / "section_groups.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    groups = data.get("groups") if isinstance(data, dict) else []
    layout_map: dict[int, dict] = {}
    for group in groups if isinstance(groups, list) else []:
        sections = group.get("sections") if isinstance(group, dict) else []
        for item in sections if isinstance(sections, list) else []:
            if not isinstance(item, dict):
                continue
            idx = item.get("index")
            if isinstance(idx, int):
                layout_map[idx] = item
    return layout_map


def _routes_from_page(page: dict) -> set[str]:
    routes: set[str] = set()
    slug = page.get("slug")
    if isinstance(slug, str) and slug:
        routes.add(slug)
        routes.add(f"/{slug}")
        if slug in {"home", "index"}:
            routes.add("")
            routes.add("/")
    url = page.get("url")
    if isinstance(url, str) and url:
        parsed = urlparse(url)
        path = (parsed.path or "").split("#", 1)[0].split("?", 1)[0].strip("/")
        if path:
            routes.add(path)
            routes.add(f"/{path}")
        else:
            routes.add("")
            routes.add("/")
    return routes


def _load_site_routes(output_root: Path, domain: str, plan: dict | None) -> list[str]:
    routes: set[str] = set()
    if isinstance(plan, dict) and plan:
        routes.update(_routes_from_page(plan))
    plan_path = output_root / domain / "site_plan.json"
    if plan_path.exists():
        try:
            data = json.loads(plan_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
        pages = data.get("pages", []) if isinstance(data, dict) else []
        for page in pages:
            if isinstance(page, dict):
                routes.update(_routes_from_page(page))
    return sorted(routes)


def _round_bucket(values: list[int], size: int) -> dict[int, int]:
    buckets: dict[int, int] = {}
    for v in values:
        b = int(round(v / size) * size)
        buckets[b] = buckets.get(b, 0) + 1
    return buckets


def _atoms_text_blob(atoms_section: dict) -> str:
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    parts: list[str] = []
    for atom in atoms:
        if not isinstance(atom, dict):
            continue
        kind = atom.get("kind")
        if kind in {"heading", "text", "link", "button"}:
            text = atom.get("text")
            if isinstance(text, str) and text.strip():
                parts.append(text.strip())
    return " ".join(parts)[:1200].lower()


def _atoms_texts(atoms_section: dict, kinds: set[str]) -> list[str]:
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    texts: list[str] = []
    for atom in atoms:
        if not isinstance(atom, dict):
            continue
        if atom.get("kind") not in kinds:
            continue
        text = atom.get("text")
        if isinstance(text, str) and text.strip():
            texts.append(text.strip())
    return texts


def _atoms_images(atoms_section: dict) -> list[dict]:
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    images: list[dict] = []
    for atom in atoms:
        if not isinstance(atom, dict) or atom.get("kind") != "image":
            continue
        src = atom.get("src")
        if isinstance(src, str) and src.strip():
            images.append(
                {
                    "src": src,
                    "alt": atom.get("text") or "",
                    "bbox": atom.get("bbox") or {},
                }
            )
    return images


def _atoms_to_cards_items(atoms_section: dict, max_items: int = 8) -> list[dict]:
    headings = _atoms_texts(atoms_section, {"heading"})
    texts = _atoms_texts(atoms_section, {"text"})
    images = _atoms_images(atoms_section)
    target = max(len(images), len(headings), 3)
    target = min(max_items, max(2, target))
    items: list[dict] = []
    for idx in range(target):
        title = headings[idx] if idx < len(headings) else (texts[idx][:60] if idx < len(texts) else f"Item {idx+1}")
        desc = texts[idx] if idx < len(texts) else ""
        item: dict[str, Any] = {"title": title}
        if desc:
            item["description"] = desc
        if idx < len(images):
            image = images[idx]
            item["image"] = {"src": image.get("src"), "alt": image.get("alt") or title}
        items.append(item)
    return items


def _atoms_to_feature_items(atoms_section: dict, max_items: int = 6) -> list[dict]:
    headings = _atoms_texts(atoms_section, {"heading"})
    texts = _atoms_texts(atoms_section, {"text"})
    items: list[dict] = []
    for idx, title in enumerate(headings[:max_items]):
        desc = texts[idx] if idx < len(texts) else ""
        items.append({"title": title, "desc": desc})
    return items


def _atoms_to_testimonial_items(atoms_section: dict, max_items: int = 6) -> list[dict]:
    texts = _atoms_texts(atoms_section, {"text"})
    headings = _atoms_texts(atoms_section, {"heading"})
    images = _atoms_images(atoms_section)
    quotes = [t for t in texts if ("\"" in t or "“" in t or len(t) > 40)]
    items: list[dict] = []
    for idx, quote in enumerate(quotes[:max_items]):
        item = {"quote": quote}
        if idx < len(headings):
            item["name"] = headings[idx]
        if idx < len(images):
            image = images[idx]
            item["avatar"] = {"src": image.get("src"), "alt": image.get("alt") or item.get("name") or "Avatar"}
        items.append(item)
    return items


def _atoms_columns_from_images(images: list[dict]) -> str:
    widths = [
        int(img.get("bbox", {}).get("w") or 0)
        for img in images
        if isinstance(img, dict) and isinstance(img.get("bbox"), dict)
    ]
    if not widths:
        return "3col"
    width_buckets = _round_bucket(widths, 30)
    peaks = sorted(width_buckets.values(), reverse=True)
    peak = peaks[0] if peaks else 0
    if peak >= 4:
        return "4col"
    if peak == 2:
        return "2col"
    return "3col"


def _truncate_text(value: str, limit: int) -> str:
    if not isinstance(value, str):
        return ""
    value = value.strip()
    if len(value) <= limit:
        return value
    return value[: max(0, limit - 1)].rstrip() + "…"


def _atoms_image_shape(images: list[dict]) -> str | None:
    ratios = []
    for img in images:
        bbox = img.get("bbox") if isinstance(img, dict) else None
        if not isinstance(bbox, dict):
            continue
        w = float(bbox.get("w") or 0)
        h = float(bbox.get("h") or 0)
        if w <= 0 or h <= 0:
            continue
        ratios.append(w / h)
    if not ratios:
        return None
    avg = sum(ratios) / len(ratios)
    if 0.85 <= avg <= 1.15:
        return "square"
    if avg < 0.7:
        return "circle"
    return "rounded"


def _atoms_image_size(images: list[dict]) -> str | None:
    areas = []
    for img in images:
        bbox = img.get("bbox") if isinstance(img, dict) else None
        if not isinstance(bbox, dict):
            continue
        w = float(bbox.get("w") or 0)
        h = float(bbox.get("h") or 0)
        if w <= 0 or h <= 0:
            continue
        areas.append(w * h)
    if not areas:
        return None
    avg = sum(areas) / len(areas)
    if avg < 4000:
        return "sm"
    if avg > 20000:
        return "lg"
    return "md"


def _atoms_cta_links(atoms_section: dict) -> list[dict]:
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    links: list[dict] = []
    for atom in atoms:
        if not isinstance(atom, dict) or atom.get("kind") not in {"link", "button"}:
            continue
        label = atom.get("text") if isinstance(atom.get("text"), str) else ""
        href = atom.get("href") if isinstance(atom.get("href"), str) else ""
        if label or href:
            links.append({"label": label or "Learn more", "href": href or "#", "variant": "primary"})
    return links[:2]


def _filter_cta_links(links: list[dict], known_routes: list[str]) -> list[dict]:
    if not links:
        return links
    if os.environ.get("HIGH_FIDELITY", "0") == "1":
        return links
    if not known_routes:
        return links
    allowed = set([route.strip("/") for route in known_routes if isinstance(route, str)])
    filtered = []
    for link in links:
        href = link.get("href") if isinstance(link, dict) else ""
        if not isinstance(href, str) or not href:
            continue
        path = href.split("#", 1)[0].split("?", 1)[0].strip("/")
        if not path or path in allowed or f"/{path}" in known_routes:
            filtered.append(link)
    return filtered or links


def _atoms_to_pricing_plans(atoms_section: dict, max_items: int = 4) -> list[dict]:
    headings = _atoms_texts(atoms_section, {"heading"})
    texts = _atoms_texts(atoms_section, {"text"})
    blobs = [t for t in texts if isinstance(t, str)]
    prices: list[str] = []
    for blob in blobs:
        match = re.search(r"[$¥€]\\s?\\d+[\\d,]*(?:\\.\\d+)?|\\d+\\s?/(mo|yr)|\\d+\\s?月", blob)
        if match:
            prices.append(match.group(0))
    plans: list[dict] = []
    for idx, title in enumerate(headings[:max_items]):
        plan: dict[str, Any] = {"name": title}
        if idx < len(prices):
            plan["price"] = prices[idx]
        if idx < len(texts):
            plan["features"] = [t for t in texts[idx: idx + 3] if t][:3]
        plans.append(plan)
    return plans


def _atoms_to_feature_media(atoms_section: dict) -> dict:
    headings = _atoms_texts(atoms_section, {"heading"})
    texts = _atoms_texts(atoms_section, {"text"})
    images = _atoms_images(atoms_section)
    title = headings[0] if headings else ""
    body = texts[0] if texts else ""
    media = images[0] if images else None
    payload: dict[str, Any] = {}
    if title:
        payload["title"] = title
    if body:
        payload["body"] = body
    if media:
        payload["mediaKind"] = "image"
        payload["mediaSrc"] = media.get("src")
        payload["mediaAlt"] = media.get("alt") or ""
    return payload


def _atoms_to_faq_items(atoms_section: dict, max_items: int = 6) -> list[dict]:
    texts = _atoms_texts(atoms_section, {"text", "heading"})
    items: list[dict] = []
    q_idx = 0
    while q_idx < len(texts) and len(items) < max_items:
        q = texts[q_idx]
        if "?" not in q and "？" not in q and not re.search(r"how|what|why|can|是否|怎么|如何|为什么", q, re.I):
            q_idx += 1
            continue
        a = texts[q_idx + 1] if q_idx + 1 < len(texts) else ""
        if not a:
            q_idx += 1
            continue
        items.append({"q": q, "a": a})
        q_idx += 2
    if len(items) < 2:
        for idx in range(0, len(texts), 2):
            if len(items) >= max_items:
                break
            q = texts[idx]
            a = texts[idx + 1] if idx + 1 < len(texts) else ""
            if q and a:
                items.append({"q": q, "a": a})
    return items


def _group_atoms_by_row(atoms: list[dict], row_gap: int = 28) -> list[list[dict]]:
    rows: list[list[dict]] = []
    for atom in atoms:
        bbox = atom.get("bbox") if isinstance(atom, dict) else None
        if not isinstance(bbox, dict):
            continue
        y = int(bbox.get("y") or 0)
        placed = False
        for row in rows:
            ry = int(row[0].get("bbox", {}).get("y") or 0)
            if abs(y - ry) <= row_gap:
                row.append(atom)
                placed = True
                break
        if not placed:
            rows.append([atom])
    return rows


def _atoms_to_cards_by_rows(atoms_section: dict, max_items: int = 8) -> list[dict]:
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    rows = _group_atoms_by_row(atoms, row_gap=32)
    items: list[dict] = []
    for row in rows:
        if len(items) >= max_items:
            break
        row_headings = [a for a in row if a.get("kind") == "heading"]
        row_texts = [a for a in row if a.get("kind") == "text"]
        row_images = [a for a in row if a.get("kind") == "image"]
        title = row_headings[0].get("text") if row_headings else (row_texts[0].get("text") if row_texts else "")
        desc = row_texts[0].get("text") if row_texts else ""
        image = row_images[0] if row_images else None
        if not title:
            continue
        item: dict[str, Any] = {"title": title}
        if desc:
            item["description"] = desc
        if image:
            item["image"] = {"src": image.get("src"), "alt": image.get("text") or title}
        items.append(item)
    return items


def _atoms_to_cta_props(atoms_section: dict) -> dict:
    headings = _atoms_texts(atoms_section, {"heading"})
    texts = _atoms_texts(atoms_section, {"text"})
    links = _atoms_texts(atoms_section, {"link"})
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    link_href = ""
    for atom in atoms:
        if not isinstance(atom, dict) or atom.get("kind") != "link":
            continue
        href = atom.get("href")
        if isinstance(href, str) and href.strip():
            link_href = href.strip()
            break
    title = headings[0] if headings else ""
    subtitle = texts[0] if texts else ""
    cta_label = links[0] if links else "Get Started"
    return {
        "title": title or "Get Started",
        "subtitle": subtitle,
        "cta": {"label": cta_label, "href": link_href or "#"},
    }


def _atoms_logo_candidate(atoms_section: dict) -> tuple[bool, float]:
    stats = atoms_section.get("stats") if isinstance(atoms_section.get("stats"), dict) else {}
    images = int(stats.get("images") or 0)
    texts = int(stats.get("text") or 0)
    headings = int(stats.get("headings") or 0)
    links = int(stats.get("links") or 0)
    buttons = int(stats.get("buttons") or 0)
    if images >= 6 and texts <= 2 and headings <= 1 and links <= 3 and buttons == 0:
        return True, 0.85
    if images >= 5 and texts <= 4 and headings <= 2 and links <= 4:
        return True, 0.65
    return False, 0.0


def _atoms_pricing_candidate(atoms_section: dict) -> tuple[bool, float]:
    text_blob = _atoms_text_blob(atoms_section)
    has_price = bool(re.search(r"[$¥€]\s?\d+|/mo|/yr|per month|monthly|年付|月付|价格|定价", text_blob))
    stats = atoms_section.get("stats") if isinstance(atoms_section.get("stats"), dict) else {}
    buttons = int(stats.get("buttons") or 0)
    links = int(stats.get("links") or 0)
    headings = int(stats.get("headings") or 0)
    if has_price and (buttons + links) >= 1 and headings >= 1:
        return True, 0.85
    if has_price:
        return True, 0.65
    return False, 0.0


def _atoms_faq_candidate(atoms_section: dict) -> tuple[bool, float]:
    text_blob = _atoms_text_blob(atoms_section)
    question_marks = text_blob.count("?") + text_blob.count("？")
    if "faq" in text_blob or "常见问题" in text_blob:
        return True, 0.85
    if question_marks >= 2:
        return True, 0.7
    return False, 0.0


def _atoms_stats_candidate(atoms_section: dict) -> tuple[bool, float]:
    text_blob = _atoms_text_blob(atoms_section)
    matches = re.findall(r"\d+%|\d+x|\d+k|\d+,\d+", text_blob)
    if len(matches) >= 3:
        return True, 0.8
    if len(matches) == 2:
        return True, 0.6
    return False, 0.0


def _atoms_steps_candidate(atoms_section: dict) -> tuple[bool, float]:
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    step_count = 0
    for atom in atoms:
        if not isinstance(atom, dict):
            continue
        text = atom.get("text")
        if not isinstance(text, str):
            continue
        if re.match(r"^\s*\d+[\.)、]", text.strip()):
            step_count += 1
    text_blob = _atoms_text_blob(atoms_section)
    if step_count >= 3 or "步骤" in text_blob or "step" in text_blob:
        return True, 0.75
    return False, 0.0


def _atoms_testimonials_candidate(atoms_section: dict) -> tuple[bool, float]:
    text_blob = _atoms_text_blob(atoms_section)
    quotes = text_blob.count("“") + text_blob.count("\"")
    stats = atoms_section.get("stats") if isinstance(atoms_section.get("stats"), dict) else {}
    images = int(stats.get("images") or 0)
    if images >= 2 and ("testimonial" in text_blob or "评价" in text_blob or "客户" in text_blob):
        return True, 0.75
    if images >= 2 and quotes >= 2:
        return True, 0.65
    return False, 0.0


def _atoms_feature_candidate(atoms_section: dict) -> tuple[bool, float]:
    stats = atoms_section.get("stats") if isinstance(atoms_section.get("stats"), dict) else {}
    headings = int(stats.get("headings") or 0)
    texts = int(stats.get("text") or 0)
    images = int(stats.get("images") or 0)
    if headings >= 3 and texts >= 3 and images >= 1:
        return True, 0.6
    if headings >= 3 and texts >= 4:
        return True, 0.55
    return False, 0.0


def _atoms_cards_candidate(atoms_section: dict) -> tuple[bool, float]:
    atoms = atoms_section.get("atoms") if isinstance(atoms_section.get("atoms"), list) else []
    stats = atoms_section.get("stats") if isinstance(atoms_section.get("stats"), dict) else {}
    img_atoms = [a for a in atoms if isinstance(a, dict) and a.get("kind") == "image" and isinstance(a.get("bbox"), dict)]
    link_atoms = [a for a in atoms if isinstance(a, dict) and a.get("kind") in {"link", "button"}]
    heading_atoms = [a for a in atoms if isinstance(a, dict) and a.get("kind") == "heading"]
    text_atoms = [a for a in atoms if isinstance(a, dict) and a.get("kind") == "text"]
    img_count = len(img_atoms)
    link_count = len(link_atoms)
    heading_count = len(heading_atoms)
    text_count = len(text_atoms)
    widths = [int(a.get("bbox", {}).get("w") or 0) for a in img_atoms if int(a.get("bbox", {}).get("w") or 0) > 0]
    heights = [int(a.get("bbox", {}).get("h") or 0) for a in img_atoms if int(a.get("bbox", {}).get("h") or 0) > 0]
    width_buckets = _round_bucket(widths, 20)
    height_buckets = _round_bucket(heights, 20)
    grid_like = max(width_buckets.values() or [0]) >= 3 or max(height_buckets.values() or [0]) >= 3
    logo_like = img_count >= 6 and heading_count <= 1 and text_count <= 1 and link_count <= 2
    if logo_like:
        return False, 0.3
    base_signal = (img_count >= 3 and (link_count + text_count + heading_count) >= 3) or (img_count >= 4 and heading_count >= 2)
    strong = base_signal and grid_like
    score = 0.0
    if strong:
        score = 0.9
    elif base_signal:
        score = 0.6
    elif (stats.get("images") or 0) >= 6 and (stats.get("text") or 0) <= 6:
        score = 0.55
    return (score >= 0.6, score)


def _suggest_block_from_atoms(atoms_section: dict) -> tuple[str | None, float, str | None]:
    ok, score = _atoms_pricing_candidate(atoms_section)
    if ok:
        return "PricingCards.v1", score, "Pricing"
    ok, score = _atoms_faq_candidate(atoms_section)
    if ok:
        return "FAQAccordion.v1", score, "FAQ"
    ok, score = _atoms_stats_candidate(atoms_section)
    if ok:
        return "StatsKPI.v1", score, "Feature"
    ok, score = _atoms_steps_candidate(atoms_section)
    if ok:
        return "StepsTimeline.v1", score, "Feature"
    ok, score = _atoms_logo_candidate(atoms_section)
    if ok:
        return "LogoCloud.v1", score, "Proof"
    ok, score = _atoms_testimonials_candidate(atoms_section)
    if ok:
        return "TestimonialsGrid.v1", score, "Proof"
    layout = str(atoms_section.get("layoutPattern") or "").lower()
    if "split" in layout:
        return "FeatureWithMedia.v1", 0.85, "Feature"
    ok, score = _atoms_cards_candidate(atoms_section)
    if ok:
        return "CardsGrid.v1", score, "Feature"
    ok, score = _atoms_feature_candidate(atoms_section)
    if ok:
        return "FeatureGrid.v1", score, "Feature"
    return None, 0.0, None


def _semantic_role_to_block(role: str) -> str | None:
    mapping = {
        "Hero": "HeroCentered.v1",
        "Feature": "FeatureGrid.v1",
        "Pricing": "PricingCards.v1",
        "FAQ": "FAQAccordion.v1",
        "Testimonials": "TestimonialsGrid.v1",
        "LogoCloud": "LogoCloud.v1",
        "CTA": "LeadCaptureCTA.v1",
        "CaseStudies": "CaseStudies.v1",
        "Footer": "Footer.v1",
        "Section": None,
    }
    return mapping.get(role)

def _find_section_content(
    sections: list[dict], heading: str | None, index: int
) -> dict:
    if not sections:
        return {}
    if heading:
        heading_base = heading.split(" - ", 1)[0]
        heading_slug = _slugify(heading_base)
        for section in sections:
            if _slugify(section.get("title", "")) == heading_slug:
                return section
    if index < len(sections):
        return sections[index]
    return {}


def _estimate_tolerance(
    section_content: dict, layout: dict | None, has_image_capture: bool
) -> dict:
    content = _normalize_section_content(section_content)
    text = _section_text(content)
    word_count = len(text.split())
    char_count = len(text)
    height = layout.get("height", 0) if layout else 0
    overflow_risk = word_count > 120 and height and height < 420
    media_expected = bool(
        content.get("images") or content.get("videos") or content.get("backgrounds")
    )
    media_missing = media_expected and not has_image_capture
    buttons = content.get("buttons") or []
    links = content.get("links") or []
    lists = content.get("lists") or []
    return {
        "word_count": word_count,
        "char_count": char_count,
        "overflow_risk": overflow_risk,
        "dynamic_height": overflow_risk or word_count > 140,
        "media_expected": media_expected,
        "media_missing": media_missing,
        "button_count": len(buttons) if isinstance(buttons, list) else 0,
        "link_count": len(links) if isinstance(links, list) else 0,
        "list_count": len(lists) if isinstance(lists, list) else 0,
        "cta_heavy": isinstance(buttons, list) and len(buttons) > 2,
    }


def _content_constraints(section_content: dict | None) -> dict:
    content = _normalize_section_content(section_content)
    title = content.get("title") or ""
    texts = content.get("texts") or []
    if isinstance(texts, str):
        texts = [texts]
    lists = content.get("lists") or []
    buttons = content.get("buttons") or []
    images = content.get("images") or []
    text_value = " ".join(texts).strip()
    text_len = len(text_value)
    if not text_len and isinstance(content.get("text"), str):
        text_len = len(content.get("text", ""))
    list_items = sum(len(items) for items in lists if isinstance(items, list))
    constraints: dict[str, list[int]] = {}
    if title:
        constraints["title_len"] = [max(6, len(title) - 6), len(title) + 12]
    if text_len:
        constraints["text_len"] = [max(40, text_len - 80), text_len + 120]
    if list_items:
        constraints["items_len"] = [max(2, list_items - 1), list_items + 2]
    if isinstance(buttons, list) and buttons:
        constraints["buttons_len"] = [max(1, len(buttons) - 1), len(buttons) + 1]
    if isinstance(images, list) and images:
        constraints["images_len"] = [max(1, len(images) - 1), len(images) + 1]
    return constraints


def _infer_intent_tags(text: str, block_type: str, hints: list[str]) -> list[str]:
    value = " ".join([text, block_type, " ".join(hints)]).lower()
    tags: list[str] = []

    def add(tag: str, cond: bool) -> None:
        if cond and tag not in tags:
            tags.append(tag)

    add("pricing", "pricing" in value or "price" in value or "plan" in value)
    add("faq", "faq" in value or "question" in value)
    add(
        "trust",
        any(
            key in value
            for key in ["testimonial", "logo", "trusted", "case study", "customer"]
        ),
    )
    add(
        "conversion",
        any(
            key in value
            for key in [
                "contact",
                "demo",
                "cta",
                "get started",
                "book",
                "signup",
                "sign up",
                "trial",
            ]
        ),
    )
    add(
        "feature_explain",
        any(
            key in value
            for key in ["feature", "benefit", "use case", "capability", "how it works"]
        ),
    )
    add("product_story", "hero" in value or "story" in value or "mission" in value)
    add("support", "support" in value or "docs" in value)
    if not tags:
        tags.append("general")
    return tags


def _infer_industry_tags(text: str) -> list[str]:
    value = text.lower()
    tags: list[str] = []
    for tag, keywords in INDUSTRY_KEYWORDS.items():
        if any(keyword in value for keyword in keywords):
            tags.append(tag)
    return tags


def _layout_schema_label(block_type: str, intent_tags: list[str]) -> str:
    if "Hero" in block_type:
        return "Hero"
    if "Pricing" in block_type:
        return "Pricing"
    if "FAQ" in block_type:
        return "FAQ"
    if "Footer" in block_type or "SupportLinks" in block_type:
        return "Footer"
    if "LeadCapture" in block_type or "Contact" in block_type:
        return "CTA"
    if any(key in block_type for key in ["LogoCloud", "Testimonials", "CaseStudies"]):
        return "Proof"
    if any(
        key in block_type
        for key in [
            "FeatureGrid",
            "UseCases",
            "IntegrationsGrid",
            "StatsKPI",
            "StepsTimeline",
            "ComparisonTable",
        ]
    ):
        return "Features"
    if "trust" in intent_tags:
        return "Proof"
    if "conversion" in intent_tags:
        return "CTA"
    return "Section"


def _repair_structure(
    sections: list[dict], available_blocks: set[str], mode: str
) -> tuple[list[dict], list[dict]]:
    actions: list[dict] = []
    if mode == "off":
        return sections, actions
    mode_parts = set(mode.split("_")) if mode else set()
    if mode == "full":
        mode_parts = {"reorder", "insert", "replace", "regroup"}
    layout_order = ["Hero", "Features", "Proof", "Pricing", "FAQ", "CTA", "Footer"]

    def label_for(section: dict) -> str:
        return _layout_schema_label(str(section.get("type", "")), [])

    if "replace" in mode_parts:
        replaced = 0
        for section in sections:
            candidate = _select_block_type_from_text(
                str(section.get("source", "")), available_blocks
            )
            if candidate and candidate != section.get("type"):
                section["type"] = candidate
                replaced += 1
        if replaced:
            actions.append({"type": "replace", "count": replaced})

    if "insert" in mode_parts:
        required = ["Hero", "Features", "CTA", "Footer"]
        present = {label_for(item) for item in sections}
        defaults = {
            "Hero": "HeroCentered.v1",
            "Features": "FeatureGrid.v1",
            "CTA": "LeadCaptureCTA.v1",
            "Footer": "Footer.v1",
        }
        inserts = []
        for label in required:
            if label in present:
                continue
            block_type = defaults.get(label)
            if block_type and block_type in available_blocks:
                inserts.append({"type": block_type, "source": f"Auto {label}"})
        if inserts:
            sections = sections + inserts
            actions.append({"type": "insert", "count": len(inserts)})

    if "reorder" in mode_parts:
        sections = sorted(
            sections,
            key=lambda item: layout_order.index(label_for(item))
            if label_for(item) in layout_order
            else len(layout_order),
        )
        actions.append({"type": "reorder", "count": len(sections)})
    elif "regroup" in mode_parts:
        grouped = []
        for label in layout_order:
            grouped.extend([item for item in sections if label_for(item) == label])
        grouped.extend([item for item in sections if label_for(item) not in layout_order])
        sections = grouped
        actions.append({"type": "regroup", "count": len(sections)})

    return sections, actions


def _average_hash(image) -> str:
    from PIL import Image

    resized = image.resize((8, 8), Image.Resampling.LANCZOS).convert("L")
    pixels = list(resized.getdata())
    avg = sum(pixels) / len(pixels)
    bits = "".join("1" if p >= avg else "0" for p in pixels)
    return f"{int(bits, 2):016x}"


def _extract_visual_hashes(
    screenshot_path: Path, section_boxes: list[dict]
) -> list[dict]:
    try:
        from PIL import Image
    except ImportError:
        return [
            {"visual_hash": None, "error": "Pillow not installed"}
            for _ in section_boxes
        ]

    if not screenshot_path.exists():
        return [
            {"visual_hash": None, "error": "screenshot missing"} for _ in section_boxes
        ]

    image = Image.open(screenshot_path)
    hashes = []
    for box in section_boxes:
        left = max(int(box.get("left", 0)), 0)
        top = max(int(box.get("top", 0)), 0)
        width = max(int(box.get("width", 0)), 1)
        height = max(int(box.get("height", 0)), 1)
        crop = image.crop((left, top, left + width, top + height))
        hashes.append({"visual_hash": _average_hash(crop)})
    return hashes


def map_sections(
    extract_data: dict,
    registry_path: Path,
    output_root: Path,
    capture_data: dict | None = None,
    page_slug: str | None = None,
    plan: dict | None = None,
) -> dict:
    headings = extract_data.get("headings", [])
    paragraphs = extract_data.get("paragraphs", [])
    markdown = extract_data.get("markdown", "")
    domain = extract_data.get("domain", "site")
    html = extract_data.get("html", "")
    extracted_sections = extract_data.get("sections", [])
    summary = " ".join(paragraphs[:3]).strip()
    text_blob = " ".join([summary, markdown]).lower()
    content_assets = extract_data.get("content_assets") or {}
    routes = _load_site_routes(output_root, domain, plan)

    registry = _load_registry(registry_path)
    puck_blocks = _load_puck_blocks_from_config()
    if not puck_blocks:
        puck_blocks = _load_puck_blocks_from_schemas()
    available_blocks = (
        registry["types"].intersection(puck_blocks)
        if puck_blocks
        else registry["types"]
    )
    variant_embeddings = build_variant_embeddings(
        ASSET_FACTORY_ROOT / "blocks/variant_prompts.json",
        ASSET_FACTORY_ROOT / "blocks/variant_embeddings.json",
    )

    mapped = []
    section_boxes: list[dict[str, Any]] = []
    section_images: list[str] = []
    capture_payloads: list[dict] = []
    screenshot_path = None
    viewport_height = 900
    if capture_data:
        section_boxes = capture_data.get("sections", [])
        section_images = capture_data.get("screenshots", [])
        capture_payloads = capture_data.get("section_payloads", []) or []
        screenshot_path = Path(capture_data.get("screenshot", ""))
        viewport = capture_data.get("viewport", {})
        viewport_height = viewport.get("height", viewport_height)

    has_capture_layout = bool(section_boxes)
    has_nav_hint = False
    if isinstance(html, str) and "<nav" in html.lower():
        has_nav_hint = True
    if not has_nav_hint and section_boxes:
        for box in section_boxes:
            tag = str(box.get("tag", "")).lower()
            class_name = str(box.get("className", "")).lower()
            top = float(box.get("top", 0) or 0)
            if (
                ("nav" in tag or "header" in tag or "nav" in class_name or "header" in class_name)
                and top <= viewport_height * 0.5
            ):
                has_nav_hint = True
                break
    if not has_nav_hint:
        links = extract_data.get("links") or []
        if len(links) >= 3 or "skip to main content" in markdown.lower():
            has_nav_hint = True
    section_titles: list[str] = []
    if has_capture_layout and (extracted_sections or capture_payloads):
        total = len(section_boxes) if section_boxes else max(len(extracted_sections), len(capture_payloads))
        for idx in range(total):
            title = None
            if idx < len(extracted_sections):
                title = extracted_sections[idx].get("title")
            if (not title) and idx < len(capture_payloads):
                title = capture_payloads[idx].get("title")
            if isinstance(title, str) and title.strip():
                section_titles.append(title.strip())
            else:
                section_titles.append(f"Section {idx + 1}")
    else:
        section_titles = [h for h in headings if isinstance(h, str) and h.strip()]
    nav_props: dict | None = None
    if has_nav_hint and "Navbar.v1" in available_blocks:
        nav_links = _build_nav_links(section_titles)
        nav_cta = _pick_nav_cta(extract_data)
        nav_logo = _pick_nav_logo(extract_data)
        nav_props = {
            "links": nav_links or [{"label": "Home", "href": "#top"}],
            "ctas": [nav_cta] if nav_cta else [],
            "sticky": True,
            "logo": nav_logo
            or {"src": "", "alt": str(extract_data.get("title") or domain or "Site")},
        }

    if section_titles:
        mapped.append({"type": "HeroCentered.v1", "source": section_titles[0]})
    elif section_boxes:
        first = section_boxes[0]
        if first.get("height", 0) > 400:
            mapped.append({"type": "HeroCentered.v1", "source": "Hero"})
    if not mapped:
        mapped.append({"type": "HeroCentered.v1", "source": "Hero"})

    for heading in section_titles[1:]:
        lower = heading.lower()
        if (
            not has_capture_layout
            and "FeatureWithMedia.v1" in available_blocks
            and "CardsGrid.v1" in available_blocks
            and "platform" in lower
            and "intelligent" in lower
        ):
            mapped.append({"type": "FeatureWithMedia.v1", "source": heading})
            mapped.append({"type": "CardsGrid.v1", "source": f"{heading} - cards"})
            continue
        selected = None
        for key, block_type in SECTION_KEYWORDS.items():
            if key in lower:
                selected = block_type
                break
        if selected and selected not in available_blocks:
            selected = None
        if not selected:
            if re.search(r"faq|question", lower):
                selected = "FAQAccordion.v1"
            else:
                selected = "FeatureGrid.v1"
        if selected in available_blocks:
            mapped.append({"type": selected, "source": heading})

    if not has_capture_layout:
        if (
            "PricingCards.v1" in available_blocks
            and ("pricing" in text_blob or re.search(r"\$\d|/mo|/yr", text_blob))
        ):
            mapped.append({"type": "PricingCards.v1", "source": "Pricing"})
        if (
            "TestimonialsGrid.v1" in available_blocks
            and ("testimonial" in text_blob or "case study" in text_blob)
        ):
            mapped.append({"type": "TestimonialsGrid.v1", "source": "Testimonials"})
        if (
            "LogoCloud.v1" in available_blocks
            and ("logo" in text_blob or "trusted by" in text_blob)
        ):
            mapped.append({"type": "LogoCloud.v1", "source": "Logo Cloud"})

        if "FAQAccordion.v1" in available_blocks and "faq" in markdown.lower():
            mapped.append({"type": "FAQAccordion.v1", "source": "FAQ"})

        if "LeadCaptureCTA.v1" in available_blocks:
            mapped.append({"type": "LeadCaptureCTA.v1", "source": "CTA"})
        if "Footer.v1" in available_blocks:
            mapped.append({"type": "Footer.v1", "source": "Footer"})

    deduped = []
    seen = set()
    for item in mapped:
        key = (item.get("type"), item.get("source"))
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    mapped = deduped
    def _layout_agent_plan(intent: str) -> list[str]:
        default = ["Hero", "Features", "Proof", "Pricing", "FAQ", "CTA", "Footer"]
        plans = {
            "home": ["Hero", "Features", "Proof", "CTA", "Footer"],
            "product": ["Hero", "Features", "Proof", "CTA", "Footer"],
            "pricing": ["Hero", "Pricing", "FAQ", "CTA", "Footer"],
            "faq": ["Hero", "FAQ", "CTA", "Footer"],
            "contact": ["Hero", "CTA", "Features", "Footer"],
            "case_study": ["Hero", "Proof", "Features", "CTA", "Footer"],
            "about": ["Hero", "Features", "Proof", "CTA", "Footer"],
            "support": ["Hero", "Features", "FAQ", "CTA", "Footer"],
            "page": default,
        }
        return plans.get(intent, default)
    def _label_for(section: dict) -> str:
        return _layout_schema_label(str(section.get("type", "")), [])
    def _default_block_for(label: str) -> str | None:
        defaults = {
            "Hero": "HeroCentered.v1",
            "Features": "FeatureGrid.v1",
            "Proof": "LogoCloud.v1",
            "Pricing": "PricingCards.v1",
            "FAQ": "FAQAccordion.v1",
            "CTA": "LeadCaptureCTA.v1",
            "Footer": "Footer.v1",
            "Section": "FeatureGrid.v1",
        }
        block = defaults.get(label)
        return block if block in available_blocks else None
    def _apply_layout_agent(
        sections: list[dict], intent: str, allow_insert: bool = True
    ) -> tuple[list[dict], list[dict]]:
        desired = _layout_agent_plan(intent)
        ordered: list[dict] = []
        actions: list[dict] = []
        used_idx: set[int] = set()
        for label in desired:
            group = [s for i, s in enumerate(sections) if _label_for(s) == label and i not in used_idx]
            if group:
                for i, s in enumerate(sections):
                    if i in used_idx:
                        continue
                    if _label_for(s) == label:
                        ordered.append(s)
                        used_idx.add(i)
                continue
            if allow_insert:
                default_block = _default_block_for(label)
                if default_block:
                    ordered.append({"type": default_block, "source": f"Auto {label}"})
                    actions.append({"type": "layout_insert", "label": label, "block": default_block})
        for i, s in enumerate(sections):
            if i not in used_idx:
                ordered.append(s)
        actions.append({"type": "layout_order", "sequence": desired})
        return ordered, actions
    repair_mode = os.environ.get("STRUCTURE_REPAIR_MODE", "off").lower()
    page_intent = (plan or {}).get("intent") if isinstance(plan, dict) else None
    layout_actions: list[dict] = []
    if page_intent and not has_capture_layout:
        mapped, layout_actions = _apply_layout_agent(mapped, str(page_intent))
        mode_parts = set(repair_mode.split("_")) if repair_mode else set()
        mode_no_reorder = "_".join([m for m in mode_parts if m not in {"reorder", "regroup"}]) or "off"
        mapped, repair_actions = _repair_structure(
            mapped, available_blocks, mode_no_reorder
        )
        repair_actions = layout_actions + repair_actions
    elif has_capture_layout:
        repair_actions = []
    else:
        mapped, repair_actions = _repair_structure(mapped, available_blocks, repair_mode)

    output_dir = output_root / domain / "pages" / (page_slug or "home")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "sections.json"

    structure = _compute_structure_features(html)

    if section_boxes and len(mapped) < len(section_boxes):
        for _ in range(len(section_boxes) - len(mapped)):
            mapped.append({"type": "FeatureGrid.v1", "source": "Section"})

    visual_hashes = (
        _extract_visual_hashes(screenshot_path, section_boxes)
        if screenshot_path
        else []
    )

    enriched_sections = []
    atoms_dsl_sections = _load_atoms_dsl(output_root, domain, page_slug)
    semantic_tags = _load_semantic_tags(output_root, domain, page_slug)
    layout_groups = _load_section_groups(output_root, domain, page_slug)
    for index, section in enumerate(mapped):
        layout = section_boxes[index] if index < len(section_boxes) else {}
        layout_tag = str(layout.get("tag", "")).lower()
        layout_class = str(layout.get("className", "")).lower()
        section_content = _find_section_content(
            extracted_sections, section.get("source"), index
        )
        capture_content = (
            capture_payloads[index] if index < len(capture_payloads) else {}
        )
        section_content = _merge_section_content(section_content, capture_content)
        content = _normalize_section_content(section_content)
        style_hints = _style_hints(section_content, layout, viewport_height)
        atoms_section = atoms_dsl_sections.get(index) if atoms_dsl_sections else None
        if not atoms_section and atoms_dsl_sections:
            src_title = str(section.get("source") or "").strip().lower()
            base_src_title = src_title.split(" - ", 1)[0].strip()
            for _, atom_sec in atoms_dsl_sections.items():
                title = str(atom_sec.get("title") or "").strip().lower()
                if title and base_src_title and title == base_src_title:
                    atoms_section = atom_sec
                    break
        semantic = semantic_tags.get(index) if semantic_tags else None
        layout_meta = layout_groups.get(index) if layout_groups else None
        if semantic and isinstance(semantic, dict):
            if atoms_section:
                atoms_section = {**atoms_section, "semanticRole": semantic.get("semanticRole") or atoms_section.get("semanticRole")}
        if atoms_section and not content.get("atoms"):
            atoms = atoms_section.get("atoms")
            if isinstance(atoms, list) and atoms:
                content["atoms"] = atoms
        layout_type = layout_meta.get("layout_type") if isinstance(layout_meta, dict) else None
        if os.environ.get("HIGH_FIDELITY", "0") == "1" and isinstance(layout_type, str):
            if "split" in layout_type and section.get("type") not in {"Footer.v1", "Navbar.v1", "AnnouncementBar.v1"}:
                if index == 0 and "HeroSplit.v1" in available_blocks:
                    section["type"] = "HeroSplit.v1"
                    section["variant"] = section.get("variant") or "image"
                elif "FeatureWithMedia.v1" in available_blocks:
                    section["type"] = "FeatureWithMedia.v1"
                    section["variant"] = section.get("variant") or "split"
            if (
                "grid" in layout_type
                and "CardsGrid.v1" in available_blocks
                and section.get("type") not in {"Footer.v1", "Navbar.v1", "AnnouncementBar.v1"}
            ):
                metrics = content.get("metrics") if isinstance(content, dict) else None
                card_count = metrics.get("card_count") if isinstance(metrics, dict) else 0
                if isinstance(card_count, int) and card_count >= 3:
                    section["type"] = "CardsGrid.v1"
                    section["variant"] = section.get("variant") or "media"
        section_text = _section_text(section_content)
        hints = []
        if "footer" in layout_tag or "footer" in layout_class:
            hints.append("footer")
        if "nav" in layout_tag or "nav" in layout_class:
            hints.append("nav")
        if "header" in layout_tag or "hero" in layout_class:
            hints.append("hero")
        if "contact" in layout_class:
            hints.append("contact")
        if "faq" in layout_class:
            hints.append("faq")
        combined_text = " ".join(
            [
                str(section.get("source", "")).lower(),
                summary if index == 0 else section_text,
                " ".join(hints),
            ]
        ).strip()
        intent_tags = _infer_intent_tags(
            section_text or combined_text, section["type"], hints
        )
        if atoms_section:
            semantic_role = atoms_section.get("semanticRole")
            if semantic_role == "Pricing" and "pricing" not in intent_tags:
                intent_tags.append("pricing")
            if semantic_role == "FAQ" and "faq" not in intent_tags:
                intent_tags.append("faq")
            if semantic_role == "Testimonials" and "trust" not in intent_tags:
                intent_tags.append("trust")
            if semantic_role == "CTA" and "conversion" not in intent_tags:
                intent_tags.append("conversion")
        industry_tags = _infer_industry_tags(
            " ".join([section_text or "", summary or "", markdown or ""]).strip()
        )
        layout_label = _layout_schema_label(section["type"], intent_tags)
        has_media = bool(
            content.get("images") or content.get("videos") or content.get("backgrounds")
        ) or (
            index < len(section_images) and bool(section_images[index])
        )
        metrics = content.get("metrics") if isinstance(content, dict) else {}
        img_count = (
            len(content.get("images", []))
            if isinstance(content.get("images"), list)
            else 0
        )
        card_count = 0
        if isinstance(metrics, dict):
            card_count = int(metrics.get("card_count") or 0)
        section_blob = (section_text or "").lower()
        context = {
            "text": combined_text or section_text or text_blob,
            "index": index,
            "total": len(mapped),
            "viewport_height": viewport_height,
            "grid_like": layout.get("width", 0) > 600,
            "repeat_items": len(headings) > 4,
            "has_media": has_media,
            "has_points": "feature" in section_blob
            or "benefit" in section_blob
            or "feature" in text_blob
            or "benefit" in text_blob,
            "two_column_like": layout.get("width", 0) > 900,
            "img_count": img_count,
            "card_count": card_count,
            "near_hero": index == 1,
            "has_h1": index == 0 and bool(headings),
            "has_cta": bool(content.get("buttons")),
            "has_footer_tag": "footer" in layout_tag or "footer" in layout_class,
        }
        classification = {"candidates": [], "family": "Skeleton"}
        candidates: list[dict] = []
        source_label = str(section.get("source", "")).strip().lower()
        force_footer = source_label == "footer"
        if "Footer.v1" in available_blocks and force_footer:
            section["type"] = "Footer.v1"
            candidates = [{"type": "Footer.v1", "score": 100, "reasons": ["footer_tag:100"], "family": "Skeleton"}]
        else:
            classification = classify_section({"layout": layout}, context)
            candidates = classification.get("candidates", [])
            initial_type = section.get("type")
            if candidates:
                top_type = candidates[0].get("type")
                top_score = int(candidates[0].get("score") or 0)
                initial_score = 0
                for c in candidates:
                    if c.get("type") == initial_type:
                        initial_score = int(c.get("score") or 0)
                        break
                if top_type in available_blocks:
                    protected = {"Footer.v1", "Navbar.v1", "AnnouncementBar.v1"}
                    if initial_type not in protected:
                        threshold = max(initial_score + 10, 60)
                        if top_type != initial_type and top_score >= threshold:
                            section["type"] = top_type
                    else:
                        section["type"] = top_type
        if atoms_section:
            suggestion, s_score, s_family = _suggest_block_from_atoms(atoms_section)
            if suggestion and suggestion in available_blocks:
                reasons = [f"atoms_rule:{int(s_score*100)}"]
                top = {"type": suggestion, "score": int(s_score * 100), "reasons": reasons, "family": s_family or "Feature"}
                current_type = section.get("type")
                top_score = candidates[0].get("score") if candidates else 0
                protected = {"Footer.v1", "Navbar.v1", "AnnouncementBar.v1", "LeadCaptureCTA.v1"}
                if index == 0:
                    protected.add("HeroCentered.v1")
                should_override = (
                    suggestion != current_type
                    and current_type not in protected
                    and int(s_score * 100) >= 80
                )
                is_split_cards = (
                    current_type == "CardsGrid.v1"
                    and " - " in str(section.get("source") or "")
                )
                if should_override and not is_split_cards:
                    section["type"] = suggestion
                candidates = [top] + [c for c in candidates if c.get("type") != suggestion][:4]
        if semantic and isinstance(semantic, dict):
            role = semantic.get("semanticRole")
            role_block = _semantic_role_to_block(role) if isinstance(role, str) else None
            if role_block and role_block in available_blocks:
                protected = {"Footer.v1", "Navbar.v1", "AnnouncementBar.v1"}
                if section.get("type") not in protected:
                    if role == "Hero" and index != 0:
                        pass
                    else:
                        if os.environ.get("HIGH_FIDELITY", "0") == "1":
                            section["type"] = role_block
                        elif section.get("type") != role_block:
                            section["type"] = role_block
            layout_pattern = semantic.get("layoutPattern")
            if (
                isinstance(layout_pattern, str)
                and "split" in layout_pattern.lower()
                and "FeatureWithMedia.v1" in available_blocks
                and section.get("type") not in {"Footer.v1", "Navbar.v1", "AnnouncementBar.v1"}
            ):
                if os.environ.get("HIGH_FIDELITY", "0") == "1":
                    section["type"] = "FeatureWithMedia.v1"
        section["candidates"] = candidates
        section["family"] = classification.get("family")
        anchor = _slugify(section.get("source") or f"section-{index}")
        block_id = f"{section['type'].split('.')[0].lower()}-{index:02d}"
        base = _base_props(block_id, anchor=anchor)
        if style_hints.get("align"):
            base["align"] = style_hints["align"]
        if style_hints.get("paddingY"):
            base["paddingY"] = style_hints["paddingY"]
        if style_hints.get("headingFont"):
            base["headingFont"] = style_hints["headingFont"]
        if style_hints.get("bodyFont"):
            base["bodyFont"] = style_hints["bodyFont"]
        props = _props_from_text(section["type"], section.get("source", ""), summary)
        if section["type"] == "HeroCentered.v1":
            fallback_image = (
                section_images[index] if index < len(section_images) else None
            )
            media = _pick_media(content, fallback_image)
            if media:
                props = {**props, "media": media}
                section["variant"] = "withMedia"
            if isinstance(base.get("backgroundMedia"), dict) and base["backgroundMedia"].get("kind") == "video":
                section["variant"] = "withMedia"
            if style_hints.get("headingSize"):
                props["headingSize"] = style_hints["headingSize"]
            if style_hints.get("bodySize"):
                props["bodySize"] = style_hints["bodySize"]
        if section["type"] == "HeroSplit.v1":
            fallback_image = section_images[index] if index < len(section_images) else None
            media = _pick_media(content, fallback_image)
            if media:
                props = {**props, "media": media}
                section["variant"] = "video" if media.get("kind") == "video" else "image"
            if style_hints.get("align"):
                base["align"] = style_hints["align"]
            if layout_type in {"split", "stack"}:
                props["mediaPosition"] = "right"
            if style_hints.get("headingSize"):
                props["headingSize"] = style_hints["headingSize"]
            if style_hints.get("bodySize"):
                props["bodySize"] = style_hints["bodySize"]
        if section["type"] == "FeatureWithMedia.v1":
            media_src = None
            media = props.get("media")
            if isinstance(media, dict):
                media_src = media.get("src")
            if not media_src:
                media_src = props.get("mediaSrc")
            if not media_src:
                fallback_image = (
                    section_images[index] if index < len(section_images) else None
                )
                selected = _pick_media(content, fallback_image)
                if selected:
                    props = {
                        **props,
                        "mediaSrc": selected.get("src"),
                        "mediaAlt": selected.get("alt") or "",
                        "mediaKind": selected.get("kind") or "image",
                    }
            if isinstance(base.get("backgroundMedia"), dict) and base["backgroundMedia"].get("kind") == "image":
                if layout_type in {"split", "overlap"}:
                    base["backgroundOverlay"] = base.get("backgroundOverlay") or "0 0% 0%"
                    base["backgroundOverlayOpacity"] = base.get("backgroundOverlayOpacity") or 0.3
                    base["backgroundBlur"] = base.get("backgroundBlur") or 4
        if section["type"] == "CardsGrid.v1":
            cards_text = " ".join([section_text, summary or "", section.get("source") or ""]).strip()
            cards_variant = _infer_cards_variant(cards_text)
            if "latest" in str(section.get("source") or "").lower():
                cards_variant = "media"
            if layout_type == "grid" and (content.get("images") or content.get("videos")):
                cards_variant = "media"
            card_items = _build_cards_items_media(content) if cards_variant == "media" else _build_cards_items(content)
            shape = None
            size = None
            if atoms_section:
                atoms_items = _atoms_to_cards_items(atoms_section)
                if len(atoms_items) >= 2:
                    card_items = atoms_items
                row_items = _atoms_to_cards_by_rows(atoms_section)
                if len(row_items) >= 2:
                    card_items = row_items
            card_items = _fill_cards_images(
                card_items,
                _filter_images(content.get("images") if isinstance(content.get("images"), list) else []),
            )
            columns = _infer_cards_columns(len(card_items))
            if atoms_section:
                atom_images = _atoms_images(atoms_section)
                atom_columns = _atoms_columns_from_images(atom_images)
                if atom_columns:
                    columns = atom_columns
                shape = _atoms_image_shape(atom_images)
                size = _atoms_image_size(atom_images)
            props = {
                "title": content.get("title") or section.get("source") or "Cards",
                "subtitle": summary if index == 0 else "",
                "variant": cards_variant,
                "columns": columns,
                "imagePosition": "top",
                "imageSize": size or "md",
                "imageShape": shape or ("circle" if cards_variant == "person" else "rounded"),
                "headingSize": style_hints.get("headingSize") or "md",
                "bodySize": style_hints.get("bodySize") or "md",
                "items": card_items,
            }
            if "backdrop" in cards_text or (cards_variant == "media" and layout_type in {"split", "overlap"}):
                base["background"] = "image"
                if not base.get("backgroundMedia"):
                    fallback_image = section_images[index] if index < len(section_images) else None
                    backdrop = _pick_background_media(content, fallback_image=fallback_image)
                    if backdrop:
                        base["backgroundMedia"] = backdrop
                        base["backgroundOverlay"] = base.get("backgroundOverlay") or "0 0% 0%"
                        base["backgroundOverlayOpacity"] = base.get("backgroundOverlayOpacity") or 0.35
                        base["backgroundBlur"] = base.get("backgroundBlur") or 6
            if style_hints.get("align"):
                props["textAlign"] = "center" if style_hints["align"] == "center" else "left"
            if style_hints.get("headingFont"):
                props["headingFont"] = style_hints["headingFont"]
            if style_hints.get("bodyFont"):
                props["bodyFont"] = style_hints["bodyFont"]
        if section["type"] in {"HeroCentered.v1", "HeroSplit.v1", "FeatureGrid.v1", "FeatureWithMedia.v1", "PricingCards.v1", "FAQAccordion.v1", "TestimonialsGrid.v1", "CaseStudies.v1", "LeadCaptureCTA.v1"}:
            if style_hints.get("headingFont"):
                props["headingFont"] = style_hints["headingFont"]
            if style_hints.get("bodyFont"):
                props["bodyFont"] = style_hints["bodyFont"]
        if section["type"] == "FeatureGrid.v1":
            items = props.get("items") if isinstance(props, dict) else None
            if (not isinstance(items, list) or len(items) < 2) and atoms_section:
                atoms_items = _atoms_to_feature_items(atoms_section)
                if len(atoms_items) >= 2:
                    truncated = [
                        {**item, "title": _truncate_text(item.get("title", ""), 56), "desc": _truncate_text(item.get("desc", ""), 140)}
                        for item in atoms_items
                    ]
                    props = {**props, "items": truncated}
            if atoms_section and not props.get("ctas"):
                props = {**props, "ctas": _filter_cta_links(_atoms_cta_links(atoms_section), routes)}
        if section["type"] == "LogoCloud.v1":
            logos = props.get("logos") if isinstance(props, dict) else None
            if (not isinstance(logos, list) or len(logos) < 3) and atoms_section:
                atom_logos = _atoms_images(atoms_section)
                if len(atom_logos) >= 3:
                    props = {**props, "logos": [{"src": item.get("src"), "alt": item.get("alt") or "Logo"} for item in atom_logos[:12]]}
        if section["type"] == "TestimonialsGrid.v1":
            items = props.get("items") if isinstance(props, dict) else None
            if (not isinstance(items, list) or len(items) < 2) and atoms_section:
                atom_items = _atoms_to_testimonial_items(atoms_section)
                if len(atom_items) >= 2:
                    props = {**props, "items": atom_items}
        if section["type"] == "PricingCards.v1":
            plans = props.get("plans") if isinstance(props, dict) else None
            if (not isinstance(plans, list) or len(plans) < 2) and atoms_section:
                atom_plans = _atoms_to_pricing_plans(atoms_section)
                if len(atom_plans) >= 2:
                    props = {**props, "plans": atom_plans}
            if atoms_section and not props.get("ctas"):
                props = {**props, "ctas": _filter_cta_links(_atoms_cta_links(atoms_section), routes)}
        if section["type"] == "FeatureWithMedia.v1":
            media_src = props.get("mediaSrc") if isinstance(props, dict) else None
            if (not media_src) and atoms_section:
                atom_media = _atoms_to_feature_media(atoms_section)
                if atom_media:
                    props = {**props, **atom_media}
            if atoms_section and not props.get("ctas"):
                props = {**props, "ctas": _filter_cta_links(_atoms_cta_links(atoms_section), routes)}
        if section["type"] == "FAQAccordion.v1":
            items = props.get("items") if isinstance(props, dict) else None
            if (not isinstance(items, list) or len(items) < 2) and atoms_section:
                atom_items = _atoms_to_faq_items(atoms_section)
                if len(atom_items) >= 2:
                    cleaned = [
                        {"q": _truncate_text(item.get("q", ""), 120), "a": _truncate_text(item.get("a", ""), 280)}
                        for item in atom_items
                    ]
                    props = {**props, "items": cleaned}
        if section["type"] == "LeadCaptureCTA.v1":
            if atoms_section:
                atom_cta = _atoms_to_cta_props(atoms_section)
                if atom_cta:
                    filtered = _filter_cta_links([atom_cta.get("cta", {})], routes)
                    cta = filtered[0] if filtered else atom_cta.get("cta")
                    props = {**props, **{**atom_cta, "cta": cta}}
        gradient_value = None
        if isinstance(content, dict):
            gradients = content.get("background_gradients")
            if isinstance(gradients, list) and gradients:
                gradient_value = gradients[0]
        fallback_image = section_images[index] if index < len(section_images) else None
        background_media = _pick_background_media(content, fallback_image=fallback_image)
        has_iframe = False
        if isinstance(content, dict):
            for item in content.get("videos") or []:
                if isinstance(item, dict) and item.get("kind") == "iframe":
                    has_iframe = True
                    break
        if not background_media and has_iframe and fallback_image:
            background_media = {
                "kind": "image",
                "src": _inline_local_media(str(fallback_image), allow_remote_image=True),
                "alt": "Video",
            }
        if background_media:
            base["background"] = "image"
            base["backgroundMedia"] = background_media
            if "backgroundOverlay" not in base:
                base["backgroundOverlay"] = "0 0% 0%"
            if "backgroundOverlayOpacity" not in base:
                base["backgroundOverlayOpacity"] = 0.45 if background_media.get("kind") == "video" else 0.25
            if "backgroundBlur" not in base:
                base["backgroundBlur"] = 8 if background_media.get("kind") == "video" else 2
            if section["type"] == "HeroCentered.v1" and background_media.get("kind") == "video":
                props.pop("media", None)
            if section["type"] == "HeroCentered.v1":
                base["emphasis"] = "high"
        if not background_media and style_hints.get("hasGradient"):
            base["background"] = "gradient"
            if gradient_value:
                base["backgroundGradient"] = gradient_value
        variant_override = None
        if not background_media:
            props, variant_override = _ensure_default_media(section["type"], props, content, index)
        if variant_override:
            section["variant"] = variant_override
        text_embedding = []
        image_embedding = []
        try:
            text_embedding = get_text_embedding(
                section_text or summary or section.get("source", "")
            )
        except Exception:
            text_embedding = []
        if index < len(section_images):
            try:
                image_embedding = get_image_embedding(Path(section_images[index]))
            except Exception:
                image_embedding = []
        embedding_variant = select_variant(
            section["type"], text_embedding, image_embedding, variant_embeddings
        )

        block = {
            "index": index,
            **section,
            "variant": embedding_variant or _infer_variant(section["type"], section),
            "props": {**base, **props},
            "content": section_content,
            "semantic_role": atoms_section.get("semanticRole") if atoms_section else None,
            "layout_pattern": atoms_section.get("layoutPattern") if atoms_section else None,
            "intent": intent_tags[0] if intent_tags else "general",
            "intent_tags": intent_tags,
            "industry_tags": industry_tags,
            "content_constraints": _content_constraints(section_content),
            "layout_schema": layout_label,
            "layout_type": layout_meta.get("layout_type") if isinstance(layout_meta, dict) else None,
            "tolerance": _estimate_tolerance(
                section_content,
                layout if layout else None,
                bool(section_images[index]) if index < len(section_images) else False,
            ),
            "embeddings": {
                "text": text_embedding,
                "image": image_embedding,
            },
        }
        if index < len(section_boxes):
            block["layout"] = section_boxes[index]
        if index < len(section_images):
            block["screenshot"] = section_images[index]
        if index < len(visual_hashes):
            block.update(visual_hashes[index])
        enriched_sections.append(block)

    if nav_props:
        nav_base = _base_props("navbar-00", anchor="top")
        nav_base["paddingY"] = "sm"
        nav_base["background"] = "none"
        nav_base["maxWidth"] = "xl"
        hero = next(
            (s for s in enriched_sections if s.get("type") == "HeroCentered.v1"),
            None,
        )
        hero_align = hero.get("props", {}).get("align") if isinstance(hero, dict) else None
        if isinstance(hero_align, str) and hero_align:
            nav_base["align"] = hero_align
        nav_variant = "withCTA" if nav_props.get("ctas") else "simple"
        nav_block = {
            "index": 0,
            "type": "Navbar.v1",
            "source": "Navbar",
            "family": "Skeleton",
            "variant": nav_variant,
            "props": {**nav_base, **nav_props},
            "content": {},
            "semantic_role": "Navbar",
            "layout_pattern": None,
            "intent": "navigation",
            "intent_tags": ["navigation"],
            "industry_tags": [],
            "content_constraints": {},
            "layout_schema": "Navbar",
            "tolerance": 1.0,
            "embeddings": {"text": [], "image": []},
        }
        enriched_sections.insert(0, nav_block)
        for idx, section in enumerate(enriched_sections):
            section["index"] = idx

    output_path.write_text(
        json.dumps(
            {
                "sections": enriched_sections,
                "structure": structure,
                "summary": summary,
                "layout_schema": [
                    section.get("layout_schema", "Section")
                    for section in enriched_sections
                ],
                "intent_tags": [
                    section.get("intent")
                    for section in enriched_sections
                    if section.get("intent")
                ],
                "industry_tags": list(
                    {
                        tag
                        for section in enriched_sections
                        for tag in (section.get("industry_tags") or [])
                    }
                ),
                "repair": {
                    "mode": repair_mode,
                    "actions": repair_actions,
                },
                "plan": {
                    "intent": page_intent or "page",
                    "layout_sequence": _layout_agent_plan(str(page_intent)) if page_intent else [],
                },
                "content_assets": content_assets,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    return {
        "domain": domain,
        "sections": enriched_sections,
        "structure": structure,
        "summary": summary,
        "layout_schema": [
            section.get("layout_schema", "Section") for section in enriched_sections
        ],
        "page_slug": page_slug or "home",
        "path": str(output_path),
        "plan": {
            "intent": page_intent or "page",
            "layout_sequence": _layout_agent_plan(str(page_intent)) if page_intent else [],
        },
        "content_assets": content_assets,
    }

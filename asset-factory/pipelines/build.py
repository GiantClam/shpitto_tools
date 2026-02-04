from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
import os

from destyler import sanitize_props, sanitize_tokens

SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128]
PADDING_VALUES = {"sm", "md", "lg"}
ALIGN_VALUES = {"left", "center"}
MAX_WIDTH_VALUES = {"lg", "xl", "2xl"}
EMPHASIS_VALUES = {"normal", "high"}
BACKGROUND_VALUES = {"none", "muted", "gradient", "image"}
FONT_SCALE = [("xs", 12), ("sm", 14), ("base", 16), ("lg", 18), ("xl", 20), ("2xl", 24), ("3xl", 30), ("4xl", 36), ("5xl", 48), ("6xl", 60)]

def _chunk_items(items: list[str], size: int) -> list[dict]:
    output = []
    for item in items[:size]:
        output.append({"title": item[:60], "description": item})
    return output


def _extract_assets(payload: object) -> list[str]:
    assets: list[str] = []
    if isinstance(payload, dict):
        for value in payload.values():
            assets.extend(_extract_assets(value))
    elif isinstance(payload, list):
        for value in payload:
            assets.extend(_extract_assets(value))
    elif isinstance(payload, str) and payload.startswith("/assets/"):
        assets.append(payload)
    return assets


def _load_tokens(output_root: Path, domain: str) -> dict:
    theme_json_path = output_root / domain / "theme" / "theme.json"
    if theme_json_path.exists():
        return json.loads(theme_json_path.read_text(encoding="utf-8"))
    tokens_path = output_root / domain / "theme" / "tokens.json"
    if tokens_path.exists():
        return json.loads(tokens_path.read_text(encoding="utf-8"))
    return {}


def _parse_number(value: object) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return None
    raw = value.strip().lower()
    if not raw:
        return None
    if raw.endswith("px"):
        try:
            return float(raw[:-2])
        except ValueError:
            return None
    if raw.endswith("rem"):
        try:
            return float(raw[:-3]) * 16
        except ValueError:
            return None
    try:
        return float(raw)
    except ValueError:
        return None


def _nearest_number(value: float, scale: list[int]) -> int:
    return min(scale, key=lambda x: abs(x - value))


def _normalize_font_size(value: float) -> str:
    return min(FONT_SCALE, key=lambda pair: abs(pair[1] - value))[0]


def _is_color_value(value: object) -> bool:
    if not isinstance(value, str):
        return False
    return value.startswith("#") or value.startswith("rgb") or value.startswith("hsl")


def _normalize_color_by_key(key: str) -> str:
    if "border" in key:
        return "hsl(var(--border))"
    if "muted" in key:
        return "hsl(var(--muted))"
    if "primary" in key or "accent" in key:
        return "hsl(var(--primary))"
    if "background" in key or "bg" in key:
        return "hsl(var(--background))"
    if "text" in key:
        return "hsl(var(--foreground))"
    return "hsl(var(--foreground))"


def _normalize_value(key: str, value: object) -> object:
    if isinstance(value, list):
        return [_normalize_value(key, item) for item in value]
    if isinstance(value, dict):
        return _normalize_object(value)
    if _is_color_value(value):
        return _normalize_color_by_key(key)
    num = _parse_number(value)
    if num is None:
        return value
    if "padding" in key or "margin" in key or "gap" in key or key.endswith("spacing"):
        return _nearest_number(num, SPACING_SCALE)
    if key == "fontSize" or key.endswith("FontSize"):
        return _normalize_font_size(num)
    if "radius" in key:
        return "var(--radius)"
    if "shadow" in key:
        return "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    return value


def _normalize_object(obj: dict) -> dict:
    return {key: _normalize_value(key.lower(), value) for key, value in obj.items()}


def _normalize_base_props(props: dict) -> dict:
    next_props = {**props}
    padding = next_props.get("paddingY")
    if isinstance(padding, str) and padding not in PADDING_VALUES:
        next_props["paddingY"] = "lg"
    background = next_props.get("background")
    if isinstance(background, str) and background not in BACKGROUND_VALUES:
        next_props["background"] = "none"
    align = next_props.get("align")
    if isinstance(align, str) and align not in ALIGN_VALUES:
        next_props["align"] = "left"
    max_width = next_props.get("maxWidth")
    if isinstance(max_width, str) and max_width not in MAX_WIDTH_VALUES:
        next_props["maxWidth"] = "xl"
    emphasis = next_props.get("emphasis")
    if isinstance(emphasis, str) and emphasis not in EMPHASIS_VALUES:
        next_props["emphasis"] = "normal"
    heading_size = next_props.get("headingSize")
    if isinstance(heading_size, str) and heading_size not in {"sm", "md", "lg"}:
        next_props["headingSize"] = "md"
    body_size = next_props.get("bodySize")
    if isinstance(body_size, str) and body_size not in {"sm", "md", "lg"}:
        next_props["bodySize"] = "md"
    return next_props


def _normalize_block_props(props: dict) -> dict:
    return _normalize_base_props(_normalize_object(props))


def _base_type(section_type: str) -> str:
    return section_type.split(".")[0] if section_type else ""


def _apply_vertical_rhythm(sections: list[dict]) -> list[dict]:
    for section in sections:
        base_type = _base_type(str(section.get("type", "")))
        props = section.get("props", {}) if isinstance(section.get("props"), dict) else {}
        padding = props.get("paddingY")
        desired = "lg"
        if any(key in base_type.lower() for key in ["lead", "cta", "contact"]):
            desired = "md"
        if "hero" in base_type.lower():
            desired = "lg"
        if "footer" in base_type.lower():
            desired = "lg"
        if not isinstance(padding, str) or padding not in PADDING_VALUES:
            props["paddingY"] = desired
        section["props"] = props
    return sections


def _apply_alternating_backgrounds(sections: list[dict]) -> list[dict]:
    filtered = []
    for section in sections:
        base_type = _base_type(str(section.get("type", ""))).lower()
        if any(key in base_type for key in ["hero", "footer", "navbar", "announcement"]):
            continue
        filtered.append(section)
    for index, section in enumerate(filtered):
        props = section.get("props", {}) if isinstance(section.get("props"), dict) else {}
        background = props.get("background")
        if background in {None, "", "none"}:
            props["background"] = "muted" if index % 2 == 1 else "none"
        section["props"] = props
    return sections


def _apply_type_scale(sections: list[dict]) -> list[dict]:
    for section in sections:
        base_type = _base_type(str(section.get("type", ""))).lower()
        props = section.get("props", {}) if isinstance(section.get("props"), dict) else {}
        if "headingSize" not in props:
            if "hero" in base_type:
                props["headingSize"] = "lg"
            elif any(key in base_type for key in ["cta", "lead", "pricing"]):
                props["headingSize"] = "md"
            else:
                props["headingSize"] = "md"
        if "bodySize" not in props:
            if "hero" in base_type:
                props["bodySize"] = "lg"
            elif any(key in base_type for key in ["faq", "testimonial", "cards", "feature"]):
                props["bodySize"] = "md"
            else:
                props["bodySize"] = "md"
        section["props"] = props
    return sections


def _ensure_media_overlay(sections: list[dict]) -> list[dict]:
    for section in sections:
        props = section.get("props", {}) if isinstance(section.get("props"), dict) else {}
        background = props.get("background")
        background_media = props.get("backgroundMedia")
        has_media = bool(background_media) or background in {"image", "gradient"}
        if has_media and not props.get("backgroundOverlay"):
            props["backgroundOverlay"] = "0 0% 0%"
            props["backgroundOverlayOpacity"] = props.get("backgroundOverlayOpacity") or 0.35
            props["backgroundBlur"] = props.get("backgroundBlur") or 2
        section["props"] = props
    return sections


def _quality_report(sections: list[dict]) -> dict:
    counts = {
        "paddingY": {},
        "background": {},
        "headingSize": {},
        "bodySize": {},
    }
    for section in sections:
        props = section.get("props", {}) if isinstance(section.get("props"), dict) else {}
        for key in ["paddingY", "background", "headingSize", "bodySize"]:
            value = props.get(key)
            if not isinstance(value, str):
                continue
            bucket = counts.get(key, {})
            bucket[value] = bucket.get(value, 0) + 1
            counts[key] = bucket
    return counts


def _slotify_block(block: dict, zones: dict) -> dict:
    props = block.get("props", {})
    slot_keys = ["items", "columns", "logos", "plans", "steps", "links"]
    slots = {}
    for key in slot_keys:
        value = props.get(key)
        if isinstance(value, list) and value:
            slot_id = f"slot-{props.get('id', 'block')}-{key}"
            zones[slot_id] = [{"props": item} for item in value]
            slots[key] = slot_id
    if slots:
        block["slots"] = slots
    return block


def build_pages(
    extract_data: dict,
    mapped_sections: dict,
    output_root: Path,
    page_slug: str | None = None,
) -> dict:
    domain = extract_data.get("domain", "site")
    title = extract_data.get("title") or (extract_data.get("headings") or [domain])[0]
    paragraphs = extract_data.get("paragraphs", [])
    canonical = extract_data.get("url")
    font_links = extract_data.get("font_links") or []
    font_css = extract_data.get("font_css") or ""

    tokens = _load_tokens(output_root, domain)
    if os.environ.get("DESTYLE", "1") != "0" and os.environ.get("HIGH_FIDELITY", "0") != "1":
        tokens = sanitize_tokens(tokens, domain)

    content = []
    zones: dict[str, list[dict]] = {}

    sections = mapped_sections.get("sections", [])
    sections = _apply_vertical_rhythm(sections)
    sections = _apply_alternating_backgrounds(sections)
    sections = _apply_type_scale(sections)
    sections = _ensure_media_overlay(sections)

    for section in sections:
        full_type = section["type"]
        parts = full_type.split(".")
        puck_type = parts[0]
        version = parts[1] if len(parts) > 1 else "v1"
        props = section.get("props", {})
        if isinstance(props, dict):
            props = _normalize_block_props(props)
        if os.environ.get("DESTYLE", "1") != "0" and os.environ.get("HIGH_FIDELITY", "0") != "1":
            props = sanitize_props(props, domain)
        props["__v"] = version
        block = {
            "type": puck_type,
            "variant": section.get("variant"),
            "props": props,
        }
        content.append(_slotify_block(block, zones))

    page_slug = page_slug or mapped_sections.get("page_slug") or "home"
    output_dir = output_root / domain / "pages" / page_slug
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "page.json"
    assets = {
        "section_screenshots": [
            section.get("screenshot")
            for section in sections
            if section.get("screenshot")
        ],
        "images": [
            asset
            for block in content
            for asset in _extract_assets(block.get("props", {}))
            if asset.startswith("/assets/")
        ],
    }
    quality = _quality_report(sections)
    payload = {
        "root": {
            "props": {
                "title": title,
                "domain": domain,
                "slug": page_slug,
                "updated_at": datetime.utcnow().isoformat() + "Z",
                "branding": {
                    "colors": tokens.get("colors", {}),
                    "typography": tokens.get("typography", {}),
                    "radius": tokens.get("radius"),
                },
            }
        },
        "meta": {
            "description": paragraphs[0][:160] if paragraphs else "",
            "source": extract_data.get("url"),
            "canonical": canonical,
            "font_links": font_links,
            "font_css": font_css,
            "content_assets": mapped_sections.get("content_assets")
            or extract_data.get("content_assets")
            or {},
            "quality": quality,
        },
        "content": content,
        "blocks": [block["type"] for block in content],
        "schema": {
            "renderer": "shadcn",
            "motion": "magic-ui",
            "version": "1.0",
        },
        "zones": zones,
        "assets": assets,
    }
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return {"domain": domain, "page": str(output_path), "slug": page_slug}

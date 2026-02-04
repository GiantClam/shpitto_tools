from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def _parse_px(value: str | None) -> int | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    if not value.endswith("px"):
        return None
    try:
        return int(float(value.replace("px", "")))
    except ValueError:
        return None


def _aggregate_counts(section_payloads: list[dict], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for payload in section_payloads:
        if not isinstance(payload, dict):
            continue
        summary = (payload.get("computed_styles") or {}).get("summary") or {}
        entries = summary.get(key)
        if not isinstance(entries, list):
            continue
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            value = entry.get("value")
            count = entry.get("count") or 0
            if not value or not isinstance(count, int):
                continue
            counts[value] = counts.get(value, 0) + count
    return counts


def _top_values(counts: dict[str, int], limit: int = 6) -> list[str]:
    if not counts:
        return []
    return [k for k, _v in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]]


def _font_size_scale(counts: dict[str, int]) -> dict[str, str]:
    sizes = []
    for raw in counts.keys():
        px = _parse_px(raw)
        if px:
            sizes.append(px)
    sizes = sorted(set(sizes))
    if not sizes:
        return {}
    labels = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]
    result: dict[str, str] = {}
    for idx, size in enumerate(sizes[: len(labels)]):
        result[labels[idx]] = f"{size}px"
    return result


def _radius_scale(counts: dict[str, int]) -> dict[str, str]:
    sizes = []
    for raw in counts.keys():
        px = _parse_px(raw)
        if px is not None:
            sizes.append(px)
    sizes = sorted(set(sizes))
    if not sizes:
        return {}
    labels = ["sm", "md", "lg", "xl", "2xl", "3xl", "full"]
    result: dict[str, str] = {}
    for idx, size in enumerate(sizes[: len(labels)]):
        result[labels[idx]] = f"{size}px"
    if 9999 in sizes or any(s >= 999 for s in sizes):
        result["full"] = "9999px"
    return result


def _spacing_scale(tokens: dict) -> dict[str, str]:
    spacing = tokens.get("spacing", {}) if isinstance(tokens, dict) else {}
    scale = spacing.get("scale") if isinstance(spacing, dict) else []
    result: dict[str, str] = {}
    if isinstance(scale, list):
        for idx, value in enumerate(scale):
            if not isinstance(value, str):
                continue
            key = f"s{idx+1}"
            result[key] = value
    base = spacing.get("base") if isinstance(spacing, dict) else None
    if isinstance(base, str):
        result["base"] = base
    return result


def _font_family(tokens: dict) -> dict[str, list[str]]:
    typography = tokens.get("typography", {}) if isinstance(tokens, dict) else {}
    body = typography.get("body") or "Inter"
    heading = typography.get("heading") or body

    def split_family(value: str) -> list[str]:
        return [part.strip().strip('"\'') for part in str(value).split(",") if part.strip()]

    return {
        "body": split_family(body) + ["ui-sans-serif", "system-ui"],
        "heading": split_family(heading) + ["ui-sans-serif", "system-ui"],
    }


def _tailwind_colors(tokens: dict) -> dict[str, str]:
    colors = tokens.get("colors", {}) if isinstance(tokens, dict) else {}
    return {
        "background": "hsl(var(--background))",
        "foreground": "hsl(var(--foreground))",
        "primary": "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "secondary": "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        "muted": "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        "border": "hsl(var(--border))",
        "card": "var(--card)",
        "card-foreground": "var(--card-foreground)",
        "palette-text-1": colors.get("foreground") or "hsl(var(--foreground))",
    }


def _pattern_from_section(section: dict, index: int) -> dict:
    props = section.get("props") if isinstance(section.get("props"), dict) else {}
    content = section.get("content") if isinstance(section.get("content"), dict) else {}
    counts = {
        "headings": len(content.get("headings") or []),
        "texts": len(content.get("texts") or []),
        "buttons": len(content.get("buttons") or []),
        "links": len(content.get("links") or []),
        "images": len(content.get("images") or []),
        "videos": len(content.get("videos") or []),
    }
    return {
        "id": props.get("id") or f"section-{index:02d}",
        "type": section.get("type"),
        "variant": section.get("variant"),
        "layout_schema": section.get("layout_schema"),
        "semantic_role": section.get("semantic_role") or section.get("intent"),
        "props_keys": sorted(list(props.keys())),
        "content_counts": counts,
    }


def build_design_system(output_root: Path, domain: str, page_slug: str) -> dict:
    site_dir = output_root / domain
    capture_path = site_dir / "capture" / page_slug / "sections.json"
    tokens_path = site_dir / "theme" / "tokens.json"
    sections_path = site_dir / "pages" / page_slug / "sections.json"

    if not capture_path.exists() or not tokens_path.exists():
        return {"status": "missing", "reason": "capture_or_tokens_missing"}

    capture_data = _load_json(capture_path)
    tokens = _load_json(tokens_path)
    section_payloads = capture_data.get("section_payloads", [])
    style_samples = capture_data.get("style_samples", {}) if isinstance(capture_data, dict) else {}

    computed_font_sizes = _aggregate_counts(section_payloads, "fontSizes")
    computed_radius = _aggregate_counts(section_payloads, "radius")
    computed_text_colors = _aggregate_counts(section_payloads, "textColors")
    computed_bg_colors = _aggregate_counts(section_payloads, "bgColors")

    design_tokens = {
        "framework": style_samples.get("framework", "custom"),
        "colors": {
            "primary": tokens.get("colors", {}).get("primary"),
            "secondary": tokens.get("colors", {}).get("secondary"),
            "accent": tokens.get("colors", {}).get("secondary"),
            "semantic": {
                "success": _top_values(computed_text_colors, 1)[0] if _top_values(computed_text_colors, 1) else "",
                "warning": _top_values(computed_text_colors, 2)[1] if len(_top_values(computed_text_colors, 2)) > 1 else "",
                "error": _top_values(computed_text_colors, 3)[2] if len(_top_values(computed_text_colors, 3)) > 2 else "",
            },
            "palette": tokens.get("palette", {}),
        },
        "spacing": tokens.get("spacing", {}),
        "typography": tokens.get("typography", {}),
        "radius": tokens.get("radius"),
        "computed": {
            "font_sizes": _top_values(computed_font_sizes, 8),
            "radius": _top_values(computed_radius, 6),
            "text_colors": _top_values(computed_text_colors, 6),
            "bg_colors": _top_values(computed_bg_colors, 6),
        },
        "source": {
            "root_vars": style_samples.get("root_vars", {}),
        },
    }

    tailwind_config = {
        "theme": {
            "extend": {
                "colors": _tailwind_colors(tokens),
                "spacing": _spacing_scale(tokens),
                "borderRadius": _radius_scale(computed_radius),
                "fontFamily": _font_family(tokens),
                "fontSize": _font_size_scale(computed_font_sizes),
            }
        }
    }

    design_dir = site_dir / "design-system"
    design_dir.mkdir(parents=True, exist_ok=True)
    tokens_out = design_dir / "tokens.json"
    tw_out = design_dir / "tailwind.config.js"

    tokens_out.write_text(json.dumps(design_tokens, ensure_ascii=False, indent=2), encoding="utf-8")
    tw_out.write_text(
        "module.exports = " + json.dumps(tailwind_config, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    patterns_written = []
    if sections_path.exists():
        sections_data = _load_json(sections_path)
        sections = sections_data.get("sections", []) if isinstance(sections_data, dict) else []
        patterns_dir = design_dir / "patterns" / page_slug
        patterns_dir.mkdir(parents=True, exist_ok=True)
        for idx, section in enumerate(sections):
            if not isinstance(section, dict):
                continue
            pattern = _pattern_from_section(section, idx)
            pattern_path = patterns_dir / f"{pattern['id']}.pattern.json"
            pattern_path.write_text(
                json.dumps(pattern, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            patterns_written.append(str(pattern_path))

        index_path = patterns_dir / "index.json"
        index_path.write_text(
            json.dumps({"patterns": patterns_written}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    return {
        "status": "ok",
        "tokens": str(tokens_out),
        "tailwind": str(tw_out),
        "patterns": patterns_written,
    }

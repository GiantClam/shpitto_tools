from __future__ import annotations

import json
from pathlib import Path


def _hex_to_hsl(color: str) -> str | None:
    if not color:
        return None
    color = color.strip().lower()
    if color.startswith("rgb"):
        return _rgb_to_hsl(color)
    if not color.startswith("#"):
        return None
    hex_value = color.lstrip("#")
    if len(hex_value) == 3:
        hex_value = "".join([c * 2 for c in hex_value])
    if len(hex_value) != 6:
        return None
    r = int(hex_value[0:2], 16) / 255
    g = int(hex_value[2:4], 16) / 255
    b = int(hex_value[4:6], 16) / 255
    return _rgb_channels_to_hsl(r, g, b)


def _rgb_to_hsl(color: str) -> str | None:
    try:
        values = color.replace("rgba", "rgb").strip("rgb() ").split(",")
        r = int(values[0].strip()) / 255
        g = int(values[1].strip()) / 255
        b = int(values[2].strip()) / 255
        alpha = float(values[3].strip()) if len(values) > 3 else 1.0
    except (ValueError, IndexError):
        return None
    if alpha <= 0.01:
        return None
    return _rgb_channels_to_hsl(r, g, b)


def _rgb_channels_to_hsl(r: float, g: float, b: float) -> str:
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    l = (max_c + min_c) / 2
    if max_c == min_c:
        h = s = 0
    else:
        d = max_c - min_c
        s = d / (2 - max_c - min_c) if l > 0.5 else d / (max_c + min_c)
        if max_c == r:
            h = (g - b) / d + (6 if g < b else 0)
        elif max_c == g:
            h = (b - r) / d + 2
        else:
            h = (r - g) / d + 4
        h /= 6
    return f"{round(h * 360)} {round(s * 100)}% {round(l * 100)}%"


def _parse_hsl(value: str) -> tuple[int, int, int] | None:
    if not value:
        return None
    parts = value.replace("%", "").split()
    if len(parts) < 3:
        return None
    try:
        return int(float(parts[0])), int(float(parts[1])), int(float(parts[2]))
    except ValueError:
        return None


def _brand_profile(tokens: dict) -> dict:
    colors = tokens.get("colors", {})
    primary = _parse_hsl(colors.get("primary", "")) or (220, 60, 50)
    background = _parse_hsl(colors.get("background", "")) or (0, 0, 100)
    hue, sat, light = primary
    bg_light = background[2]
    mood = "vivid" if sat >= 60 else "muted"
    tone = "bright" if light >= 60 else "deep"
    contrast = "high" if abs(bg_light - light) >= 50 else "low"
    body_font = tokens.get("typography", {}).get("body", "")
    typography = "serif" if "serif" in body_font.lower() and "sans" not in body_font.lower() else "sans"
    return {
        "color_mood": mood,
        "color_tone": tone,
        "contrast": contrast,
        "typography": typography,
    }


def _pick_root_var(root_vars: dict, keys: list[str]) -> str | None:
    for key in keys:
        value = root_vars.get(key)
        if value:
            return value
    return None


def _top_count_value(counts: dict) -> str | None:
    if not isinstance(counts, dict) or not counts:
        return None
    return sorted(counts.items(), key=lambda x: x[1], reverse=True)[0][0]


def _top_n_values(counts: dict, n: int = 3) -> list[str]:
    if not isinstance(counts, dict) or not counts:
        return []
    return [k for k, _v in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:n]]


def _pick_vivid_color(counts: dict) -> str | None:
    if not isinstance(counts, dict) or not counts:
        return None
    for value, _count in sorted(counts.items(), key=lambda x: x[1], reverse=True):
        hsl = _hex_to_hsl(value)
        if not hsl:
            continue
        parsed = _parse_hsl(hsl)
        if not parsed:
            continue
        _h, sat, _l = parsed
        if sat >= 15:
            return value
    return None


def _extract_px_values(counts: dict) -> list[int]:
    values: list[int] = []
    if not isinstance(counts, dict):
        return values
    for raw in counts.keys():
        if not isinstance(raw, str):
            continue
        for token in raw.replace(",", " ").split():
            if token.endswith("px"):
                try:
                    values.append(int(float(token.replace("px", ""))))
                except ValueError:
                    continue
    return [v for v in values if v > 0]


def _infer_spacing_scale(padding_counts: dict, margin_counts: dict) -> dict | None:
    values = _extract_px_values(padding_counts) + _extract_px_values(margin_counts)
    if not values:
        return None
    freq: dict[int, int] = {}
    for v in values:
        freq[v] = freq.get(v, 0) + 1
    base = sorted(freq.items(), key=lambda x: (-x[1], x[0]))[0][0]
    base = min(max(base, 4), 12)
    scale = [base, base * 2, base * 3, base * 4, base * 6]
    return {"base": f"{base}px", "scale": [f"{v}px" for v in scale]}


def build_theme_tokens(samples: dict) -> dict:
    root_vars = samples.get("root_vars", {}) if samples else {}
    computed_bg = _top_count_value(samples.get("computed_bg_colors") or {})
    computed_text = _top_count_value(samples.get("computed_text_colors") or {})
    body_bg = samples.get("body_bg") or computed_bg or "#ffffff"
    body_color = samples.get("body_color") or computed_text or "#0f172a"
    button_bg = _pick_root_var(
        root_vars, ["--primary", "--brand", "--color-primary"]
    ) or (
        samples.get("button_bg")
        or _pick_vivid_color(samples.get("computed_text_colors") or {})
        or "#2563eb"
    )
    button_color = _pick_root_var(
        root_vars, ["--primary-foreground", "--on-primary"]
    ) or (samples.get("button_color") or "#ffffff")
    link_color = _pick_root_var(root_vars, ["--link", "--color-link", "--accent"]) or (
        samples.get("link_color") or "#0ea5e9"
    )
    card_bg = _pick_root_var(root_vars, ["--card", "--surface", "--panel"]) or (
        samples.get("card_bg") or "#f8fafc"
    )
    border_color = _pick_root_var(root_vars, ["--border", "--line", "--stroke"]) or (
        samples.get("border_color") or "#e2e8f0"
    )
    computed_radius = _top_count_value(samples.get("computed_radius") or {})
    radius = samples.get("button_radius") or computed_radius or "12px"

    spacing = _infer_spacing_scale(
        samples.get("computed_padding") or {},
        samples.get("computed_margin") or {},
    )

    palette = {
        "text": _top_n_values(samples.get("computed_text_colors") or {}, 3),
        "background": _top_n_values(samples.get("computed_bg_colors") or {}, 3),
    }

    tokens = {
        "colors": {
            "background": _hex_to_hsl(body_bg) or "0 0% 100%",
            "foreground": _hex_to_hsl(body_color) or "222 47% 11%",
            "primary": _hex_to_hsl(button_bg) or "221 83% 53%",
            "primary_foreground": _hex_to_hsl(button_color) or "0 0% 100%",
            "secondary": _hex_to_hsl(link_color) or "199 89% 48%",
            "secondary_foreground": _hex_to_hsl(body_color) or "222 47% 11%",
            "muted": _hex_to_hsl(card_bg) or "210 40% 96%",
            "muted_foreground": _hex_to_hsl(body_color) or "215 25% 27%",
            "border": _hex_to_hsl(border_color) or "214 32% 91%",
        },
        "typography": {
            "body": samples.get("body_font")
            or _top_count_value(samples.get("computed_fonts") or {})
            or "Inter",
            "heading": samples.get("heading_font")
            or samples.get("body_font")
            or _top_count_value(samples.get("computed_fonts") or {})
            or "Inter",
        },
        "radius": radius,
        "spacing": spacing or {"base": "8px", "scale": ["8px", "16px", "24px", "32px"]},
        "palette": palette,
        "source": {"root_vars": root_vars},
    }
    tokens["brand"] = _brand_profile(tokens)

    tokens["w3c"] = {
        "color": {
            "background": {"value": tokens["colors"]["background"], "type": "color"},
            "foreground": {"value": tokens["colors"]["foreground"], "type": "color"},
            "primary": {"value": tokens["colors"]["primary"], "type": "color"},
            "primaryForeground": {
                "value": tokens["colors"]["primary_foreground"],
                "type": "color",
            },
            "secondary": {"value": tokens["colors"]["secondary"], "type": "color"},
            "muted": {"value": tokens["colors"]["muted"], "type": "color"},
            "border": {"value": tokens["colors"]["border"], "type": "color"},
        },
        "radius": {"md": {"value": radius, "type": "dimension"}},
        "font": {
            "body": {"value": tokens["typography"]["body"], "type": "font"},
            "heading": {"value": tokens["typography"]["heading"], "type": "font"},
        },
    }

    return tokens


def write_theme_files(tokens: dict, output_dir: Path) -> tuple[Path, Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    tokens_path = output_dir / "tokens.json"
    theme_path = output_dir / "theme.css"
    theme_json_path = output_dir / "theme.json"

    with tokens_path.open("w", encoding="utf-8") as f:
        json.dump(tokens, f, ensure_ascii=False, indent=2)
    with theme_json_path.open("w", encoding="utf-8") as f:
        json.dump(tokens, f, ensure_ascii=False, indent=2)

    colors = tokens["colors"]
    spacing = tokens.get("spacing", {}) if isinstance(tokens, dict) else {}
    scale = spacing.get("scale") if isinstance(spacing, dict) else []
    base = spacing.get("base") if isinstance(spacing, dict) else None
    space_vars = ""
    if isinstance(scale, list) and scale:
        for idx, value in enumerate(scale[:6]):
            if isinstance(value, str):
                space_vars += f"  --space-{idx+1}: {value};\n"
    if isinstance(base, str):
        space_vars += f"  --space-base: {base};\n"
    palette = tokens.get("palette", {}) if isinstance(tokens, dict) else {}
    palette_vars = ""
    if isinstance(palette, dict):
        text_colors = palette.get("text") if isinstance(palette.get("text"), list) else []
        bg_colors = palette.get("background") if isinstance(palette.get("background"), list) else []
        for idx, value in enumerate(text_colors[:3]):
            if isinstance(value, str):
                palette_vars += f"  --palette-text-{idx+1}: {value};\n"
        for idx, value in enumerate(bg_colors[:3]):
            if isinstance(value, str):
                palette_vars += f"  --palette-bg-{idx+1}: {value};\n"
    theme_css = (
        ":root {\n"
        f"  --background: {colors['background']};\n"
        f"  --foreground: {colors['foreground']};\n"
        f"  --primary: {colors['primary']};\n"
        f"  --primary-foreground: {colors['primary_foreground']};\n"
        f"  --secondary: {colors['secondary']};\n"
        f"  --secondary-foreground: {colors['secondary_foreground']};\n"
        f"  --muted: {colors['muted']};\n"
        f"  --muted-foreground: {colors['muted_foreground']};\n"
        f"  --border: {colors['border']};\n"
        "  --card: var(--palette-bg-1, hsl(var(--background)));\n"
        "  --card-foreground: var(--palette-text-1, hsl(var(--foreground)));\n"
        f"  --radius: {tokens['radius']};\n"
        f"{space_vars}"
        f"{palette_vars}"
        "}\n"
    )

    theme_path.write_text(theme_css, encoding="utf-8")
    return tokens_path, theme_path, theme_json_path

from __future__ import annotations

import base64
import json
import os
import re
import ssl
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from schema_selection import build_selection_schema
from schema_validate import validate_json
from theme import write_theme_files


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

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.environ.get(
    "OPENROUTER_MODEL", "anthropic/claude-sonnet-4.5"
)
OPENROUTER_MODEL_FALLBACK = os.environ.get(
    "OPENROUTER_MODEL_FALLBACK", "anthropic/claude-opus-4.5"
)
OPENROUTER_CONFIDENCE_FLOOR = float(
    os.environ.get("OPENROUTER_CONFIDENCE_FLOOR", "0.55")
)


def _slugify(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-")


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def _match_section_extract(extract_data: dict, section: dict) -> dict:
    sections = extract_data.get("sections") or []
    if not sections:
        return {}
    source = section.get("source") or ""
    source_slug = _slugify(source)
    for item in sections:
        if _slugify(item.get("title", "")) == source_slug:
            return item
    index = section.get("index")
    if isinstance(index, int) and index < len(sections):
        return sections[index]
    return {}


def _load_prompt(prompt_path: Path, payload: dict) -> list[dict]:
    template = prompt_path.read_text(encoding="utf-8")
    if "{payload}" in template:
        template = template.replace(
            "{payload}", json.dumps(payload, ensure_ascii=False)
        )
    return [{"role": "user", "content": template}]


def _call_openrouter(messages: list[dict], schema: dict, model: str) -> dict:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not set")
    body = {
        "model": model,
        "messages": messages,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "block_selection",
                "schema": schema,
                "strict": True,
            },
        },
    }
    request = Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
    except ssl.SSLError:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        with urlopen(request, timeout=60, context=context) as response:
            data = json.loads(response.read().decode("utf-8"))
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
    return json.loads(content)


def _selection_confidence(selection: dict) -> float:
    if not isinstance(selection, dict):
        return 0.0
    value = selection.get("confidence")
    if isinstance(value, (int, float)):
        return float(value)
    return 0.0


def _section_text(content_payload: dict) -> str:
    if not isinstance(content_payload, dict):
        return ""
    texts = content_payload.get("texts")
    if isinstance(texts, str):
        texts = [texts]
    if not texts and isinstance(content_payload.get("text"), str):
        texts = [content_payload.get("text")]
    parts = [
        content_payload.get("title") or "",
        " ".join(texts or []),
        " ".join(content_payload.get("headings") or []),
    ]
    return " ".join([part for part in parts if part]).strip()


def _theme_schema() -> dict:
    return {
        "type": "object",
        "properties": {
            "theme": {
                "type": "object",
                "properties": {
                    "colors": {
                        "type": "object",
                        "properties": {
                            "background": {"type": "string"},
                            "foreground": {"type": "string"},
                            "primary": {"type": "string"},
                            "primary_foreground": {"type": "string"},
                            "secondary": {"type": "string"},
                            "secondary_foreground": {"type": "string"},
                            "muted": {"type": "string"},
                            "muted_foreground": {"type": "string"},
                            "border": {"type": "string"},
                        },
                        "required": [
                            "background",
                            "foreground",
                            "primary",
                            "primary_foreground",
                            "secondary",
                            "secondary_foreground",
                            "muted",
                            "muted_foreground",
                            "border",
                        ],
                    },
                    "typography": {
                        "type": "object",
                        "properties": {
                            "body": {"type": "string"},
                            "heading": {"type": "string"},
                        },
                        "required": ["body", "heading"],
                    },
                    "radius": {"type": "string"},
                },
                "required": ["colors", "typography", "radius"],
            },
            "media_plan": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "integer"},
                        "role": {"type": "string"},
                        "label": {"type": "string"},
                    },
                    "required": ["index", "role", "label"],
                },
            },
            "logo_labels": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["theme", "media_plan"],
    }


def _build_theme_messages(payload: dict) -> list[dict]:
    template = (
        "你是网页重建的风格与素材生成器。根据输入的模板描述与内容资产，输出一个 JSON。\n"
        "要求：\n"
        "- 只输出 JSON。\n"
        "- theme.colors 使用 HSL 字符串格式，例如 \"220 60% 50%\"。\n"
        "- typography 使用可用的字体名，保持风格一致。\n"
        "- media_plan 为每个 section 生成一个主视觉或背景素材的简短标签。\n"
        "- role 只能是 hero | background | media | logo | avatar | card。\n"
        "- label 需体现行业与主题关键词。\n"
        "输出字段：theme, media_plan, logo_labels。\n"
        "Payload:\n"
        f"{json.dumps(payload, ensure_ascii=False)}"
    )
    return [{"role": "user", "content": template}]


def _hsl_value(value: str, fallback: str) -> str:
    if isinstance(value, str) and re.match(r"^\\d+\\s+\\d+%\\s+\\d+%$", value.strip()):
        return value.strip()
    return fallback


def _normalize_theme(theme: dict, base_tokens: dict) -> dict:
    base_colors = (base_tokens.get("colors") or {}) if isinstance(base_tokens, dict) else {}
    base_typography = (base_tokens.get("typography") or {}) if isinstance(base_tokens, dict) else {}
    colors = theme.get("colors") or {}
    typography = theme.get("typography") or {}
    normalized = {
        "colors": {
            "background": _hsl_value(colors.get("background"), base_colors.get("background", "0 0% 100%")),
            "foreground": _hsl_value(colors.get("foreground"), base_colors.get("foreground", "222 47% 11%")),
            "primary": _hsl_value(colors.get("primary"), base_colors.get("primary", "221 83% 53%")),
            "primary_foreground": _hsl_value(colors.get("primary_foreground"), base_colors.get("primary_foreground", "0 0% 100%")),
            "secondary": _hsl_value(colors.get("secondary"), base_colors.get("secondary", "199 89% 48%")),
            "secondary_foreground": _hsl_value(colors.get("secondary_foreground"), base_colors.get("secondary_foreground", "222 47% 11%")),
            "muted": _hsl_value(colors.get("muted"), base_colors.get("muted", "210 40% 96%")),
            "muted_foreground": _hsl_value(colors.get("muted_foreground"), base_colors.get("muted_foreground", "215 25% 27%")),
            "border": _hsl_value(colors.get("border"), base_colors.get("border", "214 32% 91%")),
        },
        "typography": {
            "body": typography.get("body") or base_typography.get("body") or "Inter",
            "heading": typography.get("heading") or base_typography.get("heading") or "Inter",
        },
        "radius": theme.get("radius") or base_tokens.get("radius") or "12px",
    }
    return normalized


def _hsl_css(value: str) -> str:
    return f"hsl({value})"


def _svg_placeholder(label: str, width: int, height: int, colors: dict) -> str:
    bg = _hsl_css(colors.get("muted", "210 40% 96%"))
    accent = _hsl_css(colors.get("primary", "221 83% 53%"))
    fg = _hsl_css(colors.get("foreground", "222 47% 11%"))
    safe_label = (label or "Visual").strip()[:60]
    svg = (
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{width}' height='{height}' viewBox='0 0 {width} {height}'>"
        f"<defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>"
        f"<stop offset='0%' stop-color='{bg}'/><stop offset='100%' stop-color='{accent}'/>"
        f"</linearGradient></defs>"
        f"<rect width='100%' height='100%' fill='url(#g)'/>"
        f"<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' "
        f"font-size='{max(18, width // 30)}' fill='{fg}' font-family='system-ui'>{safe_label}</text>"
        f"</svg>"
    )
    return f"data:image/svg+xml,{quote(svg)}"


def _media_size(role: str) -> tuple[int, int]:
    if role == "logo":
        return 240, 120
    if role == "avatar":
        return 200, 200
    if role == "card":
        return 640, 400
    if role == "background":
        return 1600, 900
    if role == "hero":
        return 1400, 700
    return 1200, 600


def _needs_asset(src: str | None) -> bool:
    if not src:
        return True
    if src.startswith("data:image/svg+xml"):
        return True
    lower = src.lower()
    if "placeholder" in lower or "placehold" in lower:
        return True
    return False


def _normalize_tokens(value: str) -> list[str]:
    if not value:
        return []
    return [token for token in _slugify(value).split("-") if token]


def _collect_gallery_images(sections_data: dict, sections_path: Path | None) -> list[dict]:
    images: list[dict] = []
    content_assets = sections_data.get("content_assets")
    if isinstance(content_assets, dict):
        assets_images = content_assets.get("images")
        if isinstance(assets_images, list):
            images.extend([item for item in assets_images if isinstance(item, dict)])
    if sections_path:
        extract_data = _load_json(sections_path.parents[2] / "extract" / "extract.json")
        extract_images = extract_data.get("images")
        if isinstance(extract_images, list):
            images.extend([item for item in extract_images if isinstance(item, dict)])
    seen = set()
    deduped: list[dict] = []
    for item in images:
        src = item.get("src")
        if not isinstance(src, str) or not src.strip():
            continue
        if src in seen:
            continue
        seen.add(src)
        deduped.append(item)
    return deduped


def _rank_gallery_images(label: str, images: list[dict]) -> list[dict]:
    if not images:
        return []
    label_tokens = set(_normalize_tokens(label))
    scored: list[tuple[int, int, dict]] = []
    for idx, item in enumerate(images):
        src = item.get("src")
        if not isinstance(src, str) or not src.strip():
            continue
        haystack = f"{item.get('alt') or ''} {src}"
        score = len(label_tokens.intersection(_normalize_tokens(haystack)))
        scored.append((score, idx, item))
    scored.sort(key=lambda entry: (-entry[0], entry[1]))
    ranked = [item for score, _, item in scored if score > 0]
    if ranked:
        return ranked
    return [item for _, _, item in scored]


def _inline_remote_image(src: str, timeout: float = 8.0) -> str | None:
    if not src or src.startswith("data:"):
        return src
    if not (src.startswith("http://") or src.startswith("https://")):
        return src
    request = Request(src, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            content_type = response.headers.get("content-type", "")
            if "image" not in content_type:
                return None
            data = response.read(2_000_001)
    except Exception:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        try:
            with urlopen(request, timeout=timeout, context=context) as response:
                content_type = response.headers.get("content-type", "")
                if "image" not in content_type:
                    return None
                data = response.read(2_000_001)
        except Exception:
            return None
    if not data:
        return None
    if len(data) > 2_000_000:
        return src
    encoded = base64.b64encode(data).decode("ascii")
    mime = content_type.split(";")[0] if content_type else "image/png"
    return f"data:{mime};base64,{encoded}"


def _apply_media_plan(
    sections_data: dict, media_plan: list[dict], tokens: dict, gallery_images: list[dict]
) -> bool:
    if not media_plan:
        return False
    plan_map = {item.get("index"): item for item in media_plan if isinstance(item, dict)}
    updated = False
    resolved_cache: dict[str, str | None] = {}
    gallery_cache: dict[str, tuple[str | None, str]] = {}
    any_gallery_cache: tuple[str | None, str] | None = None

    def resolve_src(src: str | None) -> str | None:
        if not src:
            return None
        if src in resolved_cache:
            return resolved_cache[src]
        resolved = _inline_remote_image(src)
        resolved_cache[src] = resolved
        return resolved

    def pick_gallery(label: str) -> tuple[str | None, str]:
        if label in gallery_cache:
            return gallery_cache[label]
        candidates = _rank_gallery_images(label, gallery_images)
        for item in candidates:
            candidate_src = item.get("src")
            if not isinstance(candidate_src, str) or not candidate_src.strip():
                continue
            resolved = resolve_src(candidate_src)
            if resolved:
                result = (resolved, item.get("alt") or label)
                gallery_cache[label] = result
                return result
        picked_src, picked_alt = pick_any_gallery(label)
        if picked_src:
            result = (picked_src, picked_alt)
            gallery_cache[label] = result
            return result
        result = (None, label)
        gallery_cache[label] = result
        return result

    def pick_any_gallery(label: str) -> tuple[str | None, str]:
        nonlocal any_gallery_cache
        if any_gallery_cache is not None:
            if any_gallery_cache[0]:
                return (any_gallery_cache[0], label)
            return (None, label)
        for item in gallery_images:
            candidate_src = item.get("src")
            if not isinstance(candidate_src, str) or not candidate_src.strip():
                continue
            resolved = resolve_src(candidate_src)
            if resolved:
                any_gallery_cache = (resolved, item.get("alt") or label)
                return (resolved, label)
        any_gallery_cache = (None, label)
        return (None, label)

    for section in sections_data.get("sections", []):
        index = section.get("index")
        if index not in plan_map:
            continue
        plan = plan_map[index]
        role = str(plan.get("role") or "media")
        label = str(plan.get("label") or section.get("source") or "Visual")
        props = section.get("props") or {}
        if role in {"hero", "media"}:
            media = props.get("media")
            media_src = media.get("src") if isinstance(media, dict) else None
            resolved = resolve_src(media_src) if media_src and not _needs_asset(media_src) else None
            if not resolved:
                picked_src, picked_alt = pick_gallery(label)
                if not picked_src:
                    width, height = _media_size(role)
                    picked_src = _svg_placeholder(
                        label, width, height, tokens.get("colors", {})
                    )
                    picked_alt = label
                props["media"] = {"kind": "image", "src": picked_src, "alt": picked_alt}
                updated = True
            elif resolved != media_src:
                props["media"] = {**media, "src": resolved}
                updated = True
        elif role == "background":
            bg_media = props.get("backgroundMedia")
            bg_src = bg_media.get("src") if isinstance(bg_media, dict) else None
            resolved = resolve_src(bg_src) if bg_src and not _needs_asset(bg_src) else None
            if not resolved:
                picked_src, picked_alt = pick_gallery(label)
                if not picked_src:
                    width, height = _media_size(role)
                    picked_src = _svg_placeholder(
                        label, width, height, tokens.get("colors", {})
                    )
                    picked_alt = label
                props["background"] = "image"
                props["backgroundMedia"] = {
                    "kind": "image",
                    "src": picked_src,
                    "alt": picked_alt,
                }
                updated = True
            elif resolved != bg_src:
                props["backgroundMedia"] = {**bg_media, "src": resolved}
                updated = True
        elif role == "logo":
            logos = props.get("logos")
            if isinstance(logos, list) and logos:
                for logo in logos:
                    if not isinstance(logo, dict):
                        continue
                    logo_label = str(logo.get("alt") or label)
                    logo_src = logo.get("src")
                    resolved = resolve_src(logo_src) if logo_src and not _needs_asset(logo_src) else None
                    if not resolved:
                        picked_src, picked_alt = pick_gallery(logo_label)
                        if picked_src:
                            logo["src"] = picked_src
                            logo["alt"] = logo.get("alt") or picked_alt
                            updated = True
                    elif resolved != logo_src:
                        logo["src"] = resolved
                        updated = True
            elif _needs_asset(
                props.get("logo", {}).get("src")
                if isinstance(props.get("logo"), dict)
                else None
            ):
                picked_src, picked_alt = pick_gallery(label)
                if not picked_src:
                    width, height = _media_size(role)
                    picked_src = _svg_placeholder(
                        label, width, height, tokens.get("colors", {})
                    )
                    picked_alt = label
                props["logo"] = {"src": picked_src, "alt": picked_alt}
                updated = True
        elif role == "avatar":
            items = props.get("items")
            if isinstance(items, list):
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    avatar = item.get("avatar")
                    avatar_src = avatar.get("src") if isinstance(avatar, dict) else None
                    item_label = str(item.get("name") or item.get("title") or label)
                    resolved = resolve_src(avatar_src) if avatar_src and not _needs_asset(avatar_src) else None
                    if not resolved:
                        picked_src, picked_alt = pick_gallery(item_label)
                        if picked_src:
                            item["avatar"] = {"src": picked_src, "alt": picked_alt}
                            updated = True
                    elif resolved != avatar_src:
                        item["avatar"] = {**avatar, "src": resolved}
                        updated = True
        elif role == "card":
            items = props.get("items")
            if isinstance(items, list):
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    item_label = str(item.get("title") or label)
                    cover = item.get("cover")
                    cover_src = cover.get("src") if isinstance(cover, dict) else None
                    resolved_cover = resolve_src(cover_src) if cover_src and not _needs_asset(cover_src) else None
                    if not resolved_cover:
                        picked_src, picked_alt = pick_gallery(item_label)
                        if picked_src:
                            item["cover"] = {"src": picked_src, "alt": picked_alt}
                            updated = True
                    elif resolved_cover != cover_src:
                        item["cover"] = {**cover, "src": resolved_cover}
                        updated = True
                    image = item.get("image")
                    image_src = image.get("src") if isinstance(image, dict) else None
                    resolved_image = resolve_src(image_src) if image_src and not _needs_asset(image_src) else None
                    if not resolved_image:
                        picked_src, picked_alt = pick_gallery(item_label)
                        if picked_src:
                            item["image"] = {"src": picked_src, "alt": picked_alt}
                            updated = True
                    elif resolved_image != image_src:
                        item["image"] = {**image, "src": resolved_image}
                        updated = True
        if updated:
            section["props"] = props
    return updated


def _fallback_media_plan(sections_data: dict) -> list[dict]:
    plan = []
    for section in sections_data.get("sections", []):
        block_type = str(section.get("type", ""))
        label = str(section.get("source") or section.get("content", {}).get("title") or block_type or "Visual")
        role = "media"
        if "Hero" in block_type:
            role = "hero"
        elif "LogoCloud" in block_type or "Footer" in block_type:
            role = "logo"
        elif "Testimonials" in block_type:
            role = "avatar"
        elif "CaseStudies" in block_type or "CardsGrid" in block_type:
            role = "card"
        plan.append({"index": section.get("index"), "role": role, "label": label})
    return plan


def generate_theme_and_media_plan(
    sections_path: Path, output_root: Path, max_retries: int = 1
) -> dict:
    sections_data = json.loads(sections_path.read_text(encoding="utf-8"))
    domain_dir = sections_path.parents[2]
    extract_data = _load_json(domain_dir / "extract" / "extract.json")
    base_tokens = _load_json(domain_dir / "theme" / "tokens.json")
    if not OPENROUTER_API_KEY:
        theme_tokens = _normalize_theme(base_tokens or {}, base_tokens)
        write_theme_files(theme_tokens, output_root / sections_data.get("domain", domain_dir.name) / "theme")
        return {
            "status": "fallback",
            "reason": "missing_api_key",
            "theme": theme_tokens,
            "media_plan": _fallback_media_plan(sections_data),
        }
    sections_payload = []
    for section in sections_data.get("sections", []):
        content_payload = section.get("content") or {}
        sections_payload.append(
            {
                "index": section.get("index"),
                "type": section.get("type"),
                "intent": section.get("intent"),
                "intent_tags": section.get("intent_tags"),
                "title": content_payload.get("title") or section.get("source"),
                "text": _section_text(content_payload)[:240],
            }
        )
    payload = {
        "site": sections_data.get("url") or extract_data.get("url"),
        "summary": sections_data.get("summary") or extract_data.get("summary") or "",
        "content_assets": sections_data.get("content_assets") or extract_data.get("content_assets") or {},
        "sections": sections_payload,
        "base_theme": base_tokens or {},
    }
    schema = _theme_schema()
    selection = {}
    model_used = OPENROUTER_MODEL
    try:
        for attempt in range(max_retries + 1):
            messages = _build_theme_messages(payload)
            selection = _call_openrouter(messages, schema, OPENROUTER_MODEL)
            if isinstance(selection, dict) and selection.get("theme"):
                break
        if not selection or not selection.get("theme"):
            messages = _build_theme_messages(payload)
            selection = _call_openrouter(messages, schema, OPENROUTER_MODEL_FALLBACK)
            model_used = OPENROUTER_MODEL_FALLBACK
    except Exception as exc:
        theme_tokens = _normalize_theme(base_tokens or {}, base_tokens)
        write_theme_files(theme_tokens, output_root / sections_data.get("domain", domain_dir.name) / "theme")
        return {
            "status": "fallback",
            "reason": str(exc),
            "theme": theme_tokens,
            "media_plan": _fallback_media_plan(sections_data),
        }
    theme_tokens = _normalize_theme(selection.get("theme", {}), base_tokens)
    write_theme_files(theme_tokens, output_root / sections_data.get("domain", domain_dir.name) / "theme")
    media_plan = selection.get("media_plan") if isinstance(selection, dict) else []
    return {"status": "ok", "model": model_used, "theme": theme_tokens, "media_plan": media_plan}


def apply_media_plan(
    sections_path: Path, media_plan: list[dict], theme_tokens: dict
) -> dict:
    sections_data = json.loads(sections_path.read_text(encoding="utf-8"))
    gallery_images = _collect_gallery_images(sections_data, sections_path)
    updated = _apply_media_plan(
        sections_data, media_plan, theme_tokens, gallery_images
    )
    if updated:
        sections_path.write_text(
            json.dumps(sections_data, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    return {"status": "ok" if updated else "skipped", "updated": updated}


def _copy_framework(intent: str | None, intent_tags: list[str]) -> dict:
    tags = [tag.lower() for tag in intent_tags if isinstance(tag, str)]
    intent_value = (intent or "").lower()
    if "faq" in tags or intent_value == "faq":
        return {
            "framework": "FAQ",
            "outline": [
                "Lead question",
                "Short answer",
                "Follow-up questions",
            ],
        }
    if "pricing" in tags or intent_value == "pricing":
        return {
            "framework": "Pricing",
            "outline": [
                "Value summary",
                "Plan overview",
                "Key differentiators",
                "CTA",
            ],
        }
    if "conversion" in tags or intent_value in {"contact", "support"}:
        return {
            "framework": "AIDA",
            "outline": [
                "Attention hook",
                "Interest value",
                "Desire proof",
                "Action CTA",
            ],
        }
    if "feature_explain" in tags or intent_value in {"product", "about"}:
        return {
            "framework": "PAS",
            "outline": [
                "Problem",
                "Agitate",
                "Solution",
            ],
        }
    return {
        "framework": "Service",
        "outline": [
            "Who it is for",
            "What it delivers",
            "How it works",
            "Proof",
            "CTA",
        ],
    }


def fill_sections(
    sections_path: Path,
    schema_dir: Path,
    prompt_path: Path,
    output_path: Path,
    max_retries: int = 2,
) -> dict:
    sections_data = json.loads(sections_path.read_text(encoding="utf-8"))
    sections = sections_data.get("sections", [])
    domain_dir = sections_path.parents[2]
    extract_data = _load_json(domain_dir / "extract" / "extract.json")
    theme_tokens = _load_json(domain_dir / "theme" / "tokens.json")
    results = []

    if not OPENROUTER_API_KEY:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps({"results": [], "status": "skipped_no_api"}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return {"results": [], "sections_path": str(sections_path), "status": "skipped_no_api"}

    for section in sections:
        candidates = section.get("candidates", [])
        if not candidates:
            results.append({"section": section, "status": "skipped"})
            continue
        selection_schema_path = (
            output_path.parent / f"selection-{section['index']:02d}.json"
        )
        selection_schema_path = build_selection_schema(
            candidates, schema_dir, selection_schema_path
        )
        schema = json.loads(selection_schema_path.read_text(encoding="utf-8"))

        extract_section = section.get("content") or _match_section_extract(
            extract_data, section
        )
        content_payload = (
            extract_section.get("content")
            if isinstance(extract_section, dict)
            and isinstance(extract_section.get("content"), dict)
            else extract_section
        )
        section_texts = content_payload.get("texts")
        if isinstance(section_texts, str):
            section_texts = [section_texts]
        if not section_texts and isinstance(content_payload.get("text"), str):
            section_texts = [content_payload.get("text")]
        payload = {
            "pageUrl": sections_data.get("url"),
            "sectionIndex": section.get("index"),
            "sectionFamily": section.get("family"),
            "candidates": candidates,
            "extracted": {
                "headings": [content_payload.get("title")]
                if content_payload.get("title")
                else [],
                "texts": section_texts
                or extract_data.get("texts", [])
                or [sections_data.get("summary", "")],
                "buttons": content_payload.get("buttons")
                or extract_data.get("buttons", []),
                "lists": content_payload.get("lists") or extract_data.get("lists", []),
                "prices": content_payload.get("prices") or extract_data.get("prices", []),
                "images": content_payload.get("images") or extract_data.get("images", []),
            },
            "sectionTolerance": section.get("tolerance") or {},
            "sectionIntent": section.get("intent"),
            "sectionIntentTags": section.get("intent_tags") or [],
            "sectionIndustryTags": section.get("industry_tags") or [],
            "pageIndustryTags": sections_data.get("industry_tags") or [],
            "contentConstraints": section.get("content_constraints") or {},
            "layoutSchema": sections_data.get("layout_schema") or [],
            "themeTokens": theme_tokens or {},
            "copyFramework": _copy_framework(
                section.get("intent"), section.get("intent_tags") or []
            ),
            "contentAssets": sections_data.get("content_assets")
            or extract_data.get("content_assets")
            or {},
            "schema": schema,
        }

        selection = {}
        valid = False
        errors = []
        model_used = OPENROUTER_MODEL
        for attempt in range(max_retries + 1):
            try:
                messages = _load_prompt(prompt_path, payload)
                selection = _call_openrouter(messages, schema, OPENROUTER_MODEL)
            except Exception as exc:
                results.append(
                    {
                        "section_index": section.get("index"),
                        "selection": {},
                        "valid": False,
                        "errors": [str(exc)],
                        "model": OPENROUTER_MODEL,
                    }
                )
                selection = {}
                valid = False
                break
            valid, errors = validate_json(selection, selection_schema_path)
            if valid and _selection_confidence(selection) >= OPENROUTER_CONFIDENCE_FLOOR:
                break
        if not valid or _selection_confidence(selection) < OPENROUTER_CONFIDENCE_FLOOR:
            try:
                messages = _load_prompt(prompt_path, payload)
                selection = _call_openrouter(messages, schema, OPENROUTER_MODEL_FALLBACK)
            except Exception as exc:
                results.append(
                    {
                        "section_index": section.get("index"),
                        "selection": {},
                        "valid": False,
                        "errors": [str(exc)],
                        "model": OPENROUTER_MODEL_FALLBACK,
                    }
                )
                selection = {}
                valid = False
            else:
                valid, errors = validate_json(selection, selection_schema_path)
                model_used = OPENROUTER_MODEL_FALLBACK
        results.append(
            {
                "section_index": section.get("index"),
                "selection": selection,
                "valid": valid,
                "errors": errors,
                "model": model_used,
            }
        )

        if valid:
            selected = selection.get("selection", {})
            if selected:
                source_label = str(section.get("source") or "").lower()
                lock_latest_variant = (
                    "the latest" in source_label
                    and section.get("type") == "CardsGrid.v1"
                )
                if not lock_latest_variant:
                    section["type"] = selected.get("type", section["type"])
                section["variant"] = (
                    section.get("variant")
                    if lock_latest_variant
                    else selected.get("variant", section.get("variant"))
                )
                selected_props = dict(selected.get("props", {}))
                if lock_latest_variant:
                    selected_props.pop("variant", None)
                section["props"] = {
                    **section.get("props", {}),
                    **selected_props,
                }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps({"results": results}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    sections_path.write_text(
        json.dumps(sections_data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return {"results": results, "sections_path": str(sections_path)}

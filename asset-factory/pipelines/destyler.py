from __future__ import annotations

import re
from urllib.parse import urlparse

DEFAULT_PLACEHOLDER_IMAGE = (
    "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%271200%27%20height=%27600%27%20viewBox=%270%200%201200%20600%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%25%27%20y1=%270%25%27%20x2=%27100%25%27%20y2=%27100%25%27%3E%3Cstop%20offset=%270%25%27%20stop-color=%27%23e5e7eb%27/%3E%3Cstop%20offset=%27100%25%27%20stop-color=%27%23cbd5e1%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%271200%27%20height=%27600%27%20fill=%27url(%23g)%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dominant-baseline=%27middle%27%20text-anchor=%27middle%27%20font-size=%2748%27%20fill=%27%236b7280%27%20font-family=%27system-ui%27%3EPlaceholder%3C/text%3E%3C/svg%3E"
)
DEFAULT_PLACEHOLDER_LOGO = (
    "data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27120%27%20height=%2740%27%20viewBox=%270%200%20120%2040%27%3E%3Crect%20rx=%276%27%20width=%27120%27%20height=%2740%27%20fill=%27%23e5e7eb%27/%3E%3Ctext%20x=%2750%25%27%20y=%2750%25%27%20dominant-baseline=%27middle%27%20text-anchor=%27middle%27%20font-size=%2712%27%20fill=%27%236b7280%27%20font-family=%27system-ui%27%3ELOGO%3C/text%3E%3C/svg%3E"
)


def _brand_tokens(domain: str) -> list[str]:
    host = domain.lower().strip()
    if not host:
        return []
    parts = re.split(r"[\.-]", host)
    tokens = [p for p in parts if p and p not in {"www", "com", "net", "org"}]
    return list(dict.fromkeys(tokens))


def _is_brand_asset(src: str, alt: str, tokens: list[str]) -> bool:
    hay = " ".join([src or "", alt or ""]).lower()
    return any(tok in hay for tok in tokens if tok)


def _normalize_src(src: str, domain: str) -> str:
    if not src:
        return src
    if src.startswith("data:"):
        return src
    if src.startswith("http://") or src.startswith("https://"):
        parsed = urlparse(src)
        if parsed.netloc and parsed.netloc.endswith(domain):
            return parsed.path or src
    return src


def _sanitize_image(obj: dict, domain: str, tokens: list[str], is_logo: bool = False) -> dict:
    src = obj.get("src") if isinstance(obj, dict) else ""
    alt = obj.get("alt") if isinstance(obj, dict) else ""
    src = _normalize_src(src, domain)
    if _is_brand_asset(src, alt, tokens):
        return {"src": DEFAULT_PLACEHOLDER_LOGO if is_logo else DEFAULT_PLACEHOLDER_IMAGE, "alt": ""}
    return {**obj, "src": src}


def sanitize_props(props: dict, domain: str) -> dict:
    if not isinstance(props, dict):
        return props
    tokens = _brand_tokens(domain)
    out = dict(props)

    def walk(value):
        if isinstance(value, dict):
            if "src" in value and any(k in value for k in ["src", "alt"]):
                return _sanitize_image(value, domain, tokens, is_logo=False)
            return {k: walk(v) for k, v in value.items()}
        if isinstance(value, list):
            return [walk(v) for v in value]
        return value

    if "logo" in out and isinstance(out["logo"], dict):
        out["logo"] = _sanitize_image(out["logo"], domain, tokens, is_logo=True)
    if "logos" in out and isinstance(out["logos"], list):
        out["logos"] = [
            _sanitize_image(item, domain, tokens, is_logo=True)
            if isinstance(item, dict)
            else item
            for item in out["logos"]
        ]

    if "avatar" in out and isinstance(out["avatar"], dict):
        out["avatar"] = _sanitize_image(out["avatar"], domain, tokens, is_logo=False)

    for key in ["image", "cover", "media", "backgroundMedia"]:
        if key in out and isinstance(out[key], dict):
            out[key] = _sanitize_image(out[key], domain, tokens, is_logo=False)

    for key in ["mediaSrc", "imageSrc"]:
        if isinstance(out.get(key), str):
            out[key] = _normalize_src(out[key], domain)

    out = walk(out)

    # Neutralize custom fonts in props
    for font_key in ["headingFont", "bodyFont"]:
        if isinstance(out.get(font_key), str) and tokens and _is_brand_asset(out[font_key], "", tokens):
            out[font_key] = "Inter"

    return out


def sanitize_tokens(tokens: dict, domain: str) -> dict:
    if not isinstance(tokens, dict):
        return tokens
    out = dict(tokens)
    brand = _brand_tokens(domain)
    typography = dict(out.get("typography", {}))
    for key in ["body", "heading"]:
        value = typography.get(key)
        if isinstance(value, str) and brand and any(tok in value.lower() for tok in brand):
            typography[key] = "Inter"
    if typography:
        out["typography"] = typography
    return out

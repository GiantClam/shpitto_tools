from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _text_blob(atoms: list[dict]) -> str:
    parts: list[str] = []
    for atom in atoms:
        if not isinstance(atom, dict):
            continue
        text = atom.get("text")
        if isinstance(text, str) and text.strip():
            parts.append(text.strip())
    return " ".join(parts).lower()


def _infer_semantic_role(atoms: list[dict], stats: dict) -> str:
    text = _text_blob(atoms)
    images = int(stats.get("images") or 0)
    headings = int(stats.get("headings") or 0)
    buttons = int(stats.get("buttons") or 0)
    links = int(stats.get("links") or 0)
    inputs = int(stats.get("inputs") or 0)
    if any(k in text for k in ["pricing", "price", "plan", "定价", "价格"]):
        return "Pricing"
    if any(k in text for k in ["faq", "question", "常见问题", "问题"]):
        return "FAQ"
    if any(k in text for k in ["testimonial", "客户", "评价", "case study"]):
        return "Testimonials"
    if inputs >= 1 and (buttons + links) >= 1:
        return "CTA"
    if any(k in text for k in ["contact", "demo", "get started", "signup", "咨询"]):
        return "CTA"
    if images >= 6 and headings <= 1 and buttons == 0:
        return "LogoCloud"
    if headings >= 1 and (buttons + links) >= 1 and images >= 1:
        return "Hero"
    if headings >= 3:
        return "Feature"
    return "Section"


def _infer_layout_pattern(atoms: list[dict]) -> str:
    images = [a for a in atoms if isinstance(a, dict) and a.get("kind") == "image"]
    texts = [a for a in atoms if isinstance(a, dict) and a.get("kind") in {"heading", "text", "input"}]
    if len(images) >= 3 and len(texts) >= 3:
        return "Grid"
    if images and texts:
        img_x = [a.get("bbox", {}).get("x") for a in images]
        txt_x = [a.get("bbox", {}).get("x") for a in texts]
        img_x = [x for x in img_x if isinstance(x, (int, float))]
        txt_x = [x for x in txt_x if isinstance(x, (int, float))]
        if img_x and txt_x:
            return "Split_Right_Image" if sum(img_x) / len(img_x) > sum(txt_x) / len(txt_x) else "Split_Left_Image"
    if texts and not images:
        return "Stack"
    return "Section"


def _top_summary_color(styles: dict, key: str) -> str | None:
    values = styles.get(key)
    if not isinstance(values, list) or not values:
        return None
    for item in values:
        if isinstance(item, dict) and item.get("value"):
            return item["value"]
    return None


def _map_color_to_token(color: str, primary: str | None, fg: str | None, bg: str | None) -> str | None:
    if not color:
        return None
    if primary and color == primary:
        return "var(--primary)"
    if fg and color == fg:
        return "var(--foreground)"
    if bg and color == bg:
        return "var(--background)"
    return None


def _normalize_atom(atom: dict) -> dict:
    if not isinstance(atom, dict):
        return {}
    return {
        "kind": atom.get("kind"),
        "tag": atom.get("tag"),
        "text": (atom.get("text") or "")[:160],
        "placeholder": (atom.get("placeholder") or "")[:160],
        "inputType": atom.get("inputType") or "",
        "href": atom.get("href") or "",
        "src": atom.get("src") or "",
        "bbox": atom.get("bbox") or {},
        "styles": atom.get("styles") or {},
    }


def _count_atoms(atoms: list[dict]) -> dict:
    counts = {
        "headings": 0,
        "text": 0,
        "links": 0,
        "buttons": 0,
        "images": 0,
        "videos": 0,
        "inputs": 0,
    }
    for atom in atoms:
        kind = atom.get("kind")
        if kind == "heading":
            counts["headings"] += 1
        elif kind == "text":
            counts["text"] += 1
        elif kind == "link":
            counts["links"] += 1
        elif kind == "button":
            counts["buttons"] += 1
        elif kind == "image":
            counts["images"] += 1
        elif kind == "video":
            counts["videos"] += 1
        elif kind == "input":
            counts["inputs"] += 1
    return counts


def build_atoms_dsl(atoms_path: Path, output_root: Path, domain: str, page_slug: str) -> dict:
    if not atoms_path.exists():
        return {"status": "missing", "path": str(atoms_path)}
    data = json.loads(atoms_path.read_text(encoding="utf-8"))
    sections = data.get("sections", []) if isinstance(data, dict) else []
    dsl_sections: list[dict[str, Any]] = []

    for section in sections:
        if not isinstance(section, dict):
            continue
        atoms = section.get("atoms") if isinstance(section.get("atoms"), list) else []
        normalized_atoms = [_normalize_atom(atom) for atom in atoms if isinstance(atom, dict)]
        counts = _count_atoms(normalized_atoms)
        styles_summary = section.get("computed_styles") or {}
        primary = _top_summary_color(styles_summary, "textColors")
        background = _top_summary_color(styles_summary, "bgColors")
        vivid = primary
        semantic_role = _infer_semantic_role(normalized_atoms, counts)
        layout_pattern = _infer_layout_pattern(normalized_atoms)

        enriched_atoms: list[dict] = []
        for atom in normalized_atoms:
            styles = atom.get("styles") if isinstance(atom.get("styles"), dict) else {}
            role = ""
            if atom.get("kind") in {"link", "button"}:
                bg = styles.get("backgroundColor")
                if isinstance(bg, str) and bg and bg not in {"transparent", "rgba(0, 0, 0, 0)"}:
                    role = "cta-main"
                else:
                    role = "cta-secondary"
            normalized_styles = {}
            color = styles.get("color") if isinstance(styles.get("color"), str) else ""
            bg = styles.get("backgroundColor") if isinstance(styles.get("backgroundColor"), str) else ""
            mapped_color = _map_color_to_token(color, vivid, primary, background)
            mapped_bg = _map_color_to_token(bg, vivid, primary, background)
            if mapped_color:
                normalized_styles["color"] = mapped_color
            if mapped_bg:
                normalized_styles["backgroundColor"] = mapped_bg
            enriched_atoms.append(
                {
                    **atom,
                    "role": role or None,
                    "normalizedStyles": normalized_styles or None,
                }
            )
        dsl_sections.append(
            {
                "index": section.get("index"),
                "title": section.get("title") or "",
                "stats": counts,
                "styles": styles_summary,
                "semanticRole": semantic_role,
                "layoutPattern": layout_pattern,
                "themeTokens": {
                    "colors": {
                        "foreground": primary or "",
                        "background": background or "",
                        "accent": vivid or "",
                    }
                },
                "atoms": enriched_atoms,
            }
        )

    output_dir = output_root / domain / "atoms" / page_slug
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "atoms_dsl.json"
    payload = {
        "url": data.get("url") if isinstance(data, dict) else "",
        "domain": domain,
        "page": page_slug,
        "sections": dsl_sections,
    }
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return {"status": "ok", "path": str(output_path), "sections": len(dsl_sections)}

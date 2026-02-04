from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from embeddings import get_text_embedding, get_image_embedding


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def _atom_type(kind: str) -> str:
    mapping = {
        "heading": "Heading",
        "text": "Text",
        "link": "Link",
        "button": "Button",
        "image": "Image",
        "video": "Video",
        "input": "Input",
    }
    return mapping.get(kind, "Unknown")


def _atom_tags(atom: dict) -> list[str]:
    tags: list[str] = []
    kind = atom.get("kind")
    role = atom.get("role")
    if kind:
        tags.append(str(kind))
    if role:
        tags.append(str(role))
    if atom.get("href"):
        tags.append("link")
    if atom.get("src"):
        tags.append("media")
    return list(dict.fromkeys(tags))


def build_atomic_assets(output_root: Path, domain: str, page_slug: str) -> dict:
    atoms_path = output_root / domain / "atoms" / page_slug / "atoms_dsl.json"
    if not atoms_path.exists():
        return {"status": "missing", "reason": "atoms_dsl_missing"}

    atoms_dsl = _load_json(atoms_path)
    sections = atoms_dsl.get("sections", []) if isinstance(atoms_dsl, dict) else []

    output_dir = output_root / domain / "atomics" / page_slug
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "atomics.json"

    atomic_items: list[dict[str, Any]] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        section_index = section.get("index")
        semantic_role = section.get("semanticRole") or ""
        layout_pattern = section.get("layoutPattern") or ""
        title = section.get("title") or ""
        atoms = section.get("atoms") if isinstance(section.get("atoms"), list) else []
        for idx, atom in enumerate(atoms):
            if not isinstance(atom, dict):
                continue
            kind = atom.get("kind") or ""
            atom_id = f"atom-{section_index}-{idx}"
            text = (atom.get("text") or "").strip()
            payload = {
                "id": atom_id,
                "type": _atom_type(str(kind)),
                "kind": kind,
                "text": text,
                "placeholder": atom.get("placeholder") or "",
                "inputType": atom.get("inputType") or "",
                "href": atom.get("href") or "",
                "src": atom.get("src") or "",
                "bbox": atom.get("bbox") or {},
                "styles": atom.get("styles") or {},
                "role": atom.get("role"),
                "normalizedStyles": atom.get("normalizedStyles"),
                "tags": _atom_tags(atom),
                "section_index": section_index,
                "section_title": title,
                "semantic_role": semantic_role,
                "layout_pattern": layout_pattern,
            }
            # Embeddings
            embedding_text: list[float] = []
            embedding_image: list[float] = []
            if text:
                try:
                    embedding_text = get_text_embedding(
                        " ".join(
                            [
                                text,
                                str(kind),
                                str(semantic_role),
                                str(layout_pattern),
                                str(title),
                            ]
                        )
                    )
                except Exception:
                    embedding_text = []
            src = atom.get("src")
            if isinstance(src, str) and src.startswith("/assets/"):
                image_path = output_root / domain / src.lstrip("/")
                if image_path.exists():
                    try:
                        embedding_image = get_image_embedding(image_path)
                    except Exception:
                        embedding_image = []
            payload["embeddings"] = {"text": embedding_text, "image": embedding_image}
            atomic_items.append(payload)

    output_path.write_text(
        json.dumps(
            {
                "domain": domain,
                "page": page_slug,
                "count": len(atomic_items),
                "items": atomic_items,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return {"status": "ok", "path": str(output_path), "count": len(atomic_items)}

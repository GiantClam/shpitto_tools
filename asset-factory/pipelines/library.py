from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Any

from embeddings import get_image_embedding, get_text_embedding


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def ingest_library_assets(output_root: Path, domain: str, page_slug: str) -> dict:
    site_dir = output_root / domain
    sections_path = site_dir / "pages" / page_slug / "sections.json"
    tokens_path = site_dir / "theme" / "tokens.json"
    atoms_path = site_dir / "atoms" / page_slug / "atoms_dsl.json"

    if not sections_path.exists():
        return {"status": "missing", "reason": "sections_missing"}

    sections_data = _load_json(sections_path)
    tokens = _load_json(tokens_path)
    atoms_dsl = _load_json(atoms_path)
    atoms_by_index = {
        item.get("index"): item
        for item in atoms_dsl.get("sections", [])
        if isinstance(item, dict)
    }

    env_root = os.environ.get("ASSET_LIBRARY_ROOT", "").strip()
    library_root = Path(env_root) if env_root else site_dir / "asset-library"
    meta_dir = library_root / "metadata" / page_slug
    preview_dir = library_root / "previews" / page_slug
    registry_path = library_root / "registry" / "index.json"

    meta_dir.mkdir(parents=True, exist_ok=True)
    preview_dir.mkdir(parents=True, exist_ok=True)
    registry_path.parent.mkdir(parents=True, exist_ok=True)

    registry = _load_json(registry_path)
    entries: list[dict[str, Any]] = registry.get("entries", []) if isinstance(registry, dict) else []

    sections = sections_data.get("sections", []) if isinstance(sections_data, dict) else []
    for section in sections:
        if not isinstance(section, dict):
            continue
        idx = section.get("index")
        block_type = section.get("type")
        block_id = section.get("props", {}).get("id") or f"section-{idx}"
        screenshot = section.get("screenshot")
        semantic = atoms_by_index.get(idx, {}).get("semanticRole") if isinstance(idx, int) else None
        layout_pattern = atoms_by_index.get(idx, {}).get("layoutPattern") if isinstance(idx, int) else None

        preview_target = preview_dir / f"{block_id}.png"
        if screenshot and Path(str(screenshot)).exists():
            try:
                shutil.copy(str(screenshot), str(preview_target))
            except Exception:
                pass

        embedding = []
        if preview_target.exists():
            try:
                embedding = get_image_embedding(preview_target)
            except Exception:
                embedding = []

        meta = {
            "id": block_id,
            "type": block_type,
            "variant": section.get("variant"),
            "intent": section.get("intent"),
            "intent_tags": section.get("intent_tags") or [],
            "industry_tags": section.get("industry_tags") or [],
            "semantic_role": semantic,
            "layout_pattern": layout_pattern,
            "tokens": tokens,
            "preview": str(preview_target) if preview_target.exists() else "",
            "embedding": embedding,
        }
        meta_path = meta_dir / f"{block_id}.json"
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

        entries.append(
            {
                "id": block_id,
                "type": block_type,
                "page": page_slug,
                "domain": domain,
                "preview": str(preview_target) if preview_target.exists() else "",
                "meta": str(meta_path),
            }
        )

    registry_path.write_text(
        json.dumps({"entries": entries}, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return {"status": "ok", "entries": len(entries), "path": str(library_root)}


def ingest_atomic_assets(output_root: Path, domain: str, page_slug: str) -> dict:
    site_dir = output_root / domain
    atoms_path = site_dir / "atomics" / page_slug / "atomics.json"
    if not atoms_path.exists():
        return {"status": "missing", "reason": "atomics_missing"}
    atoms_data = _load_json(atoms_path)
    items = atoms_data.get("items", []) if isinstance(atoms_data, dict) else []

    env_root = os.environ.get("ASSET_LIBRARY_ROOT", "").strip()
    library_root = Path(env_root) if env_root else site_dir / "asset-library"
    meta_dir = library_root / "atomic" / "metadata" / page_slug
    registry_path = library_root / "atomic" / "registry" / "index.json"
    meta_dir.mkdir(parents=True, exist_ok=True)
    registry_path.parent.mkdir(parents=True, exist_ok=True)

    registry = _load_json(registry_path)
    entries: list[dict[str, Any]] = registry.get("entries", []) if isinstance(registry, dict) else []

    for atom in items:
        if not isinstance(atom, dict):
            continue
        atom_id = atom.get("id") or ""
        if not atom_id:
            continue
        text = atom.get("text") or ""
        embedding_text = []
        try:
            if text:
                embedding_text = get_text_embedding(str(text))
        except Exception:
            embedding_text = []
        meta = {**atom, "embedding_text": embedding_text}
        meta_path = meta_dir / f"{atom_id}.json"
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
        entries.append(
            {
                "id": atom_id,
                "type": atom.get("type"),
                "page": page_slug,
                "domain": domain,
                "meta": str(meta_path),
            }
        )

    registry_path.write_text(
        json.dumps({"entries": entries}, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return {"status": "ok", "entries": len(entries), "path": str(registry_path)}

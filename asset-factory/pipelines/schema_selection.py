from __future__ import annotations

import json
from pathlib import Path


def _schema_ref(schema_path: Path) -> str:
    return schema_path.as_uri()


def build_selection_schema(
    candidates: list[dict], schema_dir: Path, output_path: Path
) -> Path:
    variants = []
    for candidate in candidates:
        block_type = candidate.get("type")
        if not block_type:
            continue
        name = block_type.replace(".v", "-v").lower()
        schema_path = schema_dir / f"{name}.json"
        if not schema_path.exists():
            continue
        variants.append(
            {
                "type": "object",
                "additionalProperties": False,
                "required": ["type", "variant", "props"],
                "properties": {
                    "type": {"const": block_type},
                    "variant": {"type": "string"},
                    "props": {"$ref": f"{_schema_ref(schema_path)}#/properties/props"},
                },
            }
        )

    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "additionalProperties": False,
        "required": ["selection"],
        "properties": {
            "selection": {"oneOf": variants},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
            "notes": {"type": "array", "items": {"type": "string"}, "maxItems": 6},
        },
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return output_path

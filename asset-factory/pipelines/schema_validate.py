from __future__ import annotations

import json
from pathlib import Path


def validate_json(instance: dict, schema_path: Path) -> tuple[bool, list[str]]:
    try:
        import jsonschema
    except Exception:
        return True, []

    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    validator = jsonschema.Draft202012Validator(schema)
    errors = [error.message for error in validator.iter_errors(instance)]
    return not errors, errors

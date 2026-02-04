from __future__ import annotations

import base64
import json
import math
import os
from pathlib import Path
from urllib.request import Request, urlopen


OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_EMBEDDING_MODEL = os.environ.get(
    "OPENROUTER_EMBEDDING_MODEL", "openai/text-embedding-3-large"
)
OPENROUTER_IMAGE_MODEL = os.environ.get(
    "OPENROUTER_IMAGE_MODEL", "openai/clip-vit-large-patch14"
)


def _post_openrouter(payload: dict) -> dict:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not set")
    request = Request(
        "https://openrouter.ai/api/v1/embeddings",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def get_text_embedding(text: str) -> list[float]:
    payload = {"model": OPENROUTER_EMBEDDING_MODEL, "input": text}
    data = _post_openrouter(payload)
    return data.get("data", [{}])[0].get("embedding", [])


def get_image_embedding(image_path: Path) -> list[float]:
    if not image_path.exists():
        return []
    image_bytes = image_path.read_bytes()
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "model": OPENROUTER_IMAGE_MODEL,
        "input": [{"image": f"data:image/png;base64,{encoded}"}],
    }
    data = _post_openrouter(payload)
    return data.get("data", [{}])[0].get("embedding", [])


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def load_variant_prompts(prompt_path: Path) -> list[dict]:
    if not prompt_path.exists():
        return []
    return json.loads(prompt_path.read_text(encoding="utf-8")).get("variants", [])


def build_variant_embeddings(
    prompt_path: Path, output_path: Path, force: bool = False
) -> dict:
    if output_path.exists() and not force:
        return json.loads(output_path.read_text(encoding="utf-8"))
    if not OPENROUTER_API_KEY:
        output = {"variants": []}
        output_path.write_text(
            json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        return output
    variants = load_variant_prompts(prompt_path)
    output = {"variants": []}
    for variant in variants:
        text = variant.get("description", "")
        embedding = get_text_embedding(text) if text else []
        output["variants"].append({**variant, "embedding": embedding})
    output_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return output


def select_variant(
    block_type: str,
    text_embedding: list[float],
    image_embedding: list[float],
    variant_embeddings: dict,
) -> str | None:
    candidates = [
        v for v in variant_embeddings.get("variants", []) if v.get("type") == block_type
    ]
    if not candidates:
        return None
    best_score = -1.0
    best_variant = None
    for candidate in candidates:
        embedding = candidate.get("embedding", [])
        text_score = cosine_similarity(text_embedding, embedding)
        image_score = cosine_similarity(image_embedding, embedding)
        score = (text_score * 0.7) + (image_score * 0.3)
        if score > best_score:
            best_score = score
            best_variant = candidate.get("variant")
    return best_variant

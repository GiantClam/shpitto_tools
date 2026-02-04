from __future__ import annotations

import json
from typing import Any

from llm_client import call_openrouter_json, OPENROUTER_API_KEY


EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "extracted": {
            "type": "object",
            "properties": {
                "product_name": {"type": ["string", "null"]},
                "product_type": {"type": ["string", "null"]},
                "industry": {"type": ["string", "null"]},
                "core_function": {"type": ["string", "null"]},
                "features": {"type": "array", "items": {"type": "string"}},
                "target_audience": {
                    "type": "object",
                    "properties": {
                        "who": {"type": ["string", "null"]},
                        "company_size": {"type": ["string", "null"]},
                        "role": {"type": ["string", "null"]},
                    },
                    "required": ["who", "company_size", "role"],
                    "additionalProperties": False,
                },
                "design": {
                    "type": "object",
                    "properties": {
                        "style": {"type": ["string", "null"]},
                        "colors": {"type": "array", "items": {"type": "string"}},
                        "references": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["style", "colors", "references"],
                    "additionalProperties": False,
                },
                "business_model": {
                    "type": "object",
                    "properties": {
                        "pricing": {"type": ["string", "null"]},
                        "has_free_tier": {"type": ["boolean", "null"]},
                    },
                    "required": ["pricing", "has_free_tier"],
                    "additionalProperties": False,
                },
            },
            "required": [
                "product_name",
                "product_type",
                "industry",
                "core_function",
                "features",
                "target_audience",
                "design",
                "business_model",
            ],
            "additionalProperties": False,
        },
        "missing": {"type": "array", "items": {"type": "string"}},
        "confidence": {
            "type": "object",
            "properties": {
                "product_name": {"type": "number"},
                "product_type": {"type": "number"},
                "industry": {"type": "number"},
                "core_function": {"type": "number"},
                "target_audience": {"type": "number"},
                "design": {"type": "number"},
                "business_model": {"type": "number"},
            },
            "required": [
                "product_name",
                "product_type",
                "industry",
                "core_function",
                "target_audience",
                "design",
                "business_model",
            ],
            "additionalProperties": False,
        },
    },
    "required": ["extracted", "missing", "confidence"],
    "additionalProperties": False,
}


EXTRACTION_PROMPT = """
You are an expert business analyst. Extract structured information from user input.

User Input:
{user_input}

Return JSON matching the provided schema.
Rules:
- Use null when information is not present.
- Be conservative and avoid hallucinating details.
- Do not ask questions.
"""


CRITICAL_FIELDS = ["product_name", "product_type", "core_function", "target_audience"]


def _normalize_extracted(payload: dict) -> dict:
    extracted = payload.get("extracted") if isinstance(payload, dict) else None
    if not isinstance(extracted, dict):
        extracted = {}
    extracted.setdefault("product_name", None)
    extracted.setdefault("product_type", None)
    extracted.setdefault("industry", None)
    extracted.setdefault("core_function", None)
    extracted.setdefault("features", [])
    extracted.setdefault(
        "target_audience", {"who": None, "company_size": None, "role": None}
    )
    extracted.setdefault("design", {"style": None, "colors": [], "references": []})
    extracted.setdefault("business_model", {"pricing": None, "has_free_tier": None})
    return extracted


def _compute_missing(extracted: dict) -> list[str]:
    missing: list[str] = []
    if not extracted.get("product_name"):
        missing.append("product_name")
    if not extracted.get("product_type"):
        missing.append("product_type")
    if not extracted.get("core_function"):
        missing.append("core_function")
    target = extracted.get("target_audience") or {}
    if not target.get("who"):
        missing.append("target_audience")
    features = extracted.get("features") if isinstance(extracted.get("features"), list) else []
    if len(features) < 3:
        missing.append("features")
    return missing


def _fallback_result(user_input: str) -> dict:
    extracted = _normalize_extracted({})
    missing = _compute_missing(extracted)
    confidence = {
        "product_name": 0.0,
        "product_type": 0.0,
        "industry": 0.0,
        "core_function": 0.0,
        "target_audience": 0.0,
        "design": 0.0,
        "business_model": 0.0,
    }
    return {
        "extracted": extracted,
        "missing": missing,
        "confidence": confidence,
        "input": user_input,
    }


class InformationExtractor:
    def extract(self, user_input: str) -> dict:
        if not OPENROUTER_API_KEY:
            return _fallback_result(user_input)
        messages = [
            {
                "role": "user",
                "content": EXTRACTION_PROMPT.format(user_input=user_input.strip()),
            }
        ]
        result = call_openrouter_json(messages, EXTRACTION_SCHEMA, temperature=0.1)
        extracted = _normalize_extracted(result)
        missing = result.get("missing")
        if not isinstance(missing, list) or not missing:
            missing = _compute_missing(extracted)
        confidence = result.get("confidence") if isinstance(result, dict) else None
        if not isinstance(confidence, dict):
            confidence = {
                "product_name": 0.5 if extracted.get("product_name") else 0.0,
                "product_type": 0.5 if extracted.get("product_type") else 0.0,
                "industry": 0.5 if extracted.get("industry") else 0.0,
                "core_function": 0.5 if extracted.get("core_function") else 0.0,
                "target_audience": 0.5 if extracted.get("target_audience", {}).get("who") else 0.0,
                "design": 0.5 if extracted.get("design", {}).get("style") else 0.0,
                "business_model": 0.5 if extracted.get("business_model", {}).get("pricing") else 0.0,
            }
        return {
            "extracted": extracted,
            "missing": missing,
            "confidence": confidence,
            "input": user_input,
        }

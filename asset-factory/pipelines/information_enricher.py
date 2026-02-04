from __future__ import annotations

import copy
import json

from llm_client import call_openrouter_json, OPENROUTER_API_KEY
from information_extractor import _normalize_extracted, _compute_missing


INDUSTRY_KB = {
    "saas": {
        "common_features": [
            "Team collaboration",
            "Analytics dashboard",
            "Automation workflows",
        ],
        "design_trends": ["clean", "modern", "trustworthy"],
        "must_have_sections": ["Hero", "Features", "Pricing", "Testimonials", "CTA"],
    },
    "e-commerce": {
        "common_features": ["Product catalog", "Secure checkout", "Shipping updates"],
        "design_trends": ["bold", "product-focused", "conversion-driven"],
        "must_have_sections": ["Hero", "ProductGrid", "Reviews", "FAQ", "Footer"],
    },
    "portfolio": {
        "common_features": ["Project showcase", "About", "Contact"],
        "design_trends": ["minimal", "image-led", "editorial"],
        "must_have_sections": ["Hero", "Gallery", "About", "Contact"],
    },
}

ENRICH_SCHEMA = {
    "type": "object",
    "properties": {
        "enriched": {
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
                "industry_insights": {
                    "type": ["object", "null"],
                    "properties": {
                        "typical_features": {"type": "array", "items": {"type": "string"}},
                        "design_trends": {"type": "array", "items": {"type": "string"}},
                        "must_have_sections": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": [
                        "typical_features",
                        "design_trends",
                        "must_have_sections",
                    ],
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
                "industry_insights",
            ],
            "additionalProperties": False,
        },
        "assumptions": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["enriched", "assumptions"],
    "additionalProperties": False,
}

ENRICH_PROMPT = """
You are an information enrichment agent. Fill missing fields with reasonable assumptions based on the user input and extracted info.
Do not ask questions and do not require user follow-up.
Return JSON that matches the provided schema.

User Input:
{user_input}

Extracted Info:
{extracted}

Rules:
- If a field is missing, make a best-effort assumption.
- Keep assumptions realistic and aligned with the input.
- List any assumptions you made in the assumptions array.
"""


def _apply_industry_insights(enriched: dict) -> None:
    industry = (enriched.get("industry") or "").lower()
    product_type = (enriched.get("product_type") or "").lower()
    key = industry or product_type
    insights = INDUSTRY_KB.get(key)
    if insights:
        enriched["industry_insights"] = {
            "typical_features": insights["common_features"],
            "design_trends": insights["design_trends"],
            "must_have_sections": insights["must_have_sections"],
        }
    else:
        enriched.setdefault(
            "industry_insights",
            {"typical_features": [], "design_trends": [], "must_have_sections": []},
        )


def _fallback_assumptions(enriched: dict, missing: list[str]) -> list[str]:
    assumptions: list[str] = []
    if "product_name" in missing:
        enriched["product_name"] = "Your Product"
        assumptions.append("Product name assumed as 'Your Product'.")
    if "product_type" in missing:
        enriched["product_type"] = "SaaS"
        assumptions.append("Product type assumed as SaaS.")
    if "core_function" in missing:
        enriched["core_function"] = "Helps teams manage work more efficiently."
        assumptions.append("Core function inferred from generic productivity context.")
    target = enriched.get("target_audience") or {}
    if "target_audience" in missing:
        target.update({"who": "Teams", "company_size": "SMB", "role": "Manager"})
        enriched["target_audience"] = target
        assumptions.append("Target audience inferred as SMB teams.")
    features = enriched.get("features") if isinstance(enriched.get("features"), list) else []
    if "features" in missing:
        features = features + ["Automation", "Reporting", "Collaboration"]
        enriched["features"] = features[:3]
        assumptions.append("Default features added to reach minimum list size.")
    return assumptions


def _calculate_confidence(missing: list[str]) -> float:
    critical_fields = ["product_name", "product_type", "core_function", "target_audience"]
    critical_missing = [field for field in critical_fields if field in missing]
    if not critical_missing:
        return 0.9
    if len(critical_missing) == 1:
        return 0.7
    if len(critical_missing) == 2:
        return 0.5
    return 0.3


class InformationEnricher:
    def enrich(self, extracted_payload: dict) -> dict:
        extracted = _normalize_extracted(extracted_payload)
        enriched = copy.deepcopy(extracted)
        missing = _compute_missing(enriched)
        assumptions: list[str] = []

        if missing and OPENROUTER_API_KEY:
            prompt = ENRICH_PROMPT.format(
                user_input=extracted_payload.get("input", ""),
                extracted=json.dumps(extracted, ensure_ascii=False),
            )
            messages = [{"role": "user", "content": prompt}]
            try:
                response = call_openrouter_json(messages, ENRICH_SCHEMA, temperature=0.2)
                enriched_payload = response.get("enriched", enriched)
                enriched = _normalize_extracted({"extracted": enriched_payload})
                if isinstance(enriched_payload, dict) and enriched_payload.get("industry_insights"):
                    enriched["industry_insights"] = enriched_payload.get("industry_insights")
                assumptions = response.get("assumptions") if isinstance(response, dict) else []
            except Exception:
                assumptions = _fallback_assumptions(enriched, missing)
        else:
            assumptions = _fallback_assumptions(enriched, missing)

        _apply_industry_insights(enriched)
        missing = _compute_missing(enriched)
        confidence = _calculate_confidence(missing)
        return {
            "enriched_info": enriched,
            "missing": missing,
            "assumptions": assumptions,
            "confidence": confidence,
        }

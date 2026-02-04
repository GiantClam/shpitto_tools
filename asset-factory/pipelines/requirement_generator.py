from __future__ import annotations

import json
from typing import Any

from llm_client import call_openrouter_json, OPENROUTER_API_KEY


REQUIREMENT_SCHEMA = {
    "type": "object",
    "properties": {
        "product_overview": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "tagline": {"type": "string"},
                "description": {"type": "string"},
                "industry": {"type": "string"},
                "unique_value": {"type": "string"},
            },
            "required": ["name", "tagline", "description", "industry", "unique_value"],
            "additionalProperties": False,
        },
        "target_audience": {
            "type": "object",
            "properties": {
                "primary": {
                    "type": "object",
                    "properties": {
                        "persona": {"type": "string"},
                        "pain_points": {"type": "array", "items": {"type": "string"}},
                        "goals": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["persona", "pain_points", "goals"],
                    "additionalProperties": False,
                }
            },
            "required": ["primary"],
            "additionalProperties": False,
        },
        "website_goals": {
            "type": "object",
            "properties": {
                "primary": {"type": "string"},
                "secondary": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["primary", "secondary"],
            "additionalProperties": False,
        },
        "required_sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {"type": "string"},
                    "priority": {"type": "string"},
                    "purpose": {"type": "string"},
                    "key_content": {
                        "type": "object",
                        "properties": {
                            "headline": {"type": "string"},
                            "subheadline": {"type": "string"},
                            "cta": {"type": "string"},
                        },
                        "required": ["headline", "subheadline", "cta"],
                        "additionalProperties": True,
                    },
                },
                "required": ["type", "priority"],
                "additionalProperties": True,
            },
        },
        "design_direction": {
            "type": "object",
            "properties": {
                "style": {"type": "string"},
                "mood": {"type": "string"},
                "colors": {
                    "type": "object",
                    "properties": {
                        "primary": {"type": "string"},
                        "secondary": {"type": "string"},
                        "rationale": {"type": "string"},
                    },
                    "required": ["primary", "secondary", "rationale"],
                    "additionalProperties": False,
                },
                "typography": {
                    "type": "object",
                    "properties": {"personality": {"type": "string"}},
                    "required": ["personality"],
                    "additionalProperties": False,
                },
            },
            "required": ["style", "mood", "colors", "typography"],
            "additionalProperties": False,
        },
        "key_messages": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "target_section": {"type": "string"},
                },
                "required": ["message", "target_section"],
                "additionalProperties": False,
            },
        },
    },
    "required": [
        "product_overview",
        "target_audience",
        "website_goals",
        "required_sections",
        "design_direction",
        "key_messages",
    ],
    "additionalProperties": False,
}

REQUIREMENT_PROMPT = """
You are a product manager. Create a comprehensive website requirement document.

Gathered Information:
{enriched_info}

Rules:
- Be specific and avoid generic claims.
- Include Hero and Footer sections.
- Output JSON matching the provided schema.
"""


class RequirementGenerator:
    def generate(self, enriched_info: dict) -> dict:
        if OPENROUTER_API_KEY:
            prompt = REQUIREMENT_PROMPT.format(
                enriched_info=json.dumps(enriched_info, ensure_ascii=False, indent=2)
            )
            messages = [{"role": "user", "content": prompt}]
            result = call_openrouter_json(messages, REQUIREMENT_SCHEMA, temperature=0.7)
            self._validate(result)
            return result
        return self._fallback(enriched_info)

    def _fallback(self, enriched_info: dict) -> dict:
        name = enriched_info.get("product_name") or "Your Product"
        industry = enriched_info.get("industry") or enriched_info.get("product_type") or "General"
        persona = enriched_info.get("target_audience", {}).get("who") or "Teams"
        core = enriched_info.get("core_function") or "Deliver value efficiently."
        features = enriched_info.get("features") or []
        if len(features) < 3:
            features = (features + ["Automation", "Insights", "Collaboration"])[:3]
        return {
            "product_overview": {
                "name": name,
                "tagline": f"{name} helps {persona} move faster",
                "description": core,
                "industry": industry,
                "unique_value": "Focused on measurable outcomes",
            },
            "target_audience": {
                "primary": {
                    "persona": persona,
                    "pain_points": ["Manual processes", "Limited visibility", "Slow execution"],
                    "goals": ["Move faster", "Reduce overhead"],
                }
            },
            "website_goals": {
                "primary": "Generate leads",
                "secondary": ["Explain value", "Drive signups"],
            },
            "required_sections": [
                {
                    "type": "Hero",
                    "priority": "critical",
                    "purpose": "Communicate core value quickly",
                    "key_content": {
                        "headline": f"{name}: {core}",
                        "subheadline": "Designed for modern teams.",
                        "cta": "Get started",
                    },
                },
                {
                    "type": "Features",
                    "priority": "high",
                    "purpose": "Highlight key benefits",
                    "features": [
                        {
                            "title": feature,
                            "description": f"{feature} tailored to your workflow.",
                            "benefit": "Save time and stay aligned.",
                        }
                        for feature in features
                    ],
                },
                {
                    "type": "CTA",
                    "priority": "high",
                    "purpose": "Drive action",
                    "key_content": {
                        "headline": "See it in action",
                        "subheadline": "Start a free trial today.",
                        "cta": "Start free trial",
                    },
                },
                {
                    "type": "Footer",
                    "priority": "medium",
                    "purpose": "Provide navigation and trust",
                    "key_content": {
                        "headline": name,
                        "subheadline": "Contact and legal",
                        "cta": "Contact",
                    },
                },
            ],
            "design_direction": {
                "style": enriched_info.get("design", {}).get("style") or "modern",
                "mood": "confident",
                "colors": {
                    "primary": "#1F2937",
                    "secondary": "#3B82F6",
                    "rationale": "Balanced for clarity and trust",
                },
                "typography": {"personality": "clean and professional"},
            },
            "key_messages": [
                {
                    "message": "Deliver results faster with less overhead.",
                    "target_section": "Hero",
                }
            ],
        }

    def _validate(self, doc: dict) -> None:
        required_keys = [
            "product_overview",
            "target_audience",
            "website_goals",
            "required_sections",
            "design_direction",
        ]
        for key in required_keys:
            if key not in doc:
                raise ValueError(f"Requirement doc missing: {key}")
        section_types = [item.get("type") for item in doc.get("required_sections", [])]
        if "Hero" not in section_types:
            raise ValueError("Must have Hero section")

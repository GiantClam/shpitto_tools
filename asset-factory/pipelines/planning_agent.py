from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from information_extractor import InformationExtractor
from information_enricher import InformationEnricher
from requirement_generator import RequirementGenerator


@dataclass
class PlanningArtifacts:
    extracted: dict
    enriched: dict
    requirement: dict
    plan: dict


class PlanningAgent:
    def __init__(self, output_dir: Path) -> None:
        self.output_dir = output_dir
        self.extractor = InformationExtractor()
        self.enricher = InformationEnricher()
        self.requirement_generator = RequirementGenerator()

    def run(self, user_input: str) -> PlanningArtifacts:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        extracted = self.extractor.extract(user_input)
        enriched = self.enricher.enrich(extracted)
        requirement = self.requirement_generator.generate(enriched["enriched_info"])
        plan = self._plan_from_requirement(requirement)

        self._write_json("extracted.json", extracted)
        self._write_json("enriched.json", enriched)
        self._write_json("requirement.json", requirement)
        self._write_json("plan.json", plan)

        return PlanningArtifacts(
            extracted=extracted, enriched=enriched, requirement=requirement, plan=plan
        )

    def _plan_from_requirement(self, requirement: dict) -> dict:
        sections = requirement.get("required_sections", [])
        plan_sections = []
        for item in sections:
            if not isinstance(item, dict):
                continue
            plan_sections.append(
                {
                    "type": item.get("type"),
                    "priority": item.get("priority"),
                    "purpose": item.get("purpose"),
                    "key_content": item.get("key_content", {}),
                }
            )
        return {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "pages": [
                {
                    "path": "/",
                    "name": "Home",
                    "sections": plan_sections,
                }
            ],
        }

    def _write_json(self, name: str, payload: dict) -> None:
        path = self.output_dir / name
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

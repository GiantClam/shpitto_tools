"""
Batch processor for template reconstruction from screenshots.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any

from .client import OpenRouterClient, TemplateReconstructor
from .prompts import (
    TEMPLATE_RECONSTRUCTION_SYSTEM,
    TEMPLATE_GENERATION_PROMPT,
    VISION_ANALYSIS_PROMPT,
)


class BatchTemplateProcessor:
    """Process multiple websites to generate templates from screenshots."""

    def __init__(
        self,
        client: OpenRouterClient,
        output_dir: str | Path = "output/ai-templates",
    ):
        self.llm = client
        self.reconstructor = TemplateReconstructor(client)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.results: list[dict] = []

    def load_snapshots(self, snapshot_index: str | Path) -> list[dict]:
        """Load snapshot index file."""
        with open(snapshot_index, "r", encoding="utf-8") as f:
            return json.load(f)

    def process_site(
        self,
        screenshot_path: str | Path,
        dom_path: str | Path,
        site_name: str,
        domain: str,
    ) -> dict:
        """Process a single site and generate template."""
        print(f"Processing {site_name}...")

        try:
            template = self.reconstructor.reconstruct_from_screenshot(
                screenshot_path, dom_path, site_name
            )
            template["domain"] = domain
            template["generated_at"] = datetime.now().isoformat()

            # Save individual template
            output_path = self.output_dir / f"{domain}.json"
            with output_path.open("w", encoding="utf-8") as f:
                json.dump(template, f, ensure_ascii=False, indent=2)

            print(f"  ✓ Saved: {output_path.name}")
            return {"status": "success", "domain": domain, "template": template}

        except Exception as e:
            print(f"  ✗ Failed: {e}")
            return {
                "status": "error",
                "domain": domain,
                "error": str(e),
            }

    def process_all(
        self,
        snapshot_index: str | Path,
        limit: int | None = None,
    ) -> dict:
        """Process all sites from snapshot index."""
        snapshots = self.load_snapshots(snapshot_index)
        if limit:
            snapshots = snapshots[:limit]

        print(f"Processing {len(snapshots)} sites...")

        for snapshot in snapshots:
            result = self.process_site(
                screenshot_path=snapshot["screenshot"],
                dom_path=snapshot["snapshot"],
                site_name=snapshot["domain"],
                domain=snapshot["domain"],
            )
            self.results.append(result)

        # Save summary report
        summary = {
            "processed_at": datetime.now().isoformat(),
            "total": len(self.results),
            "successful": sum(1 for r in self.results if r["status"] == "success"),
            "failed": sum(1 for r in self.results if r["status"] == "error"),
            "results": self.results,
        }

        summary_path = self.output_dir / "batch_summary.json"
        with summary_path.open("w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)

        print(
            f"\nBatch complete: {summary['successful']}/{summary['total']} successful"
        )
        return summary


def run_batch_generation(
    snapshot_index: str = "output/snapshots/snapshot_index.json",
    output_dir: str = "output/ai-templates",
    model: str = "anthropic/claude-sonnet-4-5-2025-06-01",
    limit: int | None = None,
) -> dict:
    """Convenience function to run batch template generation."""
    client = OpenRouterClient(model=model)
    processor = BatchTemplateProcessor(client, output_dir)
    return processor.process_all(snapshot_index, limit)


def import_to_template_library(
    ai_templates_dir: str = "output/ai-templates",
    supabase_url: str | None = None,
    supabase_key: str | None = None,
) -> dict:
    """Import AI-generated templates to the template library."""
    import ssl
    import urllib.request
    import urllib.error

    url = supabase_url or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = supabase_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError("Supabase credentials not set")

    template_dir = Path(ai_templates_dir)
    all_templates = []

    for file_path in template_dir.glob("*.json"):
        if file_path.name == "batch_summary.json":
            continue
        with file_path.open("r", encoding="utf-8") as f:
            template = json.load(f)
            if template.get("template_type"):
                all_templates.append(template)

    # Prepare payload
    def build_payload(t):
        return {
            "name": t.get("name", "AI Template"),
            "slug": t.get("slug", f"ai-{t.get('domain', 'unknown')}"),
            "source_url": f"https://{t.get('domain', '')}",
            "description": t.get(
                "description", f"AI-generated from {t.get('domain', '')}"
            ),
            "puck_data": t.get("puck_data", {}),
            "visual_spec": t.get("visual_spec", {}),
            "template_type": t.get("template_type", "page"),
            "template_kind": t.get("template_kind", "landing"),
            "template_source": "ai-generated",
        }

    payload = [build_payload(t) for t in all_templates]

    endpoint = f"{url}/rest/v1/shpitto_templates?on_conflict=slug"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    context = ssl._create_unverified_context()
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        endpoint, data=data, headers=headers, method="POST"
    )

    try:
        with urllib.request.urlopen(request, timeout=120, context=context) as response:
            print(f"Imported {len(payload)} templates to Supabase")
            return {"imported": len(payload), "status": "success"}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        raise RuntimeError(f"Import failed: {e.code} {e.reason} {error_body}")

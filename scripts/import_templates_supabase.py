import argparse
import json
import os
from pathlib import Path

import ssl
import urllib.error
import urllib.request


def load_templates(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_payload(template: dict) -> dict:
    return {
        "name": template["name"],
        "slug": template["slug"],
        "source_url": template["source_url"],
        "description": template["raw_description"],
        "puck_data": template["puck_data"],
        "visual_spec": template.get("visual_spec"),
        "interaction_spec": template.get("interaction_spec"),
        "copy_spec": template.get("copy_spec"),
        "r2_urls": {},
        "template_type": template.get("template_type", "page"),
        "template_kind": template.get("template_kind", "landing"),
        "template_source": template.get("template_source", "excel"),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default="/Users/beihuang/Documents/opencode/shpitto/output/templates.json",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--insecure", action="store_true")
    args = parser.parse_args()

    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_role = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role:
        raise RuntimeError(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        )

    templates = load_templates(Path(args.input))
    payload = [build_payload(item) for item in templates]

    if args.dry_run:
        print(f"Prepared {len(payload)} templates for import")
        return

    endpoint = f"{supabase_url}/rest/v1/shpitto_templates?on_conflict=slug"
    headers = {
        "apikey": service_role,
        "Authorization": f"Bearer {service_role}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        endpoint, data=data, headers=headers, method="POST"
    )
    context = None
    if args.insecure:
        context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(request, timeout=60, context=context) as response:
            status = response.status
            body = response.read().decode("utf-8")
            if status >= 300:
                raise RuntimeError(f"Supabase import failed: {status} {body}")
    except urllib.error.HTTPError as error:
        error_body = error.read().decode("utf-8") if error.fp else ""
        raise RuntimeError(
            f"Supabase import failed: {error.code} {error.reason} {error_body}"
        ) from error

    print(f"Imported {len(payload)} templates to Supabase")


if __name__ == "__main__":
    main()

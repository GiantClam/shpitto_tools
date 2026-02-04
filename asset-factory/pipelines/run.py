from __future__ import annotations

import argparse
import os
import subprocess
import time
import json
from datetime import datetime
from urllib.parse import urlparse
from pathlib import Path
import socket
import urllib.request

from build import build_pages
from capture import capture_site
from discover import discover_urls, write_discovered
from extract import extract_site_sync
from map import map_sections
from llm_filler import apply_media_plan, fill_sections, generate_theme_and_media_plan
from atoms_dsl import build_atoms_dsl
from atomics import build_atomic_assets
from semantic_tagger import apply_semantic_override, tag_semantics
from library import ingest_library_assets, ingest_atomic_assets
from design_system import build_design_system
from verify import verify_outputs
from planning_agent import PlanningAgent

REPO_ROOT = Path(__file__).resolve().parents[2]
ASSET_FACTORY_ROOT = REPO_ROOT / "asset-factory"


def _slug_from_url(url: str) -> str:
    parsed = urlparse(url)
    slug = parsed.path.strip("/") or "home"
    return slug.replace("/", "-")


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def _infer_page_intent(url: str) -> str:
    path = urlparse(url).path.lower()
    if path in {"", "/"}:
        return "home"
    if "pricing" in path or "plan" in path:
        return "pricing"
    if "faq" in path or "question" in path:
        return "faq"
    if "case" in path or "customer" in path or "story" in path:
        return "case_study"
    if "about" in path or "company" in path or "team" in path:
        return "about"
    if "contact" in path or "demo" in path or "sales" in path:
        return "contact"
    if "support" in path or "help" in path:
        return "support"
    if "blog" in path or "news" in path or "insight" in path:
        return "blog"
    if "product" in path or "solution" in path:
        return "product"
    return "page"


def _build_site_plan(urls: list[str]) -> dict:
    pages = []
    seen = set()
    for url in urls:
        slug = _slug_from_url(url)
        if slug in seen:
            continue
        seen.add(slug)
        pages.append(
            {
                "url": url,
                "slug": slug,
                "intent": _infer_page_intent(url),
            }
        )
    return {
        "pages": pages,
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }


def _write_site_files(site_plan: dict, output_root: Path, domain: str) -> dict:
    pages = site_plan.get("pages", []) if isinstance(site_plan, dict) else []
    urls = [page.get("url") for page in pages if isinstance(page, dict) and page.get("url")]
    sitemap_entries = []
    for url in urls:
        sitemap_entries.append(f"  <url><loc>{url}</loc></url>")
    sitemap_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(sitemap_entries)
        + "\n</urlset>\n"
    )
    site_dir = output_root / domain
    sitemap_path = site_dir / "sitemap.xml"
    robots_path = site_dir / "robots.txt"
    sitemap_path.write_text(sitemap_xml, encoding="utf-8")
    robots_path.write_text(
        f"User-agent: *\nAllow: /\nSitemap: https://{domain}/sitemap.xml\n",
        encoding="utf-8",
    )
    return {"sitemap": str(sitemap_path), "robots": str(robots_path)}


def _page_plan(site_plan: dict, page_slug: str) -> dict:
    for page in site_plan.get("pages", []):
        if page.get("slug") == page_slug:
            return page
    return {}


def _infer_layout_schema(sections: list[dict]) -> list[str]:
    labels: list[str] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        label = section.get("layout_schema")
        if isinstance(label, str) and label:
            labels.append(label)
            continue
        block_type = str(section.get("type", ""))
        if "Hero" in block_type:
            labels.append("Hero")
        elif "Footer" in block_type or "Support" in block_type:
            labels.append("Footer")
        elif "LeadCapture" in block_type or "Contact" in block_type:
            labels.append("CTA")
        elif any(key in block_type for key in ["LogoCloud", "Testimonials", "CaseStudies"]):
            labels.append("Proof")
        elif any(
            key in block_type
            for key in [
                "Feature",
                "UseCases",
                "Integrations",
                "Stats",
                "Steps",
                "Comparison",
                "Pricing",
                "FAQ",
            ]
        ):
            labels.append("Features")
        else:
            labels.append("Section")
    return labels


def _style_fingerprint(tokens: dict, report: dict) -> dict:
    colors = tokens.get("colors", {}) if isinstance(tokens, dict) else {}
    typography = tokens.get("typography", {}) if isinstance(tokens, dict) else {}
    contrast = {}
    if isinstance(report, dict):
        contrast = report.get("aesthetics", {}).get("contrast", {}) or {}
    return {
        "colors": list(colors.keys()),
        "typography": list(typography.keys()),
        "contrast": contrast,
    }


def ingest_library(
    output_root: Path,
    domain: str,
    page_slug: str,
    approved: bool = False,
    library_root: Path | None = None,
) -> dict:
    if not approved:
        return {"status": "skipped", "reason": "approval_required"}
    reports_dir = output_root / domain / "reports"
    report_path = reports_dir / f"{page_slug}.json"
    if not report_path.exists():
        return {"status": "failed", "reason": "report_missing"}
    report = _load_json(report_path)
    gate = report.get("library_gate", {})
    if gate.get("status") != "pass":
        return {"status": "failed", "reason": "library_gate_failed", "gate": gate}
    sections_path = output_root / domain / "pages" / page_slug / "sections.json"
    sections_data = _load_json(sections_path)
    sections = sections_data.get("sections", [])
    tokens = _load_json(output_root / domain / "theme" / "tokens.json")
    layout_schema = sections_data.get("layout_schema") or _infer_layout_schema(sections)
    payload = {
        "site": domain,
        "page_slug": page_slug,
        "layout_schema": layout_schema,
        "intent_tags": sections_data.get("intent_tags", []),
        "tokens": tokens,
        "blocks": [
            {
                "type": section.get("type"),
                "variant": section.get("variant"),
                "props": section.get("props"),
                "intent": section.get("intent"),
                "intent_tags": section.get("intent_tags"),
                "layout_schema": section.get("layout_schema"),
                "content_constraints": section.get("content_constraints"),
            }
            for section in sections
            if isinstance(section, dict)
        ],
        "content_constraints": {
            section.get("props", {}).get("id", f"block-{index:02d}"): section.get(
                "content_constraints", {}
            )
            for index, section in enumerate(sections)
            if isinstance(section, dict)
        },
        "style_fingerprint": _style_fingerprint(tokens, report),
        "scores": report.get("library_scores", {}),
    }
    target_root = library_root or (output_root / domain / "library")
    target_root.mkdir(parents=True, exist_ok=True)
    target_path = target_root / f"{page_slug}.json"
    target_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return {"status": "ok", "path": str(target_path)}


def _port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def _http_ok(url: str, timeout: float = 2.5) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return 200 <= resp.status < 300
    except Exception:
        return False


def ensure_render_server(render_base: str, render_url: str | None = None, wait_seconds: int = 30) -> tuple[bool, str]:
    host = "localhost"
    port = 3000
    if _port_open(host, port) and (_http_ok(f"http://{host}:{port}/") or _http_ok(render_base) or (render_url and _http_ok(render_url))):
        return True, "healthy"
    try:
        subprocess.Popen(
            ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", str(port)],
            cwd=str(REPO_ROOT / "builder"),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception as e:
        return False, f"start_failed: {e}"
    deadline = time.time() + wait_seconds
    while time.time() < deadline:
        if _port_open(host, port) and (_http_ok(f"http://{host}:{port}/") or _http_ok(render_base) or (render_url and _http_ok(render_url))):
            return True, "started"
        time.sleep(1.0)
    return False, "timeout"


def run_visual_qa(domain: str, original_url: str, render_url: str) -> tuple[int, str]:
    cmd = [
        "npx",
        "--prefix",
        str(REPO_ROOT / "visual-qa"),
        "ts-node",
        "--esm",
        str(REPO_ROOT / "visual-qa" / "scripts" / "run.ts"),
    ]
    env = os.environ.copy()
    env.update({"SITE_KEY": domain, "ORIGINAL_URL": original_url, "RENDER_URL": render_url})
    result = subprocess.run(cmd, env=env, capture_output=True, text=True)
    out = (result.stdout or "") + (result.stderr or "")
    return result.returncode, out


def run_visual_auto_repair(domain: str, original_url: str, puck_data_path: Path, render_base: str) -> tuple[int, str]:
    cmd = [
        "npx",
        "--prefix",
        str(REPO_ROOT / "visual-qa"),
        "ts-node",
        "--esm",
        str(REPO_ROOT / "visual-qa" / "scripts" / "run-loop.ts"),
    ]
    env = os.environ.copy()
    env.update(
        {
            "SITE_KEY": domain,
            "ORIGINAL_URL": original_url,
            "RENDER_URL_BASE": render_base,
            "PUCK_DATA_PATH": str(puck_data_path),
        }
    )
    result = subprocess.run(cmd, env=env, capture_output=True, text=True)
    out = (result.stdout or "") + (result.stderr or "")
    return result.returncode, out


def _apply_auto_repair_result(domain: str, page_slug: str, page_path: Path) -> dict:
    work_dir = REPO_ROOT / "asset-factory" / "out" / domain / "work"
    if not work_dir.exists():
        return {"status": "missing", "reason": "work_dir_missing"}

    def _iter_index(path: Path) -> int:
        name = path.name
        try:
            return int(name.split("puck.iter.")[1].split(".json")[0])
        except Exception:
            return -1

    iter_files = sorted(work_dir.glob("puck.iter.*.json"), key=_iter_index)
    if not iter_files:
        return {"status": "missing", "reason": "iter_files_missing"}
    latest = iter_files[-1]
    latest_idx = _iter_index(latest)

    backup_path = page_path.with_suffix(".pre-repair.json")
    if page_path.exists() and not backup_path.exists():
        backup_path.write_text(page_path.read_text(encoding="utf-8"), encoding="utf-8")
    page_path.write_text(latest.read_text(encoding="utf-8"), encoding="utf-8")

    return {
        "status": "applied",
        "iter": latest_idx,
        "source": str(latest),
        "backup": str(backup_path),
    }


def run_pipeline(
    urls: list[str],
    output_root: Path,
    registry_path: Path,
    fill_props: bool,
    ingest_library: bool = False,
    ingest_atomics: bool = False,
) -> dict:
    results = []
    domain = urlparse(urls[0]).netloc if urls else "site"
    site_plan = _build_site_plan(urls)
    site_dir = output_root / domain
    site_dir.mkdir(parents=True, exist_ok=True)
    plan_path = site_dir / "site_plan.json"
    plan_path.write_text(
        json.dumps(site_plan, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    site_files = _write_site_files(site_plan, output_root, domain)
    for url in urls:
        page_slug = _slug_from_url(url)
        capture_result = capture_site(url, output_root, page_slug=page_slug)
        extract_result = extract_site_sync(url, output_root)
        capture_data = {}
        if capture_result.get("sections"):
            sections_path = Path(capture_result["sections"])
            if sections_path.exists():
                capture_data = json.loads(sections_path.read_text(encoding="utf-8"))
                capture_data["screenshot"] = capture_result.get("screenshot")
        if capture_result.get("atoms"):
            atoms_path = Path(capture_result["atoms"])
            if atoms_path.exists():
                build_atoms_dsl(atoms_path, output_root, domain, page_slug)
                build_atomic_assets(output_root, domain, page_slug)
                tag_semantics(output_root, domain, page_slug, use_llm=True)
        map_result = map_sections(
            extract_result,
            registry_path,
            output_root,
            capture_data,
            page_slug,
            _page_plan(site_plan, page_slug),
        )
        design_system_result = build_design_system(output_root, domain, page_slug)
        media_plan = None
        theme_tokens = None
        if fill_props:
            theme_result = generate_theme_and_media_plan(
                Path(map_result["path"]), output_root, max_retries=1
            )
            if theme_result.get("status") in {"ok", "fallback"}:
                media_plan = theme_result.get("media_plan") or []
                theme_tokens = theme_result.get("theme") or {}
            fill_sections(
                Path(map_result["path"]),
                ASSET_FACTORY_ROOT / "schemas/blocks",
                ASSET_FACTORY_ROOT / "prompts/props_filler.md",
                output_root / domain / "logs" / f"llm-fill-{page_slug}.json",
                max_retries=2,
            )
            if media_plan and theme_tokens:
                apply_media_plan(Path(map_result["path"]), media_plan, theme_tokens)
        build_result = build_pages(
            extract_result, map_result, output_root, page_slug=page_slug
        )
        report = verify_outputs(domain, output_root, page_slug=page_slug)
        render_base = "http://localhost:3000/"
        render_url = f"http://localhost:3000/render?siteKey={domain}&page={page_slug}"
        healthy, note = ensure_render_server(render_base, render_url=render_url)
        if healthy:
            vqa_code, vqa_out = run_visual_qa(domain, url, render_url)
            report2 = verify_outputs(domain, output_root, page_slug=page_slug)
        else:
            vqa_code, vqa_out = 1, f"render_server_unavailable: {note}"
            report2 = report
        auto_repair_status = {"status": "skipped"}
        if os.environ.get("AUTO_REPAIR", "0") == "1":
            loop_code, loop_out = run_visual_auto_repair(
                domain,
                url,
                Path(build_result["page"]),
                "http://localhost:3000/render",
            )
            repair_apply = None
            if loop_code == 0:
                repair_apply = _apply_auto_repair_result(
                    domain, page_slug, Path(build_result["page"])
                )
                report2 = verify_outputs(domain, output_root, page_slug=page_slug)
            auto_repair_status = {
                "status": "ok" if loop_code == 0 else "failed",
                "output": loop_out[-2000:],
                "apply": repair_apply if loop_code == 0 else None,
            }
        library_result = {"status": "skipped"}
        atomic_result = {"status": "skipped"}
        if ingest_library:
            library_result = ingest_library_assets(output_root, domain, page_slug)
            atomic_result = ingest_atomic_assets(output_root, domain, page_slug)
        elif ingest_atomics:
            atomic_result = ingest_atomic_assets(output_root, domain, page_slug)
        results.append(
            {
                "capture": capture_result,
                "extract": extract_result,
                "map": map_result,
                "build": build_result,
                "visual_qa": {"status": "ok" if vqa_code == 0 else "failed", "output": vqa_out[-2000:]},
                "report": report2,
                "auto_repair": auto_repair_status,
                "design_system": design_system_result,
                "library": library_result,
                "atomics": atomic_result,
            }
        )

    return {
        "domain": domain,
        "pages": results,
        "site_plan": {"path": str(plan_path), "pages": len(site_plan["pages"])},
        "site_files": site_files,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run asset-factory pipeline")
    parser.add_argument("--url", required=True, help="Target URL")
    parser.add_argument(
        "--discover",
        action="store_true",
        help="Discover URLs via sitemap/links",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=5,
        help="Max pages to process when discovering URLs",
    )
    parser.add_argument(
        "--output",
        default=str(ASSET_FACTORY_ROOT / "out"),
        help="Output directory",
    )
    parser.add_argument(
        "--registry",
        default=str(ASSET_FACTORY_ROOT / "blocks/registry.json"),
        help="Block registry path",
    )
    parser.add_argument(
        "--fill-props",
        action="store_true",
        help="Use LLM to fill props and variants",
    )
    parser.add_argument(
        "--auto-repair",
        action="store_true",
        help="Enable visual auto-repair loop",
    )
    parser.add_argument(
        "--library",
        action="store_true",
        help="Ingest assets into asset-library under out/<site>",
    )
    parser.add_argument(
        "--atomics",
        action="store_true",
        help="Build and ingest atomic assets",
    )
    parser.add_argument(
        "--semantic-override",
        type=str,
        help="Path to semantic.json override to apply before mapping",
    )
    parser.add_argument(
        "--high-fidelity",
        action="store_true",
        help="Enable high fidelity mode (keep media, disable destyle, prioritize semantic mapping)",
    )
    parser.add_argument(
        "--plan-input",
        type=str,
        help="Run info enrichment + requirement planning (no dialog) before pipeline",
    )
    parser.add_argument(
        "--plan-output",
        type=str,
        help="Output directory for planning artifacts (defaults to out/<domain>/planning)",
    )
    args = parser.parse_args()

    if args.discover:
        urls = discover_urls(args.url, max_pages=args.max_pages)
        write_discovered(
            urls, Path(args.output) / urlparse(args.url).netloc / "discover"
        )
    else:
        urls = [args.url]

    if args.auto_repair:
        os.environ["AUTO_REPAIR"] = "1"
    if args.high_fidelity:
        os.environ["HIGH_FIDELITY"] = "1"
        os.environ["CAPTURE_KEEP_MEDIA"] = "1"
        os.environ["DESTYLE"] = "0"
    if args.semantic_override:
        apply_semantic_override(
            Path(args.output),
            urlparse(args.url).netloc,
            _slug_from_url(args.url),
            Path(args.semantic_override),
        )
    planning_result = None
    if args.plan_input:
        domain = urlparse(args.url).netloc or "local"
        planning_dir = (
            Path(args.plan_output)
            if args.plan_output
            else Path(args.output) / domain / "planning"
        )
        planner = PlanningAgent(planning_dir)
        planning_result = planner.run(args.plan_input)
        print(f"Planning artifacts saved to: {planning_dir}")

    result = run_pipeline(
        urls,
        Path(args.output),
        Path(args.registry),
        args.fill_props,
        ingest_library=args.library or os.environ.get("ASSET_LIBRARY", "0") == "1",
        ingest_atomics=args.atomics or os.environ.get("ATOMIC_LIBRARY", "0") == "1",
    )
    print("Pipeline completed")
    print(f"Domain: {result['domain']}")
    print(f"Pages processed: {len(result['pages'])}")


if __name__ == "__main__":
    main()

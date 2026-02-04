from __future__ import annotations

import argparse
import json
import re
from urllib.parse import urlparse
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
VISUAL_QA_OUT = REPO_ROOT / "asset-factory" / "out"


def _parse_hsl(value: str) -> tuple[float, float, float] | None:
    if not value:
        return None
    parts = value.replace("%", "").split()
    if len(parts) < 3:
        return None
    try:
        h = float(parts[0]) % 360
        s = float(parts[1]) / 100
        l = float(parts[2]) / 100
    except ValueError:
        return None
    return h, s, l


def _hsl_to_rgb(h: float, s: float, l: float) -> tuple[float, float, float]:
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if 0 <= h < 60:
        r, g, b = c, x, 0
    elif 60 <= h < 120:
        r, g, b = x, c, 0
    elif 120 <= h < 180:
        r, g, b = 0, c, x
    elif 180 <= h < 240:
        r, g, b = 0, x, c
    elif 240 <= h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    return r + m, g + m, b + m


def _relative_luminance(rgb: tuple[float, float, float]) -> float:
    def adjust(c: float) -> float:
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)


def _contrast_ratio(a: str, b: str) -> float | None:
    hsl_a = _parse_hsl(a)
    hsl_b = _parse_hsl(b)
    if not hsl_a or not hsl_b:
        return None
    rgb_a = _hsl_to_rgb(*hsl_a)
    rgb_b = _hsl_to_rgb(*hsl_b)
    l1 = _relative_luminance(rgb_a)
    l2 = _relative_luminance(rgb_b)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)


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


def _load_puck_blocks_from_config() -> set[str]:
    config_path = REPO_ROOT / "builder" / "src" / "puck" / "config.ts"
    if not config_path.exists():
        return set()
    content = config_path.read_text(encoding="utf-8")
    start = content.find("components")
    if start == -1:
        return set()
    brace_start = content.find("{", start)
    if brace_start == -1:
        return set()
    names: set[str] = set()
    depth = 0
    for line in content[brace_start:].splitlines():
        current_depth = depth
        if current_depth == 1:
            match = re.match(r"\s*([A-Za-z0-9]+)\s*:\s*\{", line)
            if match:
                names.add(f"{match.group(1)}.v1")
        depth += line.count("{") - line.count("}")
        if depth <= 0 and current_depth > 0:
            break
    return names


def _block_coverage(sections_path: Path) -> dict:
    if not sections_path.exists():
        return {"status": "missing", "reason": "sections_missing"}
    data = json.loads(sections_path.read_text(encoding="utf-8"))
    sections = data.get("sections", [])
    used_blocks = [
        section.get("type")
        for section in sections
        if isinstance(section, dict) and isinstance(section.get("type"), str)
    ]
    used_set = {block for block in used_blocks if block}
    puck_blocks = _load_puck_blocks_from_config()
    if not puck_blocks:
        return {
            "status": "skipped",
            "reason": "puck_config_missing",
            "mapped_blocks": sorted(used_set),
            "sections": len(used_blocks),
        }
    missing_in_puck = sorted(used_set - puck_blocks)
    unused_puck = sorted(puck_blocks - used_set)
    in_puck = used_set.intersection(puck_blocks)
    coverage_ratio = round(len(in_puck) / len(used_set), 3) if used_set else 0.0
    candidates_missing: set[str] = set()
    for section in sections:
        if not isinstance(section, dict):
            continue
        for candidate in section.get("candidates", []) or []:
            if not isinstance(candidate, dict):
                continue
            candidate_type = candidate.get("type")
            if isinstance(candidate_type, str) and candidate_type:
                if candidate_type not in puck_blocks:
                    candidates_missing.add(candidate_type)
    return {
        "status": "ok" if not missing_in_puck else "missing",
        "coverage_ratio": coverage_ratio,
        "sections": len(used_blocks),
        "mapped_blocks": sorted(used_set),
        "puck_blocks": sorted(puck_blocks),
        "missing_in_puck": missing_in_puck,
        "unused_puck": unused_puck,
        "candidates_missing": sorted(candidates_missing),
    }


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _normalize_path(value: str) -> str:
    if not value:
        return ""
    path = value.split("#", 1)[0].split("?", 1)[0]
    return path.strip()


def _collect_links(sections: list[dict]) -> list[dict]:
    links: list[dict] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        props = section.get("props") if isinstance(section.get("props"), dict) else {}
        content = section.get("content") if isinstance(section.get("content"), dict) else {}
        section_id = props.get("id") or section.get("type") or "section"
        for button in content.get("buttons") or []:
            if isinstance(button, dict):
                links.append(
                    {
                        "label": button.get("label") or "",
                        "href": button.get("href") or "",
                        "source": "content_button",
                        "section_id": section_id,
                    }
                )
        for link in content.get("links") or []:
            if isinstance(link, dict):
                links.append(
                    {
                        "label": link.get("label") or "",
                        "href": link.get("href") or "",
                        "source": "content_link",
                        "section_id": section_id,
                    }
                )
        ctas = props.get("ctas")
        if isinstance(ctas, list):
            for cta in ctas:
                if isinstance(cta, dict):
                    links.append(
                        {
                            "label": cta.get("label") or "",
                            "href": cta.get("href") or "",
                            "source": "props_cta",
                            "section_id": section_id,
                        }
                    )
        cta = props.get("cta")
        if isinstance(cta, dict):
            links.append(
                {
                    "label": cta.get("label") or "",
                    "href": cta.get("href") or "",
                    "source": "props_cta",
                    "section_id": section_id,
                }
            )
        for link in props.get("links") or []:
            if isinstance(link, dict):
                links.append(
                    {
                        "label": link.get("label") or "",
                        "href": link.get("href") or "",
                        "source": "props_link",
                        "section_id": section_id,
                    }
                )
    return links


def _linker_report(sections_data: dict, site_plan: dict, domain: str) -> dict:
    sections = sections_data.get("sections", []) if isinstance(sections_data, dict) else []
    anchors: set[str] = set()
    for section in sections:
        if not isinstance(section, dict):
            continue
        props = section.get("props") if isinstance(section.get("props"), dict) else {}
        anchor = props.get("anchor")
        if isinstance(anchor, str) and anchor:
            anchors.add(anchor)
        section_id = props.get("id")
        if isinstance(section_id, str) and section_id:
            anchors.add(section_id)
        source = section.get("source")
        if isinstance(source, str) and source:
            anchors.add(_slugify(source))
    routes: set[str] = set()
    for page in site_plan.get("pages", []) if isinstance(site_plan, dict) else []:
        if not isinstance(page, dict):
            continue
        slug = page.get("slug")
        if isinstance(slug, str) and slug:
            routes.add(slug)
            routes.add(f"/{slug}")
        url = page.get("url")
        if isinstance(url, str) and url:
            parsed = urlparse(url)
            path = _normalize_path(parsed.path)
            if path:
                routes.add(path)
                routes.add(path.lstrip("/"))
    links = _collect_links(sections)
    issues: list[dict] = []
    totals = {
        "total": len(links),
        "missing_href": 0,
        "invalid_anchor": 0,
        "unknown_route": 0,
        "invalid_href": 0,
    }
    for link in links:
        href = str(link.get("href") or "").strip()
        if not href:
            totals["missing_href"] += 1
            issues.append({**link, "issue": "missing_href"})
            continue
        if href in {"#", "/#"} or href.startswith("javascript:"):
            totals["invalid_href"] += 1
            issues.append({**link, "issue": "invalid_href"})
            continue
        if href.startswith(("mailto:", "tel:", "sms:")):
            continue
        if href.startswith("#"):
            anchor = href[1:]
            if anchor not in anchors:
                totals["invalid_anchor"] += 1
                issues.append({**link, "issue": "invalid_anchor"})
            continue
        parsed = urlparse(href)
        if parsed.scheme in {"http", "https"}:
            if parsed.netloc and parsed.netloc != domain and not parsed.netloc.endswith(domain):
                continue
            path = _normalize_path(parsed.path)
            if not path:
                continue
            normalized = path.lstrip("/") or "home"
            if routes and normalized not in routes and f"/{normalized}" not in routes and path not in routes:
                totals["unknown_route"] += 1
                issues.append({**link, "issue": "unknown_route"})
            continue
        path = _normalize_path(href)
        normalized = path.lstrip("/") or "home"
        if routes and normalized not in routes and f"/{normalized}" not in routes and path not in routes:
            totals["unknown_route"] += 1
            issues.append({**link, "issue": "unknown_route"})
    status = "ok" if not issues else "issues"
    return {
        "status": status,
        "totals": totals,
        "anchors": sorted(anchors),
        "routes": sorted(routes),
        "issues": issues,
    }


def _structure_score(sections: list[dict], layout_schema: list[str]) -> float:
    if not sections:
        return 0.0
    labels = layout_schema or _infer_layout_schema(sections)
    present = set(labels)
    required = ["Hero", "Features", "CTA", "Footer"]
    features_present = any(label in {"Features", "Proof", "Pricing", "FAQ"} for label in present)
    coverage = 0
    for req in required:
        if req == "Features":
            coverage += 1 if features_present else 0
        else:
            coverage += 1 if req in present else 0
    base = coverage / len(required)
    total = len(sections)
    bonus = 0.05 if 4 <= total <= 12 else 0.0
    return min(1.0, round(base + bonus, 3))


def _adaptability_score(sections: list[dict]) -> float:
    if not sections:
        return 0.0
    scored = 0
    overflow = 0
    for section in sections:
        if not isinstance(section, dict):
            continue
        constraints = section.get("content_constraints") or {}
        if isinstance(constraints, dict) and constraints:
            scored += 1
        tolerance = section.get("tolerance") or {}
        if isinstance(tolerance, dict) and tolerance.get("overflow_risk"):
            overflow += 1
    base = scored / len(sections)
    penalty = 0.1 * (overflow / len(sections))
    return max(0.0, round(base - penalty, 3))


def _intent_tag_score(sections: list[dict]) -> float:
    if not sections:
        return 0.0
    tags: set[str] = set()
    for section in sections:
        intent_tags = section.get("intent_tags")
        if isinstance(intent_tags, list):
            tags.update([tag for tag in intent_tags if isinstance(tag, str)])
        intent = section.get("intent")
        if isinstance(intent, str) and intent:
            tags.add(intent)
    if not tags:
        return 0.0
    required = ["product_story", "feature_explain", "conversion", "trust"]
    coverage = sum(1 for tag in required if tag in tags) / len(required)
    diversity = min(1.0, len(tags) / 6)
    score = 0.7 * coverage + 0.3 * diversity
    return min(1.0, round(score, 3))


def _reusability_score(sections: list[dict]) -> float:
    if not sections:
        return 0.0
    constraints = 0
    overflow = 0
    dynamic_height = 0
    cta_heavy = 0
    for section in sections:
        if isinstance(section.get("content_constraints"), dict) and section.get(
            "content_constraints"
        ):
            constraints += 1
        tolerance = section.get("tolerance") or {}
        if isinstance(tolerance, dict):
            if tolerance.get("overflow_risk"):
                overflow += 1
            if tolerance.get("dynamic_height"):
                dynamic_height += 1
            if tolerance.get("cta_heavy"):
                cta_heavy += 1
    base = constraints / len(sections)
    penalty = (
        0.15 * (overflow / len(sections))
        + 0.1 * (dynamic_height / len(sections))
        + 0.1 * (cta_heavy / len(sections))
    )
    bonus = 0.05 if 4 <= len(sections) <= 12 else 0.0
    return max(0.0, min(1.0, round(base - penalty + bonus, 3)))


def _style_transfer_score(tokens: dict) -> float:
    colors = tokens.get("colors") if isinstance(tokens, dict) else {}
    typography = tokens.get("typography") if isinstance(tokens, dict) else {}
    base = (1 if colors else 0) + (1 if typography else 0)
    radius = 1 if tokens.get("radius") else 0
    score = (base + 0.5 * radius) / 2.5 if tokens else 0.0
    return round(min(score, 1.0), 3)


def _similarity_score(diff_payload: dict | None) -> float | None:
    if not diff_payload or not isinstance(diff_payload, dict):
        return None
    similarity = diff_payload.get("similarity")
    if isinstance(similarity, (int, float)):
        return round(max(0.0, min(1.0, float(similarity))), 3)
    mismatch_percent = diff_payload.get("mismatchPercent")
    if not isinstance(mismatch_percent, (int, float)):
        return None
    return round(max(0.0, 1.0 - float(mismatch_percent)), 3)


def verify_outputs(
    domain: str, output_root: Path, page_slug: str | None = None
) -> dict:
    site_dir = output_root / domain
    page_slug = page_slug or "home"
    capture_dir = site_dir / "capture" / page_slug
    theme_dir = site_dir / "theme"
    pages_dir = site_dir / "pages" / page_slug

    report = {
        "domain": domain,
        "files": {
            "screenshot": str(capture_dir / "full.png"),
            "dom": str(capture_dir / "dom.json"),
            "sections": str(capture_dir / "sections.json"),
            "tokens": str(theme_dir / "tokens.json"),
            "theme": str(theme_dir / "theme.css"),
            "page": str(pages_dir / "page.json"),
            "visual_qa_desktop": str(
                VISUAL_QA_OUT / domain / "visual-qa" / "desktop" / "report.json"
            ),
            "visual_qa_mobile": str(
                VISUAL_QA_OUT / domain / "visual-qa" / "mobile" / "report.json"
            ),
        },
        "status": {},
        "visual_regression": {"status": "skipped"},
        "classification": {},
    }

    for key, path in report["files"].items():
        report["status"][key] = Path(path).exists()

    base = Path(report["files"]["screenshot"])
    visual_reports: dict[str, dict] = {}
    visual_similarities: list[float] = []
    for viewport in ["desktop", "mobile"]:
        report_path = VISUAL_QA_OUT / domain / "visual-qa" / viewport / "report.json"
        if report_path.exists():
            payload = json.loads(report_path.read_text(encoding="utf-8"))
            visual_reports[viewport] = payload
            similarity = payload.get("similarity")
            if isinstance(similarity, (int, float)):
                visual_similarities.append(float(similarity))

    if visual_similarities:
        avg_similarity = round(
            sum(visual_similarities) / len(visual_similarities), 3
        )
        report["visual_regression"] = {
            "status": "complete",
            "source": "visual-qa",
            "reports": visual_reports,
            "result": {
                "similarity": avg_similarity,
                "viewports": {
                    key: value.get("similarity")
                    for key, value in visual_reports.items()
                },
            },
        }
    else:
        report["visual_regression"] = {
            "status": "skipped",
            "source": "visual-qa",
            "reason": "visual_qa_report_missing",
        }

    sections_path = Path(report["files"]["sections"])
    sections_data = {}
    sections_list: list[dict] = []
    layout_schema: list[str] = []
    if sections_path.exists():
        sections_data = json.loads(sections_path.read_text(encoding="utf-8"))
        sections_list = sections_data.get("sections", [])
        sections_count = len(sections_list)
        layout_schema = sections_data.get("layout_schema", []) or []
    else:
        sections_count = 0
    site_plan_path = site_dir / "site_plan.json"
    site_plan = {}
    if site_plan_path.exists():
        site_plan = json.loads(site_plan_path.read_text(encoding="utf-8"))
    extract_path = site_dir / "extract" / "extract.json"
    extract_data = {}
    if extract_path.exists():
        extract_data = json.loads(extract_path.read_text(encoding="utf-8"))
    content_assets = sections_data.get("content_assets") or extract_data.get(
        "content_assets"
    ) or {}

    report["classification"] = {
        "structure": {
            "sections": sections_count,
            "status": "ok" if sections_count > 0 else "missing",
        },
        "tokens": {
            "status": "ok" if Path(report["files"]["tokens"]).exists() else "missing",
        },
        "assets": {
            "status": "ok"
            if Path(report["files"]["screenshot"]).exists()
            else "missing"
        },
    }

    mapped_sections_path = pages_dir / "sections.json"
    report["block_coverage"] = _block_coverage(mapped_sections_path)
    report["linker"] = _linker_report(sections_data, site_plan, domain)
    report["content_assets"] = content_assets

    tokens_path = Path(report["files"]["tokens"])
    if tokens_path.exists():
        tokens = json.loads(tokens_path.read_text(encoding="utf-8"))
        colors = tokens.get("colors", {})
        bg = colors.get("background")
        fg = colors.get("foreground")
        primary = colors.get("primary")
        bg_fg = _contrast_ratio(bg, fg) if bg and fg else None
        bg_primary = _contrast_ratio(bg, primary) if bg and primary else None
        report["aesthetics"] = {
            "contrast": {
                "bg_fg": bg_fg,
                "bg_primary": bg_primary,
                "status": "ok"
                if (bg_fg or 0) >= 4.5 and (bg_primary or 0) >= 3
                else "low",
            }
        }

    similarity = _similarity_score(report["visual_regression"].get("result"))
    structure_score = _structure_score(sections_list, layout_schema)
    adaptability_score = _adaptability_score(sections_list)
    intent_tag_score = _intent_tag_score(sections_list)
    reusability_score = _reusability_score(sections_list)
    style_transfer = _style_transfer_score(tokens if tokens_path.exists() else {})
    thresholds = {
        "similarity": 0.75,
        "structure_score": 0.8,
        "adaptability_score": 0.7,
        "intent_tag_score": 0.6,
        "reusability_score": 0.65,
        "style_transfer": 0.7,
    }
    report["library_scores"] = {
        "similarity": similarity,
        "structure_score": structure_score,
        "adaptability_score": adaptability_score,
        "intent_tag_score": intent_tag_score,
        "reusability_score": reusability_score,
        "style_transfer": style_transfer,
        "thresholds": thresholds,
    }
    report["library_gate"] = {
        "similarity": similarity is not None and similarity >= thresholds["similarity"],
        "structure_score": structure_score >= thresholds["structure_score"],
        "adaptability_score": adaptability_score >= thresholds["adaptability_score"],
        "intent_tag_score": intent_tag_score >= thresholds["intent_tag_score"],
        "reusability_score": reusability_score >= thresholds["reusability_score"],
        "style_transfer": style_transfer >= thresholds["style_transfer"],
        "status": "pass"
        if (
            similarity is not None
            and similarity >= thresholds["similarity"]
            and structure_score >= thresholds["structure_score"]
            and adaptability_score >= thresholds["adaptability_score"]
            and intent_tag_score >= thresholds["intent_tag_score"]
            and reusability_score >= thresholds["reusability_score"]
            and style_transfer >= thresholds["style_transfer"]
        )
        else "fail",
    }

    report_path = site_dir / "reports" / f"{page_slug}.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify asset-factory outputs")
    parser.add_argument("--domain", required=True, help="Site domain key")
    parser.add_argument(
        "--output",
        default=str(REPO_ROOT / "asset-factory" / "out"),
        help="Asset-factory output root",
    )
    parser.add_argument("--page", default="home", help="Page slug")
    args = parser.parse_args()

    report = verify_outputs(args.domain, Path(args.output), page_slug=args.page)
    report_path = (
        Path(args.output) / args.domain / "reports" / f"{args.page}.json"
    )
    print(
        json.dumps(
            {"domain": report.get("domain"), "report": str(report_path)},
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()

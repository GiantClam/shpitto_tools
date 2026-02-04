"""Website quality checklist evaluator.

Evaluates crawled website data and generated templates against
visual, content, UX, technical, and marketing criteria.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path


@dataclass
class ChecklistResult:
    site: str
    score: int
    max_score: int
    passed: int
    total: int
    details: list[dict]


def load_crawled_data(crawled_dir: Path) -> list[dict]:
    crawled = []
    for file_path in crawled_dir.glob("*.json"):
        if file_path.name == ".json":
            continue
        with file_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict) and data.get("error"):
            continue
        crawled.append(data)
    return crawled


def load_templates(templates_file: Path) -> list[dict]:
    if not templates_file.exists():
        return []
    with templates_file.open("r", encoding="utf-8") as f:
        return json.load(f)


def get_homepage(pages: list[dict]) -> dict | None:
    for page in pages:
        if page.get("page_type") in {"home", "landing"}:
            return page
    return pages[0] if pages else None


def has_keywords(texts: list[str], keywords: list[str]) -> bool:
    combined = " ".join([t.lower() for t in texts if t])
    return any(keyword in combined for keyword in keywords)


def evaluate_site(site_data: dict) -> ChecklistResult:
    pages = site_data.get("pages", [])
    homepage = get_homepage(pages)
    details: list[dict] = []

    def add_check(dimension: str, label: str, passed: bool, note: str) -> None:
        details.append(
            {
                "dimension": dimension,
                "check": label,
                "passed": passed,
                "note": note,
            }
        )

    # Visual & Branding
    if homepage:
        hero_sections = [
            s for s in homepage.get("content_structure", []) if s.get("type") == "hero"
        ]
        has_value_prop = bool(homepage.get("h1")) or bool(hero_sections)
        add_check(
            "visual",
            "Value proposition in hero",
            has_value_prop,
            "Hero section or H1 found" if has_value_prop else "Missing hero/H1",
        )

        colors = homepage.get("visual_features", {}).get("colors", {})
        fonts = homepage.get("visual_features", {}).get("fonts", {})
        has_branding = bool(colors.get("accent")) and bool(fonts.get("heading_font"))
        add_check(
            "visual",
            "Consistent branding colors/fonts",
            has_branding,
            "Colors and fonts detected" if has_branding else "Missing colors/fonts",
        )

        images = homepage.get("images", [])
        alt_ratio = 0
        if images:
            alt_count = sum(1 for img in images if img.get("alt"))
            alt_ratio = alt_count / len(images)
        has_quality_images = len(images) >= 3 and alt_ratio >= 0.5
        add_check(
            "visual",
            "High quality imagery",
            has_quality_images,
            f"Images: {len(images)}, alt ratio: {alt_ratio:.0%}"
            if images
            else "No images detected",
        )

    # Content & Trust
    for page in pages:
        if page.get("page_type") == "about":
            add_check("content", "About page present", True, "About page found")
            break
    else:
        add_check("content", "About page present", False, "No about page")

    has_features = any(
        s.get("type") == "features"
        for page in pages
        for s in page.get("content_structure", [])
    )
    add_check(
        "content",
        "Product/service details",
        has_features,
        "Features section found" if has_features else "Missing features section",
    )

    has_social_proof = any(
        s.get("type") == "testimonials"
        for page in pages
        for s in page.get("content_structure", [])
    )
    add_check(
        "content",
        "Social proof present",
        has_social_proof,
        "Testimonials section found" if has_social_proof else "Missing testimonials",
    )

    has_blog = any(page.get("page_type") == "blog" for page in pages)
    add_check(
        "content",
        "Dynamic content (blog/news)",
        has_blog,
        "Blog page found" if has_blog else "No blog page detected",
    )

    # UX & Interaction
    if homepage:
        nav_links = homepage.get("links", [])
        has_nav = len(nav_links) >= 3
        add_check(
            "ux",
            "Navigation depth",
            has_nav,
            f"Navigation links: {len(nav_links)}",
        )

        ctas = homepage.get("ctas", [])
        has_cta = len(ctas) >= 1
        add_check(
            "ux",
            "CTA visibility",
            has_cta,
            f"CTA count: {len(ctas)}",
        )

        has_contact = (
            any("contact" in (link.get("text", "").lower()) for link in nav_links)
            or homepage.get("form_count", 0) > 0
        )
        add_check(
            "ux",
            "Contact entry point",
            has_contact,
            "Contact link/form found" if has_contact else "Missing contact entry",
        )

        has_chat = homepage.get("has_chat_widget", False)
        add_check(
            "ux",
            "Chat or instant support",
            has_chat,
            "Chat widget detected" if has_chat else "No chat widget",
        )

    # Technical SEO & Performance
    base_url = site_data.get("base_url", "")
    has_https = base_url.startswith("https://")
    add_check(
        "technical",
        "HTTPS enabled",
        has_https,
        base_url or "Missing base URL",
    )

    if homepage:
        has_description = bool(homepage.get("description"))
        add_check(
            "technical",
            "Meta description",
            has_description,
            "Meta description present"
            if has_description
            else "Missing meta description",
        )

        has_heading_structure = bool(homepage.get("h1")) and bool(
            homepage.get("headings", {}).get("h2")
        )
        add_check(
            "technical",
            "Heading hierarchy",
            has_heading_structure,
            "H1 + H2 present" if has_heading_structure else "Missing heading levels",
        )

        images = homepage.get("images", [])
        alt_ratio = 0
        if images:
            alt_ratio = sum(1 for img in images if img.get("alt")) / len(images)
        has_alt = alt_ratio >= 0.5
        add_check(
            "technical",
            "Image alt coverage",
            has_alt,
            f"Alt ratio: {alt_ratio:.0%}" if images else "No images",
        )

    # Marketing & Analytics
    if homepage:
        has_analytics = homepage.get("has_analytics", False)
        add_check(
            "marketing",
            "Analytics tracking",
            has_analytics,
            "Analytics detected" if has_analytics else "No analytics",
        )

        has_form = homepage.get("form_count", 0) > 0
        add_check(
            "marketing",
            "Lead capture form",
            has_form,
            f"Form count: {homepage.get('form_count', 0)}",
        )

        nav_links = homepage.get("links", [])
        has_privacy = any(
            "privacy" in (link.get("text", "").lower()) for link in nav_links
        )
        add_check(
            "marketing",
            "Privacy policy link",
            has_privacy,
            "Privacy link found" if has_privacy else "No privacy link",
        )

    passed = sum(1 for d in details if d["passed"])
    total = len(details)
    score = int((passed / total) * 100) if total else 0

    return ChecklistResult(
        site=site_data.get("domain", "unknown"),
        score=score,
        max_score=100,
        passed=passed,
        total=total,
        details=details,
    )


def summarize_templates(templates: list[dict]) -> dict:
    component_counts = {}
    template_count = len(templates)
    for template in templates:
        content = template.get("puck_data", {}).get("content", [])
        for block in content:
            if not block:
                continue
            name = block.get("type") or block.get("component")
            if not name:
                continue
            component_counts[name] = component_counts.get(name, 0) + 1

    key_components = [
        "Hero",
        "ValuePropositions",
        "Feature",
        "FeatureGrid",
        "Testimonials",
        "CTASection",
        "CTA",
        "Stats",
        "Pricing",
        "FAQ",
        "Logos",
        "Team",
        "Blog",
    ]

    coverage = {name: component_counts.get(name, 0) for name in key_components}

    return {
        "total_templates": template_count,
        "component_counts": component_counts,
        "key_component_coverage": coverage,
    }


def run_quality_checklist(crawled_dir: Path, templates_file: Path) -> dict:
    crawled_data = load_crawled_data(crawled_dir)
    templates = load_templates(templates_file)

    results = [evaluate_site(site) for site in crawled_data]
    report = {
        "sites": [
            {
                "site": result.site,
                "score": result.score,
                "passed": result.passed,
                "total": result.total,
                "details": result.details,
            }
            for result in results
        ],
        "summary": {
            "sites_checked": len(results),
            "average_score": (
                sum(r.score for r in results) / len(results) if results else 0
            ),
        },
        "templates": summarize_templates(templates),
    }

    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Run website quality checklist")
    parser.add_argument(
        "--crawled-dir",
        type=str,
        default="/Users/beihuang/Documents/opencode/shpitto/output/crawled",
    )
    parser.add_argument(
        "--templates-file",
        type=str,
        default="/Users/beihuang/Documents/opencode/shpitto/output/templates/crawled_templates.json",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="/Users/beihuang/Documents/opencode/shpitto/output/reports/quality_report.json",
    )
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    report = run_quality_checklist(Path(args.crawled_dir), Path(args.templates_file))

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    avg_score = report["summary"]["average_score"]
    print(f"Quality report saved to {output_path}")
    print(f"Sites checked: {report['summary']['sites_checked']}")
    print(f"Average score: {avg_score:.1f}")


if __name__ == "__main__":
    main()

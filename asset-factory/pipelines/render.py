from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright


def _render_block_html(block: dict) -> str:
    block_type = block.get("type", "")
    props = block.get("props", {})
    title = props.get("title", "")
    subtitle = props.get("subtitle", "")
    items = props.get("items", [])
    ctas = props.get("ctas", [])
    if block_type.startswith("Hero"):
        buttons = "".join(
            f"<a class='btn {cta.get('variant', 'primary')}' href='{cta.get('href', '#')}'>{cta.get('label', '')}</a>"
            for cta in ctas
        )
        return f"<section class='hero'><h1>{title}</h1><p>{subtitle}</p>{buttons}</section>"
    if block_type.startswith("FeatureGrid"):
        cards = "".join(
            f"<div class='card'><h3>{item.get('title', '')}</h3><p>{item.get('desc', '')}</p></div>"
            for item in items
        )
        return f"<section class='features'><h2>{title}</h2><div class='grid'>{cards}</div></section>"
    if block_type.startswith("CardsGrid"):
        cards = "".join(
            f"<div class='card'><h3>{item.get('title', '')}</h3><p>{item.get('description', '') or item.get('subtitle', '')}</p></div>"
            for item in items
        )
        return f"<section class='features'><h2>{title}</h2><div class='grid'>{cards}</div></section>"
    if block_type.startswith("Pricing"):
        plans = props.get("plans", [])
        cards = "".join(
            f"<div class='card'><h3>{plan.get('name', '')}</h3><p class='price'>{plan.get('price', '')}</p></div>"
            for plan in plans
        )
        return f"<section class='pricing'><h2>{title}</h2><div class='grid'>{cards}</div></section>"
    if block_type.startswith("FAQ"):
        questions = props.get("items", [])
        items_html = "".join(
            f"<div class='faq-item'><h3>{item.get('q', '')}</h3><p>{item.get('a', '')}</p></div>"
            for item in questions
        )
        return f"<section class='faq'><h2>{title}</h2>{items_html}</section>"
    if block_type.startswith("Footer"):
        return f"<footer class='footer'>{props.get('legal', '')}</footer>"
    return f"<section class='section'><h2>{title}</h2><p>{subtitle}</p></section>"


def _build_html(page_data: dict, tokens: dict) -> str:
    blocks = page_data.get("content", [])
    colors = tokens.get("colors", {})
    background = colors.get("background", "0 0% 100%")
    foreground = colors.get("foreground", "222 47% 11%")
    primary = colors.get("primary", "221 83% 53%")

    css = f"""
    :root {{
      --background: {background};
      --foreground: {foreground};
      --primary: {primary};
    }}
    body {{
      font-family: 'Inter', sans-serif;
      margin: 0;
      color: hsl(var(--foreground));
      background: hsl(var(--background));
    }}
    .hero, .features, .pricing, .faq, .section {{ padding: 64px 80px; }}
    .grid {{ display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }}
    .card {{ padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; }}
    .btn.primary {{ background: hsl(var(--primary)); color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; margin-right: 8px; }}
    .btn.secondary {{ border: 1px solid hsl(var(--primary)); color: hsl(var(--primary)); padding: 10px 18px; border-radius: 8px; text-decoration: none; }}
    .footer {{ padding: 40px 80px; border-top: 1px solid #e2e8f0; }}
    """

    body = "".join(_render_block_html(block) for block in blocks)
    return f"<html><head><style>{css}</style></head><body>{body}</body></html>"


def render_page(output_root: Path, domain: str, page_slug: str) -> Path | None:
    page_path = output_root / domain / "pages" / page_slug / "page.json"
    tokens_path = output_root / domain / "theme" / "tokens.json"
    if not page_path.exists() or not tokens_path.exists():
        return None

    page_data = json.loads(page_path.read_text(encoding="utf-8"))
    tokens = json.loads(tokens_path.read_text(encoding="utf-8"))
    html = _build_html(page_data, tokens)

    render_dir = output_root / domain / "rendered"
    render_dir.mkdir(parents=True, exist_ok=True)
    output_path = render_dir / f"{page_slug}.png"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.set_content(html, wait_until="load")
        page.wait_for_timeout(500)
        page.screenshot(path=str(output_path), full_page=True)
        browser.close()

    return output_path

from __future__ import annotations

import re
from typing import Any


CTA_PHRASES = [
    "get started",
    "book a demo",
    "request demo",
    "contact",
    "contact us",
    "buy now",
    "start free",
    "free trial",
    "立即",
    "咨询",
    "预约",
]


def _has_price_pattern(text: str) -> bool:
    return bool(re.search(r"[$¥€]\s?\d+|/mo|/yr|per month|monthly|年付|月付", text))


def _has_stats_pattern(text: str) -> bool:
    return bool(re.search(r"\d+%|\d+x|\d+k|\d+,\d+", text))


def _score(reason: str, points: int, reasons: list[str]) -> int:
    reasons.append(f"{reason}:{points}")
    return points


def _score_hero(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["above_the_fold"]:
        score += _score("above_the_fold", 20, reasons)
    if signals["has_h1"]:
        score += _score("has_h1", 25, reasons)
    if signals["has_cta_phrase"]:
        score += _score("cta_phrase", 15, reasons)
    if signals["link_density"] > 0.08:
        score -= _score("high_link_density", -25, reasons)
    if signals["has_price_pattern"]:
        score -= _score("price_pattern", -15, reasons)
    return score


def _score_logo_cloud(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["img_count"] >= 6:
        score += _score("img_count", 25, reasons)
    if signals["text_len"] < 200:
        score += _score("low_text", 10, reasons)
    if signals["near_hero"]:
        score += _score("near_hero", 10, reasons)
    return score


def _score_testimonials(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_quote_pattern"]:
        score += _score("quote_pattern", 20, reasons)
    if signals["grid_like"]:
        score += _score("grid_like", 15, reasons)
    if signals.get("card_count", 0) >= 3 and signals.get("img_count", 0) >= 3:
        score += _score("card_like", 10, reasons)
    return score


def _score_ratings(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_rating_pattern"]:
        score += _score("rating_pattern", 30, reasons)
    return score


def _score_case_studies(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_case_pattern"]:
        score += _score("case_pattern", 20, reasons)
    if signals["grid_like"]:
        score += _score("grid_like", 10, reasons)
    if signals.get("card_count", 0) >= 3 and signals.get("img_count", 0) >= 2:
        score += _score("card_like", 10, reasons)
    return score


def _score_feature_grid(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["grid_like"]:
        score += _score("grid_like", 25, reasons)
    if signals["repeat_items"]:
        score += _score("repeat_items", 15, reasons)
    if signals.get("card_count", 0) >= 3:
        score += _score("card_count", 15, reasons)
    return score


def _score_cards_grid(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["grid_like"]:
        score += _score("grid_like", 20, reasons)
    if signals.get("card_count", 0) >= 3:
        score += _score("card_count", 25, reasons)
    if signals.get("img_count", 0) >= 2:
        score += _score("img_count", 10, reasons)
    if signals["repeat_items"]:
        score += _score("repeat_items", 10, reasons)
    return score


def _score_feature_media(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_media"]:
        score += _score("media", 25, reasons)
    if signals["has_points"]:
        score += _score("points", 15, reasons)
    if signals["two_column_like"]:
        score += _score("two_column", 10, reasons)
    return score


def _score_steps(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_step_pattern"]:
        score += _score("step_pattern", 20, reasons)
    if signals["repeat_items"]:
        score += _score("repeat_items", 10, reasons)
    return score


def _score_stats(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_stats_pattern"]:
        score += _score("stats_pattern", 25, reasons)
    return score


def _score_integrations(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_integrations_pattern"]:
        score += _score("integrations_pattern", 20, reasons)
    if signals["grid_like"]:
        score += _score("grid_like", 10, reasons)
    return score


def _score_comparison(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_table"]:
        score += _score("table", 25, reasons)
    if signals["has_compare_pattern"]:
        score += _score("compare_pattern", 10, reasons)
    return score


def _score_use_cases(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_use_cases_pattern"]:
        score += _score("use_cases_pattern", 15, reasons)
    return score


def _score_pricing(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_price_pattern"]:
        score += _score("price_pattern", 30, reasons)
    if signals["grid_like"]:
        score += _score("grid_like", 15, reasons)
    if signals["has_toggle_pattern"]:
        score += _score("toggle", 15, reasons)
    return score


def _score_plan_compare(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_table"]:
        score += _score("table", 25, reasons)
    if signals["has_compare_pattern"]:
        score += _score("compare_pattern", 15, reasons)
    return score


def _score_faq(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_faq_pattern"]:
        score += _score("faq", 20, reasons)
    if signals["has_accordion_pattern"]:
        score += _score("accordion", 25, reasons)
    return score


def _score_support(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_support_pattern"]:
        score += _score("support", 20, reasons)
    if signals["link_density"] > 0.04:
        score += _score("link_density", 10, reasons)
    return score


def _score_contact(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_contact_pattern"]:
        score += _score("contact", 20, reasons)
    if signals["has_form"]:
        score += _score("form", 25, reasons)
    return score


def _score_footer(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["has_footer_tag"]:
        score += _score("footer_tag", 60, reasons)
    if signals["near_bottom"]:
        score += _score("near_bottom", 25, reasons)
    if signals["link_density"] > 0.08:
        score += _score("link_density", 25, reasons)
    if signals["has_footer_pattern"]:
        score += _score("footer_pattern", 15, reasons)
    return score


def _score_navbar(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["near_top"]:
        score += _score("near_top", 20, reasons)
    if signals["link_density"] > 0.05:
        score += _score("link_density", 15, reasons)
    if signals["section_height"] < 160:
        score += _score("short_height", 10, reasons)
    return score


def _score_announcement(signals: dict, reasons: list[str]) -> int:
    score = 0
    if signals["near_top"] and signals["section_height"] < 80:
        score += _score("banner_height", 30, reasons)
    if signals["text_len"] < 120:
        score += _score("short_text", 10, reasons)
    return score


def _build_signals(section: dict, context: dict) -> dict:
    text = context.get("text", "").lower()
    layout = section.get("layout", {})
    viewport_height = context.get("viewport_height", 900)
    index = context.get("index", 0)
    total = context.get("total", 1)

    text_len = len(text)
    links = len(re.findall(r"https?://", text))
    link_density = links / max(text_len, 1)
    above_the_fold = layout.get("top", 0) < viewport_height * 0.9
    near_bottom = index >= max(total - 2, 0)
    near_top = index == 0
    has_cta_phrase = any(phrase in text for phrase in CTA_PHRASES)
    has_faq = "faq" in text or "常见问题" in text or "question" in text
    has_quote = '"' in text or "“" in text or "testimonial" in text
    has_rating = "★★★★★" in text or "trustpilot" in text or "reviews" in text
    has_case = "case study" in text or "案例" in text
    has_integrations = "integration" in text or "集成" in text
    has_compare = "comparison" in text or "compare" in text
    has_use_cases = "use case" in text or "场景" in text
    has_step = "step" in text or "步骤" in text or "流程" in text
    has_support = "docs" in text or "documentation" in text or "支持" in text
    has_contact = "contact" in text or "联系我们" in text
    has_footer = "privacy" in text or "terms" in text or "©" in text
    has_form = "form" in text or "email" in text or "phone" in text
    grid_like = context.get("grid_like", False)
    repeat_items = context.get("repeat_items", False)
    has_media = context.get("has_media", False)
    has_points = context.get("has_points", False)
    two_column_like = context.get("two_column_like", False)

    return {
        "text_len": text_len,
        "link_density": link_density,
        "above_the_fold": above_the_fold,
        "near_bottom": near_bottom,
        "near_top": near_top,
        "section_height": layout.get("height", 0),
        "has_h1": context.get("has_h1", False),
        "has_cta_phrase": has_cta_phrase,
        "has_price_pattern": _has_price_pattern(text),
        "has_faq_pattern": has_faq,
        "has_quote_pattern": has_quote,
        "has_rating_pattern": has_rating,
        "has_case_pattern": has_case,
        "has_integrations_pattern": has_integrations,
        "has_compare_pattern": has_compare,
        "has_use_cases_pattern": has_use_cases,
        "has_step_pattern": has_step,
        "has_support_pattern": has_support,
        "has_contact_pattern": has_contact,
        "has_footer_pattern": has_footer,
        "has_footer_tag": context.get("has_footer_tag", False),
        "has_form": has_form,
        "has_accordion_pattern": "accordion" in text,
        "has_stats_pattern": _has_stats_pattern(text),
        "has_table": "table" in text,
        "has_toggle_pattern": "monthly" in text or "yearly" in text,
        "grid_like": grid_like,
        "repeat_items": repeat_items,
        "has_media": has_media,
        "has_points": has_points,
        "two_column_like": two_column_like,
        "img_count": context.get("img_count", 0),
        "card_count": context.get("card_count", 0),
        "near_hero": context.get("near_hero", False),
    }


def classify_section(section: dict, context: dict) -> dict:
    signals = _build_signals(section, context)
    candidates = []

    def add_candidate(
        block_type: str, score: int, reasons: list[str], family: str
    ) -> None:
        candidates.append(
            {"type": block_type, "score": score, "reasons": reasons, "family": family}
        )

    reasons: list[str] = []
    add_candidate("HeroCentered.v1", _score_hero(signals, reasons), reasons, "Hero")

    reasons = []
    add_candidate("LogoCloud.v1", _score_logo_cloud(signals, reasons), reasons, "Proof")

    reasons = []
    add_candidate(
        "TestimonialsGrid.v1", _score_testimonials(signals, reasons), reasons, "Proof"
    )

    reasons = []
    add_candidate(
        "RatingsSummary.v1", _score_ratings(signals, reasons), reasons, "Proof"
    )

    reasons = []
    add_candidate(
        "CaseStudies.v1", _score_case_studies(signals, reasons), reasons, "Proof"
    )

    reasons = []
    add_candidate(
        "FeatureGrid.v1", _score_feature_grid(signals, reasons), reasons, "Feature"
    )

    reasons = []
    add_candidate(
        "CardsGrid.v1", _score_cards_grid(signals, reasons), reasons, "Feature"
    )

    reasons = []
    add_candidate(
        "FeatureWithMedia.v1",
        _score_feature_media(signals, reasons),
        reasons,
        "Feature",
    )

    reasons = []
    add_candidate(
        "StepsTimeline.v1", _score_steps(signals, reasons), reasons, "Feature"
    )

    reasons = []
    add_candidate("StatsKPI.v1", _score_stats(signals, reasons), reasons, "Feature")

    reasons = []
    add_candidate(
        "IntegrationsGrid.v1", _score_integrations(signals, reasons), reasons, "Feature"
    )

    reasons = []
    add_candidate(
        "ComparisonTable.v1", _score_comparison(signals, reasons), reasons, "Feature"
    )

    reasons = []
    add_candidate("UseCases.v1", _score_use_cases(signals, reasons), reasons, "Feature")

    reasons = []
    add_candidate(
        "PricingCards.v1", _score_pricing(signals, reasons), reasons, "Pricing"
    )

    reasons = []
    add_candidate(
        "PlanComparison.v1", _score_plan_compare(signals, reasons), reasons, "Pricing"
    )

    reasons = []
    add_candidate("FAQAccordion.v1", _score_faq(signals, reasons), reasons, "FAQ")

    reasons = []
    add_candidate(
        "SupportLinks.v1", _score_support(signals, reasons), reasons, "Support"
    )

    reasons = []
    add_candidate(
        "ContactSection.v1", _score_contact(signals, reasons), reasons, "Contact"
    )

    reasons = []
    add_candidate("Footer.v1", _score_footer(signals, reasons), reasons, "Skeleton")

    reasons = []
    add_candidate("Navbar.v1", _score_navbar(signals, reasons), reasons, "Skeleton")

    reasons = []
    add_candidate(
        "AnnouncementBar.v1", _score_announcement(signals, reasons), reasons, "Skeleton"
    )

    candidates = sorted(candidates, key=lambda c: c["score"], reverse=True)
    family = candidates[0]["family"] if candidates else "Unknown"
    return {"candidates": candidates[:5], "family": family, "signals": signals}

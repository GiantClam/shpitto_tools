from __future__ import annotations

from typing import Callable


def migrate_feature_grid_v1_to_v2(props: dict) -> dict:
    return props


def migrate_pricing_cards_v1_to_v2(props: dict) -> dict:
    return props


MIGRATIONS: dict[str, Callable[[dict], dict]] = {
    "FeatureGrid:1->2": migrate_feature_grid_v1_to_v2,
    "PricingCards:1->2": migrate_pricing_cards_v1_to_v2,
}


def migrate(block_type: str, version_from: int, version_to: int, props: dict) -> dict:
    key = f"{block_type}:{version_from}->{version_to}"
    handler = MIGRATIONS.get(key)
    return handler(props) if handler else props

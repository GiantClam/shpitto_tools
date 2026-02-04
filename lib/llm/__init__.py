"""
LLM Template Generation Module

This module provides AI-powered template reconstruction from screenshots
using vision-capable language models through OpenRouter.

Usage:
    from lib.llm import create_llm_client, generate_template_from_snapshot

    client = create_llm_client("anthropic/claude-sonnet-4-5-2025-06-01")
    template = generate_template_from_snapshot(
        "screenshot.png",
        "snapshot.json",
        "Example Site"
    )
"""

from .client import (
    OpenRouterClient,
    TemplateReconstructor,
    create_llm_client,
    generate_template_from_snapshot,
)
from .batch_processor import (
    BatchTemplateProcessor,
    run_batch_generation,
    import_to_template_library,
)

__all__ = [
    "OpenRouterClient",
    "TemplateReconstructor",
    "create_llm_client",
    "generate_template_from_snapshot",
    "BatchTemplateProcessor",
    "run_batch_generation",
    "import_to_template_library",
]

__version__ = "1.0.0"

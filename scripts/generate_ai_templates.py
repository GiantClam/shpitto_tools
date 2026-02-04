#!/usr/bin/env python3
"""
AI Template Generator CLI

Generate templates from screenshots using Claude Sonnet 4.5 or Gemini 2.5 Flash.

Usage:
    python3 scripts/generate_ai_templates.py --model anthropic/claude-sonnet-4-5-2025-06-01
    python3 scripts/generate_ai_templates.py --model google/gemini-2-5-flash-preview --limit 5
    python3 scripts/generate_ai_templates.py --single kymetacorp.com
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Add parent path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from lib.llm import (
    OpenRouterClient,
    BatchTemplateProcessor,
    run_batch_generation,
    import_to_template_library,
)


def check_api_key():
    """Check if OpenRouter API key is set."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ Error: OPENROUTER_API_KEY not set")
        print("\nTo set your API key:")
        print("  export OPENROUTER_API_KEY='your-api-key'")
        print("\nOr add to .env file:")
        print("  OPENROUTER_API_KEY=your-api-key")
        return False
    print(f"✓ API key configured (length: {len(api_key)})")
    return True


def list_available_snapshots():
    """List available snapshots."""
    snapshot_index = Path("output/snapshots/snapshot_index.json")
    if not snapshot_index.exists():
        print("❌ No snapshots found. Run with --with-snapshots first.")
        return None

    with open(snapshot_index) as f:
        snapshots = json.load(f)

    print(f"\n📸 Available snapshots ({len(snapshots)}):")
    for i, s in enumerate(snapshots[:10], 1):
        print(f"  {i}. {s['domain']}")
    if len(snapshots) > 10:
        print(f"  ... and {len(snapshots) - 10} more")

    return snapshots


def main():
    parser = argparse.ArgumentParser(
        description="Generate AI templates from screenshots",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check API key
  python3 scripts/generate_ai_templates.py --check

  # List available snapshots  
  python3 scripts/generate_ai_templates.py --list

  # Generate templates from all snapshots (Claude)
  python3 scripts/generate_ai_templates.py --model anthropic/claude-sonnet-4-5-2025-06-01

  # Generate templates from first 3 snapshots (Claude)
  python3 scripts/generate_ai_templates.py --model anthropic/claude-sonnet-4-5-2025-06-01 --limit 3

  # Generate template for single site
  python3 scripts/generate_ai_templates.py --single kymetacorp.com

  # Generate with Gemini 2.5 Flash
  python3 scripts/generate_ai_templates.py --model google/gemini-2-5-flash-preview

  # Import to Supabase
  python3 scripts/generate_ai_templates.py --import
        """,
    )

    parser.add_argument("--check", action="store_true", help="Check API key")
    parser.add_argument("--list", action="store_true", help="List available snapshots")
    parser.add_argument(
        "--model",
        type=str,
        default="anthropic/claude-sonnet-4-5-2025-06-01",
        help="Model to use (default: anthropic/claude-sonnet-4-5-2025-06-01)",
    )
    parser.add_argument(
        "--limit", type=int, default=None, help="Limit number of sites to process"
    )
    parser.add_argument("--single", type=str, help="Process single site by domain")
    parser.add_argument(
        "--output",
        type=str,
        default="output/ai-templates",
        help="Output directory (default: output/ai-templates)",
    )
    parser.add_argument(
        "--import",
        action="store_true",
        dest="import_templates",
        help="Import to Supabase",
    )

    args = parser.parse_args()

    if args.check:
        return 0 if check_api_key() else 1

    if args.list:
        snapshots = list_available_snapshots()
        return 0 if snapshots is not None else 1

    # Check API key
    if not check_api_key():
        return 1

    # Check snapshots
    snapshot_index = Path("output/snapshots/snapshot_index.json")
    if not snapshot_index.exists():
        print("❌ No snapshots found.")
        print("Run the crawler with --with-snapshots first:")
        print("  python3 scripts/crawlers/run_crawler.py --with-snapshots")
        return 1

    # Load snapshots
    with open(snapshot_index) as f:
        snapshots = json.load(f)

    # Single site mode
    if args.single:
        target = next((s for s in snapshots if s["domain"] == args.single), None)
        if not target:
            print(f"❌ Snapshot not found: {args.single}")
            return 1

        client = OpenRouterClient(model=args.model)
        processor = BatchTemplateProcessor(client, args.output)
        result = processor.process_site(
            screenshot_path=target["screenshot"],
            dom_path=target["snapshot"],
            site_name=target["domain"],
            domain=target["domain"],
        )
        print(f"\n{'✓' if result['status'] == 'success' else '✗'} {result['status']}")
        return 0

    # Batch mode
    print(f"\n🚀 Starting batch template generation")
    print(f"Model: {args.model}")
    print(f"Limit: {args.limit or 'all'}")

    try:
        summary = run_batch_generation(
            snapshot_index=str(snapshot_index),
            output_dir=args.output,
            model=args.model,
            limit=args.limit,
        )

        print(f"\n✅ Complete!")
        print(f"  Successful: {summary['successful']}")
        print(f"  Failed: {summary['failed']}")
        print(f"  Output: {args.output}/")

        # Import to Supabase if requested
        if args.import_templates:
            print(f"\n📤 Importing to Supabase...")
            result = import_to_template_library(args.output)
            print(f"  Imported: {result['imported']}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Quick verification script for LLM template generation setup.
"""

import json
import os
import sys
from pathlib import Path


def check_python_deps():
    """Check Python dependencies."""
    print("📦 Checking Python dependencies...")
    deps = [
        ("httpx", "httpx"),
        ("playwright", "playwright"),
    ]
    all_ok = True
    for pkg, import_name in deps:
        try:
            __import__(import_name)
            print(f"  ✓ {pkg}")
        except ImportError:
            print(f"  ✗ {pkg} (not installed)")
            all_ok = False
    return all_ok


def check_api_key():
    """Check OpenRouter API key."""
    print("\n🔑 Checking OpenRouter API key...")
    api_key = os.getenv("OPENROUTER_API_KEY")
    if api_key:
        print(f"  ✓ API key configured (length: {len(api_key)})")
        return True
    print("  ✗ OPENROUTER_API_KEY not set")
    print("  Run: export OPENROUTER_API_KEY='your-key'")
    return False


def check_snapshots():
    """Check if snapshots exist."""
    print("\n📸 Checking snapshots...")
    snapshot_index = Path("output/snapshots/snapshot_index.json")
    if snapshot_index.exists():
        with open(snapshot_index) as f:
            snapshots = json.load(f)
        print(f"  ✓ {len(snapshots)} snapshots found")
        for s in snapshots[:3]:
            print(f"    - {s['domain']}")
        if len(snapshots) > 3:
            print(f"    ... and {len(snapshots) - 3} more")
        return True
    print("  ✗ No snapshots found")
    print("  Run: python3 scripts/crawlers/run_crawler.py --with-snapshots")
    return False


def check_lib():
    """Check if LLM lib modules can be imported."""
    print("\n📁 Checking LLM library modules...")
    try:
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from lib.llm import create_llm_client, BatchTemplateProcessor

        print("  ✓ lib.llm imported successfully")
        return True
    except ImportError as e:
        print(f"  ✗ Import error: {e}")
        return False


def check_env_file():
    """Check for .env file."""
    print("\n⚙️  Checking environment...")
    env_file = Path(".env")
    env_example = Path(".env.llm.example")
    if env_file.exists():
        print("  ✓ .env file exists")
        return True
    elif env_example.exists():
        print("  ℹ .env not found, using .env.llm.example")
        print("  Run: cp .env.llm.example .env")
        return True
    return False


def main():
    print("=" * 50)
    print("LLM Template Generation Setup Check")
    print("=" * 50)

    results = {
        "Python deps": check_python_deps(),
        "API key": check_api_key(),
        "Snapshots": check_snapshots(),
        "Library": check_lib(),
        "Environment": check_env_file(),
    }

    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for name, ok in results.items():
        print(f"  {'✓' if ok else '✗'} {name}")

    print(f"\n{passed}/{total} checks passed")

    if passed == total:
        print("\n✅ Setup complete! You can now generate templates:")
        print("  python3 scripts/generate_ai_templates.py --list")
    else:
        print("\n⚠️  Some checks failed. Fix the issues above.")

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())

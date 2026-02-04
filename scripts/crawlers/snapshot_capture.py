"""
Screenshot and DOM snapshot capture using agent-browser.
Provides AI-optimized snapshots for template reconstruction.

agent-browser is a headless browser automation CLI built by Vercel Labs,
specifically designed for AI agents. It provides:
- 93% less context than Playwright for LLM efficiency
- AI-friendly accessibility tree output (YAML format)
- refs-based element selection (more stable than CSS selectors)
"""

import json
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# agent-browser command path
AGENT_BROWSER_CMD = "agent-browser"


@dataclass
class SnapshotResult:
    url: str
    domain: str
    screenshot_path: str
    snapshot_path: str
    success: bool
    error: str | None = None


def _ensure_output_dir(output_dir: Path) -> None:
    """Create output directory if it doesn't exist."""
    output_dir.mkdir(parents=True, exist_ok=True)


def _run_agent_browser(args: list[str], timeout: int = 60) -> tuple[str, str, int]:
    """Run agent-browser command and return output, error, return code."""
    try:
        result = subprocess.run(
            [AGENT_BROWSER_CMD] + args,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return "", "Command timed out", 1
    except FileNotFoundError:
        return (
            "",
            f"agent-browser not found. Install with: npm install -g agent-browser",
            1,
        )


def _parse_yaml_snapshot(output: str) -> dict:
    """Parse agent-browser YAML-style snapshot output."""
    import re

    elements = []
    lines = output.strip().split("\n")

    for line in lines:
        line = line.strip()
        if not line or line.startswith("- document"):
            continue

        # Parse element reference
        ref_match = re.search(r"\[ref=([^\]]+)\]", line)
        text_match = re.search(r'"([^"]+)"', line)
        level_match = re.search(r"\[level=(\d+)\]", line)
        tag_match = re.search(
            r"^-\s*(heading|paragraph|link|image|button|input|div|span|section|main|nav|header|footer)",
            line,
        )

        element = {
            "raw": line,
            "ref": ref_match.group(1) if ref_match else None,
            "text": text_match.group(1) if text_match else None,
            "level": int(level_match.group(1)) if level_match else None,
            "tag": tag_match.group(1) if tag_match else None,
        }

        elements.append(element)

    return {
        "elements": elements,
        "format": "agent-browser-accessibility-tree",
        "raw_output": output,
    }


def capture_snapshot(url: str, output_dir: Path) -> SnapshotResult:
    """Capture screenshot and DOM snapshot for a single URL using agent-browser."""
    _ensure_output_dir(output_dir)
    domain = url.replace("https://", "").replace("http://", "").split("/")[0]
    screenshot_path = output_dir / f"{domain}.png"
    snapshot_path = output_dir / f"{domain}.json"

    print(f"Capturing {url}...")

    # Open browser and navigate
    open_error = None
    for attempt in range(2):
        out, err, code = _run_agent_browser(["open", url], timeout=120)
        if code == 0 and "error" not in err.lower():
            open_error = None
            break
        open_error = err or "Failed to open URL"
        _run_agent_browser(["close"])
        if attempt == 0:
            import time

            time.sleep(2)
    if open_error:
        return SnapshotResult(
            url=url,
            domain=domain,
            screenshot_path=str(screenshot_path),
            snapshot_path=str(snapshot_path),
            success=False,
            error=open_error,
        )

    # Wait for page to load
    out, err, code = _run_agent_browser(["wait", "--timeout", "10"], timeout=60)
    if code != 0:
        import time

        time.sleep(2)

    # Take screenshot
    out, err, code = _run_agent_browser(
        ["screenshot", str(screenshot_path)], timeout=120
    )
    if code != 0:
        _run_agent_browser(["close"])
        return SnapshotResult(
            url=url,
            domain=domain,
            screenshot_path=str(screenshot_path),
            snapshot_path=str(snapshot_path),
            success=False,
            error=err or "Failed to take screenshot",
        )

    # Get DOM snapshot (accessibility tree format)
    out, err, code = _run_agent_browser(["snapshot"], timeout=120)

    # Close browser
    _run_agent_browser(["close"])

    # Parse snapshot
    snapshot_data = None
    if out.strip():
        snapshot_data = _parse_yaml_snapshot(out)

    # Save snapshot to file
    if snapshot_data:
        with open(snapshot_path, "w", encoding="utf-8") as f:
            json.dump(snapshot_data, f, ensure_ascii=False, indent=2)

    success = screenshot_path.exists() and snapshot_path.exists()

    return SnapshotResult(
        url=url,
        domain=domain,
        screenshot_path=str(screenshot_path),
        snapshot_path=str(snapshot_path),
        success=success,
        error=None if success else "Failed to create output files",
    )


def capture_batch(
    urls: list[str],
    output_dir: Path | str,
    max_concurrent: int = 3,
) -> list[SnapshotResult]:
    """Capture snapshots for multiple URLs with concurrency control."""
    from concurrent.futures import ThreadPoolExecutor

    output_dir = Path(output_dir)
    _ensure_output_dir(output_dir)

    results: list[SnapshotResult] = []

    def process_url(url: str) -> SnapshotResult:
        return capture_snapshot(url, output_dir)

    with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
        results = list(executor.map(process_url, urls))

    return results


def capture_from_crawled_data(
    crawled_dir: Path, output_dir: Path
) -> list[SnapshotResult]:
    """Capture snapshots for all sites in crawled data."""
    crawled_dir = Path(crawled_dir)
    output_dir = Path(output_dir)
    _ensure_output_dir(output_dir)

    results: list[SnapshotResult] = []
    processed_domains = set()

    for file_path in crawled_dir.glob("*.json"):
        if file_path.name == ".json":
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if data.get("error"):
            continue

        pages = data.get("pages", [])
        if not pages:
            continue

        domain = data.get("domain", "")
        if domain in processed_domains:
            continue

        home = next(
            (p for p in pages if p.get("page_type") in {"home", "landing"}), pages[0]
        )
        url = home.get("url") or data.get("base_url")

        if not url:
            continue

        result = capture_snapshot(url, output_dir)
        result.domain = domain
        results.append(result)
        processed_domains.add(domain)

    return results


def generate_snapshot_index(output_dir: Path) -> dict:
    """Generate index file for all snapshots in directory."""
    output_dir = Path(output_dir)
    index = {"captured_at": "", "snapshots": []}

    import datetime

    for file_path in output_dir.glob("*.json"):
        if file_path.name == "snapshot_index.json":
            continue

        domain = file_path.stem
        screenshot = file_path.with_suffix(".png")

        if screenshot.exists():
            index["snapshots"].append(
                {
                    "domain": domain,
                    "screenshot": str(screenshot),
                    "snapshot": str(file_path),
                }
            )

    index["captured_at"] = datetime.datetime.now().isoformat()

    index_path = output_dir / "snapshot_index.json"
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    return index


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Capture screenshots and DOM snapshots using agent-browser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Single URL
  python3 snapshot_capture.py --url https://kymetacorp.com

  # From crawled data
  python3 snapshot_capture.py --crawled-dir output/crawled

  # Batch from URL list
  python3 snapshot_capture.py --urls "url1,url2,url3"
        """,
    )

    parser.add_argument("--url", help="Single URL to capture")
    parser.add_argument("--urls", help="Comma-separated URLs")
    parser.add_argument("--crawled-dir", help="Directory with crawled data")
    parser.add_argument(
        "--output",
        default="output/snapshots",
        help="Output directory (default: output/snapshots)",
    )
    parser.add_argument(
        "--max-concurrent",
        type=int,
        default=3,
        help="Max concurrent captures (default: 3)",
    )

    args = parser.parse_args()

    output_dir = Path(args.output)

    if args.url:
        result = capture_snapshot(args.url, output_dir)
        print(
            f"{'✓' if result.success else '✗'} {result.domain}: {result.error or 'success'}"
        )
        return 0 if result.success else 1

    elif args.urls:
        urls = [u.strip() for u in args.urls.split(",") if u.strip()]
        results = capture_batch(urls, output_dir, args.max_concurrent)
        for r in results:
            print(f"{'✓' if r.success else '✗'} {r.domain}: {r.error or 'success'}")
        return 0 if all(r.success for r in results) else 1

    elif args.crawled_dir:
        results = capture_from_crawled_data(Path(args.crawled_dir), output_dir)
        for r in results:
            print(f"{'✓' if r.success else '✗'} {r.domain}: {r.error or 'success'}")

        index = generate_snapshot_index(output_dir)
        print(f"\nGenerated index with {len(index['snapshots'])} snapshots")
        return 0

    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())

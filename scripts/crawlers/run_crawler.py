#!/usr/bin/env python3
"""
Main script to crawl all websites and generate templates.

Uses Crawl4AI for intelligent web crawling with JavaScript rendering.

Usage:
    python3 run_crawler.py [--urls "url1,url2,..."] [--max-pages N]
    python3 run_crawler.py --use-legacy  # Use old aiohttp crawler
"""

import asyncio
import json
import argparse
from pathlib import Path
import sys
from urllib.parse import urlparse
from dataclasses import asdict

sys.path.insert(0, str(Path(__file__).parent))

from template_generator import TemplateGenerator
from quality_checklist import run_quality_checklist
from snapshot_capture import capture_from_crawled_data, generate_snapshot_index


def load_urls_from_excel(excel_path: str) -> list:
    """Load URLs from the Excel file."""
    import pandas as pd

    df = pd.read_excel(excel_path)
    urls = df["网站链接"].tolist()

    clean_urls = []
    for url in urls:
        url = str(url).strip()
        if not url or "google.com/search" in url:
            continue
        if not url.startswith("http"):
            url = "https://" + url
        clean_urls.append(url)

    return clean_urls


async def crawl_single_website_crawl4ai(url: str, crawler) -> dict:
    """Crawl a single website using Crawl4AI."""
    print(f"\n{'=' * 60}")
    print(f"Crawling: {url}")
    print(f"{'=' * 60}")

    try:
        analysis = await crawler.crawl_website(url, max_pages=15)

        print(f"\nResults for {analysis.domain}:")
        print(f"  Pages discovered: {len(analysis.pages)}")
        print(f"  Page types found: {list(analysis.navigation_structure.keys())}")

        output_dir = Path("/Users/beihuang/Documents/opencode/shpitto/output/crawled")
        output_dir.mkdir(exist_ok=True)

        output_file = output_dir / f"{analysis.domain}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(asdict(analysis), f, ensure_ascii=False, indent=2)

        print(f"  Saved to: {output_file}")

        return asdict(analysis)

    except Exception as e:
        print(f"  ERROR: {e}")
        return {"base_url": url, "domain": url.split("/")[0], "error": str(e)}


async def run_crawl4ai_all(urls: list, max_concurrent: int = 3):
    """Crawl all websites using Crawl4AI."""
    print(f"\nCrawling {len(urls)} websites using Crawl4AI...")
    print(f"Max concurrent requests: {max_concurrent}")

    all_results = []

    from crawl4ai_crawler import Crawl4AICrawler

    async with Crawl4AICrawler(max_concurrent=max_concurrent) as crawler:
        semaphore = asyncio.Semaphore(max_concurrent)

        async def crawl_with_semaphore(url):
            async with semaphore:
                return await crawl_single_website_crawl4ai(url, crawler)

        tasks = [crawl_with_semaphore(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, dict):
                all_results.append(result)

    return all_results


def load_urls_from_file(file_path: str) -> list:
    """Load URLs from a text file (one per line)."""
    with open(file_path, "r", encoding="utf-8") as f:
        return [
            line.strip()
            for line in f
            if line.strip() and not line.strip().startswith("#")
        ]


async def main():
    parser = argparse.ArgumentParser(
        description="Crawl websites using Crawl4AI and generate templates",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # From Excel file (default)
  python3 run_crawler.py

  # Specific URLs
  python3 run_crawler.py --urls "https://kymetacorp.com,https://varda.com"

  # From URL file
  python3 run_crawler.py --url-file urls.txt

  # Legacy aiohttp crawler
  python3 run_crawler.py --use-legacy
        """,
    )

    parser.add_argument(
        "--urls",
        type=str,
        default=None,
        help="Comma-separated URLs (default: from Excel)",
    )
    parser.add_argument(
        "--url-file",
        type=str,
        default=None,
        help="File with URLs (one per line)",
    )
    parser.add_argument(
        "--max-concurrent", type=int, default=3, help="Max concurrent requests"
    )
    parser.add_argument(
        "--use-legacy", action="store_true", help="Use legacy aiohttp crawler"
    )
    parser.add_argument(
        "--skip-crawl",
        action="store_true",
        help="Skip crawling, only generate templates",
    )
    parser.add_argument(
        "--skip-snapshots", action="store_true", help="Skip screenshots"
    )
    parser.add_argument(
        "--skip-checklist", action="store_true", help="Skip quality checklist"
    )

    args = parser.parse_args()

    # Load URLs
    if args.urls:
        urls = [u.strip() for u in args.urls.split(",") if u.strip()]
    elif args.url_file:
        urls = load_urls_from_file(args.url_file)
    else:
        urls = load_urls_from_excel(
            "/Users/beihuang/Documents/opencode/shpitto/网站视觉描述词库扩充建议.xlsx"
        )

    print(f"\nURLs to process: {len(urls)}")
    for i, url in enumerate(urls[:10], 1):
        print(f"  {i}. {url}")
    if len(urls) > 10:
        print(f"  ... and {len(urls) - 10} more")

    # Crawl all websites
    if not args.skip_crawl:
        if args.use_legacy:
            from crawler import WebsiteCrawler as LegacyCrawler

            async def run_legacy_all(urls, max_concurrent):
                from crawler import crawl_single_website as legacy_crawl

                print(f"\nUsing legacy aiohttp crawler...")
                semaphore = asyncio.Semaphore(max_concurrent)

                async def crawl_with_semaphore(url):
                    async with semaphore:
                        return await legacy_crawl(url)

                tasks = [crawl_with_semaphore(url) for url in urls]
                return await asyncio.gather(*tasks, return_exceptions=True)

            await run_legacy_all(urls, args.max_concurrent)
        else:
            await run_crawl4ai_all(urls, args.max_concurrent)

    # Capture snapshots
    if not args.skip_snapshots:
        snapshots_dir = Path(
            "/Users/beihuang/Documents/opencode/shpitto/output/snapshots"
        )
        if args.urls or args.url_file:
            from snapshot_capture import capture_batch

            snapshot_results = capture_batch(urls, snapshots_dir, args.max_concurrent)
        else:
            snapshot_results = capture_from_crawled_data(
                Path("/Users/beihuang/Documents/opencode/shpitto/output/crawled"),
                snapshots_dir,
            )
        generate_snapshot_index(snapshots_dir)
        failed_snapshots = [r for r in snapshot_results if not r.success]
        if failed_snapshots:
            print(f"Snapshot failures: {len(failed_snapshots)}")

    # Generate templates
    if not args.skip_crawl:
        if args.urls or args.url_file:
            from template_generator import TemplateGenerator

            crawled_dir = Path(
                "/Users/beihuang/Documents/opencode/shpitto/output/crawled"
            )
            generator = TemplateGenerator()
            domains = {urlparse(url).netloc for url in urls if urlparse(url).netloc}
            for domain in domains:
                crawled_file = crawled_dir / f"{domain}.json"
                if not crawled_file.exists():
                    print(f"Crawled data missing for {domain}")
                    continue
                print(f"\nProcessing {crawled_file.name}...")
                with crawled_file.open("r", encoding="utf-8") as f:
                    crawled_data = json.load(f)
                pages, sections = generator.generate_from_crawled_data(crawled_data)
                print(
                    f"  Generated {pages} page templates, {sections} section templates"
                )
            output_file = generator.save_templates()
            print(
                f"\nTotal: {len(generator.generated_pages)} pages, {len(generator.generated_sections)} sections"
            )
            print(f"Output: {output_file}")
        else:
            from template_generator import process_all_crawled_data

            await process_all_crawled_data()

    # Run quality checklist
    if not args.skip_checklist:
        output_path = Path(
            "/Users/beihuang/Documents/opencode/shpitto/output/reports/quality_report.json"
        )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        crawled_dir = Path("/Users/beihuang/Documents/opencode/shpitto/output/crawled")
        if args.urls or args.url_file:
            filtered_dir = Path(
                "/Users/beihuang/Documents/opencode/shpitto/output/crawled/selected"
            )
            filtered_dir.mkdir(parents=True, exist_ok=True)
            domains = {urlparse(url).netloc for url in urls if urlparse(url).netloc}
            for domain in domains:
                source_file = crawled_dir / f"{domain}.json"
                if not source_file.exists():
                    continue
                with source_file.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                target_file = filtered_dir / source_file.name
                with target_file.open("w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            crawled_dir = filtered_dir
        report = run_quality_checklist(
            crawled_dir,
            Path(
                "/Users/beihuang/Documents/opencode/shpitto/output/templates/crawled_templates.json"
            ),
        )
        with output_path.open("w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        avg_score = report["summary"]["average_score"]
        print(f"Quality report saved to {output_path}")
        print(f"Sites checked: {report['summary']['sites_checked']}")
        print(f"Average score: {avg_score:.1f}")


if __name__ == "__main__":
    asyncio.run(main())

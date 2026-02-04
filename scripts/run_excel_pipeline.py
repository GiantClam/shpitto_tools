import argparse
import json
import os
import subprocess
import time
from pathlib import Path
from urllib.parse import urlparse
import urllib.request
import socket

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = str(REPO_ROOT / "网站视觉描述词库扩充建议.xlsx")
OUTPUT_REPORT = str(REPO_ROOT / "output/reports/excel_pipeline_report.json")


def load_urls_from_excel(excel_path: str) -> list[str]:
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


def run_command(command: list[str], env: dict | None = None) -> tuple[int, str]:
    result = subprocess.run(
        command,
        env=env,
        capture_output=True,
        text=True,
    )
    output = (result.stdout or "") + (result.stderr or "")
    return result.returncode, output


def slug_from_url(url: str) -> str:
    parsed = urlparse(url)
    slug = parsed.path.strip("/") or "home"
    return slug.replace("/", "-")

def _port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

def _http_ok(url: str, timeout: float = 2.5) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return 200 <= resp.status < 300
    except Exception:
        return False

def ensure_render_server(
    render_base: str, render_url: str | None = None, wait_seconds: int = 30
) -> tuple[bool, str]:
    host = "localhost"
    port = 3000
    if _port_open(host, port) and (
        _http_ok(f"http://{host}:{port}/")
        or _http_ok(render_base)
        or (render_url and _http_ok(render_url))
    ):
        return True, "healthy"
    try:
        proc = subprocess.Popen(
            ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", str(port)],
            cwd=str(REPO_ROOT / "builder"),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception as e:
        return False, f"start_failed: {e}"
    deadline = time.time() + wait_seconds
    while time.time() < deadline:
        if _port_open(host, port) and (
            _http_ok(f"http://{host}:{port}/")
            or _http_ok(render_base)
            or (render_url and _http_ok(render_url))
        ):
            return True, "started"
        time.sleep(1.0)
    return False, "timeout"


def run_pipeline(url: str, fill_props: bool, auto_repair: bool) -> dict:
    parsed = urlparse(url)
    site_key = parsed.netloc or url.replace("https://", "").split("/")[0]
    page_slug = slug_from_url(url)
    render_url = (
        f"http://localhost:3000/render?siteKey={site_key}&page={page_slug}"
    )
    render_base = "http://localhost:3000/"

    pipeline_cmd = [
        "python3",
        str(REPO_ROOT / "asset-factory/pipelines/run.py"),
        "--url",
        url,
    ]
    if fill_props:
        pipeline_cmd.append("--fill-props")
    if auto_repair:
        pipeline_cmd.append("--auto-repair")
    pipeline_code, pipeline_output = run_command(pipeline_cmd)

    healthy, health_note = ensure_render_server(render_base, render_url=render_url)

    if healthy:
        visual_cmd = [
            "npx",
            "--prefix",
            str(REPO_ROOT / "visual-qa"),
            "ts-node",
            "--esm",
            str(REPO_ROOT / "visual-qa" / "scripts" / "run.ts"),
        ]
        env = os.environ.copy()
        env.update(
            {
                "SITE_KEY": site_key,
                "ORIGINAL_URL": url,
                "RENDER_URL": render_url,
            }
        )
        visual_code, visual_output = run_command(visual_cmd, env=env)
    else:
        visual_code = 1
        visual_output = f"render_server_unavailable: {health_note}"

    verify_cmd = [
        "python3",
        str(REPO_ROOT / "asset-factory/pipelines/verify.py"),
        "--domain",
        site_key,
        "--output",
        str(REPO_ROOT / "asset-factory/out"),
        "--page",
        page_slug,
    ]
    verify_code, verify_output = run_command(verify_cmd)

    return {
        "url": url,
        "site_key": site_key,
        "render_url": render_url,
        "page_slug": page_slug,
        "pipeline": {
            "status": "ok" if pipeline_code == 0 else "failed",
            "output": pipeline_output[-2000:],
        },
        "visual_qa": {
            "status": "ok" if visual_code == 0 else "failed",
            "output": visual_output[-2000:],
        },
        "verify": {
            "status": "ok" if verify_code == 0 else "failed",
            "output": verify_output[-1000:],
        },
        "render_health": {"status": "ok" if healthy else "failed", "note": health_note},
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run pipeline for URLs in Excel")
    parser.add_argument(
        "--first-only",
        action="store_true",
        help="Only process the first URL in the Excel list",
    )
    parser.add_argument(
        "--fill-props",
        action="store_true",
        help="Use LLM to fill props and variants",
    )
    parser.add_argument(
        "--auto-repair",
        action="store_true",
        help="Enable visual auto-repair loop",
    )
    args = parser.parse_args()

    urls = load_urls_from_excel(EXCEL_PATH)
    if args.first_only:
        urls = urls[:1]
    results = []
    for url in urls:
        results.append(run_pipeline(url, args.fill_props, args.auto_repair))

    output_path = Path(OUTPUT_REPORT)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(
            {"count": len(results), "results": results}, ensure_ascii=False, indent=2
        ),
        encoding="utf-8",
    )

    print(f"Processed {len(results)} sites")
    print(f"Report: {output_path}")


if __name__ == "__main__":
    main()

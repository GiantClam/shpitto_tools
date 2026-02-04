from __future__ import annotations

import json
import os
import ssl
from pathlib import Path
from urllib.request import Request, urlopen


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.environ.get(
    "OPENROUTER_MODEL", "anthropic/claude-sonnet-4.5"
)
OPENROUTER_MODEL_FALLBACK = os.environ.get(
    "OPENROUTER_MODEL_FALLBACK", "anthropic/claude-opus-4.5"
)


def call_openrouter_json(
    messages: list[dict],
    schema: dict,
    model: str | None = None,
    temperature: float | None = None,
) -> dict:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not set")
    body: dict = {
        "model": model or OPENROUTER_MODEL,
        "messages": messages,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "structured_output",
                "schema": schema,
                "strict": True,
            },
        },
    }
    if temperature is not None:
        body["temperature"] = temperature

    request = Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
    except ssl.SSLError:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        with urlopen(request, timeout=60, context=context) as response:
            data = json.loads(response.read().decode("utf-8"))

    content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
    return json.loads(content)

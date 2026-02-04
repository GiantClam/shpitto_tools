from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen
import ssl
import os

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "anthropic/claude-sonnet-4.5")


def _load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def _fallback_role(text: str) -> str:
    value = (text or "").lower()
    if any(k in value for k in ["pricing", "price", "plan", "定价", "价格"]):
        return "Pricing"
    if any(k in value for k in ["faq", "question", "常见问题", "问题"]):
        return "FAQ"
    if any(k in value for k in ["testimonial", "客户", "评价", "case study"]):
        return "Testimonials"
    if any(k in value for k in ["contact", "demo", "get started", "signup", "咨询"]):
        return "CTA"
    if any(k in value for k in ["logo", "trusted", "partners", "客户标识"]):
        return "LogoCloud"
    if any(k in value for k in ["hero", "headline", "mission", "intro"]):
        return "Hero"
    return "Feature"


def _call_openrouter(messages: list[dict], schema: dict) -> dict:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not set")
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "response_format": {"type": "json_schema", "json_schema": schema},
        "temperature": 0.2,
    }
    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    req = Request("https://openrouter.ai/api/v1/chat/completions", data=data, headers=headers)
    ctx = ssl.create_default_context()
    with urlopen(req, timeout=60, context=ctx) as resp:
        response = json.loads(resp.read().decode("utf-8"))
    content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {}


def tag_semantics(output_root: Path, domain: str, page_slug: str, use_llm: bool = True) -> dict:
    atoms_path = output_root / domain / "atoms" / page_slug / "atoms_dsl.json"
    sections_path = output_root / domain / "pages" / page_slug / "sections.json"
    atoms_dsl = _load_json(atoms_path)
    sections = _load_json(sections_path).get("sections", []) if sections_path.exists() else []
    atoms_sections = atoms_dsl.get("sections", []) if isinstance(atoms_dsl, dict) else []

    items: list[dict[str, Any]] = []
    for item in atoms_sections:
        if not isinstance(item, dict):
            continue
        idx = item.get("index")
        title = item.get("title") or ""
        semantic = item.get("semanticRole") or ""
        text = " ".join(
            [
                title,
                " ".join([a.get("text") for a in (item.get("atoms") or []) if isinstance(a, dict) and a.get("text")])
            ]
        )[:600]
        items.append({"index": idx, "title": title, "semanticRole": semantic, "text": text})

    if not items and sections:
        for section in sections:
            if not isinstance(section, dict):
                continue
            idx = section.get("index")
            text = str(section.get("source") or "") + " " + str(section.get("content") or "")
            items.append({"index": idx, "title": section.get("source") or "", "semanticRole": "", "text": text[:600]})

    roles = [
        "Hero",
        "Feature",
        "Pricing",
        "FAQ",
        "Testimonials",
        "LogoCloud",
        "CTA",
        "CaseStudies",
        "Footer",
        "Section",
    ]
    output: dict[str, Any] = {"sections": []}

    if use_llm and OPENROUTER_API_KEY and items:
        schema = {
            "name": "semantic_tags",
            "schema": {
                "type": "object",
                "properties": {
                    "sections": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "index": {"type": "integer"},
                                "semanticRole": {"type": "string", "enum": roles},
                                "confidence": {"type": "number"},
                                "notes": {"type": "string"},
                            },
                            "required": ["index", "semanticRole"],
                            "additionalProperties": False,
                        },
                    }
                },
                "required": ["sections"],
                "additionalProperties": False,
            },
        }
        messages = [
            {
                "role": "system",
                "content": "You label webpage sections with a semantic role for asset reuse. Output JSON only.",
            },
            {
                "role": "user",
                "content": json.dumps({"roles": roles, "sections": items}, ensure_ascii=False),
            },
        ]
        try:
            output = _call_openrouter(messages, schema)
        except Exception:
            output = {"sections": []}

    if not output.get("sections"):
        output = {
            "sections": [
                {
                    "index": item.get("index"),
                    "semanticRole": item.get("semanticRole")
                    or _fallback_role(item.get("text") or item.get("title") or ""),
                    "confidence": 0.5,
                    "notes": "rule_fallback",
                }
                for item in items
            ]
        }

    out_dir = output_root / domain / "semantic" / page_slug
    out_dir.mkdir(parents=True, exist_ok=True)
    semantic_path = out_dir / "semantic.json"
    semantic_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    panel_path = out_dir / "semantic_panel.html"
    panel_path.write_text(_render_panel(output, domain, page_slug), encoding="utf-8")

    return {"status": "ok", "path": str(semantic_path), "panel": str(panel_path)}


def apply_semantic_override(output_root: Path, domain: str, page_slug: str, source_path: Path) -> dict:
    if not source_path.exists():
        return {"status": "missing", "path": str(source_path)}
    try:
        data = json.loads(source_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"status": "invalid_json", "path": str(source_path)}
    out_dir = output_root / domain / "semantic" / page_slug
    out_dir.mkdir(parents=True, exist_ok=True)
    semantic_path = out_dir / "semantic.json"
    semantic_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"status": "ok", "path": str(semantic_path)}


def _render_panel(data: dict, domain: str, page_slug: str) -> str:
    rows = []
    for item in data.get("sections", []):
        idx = item.get("index")
        role = item.get("semanticRole", "")
        conf = item.get("confidence", "")
        note = item.get("notes", "")
        rows.append(
            f"<tr><td>{idx}</td><td contenteditable='true'>{role}</td><td>{conf}</td><td>{note}</td></tr>"
        )
    rows_html = "\n".join(rows)
    return f"""<!doctype html>
<html lang='zh'>
<head>
<meta charset='utf-8' />
<title>Semantic Panel - {domain}/{page_slug}</title>
<style>
body {{ font-family: system-ui, sans-serif; padding: 20px; }}
.table {{ border-collapse: collapse; width: 100%; }}
.table th, .table td {{ border: 1px solid #ddd; padding: 8px; }}
.table th {{ background: #f6f7f9; }}
.note {{ margin-top: 12px; font-size: 12px; color: #666; }}
textarea {{ width: 100%; height: 220px; margin-top: 10px; }}
 .actions {{ margin-top: 12px; display: flex; gap: 8px; }}
 button {{ padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; }}
</style>
</head>
<body>
<h2>Semantic Panel: {domain} / {page_slug}</h2>
<table class='table'>
<thead><tr><th>Index</th><th>SemanticRole (editable)</th><th>Confidence</th><th>Notes</th></tr></thead>
<tbody>
{rows_html}
</tbody>
</table>
<div class='note'>编辑表格后，请复制下方 JSON 并保存覆盖 semantic.json。</div>
<textarea>{json.dumps(data, ensure_ascii=False, indent=2)}</textarea>
 <div class='actions'>
   <button onclick="save()">下载 semantic.json</button>
 </div>
 <script>
   function save() {{
     const rows = Array.from(document.querySelectorAll('tbody tr')).map(tr => {{
       const tds = tr.querySelectorAll('td');
       return {{
         index: Number(tds[0].textContent || 0),
         semanticRole: (tds[1].textContent || '').trim(),
         confidence: Number(tds[2].textContent || 0),
         notes: (tds[3].textContent || '').trim(),
       }};
     }});
     const blob = new Blob([JSON.stringify({{ sections: rows }}, null, 2)], {{ type: 'application/json' }});
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'semantic.json';
     a.click();
     URL.revokeObjectURL(url);
   }}
 </script>
</body>
</html>"""

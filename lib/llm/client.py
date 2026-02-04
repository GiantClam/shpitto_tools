"""
LLM Client for template generation using OpenRouter.
Supports Claude Sonnet 4.5 and Gemini 2.5 Flash with vision capabilities.
"""

import base64
import json
import os
from pathlib import Path
from typing import Any

import httpx


class OpenRouterClient:
    """Client for calling LLMs through OpenRouter."""

    def __init__(
        self,
        model: str = "anthropic/claude-sonnet-4-5-2025-06-01",
        api_key: str | None = None,
        base_url: str = "https://openrouter.ai/api/v1",
    ):
        self.model = model
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = base_url
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not set")

    def call(
        self,
        messages: list[dict],
        max_tokens: int = 4000,
        temperature: float = 0.2,
    ) -> dict:
        """Call OpenRouter API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://shipitto.com",
            "X-Title": "Shipitto Template Generator",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        with httpx.Client(timeout=120.0) as client:
            response = client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    def call_with_image(
        self,
        image_path: str | Path,
        prompt: str,
        max_tokens: int = 4000,
    ) -> dict:
        """Call with base64 encoded image."""
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")

        content = [
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{image_data}"},
            },
        ]

        messages = [{"role": "user", "content": content}]
        return self.call(messages, max_tokens=max_tokens)


class TemplateReconstructor:
    """Reconstruct templates from screenshots + DOM snapshots using LLM."""

    def __init__(self, llm_client: OpenRouterClient):
        self.llm = llm_client

    def build_vision_prompt(self, dom_snapshot: dict, site_name: str) -> str:
        """Build prompt for visual template reconstruction."""
        return f"""You are an expert web designer. Analyze the website screenshot and DOM data to extract the visual design system.

Website: {site_name}

Analyze the following DOM snapshot and output a structured design specification in JSON format:

```json
{{
  "visual_spec": {{
    "colors": {{
      "primary": "#HEXCODE",
      "secondary": "#HEXCODE", 
      "accent": "#HEXCODE",
      "background": "#HEXCODE",
      "text": "#HEXCODE"
    }},
    "typography": {{
      "heading_font": "Font Family Name",
      "body_font": "Font Family Name",
      "heading_weight": 400-900,
      "heading_size": "e.g. 48px",
      "body_size": "e.g. 16px"
    }},
    "layout": {{
      "container_width": "e.g. 1440px",
      "border_radius": "none|sm|md|lg|xl",
      "grid_columns": 12,
      "visual_density": "airy|balanced|compact",
      "gap": "e.g. 24px"
    }},
    "theme": "light|dark|auto"
  }},
  "page_structure": [
    {{
      "name": "Hero",
      "type": "Hero",
      "props": {{
        "title": "Main headline text",
        "description": "Subheading or description",
        "cta_text": "Button text if visible",
        "alignment": "left|center",
        "background_style": "gradient|solid|image|none"
      }}
    }},
    {{
      "name": "Features",
      "type": "FeatureGrid|ValuePropositions",
      "props": {{
        "title": "Section title",
        "item_count": 3-6,
        "layout": "grid|list|cards"
      }}
    }},
    {{
      "name": "Social Proof",
      "type": "Testimonials|Logos",
      "props": {{
        "title": "Section title",
        "style": "cards|slider|grid"
      }}
    }},
    {{
      "name": "CTA",
      "type": "CTASection",
      "props": {{
        "title": "Call to action text",
        "button_text": "Button label"
      }}
    }}
  ],
  "component_details": {{
    "buttons": {{
      "style": "fill|outline|ghost|soft",
      "border_radius": "none|sm|md|lg|xl",
      "padding": "e.g. 12px 24px"
    }},
    "cards": {{
      "style": "flat|bordered|elevated|glass",
      "shadow": "none|subtle|medium|strong"
    }},
    "navigation": {{
      "style": "horizontal|stacked|sidebar|hamburger"
    }}
  }}
}}
```

Important:
1. Extract actual colors from the visible UI (not just from DOM)
2. Identify the font families used for headings vs body text
3. Note the spacing and layout patterns (grid gaps, margins)
4. List all visible sections in order
5. Describe button and card styles

Return ONLY the JSON, no markdown formatting."""

    def build_structured_prompt(self, dom_snapshot: dict, visual_spec: dict) -> str:
        """Build prompt combining DOM and visual analysis."""
        page_content = dom_snapshot.get("elements", [])[:100]

        return f"""Based on the DOM structure and visual design, generate a complete Puck template specification.

Visual Design:
{json.dumps(visual_spec, indent=2)}

DOM Structure (top elements):
{json.dumps(page_content, indent=2)[:3000]}

Generate the full Puck template JSON:

```json
{{
  "name": "Template Name",
  "slug": "template-slug",
  "template_type": "page",
  "template_kind": "landing",
  "template_source": "ai-generated",
  "description": "Brief description",
  "puck_data": {{
    "root": {{
      "props": {{
        "title": "Site Title",
        "branding": {{
          "name": "Brand Name",
          "colors": {visual_spec["colors"]},
          "style": {{
            "typography": "{visual_spec["typography"]["heading_font"]}",
            "borderRadius": "{visual_spec["layout"]["border_radius"]}"
          }}
        }}
      }}
    }},
    "content": [
      // Generate sections based on page_structure from visual analysis
    ]
  }},
  "visual_spec": {visual_spec}
}}
```

Return ONLY valid JSON, no markdown."""

    def reconstruct_from_screenshot(
        self,
        screenshot_path: str | Path,
        dom_snapshot_path: str | Path,
        site_name: str,
    ) -> dict:
        """Main method: reconstruct template from screenshot + DOM."""
        # Step 1: Analyze screenshot for visual specs
        dom_snapshot = json.loads(Path(dom_snapshot_path).read_text())
        prompt = self.build_vision_prompt(dom_snapshot, site_name)

        response = self.llm.call_with_image(screenshot_path, prompt, max_tokens=4000)
        content = response["choices"][0]["message"]["content"]

        # Parse JSON from response
        visual_spec = self._extract_json(content, "visual_spec")

        # Step 2: Generate complete template with DOM context
        template_prompt = self.build_structured_prompt(dom_snapshot, visual_spec)
        template_response = self.llm.call(
            [{"role": "user", "content": template_prompt}],
            max_tokens=6000,
        )
        template_content = template_response["choices"][0]["message"]["content"]

        template = self._extract_json(template_content, "puck_data")
        template["name"] = f"{site_name.title()} AI Template"
        template["slug"] = f"{site_name.lower().replace('.', '-')}-ai"
        template["template_source"] = "ai-generated"
        template["visual_spec"] = visual_spec

        return template

    def _extract_json(self, content: str, key: str) -> dict:
        """Extract JSON from LLM response."""
        # Try to find JSON block
        import re

        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Find first { and last }
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1:
                json_str = content[start : end + 1]
            else:
                json_str = content

        try:
            parsed = json.loads(json_str)
            return parsed.get(key, parsed)
        except json.JSONDecodeError:
            # Return as-is if can't parse
            return {}


def create_llm_client(
    model: str = "anthropic/claude-sonnet-4-5-2025-06-01",
) -> OpenRouterClient:
    """Factory function to create LLM client."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")

    return OpenRouterClient(model=model)


def generate_template_from_snapshot(
    screenshot_path: str,
    dom_path: str,
    site_name: str,
    model: str = "anthropic/claude-sonnet-4-5-2025-06-01",
) -> dict:
    """Convenience function to generate template from snapshot."""
    client = create_llm_client(model)
    reconstructor = TemplateReconstructor(client)
    return reconstructor.reconstruct_from_screenshot(
        screenshot_path, dom_path, site_name
    )

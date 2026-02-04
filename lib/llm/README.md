# AI Template Generation with LLMs

This module provides AI-powered template reconstruction from screenshots using vision-capable language models through OpenRouter.

## Models Supported

| Model | Vision | Strengths | Best For |
|-------|--------|-----------|----------|
| `anthropic/claude-sonnet-4-5-2025-06-01` | ✅ | Best visual understanding, code generation | High-quality template reconstruction |
| `google/gemini-2-5-flash-preview` | ✅ | Fast, cheap, large context | Batch processing, simple pages |

## Setup

### 1. Install Dependencies

```bash
# Install httpx for API calls
pip3 install httpx

# Install playwright for screenshot capture (optional)
pip3 install playwright
python3 -m playwright install chromium
```

### 2. Configure API Key

```bash
# Set OpenRouter API key
export OPENROUTER_API_KEY="your-api-key"

# Or add to .env file
cp .env.llm.example .env
# Then edit .env and add your key
```

Get your API key from: https://openrouter.ai

### 3. Capture Screenshots

First, capture screenshots of websites:

```bash
python3 scripts/crawlers/run_crawler.py --with-snapshots
```

This creates:
- `output/snapshots/{domain}.png` - Screenshots
- `output/snapshots/{domain}.json` - DOM snapshots
- `output/snapshots/snapshot_index.json` - Index file

## Usage

### CLI Usage

```bash
# Check API key
python3 scripts/generate_ai_templates.py --check

# List available snapshots
python3 scripts/generate_ai_templates.py --list

# Generate templates with Claude Sonnet 4.5
python3 scripts/generate_ai_templates.py --model anthropic/claude-sonnet-4-5-2025-06-01

# Generate with Gemini 2.5 Flash (faster, cheaper)
python3 scripts/generate_ai_templates.py --model google/gemini-2-5-flash-preview

# Limit to 5 sites
python3 scripts/generate_ai_templates.py --limit 5

# Single site
python3 scripts/generate_ai_templates.py --single kymetacorp.com

# Import to Supabase
python3 scripts/generate_ai_templates.py --import
```

### Programmatic Usage

```python
from lib.llm import create_llm_client, generate_template_from_snapshot

# Create client
client = create_llm_client("anthropic/claude-sonnet-4-5-2025-06-01")

# Generate template from screenshot
template = generate_template_from_snapshot(
    screenshot_path="output/snapshots/kymetacorp.com.png",
    dom_path="output/snapshots/kymetacorp.com.json",
    site_name="Kymera Corp",
)

print(template)
```

### Batch Processing

```python
from lib.llm import run_batch_generation, import_to_template_library

# Generate templates from all snapshots
summary = run_batch_generation(
    snapshot_index="output/snapshots/snapshot_index.json",
    output_dir="output/ai-templates",
    model="anthropic/claude-sonnet-4-5-2025-06-01",
    limit=10,
)

# Import to Supabase
import_to_template_library("output/ai-templates")
```

## Output

Generated templates are saved to `output/ai-templates/`:
- `{domain}.json` - Individual template JSON
- `batch_summary.json` - Processing summary

### Template Structure

```json
{
  "name": "Brand Name AI Template",
  "slug": "brand-name-ai",
  "template_type": "page",
  "template_kind": "landing",
  "template_source": "ai-generated",
  "puck_data": {
    "root": {
      "props": {
        "title": "Site Name",
        "branding": {
          "name": "Brand Name",
          "colors": { "primary": "#HEX", ... },
          "style": { "typography": "Font Name", "borderRadius": "md" }
        }
      }
    },
    "content": [
      { "type": "Hero", "props": { ... } },
      { "type": "FeatureGrid", "props": { ... } },
      { "type": "Testimonials", "props": { ... } },
      { "type": "CTASection", "props": { ... } }
    ]
  },
  "visual_spec": {
    "colors": { "primary": "#HEX", "accent": "#HEX", ... },
    "typography": { "heading": "48px", "body": "16px", ... },
    "layout": { "radius": "md", "has_grid": true, ... },
    "theme": "dark"
  }
}
```

## Tips

### For Best Results

1. **Use Claude Sonnet 4.5** for complex, design-heavy sites
2. **Use Gemini 2.5 Flash** for simple, content-heavy sites
3. **Higher quality screenshots** = better template output
4. **Limit batch size** to avoid rate limits

### Rate Limits

OpenRouter has rate limits based on your plan. For large batches:
- Use `limit` parameter to process in chunks
- Consider using Gemini 2.5 Flash for faster processing
- Check OpenRouter dashboard for current usage

## Architecture

```
scripts/generate_ai_templates.py
    ↓
lib/llm/client.py
    ├── OpenRouterClient (API calls)
    └── TemplateReconstructor (2-step: visual analysis → template generation)
    ↓
lib/llm/batch_processor.py
    ├── BatchTemplateProcessor
    └── import_to_template_library (Supabase import)
    ↓
output/ai-templates/
    ├── {domain}.json (individual templates)
    └── batch_summary.json (summary)
```

## Troubleshooting

### "OPENROUTER_API_KEY not set"
```bash
export OPENROUTER_API_KEY="your-key"
```

### "No snapshots found"
```bash
python3 scripts/crawlers/run_crawler.py --with-snapshots
```

### Playwright not installed
```bash
pip3 install playwright
python3 -m playwright install chromium
```

### Rate limit errors
- Wait and retry
- Use `--limit` to process fewer at a time
- Check OpenRouter dashboard for your plan limits

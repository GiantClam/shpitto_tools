"""
Prompt templates for template reconstruction tasks.
"""

# System prompt for template reconstruction
TEMPLATE_RECONSTRUCTION_SYSTEM = """You are an expert web designer and frontend architect. Your specialty is analyzing websites and extracting their design systems to create reusable, high-quality templates.

Your strengths:
1. Precise visual analysis - you notice typography, colors, spacing, shadows
2. Understanding of component hierarchies and layouts
3. Creating semantic, accessible HTML structures
4. Following modern design patterns and best practices

When analyzing websites, you always consider:
- Brand consistency and visual hierarchy
- User experience and accessibility
- Responsive design principles
- Performance implications of design choices

When generating templates, you ensure:
- Clean, maintainable code structure
- Proper semantic HTML
- Accessible patterns
- Responsive by default"""

# Vision analysis prompt
VISION_ANALYSIS_PROMPT = """Analyze this website screenshot to extract its visual design system.

For each section, identify and describe:

1. **Colors**: Extract the exact hex codes for:
   - Primary brand color (used for main actions, links)
   - Secondary color (used for accents, highlights)
   - Background color(s)
   - Text color(s)
   - Any accent or decorative colors

2. **Typography**:
   - Heading font family and weight
   - Body text font family and weight
   - Font sizes (approximate px values)
   - Line heights and letter spacing

3. **Layout & Spacing**:
   - Container width (how wide is the main content)
   - Grid system (how many columns)
   - Gap between elements (card gaps, section padding)
   - Border radius on buttons and cards

4. **Component Styles**:
   - Button styles (fill, outline, shadow, radius)
   - Card styles (flat, bordered, elevated, glass)
   - Navigation style (horizontal, hamburger, sidebar)

5. **Page Sections** (in order from top to bottom):
   - Hero: title, subtitle, CTA, background
   - Features: grid layout, card count, icons
   - Social Proof: testimonials, client logos
   - CTA: banner style, button text
   - Footer: links, social icons

Provide your analysis in the following JSON format:
```json
{{
  "brand_analysis": {{
    "industry": "tech|finance|ecommerce|etc",
    "brand_personality": "minimal|bold|friendly|professional|luxury",
    "visual_complexity": "simple|moderate|complex"
  }},
  "colors": {{
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX", 
    "background": "#HEX",
    "background_secondary": "#HEX",
    "text": "#HEX",
    "text_muted": "#HEX"
  }},
  "typography": {{
    "heading_font": "Font Name",
    "heading_weight": 400-900,
    "heading_size": "48px",
    "body_font": "Font Name", 
    "body_weight": 400,
    "body_size": "16px",
    "line_height": "1.5-1.8"
  }},
  "layout": {{
    "container_width": "1200-1440px",
    "grid_columns": 12,
    "section_padding": "64px-120px",
    "element_gap": "16px-32px",
    "border_radius": "sm|md|lg|xl",
    "visual_density": "airy|balanced|compact"
  }},
  "components": {{
    "buttons": {{
      "style": "fill|outline|soft",
      "border_radius": "4px-12px",
      "shadow": "none|subtle|medium"
    }},
    "cards": {{
      "style": "flat|bordered|elevated",
      "shadow": "none|subtle|medium",
      "padding": "24px-32px"
    }},
    "navigation": {{
      "style": "horizontal|stacked|hamburger"
    }}
  }},
  "sections": [
    {{
      "name": "Hero",
      "type": "Hero",
      "props": {{
        "title": "Main headline (exact text)",
        "description": "Subheading (exact text)",
        "cta_text": "Button text or 'none'",
        "alignment": "left|center",
        "background": "gradient|solid|image|none"
      }}
    }},
    {{
      "name": "Features",
      "type": "FeatureGrid",
      "props": {{
        "title": "Section title",
        "columns": 3-4,
        "card_layout": "vertical|horizontal"
      }}
    }},
    {{
      "name": "Social Proof", 
      "type": "Testimonials|Logos",
      "props": {{
        "style": "grid|carousel|cards"
      }}
    }},
    {{
      "name": "CTA",
      "type": "CTASection",
      "props": {{
        "title": "CTA headline",
        "button_text": "Get Started"
      }}
    }}
  ]
}}
```"""

# Template generation prompt
TEMPLATE_GENERATION_PROMPT = """Using the visual analysis and DOM data provided, generate a complete, production-ready Puck template.

The template should:
1. Match the visual design exactly (colors, fonts, spacing)
2. Include all identified sections in the correct order
3. Use semantic, accessible HTML structure
4. Be responsive by default
5. Follow modern CSS practices (flexbox, CSS grid)

Generate the template in this JSON format:
```json
{{
  "name": "Brand Name Template",
  "slug": "brand-name-template",
  "template_type": "page",
  "template_kind": "landing",
  "template_source": "ai-generated",
  "description": "A {brand_personality} landing page for {industry} businesses",
  "puck_data": {{
    "root": {{
      "props": {{
        "title": "Site Name",
        "branding": {{
          "name": "Brand Name",
          "colors": {{
            "primary": "#HEX",
            "secondary": "#HEX",
            "accent": "#HEX",
            "background": "#HEX",
            "text": "#HEX"
          }},
          "style": {{
            "typography": "Font Name",
            "borderRadius": "md"
          }}
        }}
      }}
    }},
    "content": [
      {{
        "type": "Hero",
        "props": {{
          "title": "Hero Headline",
          "description": "Hero description text",
          "ctaText": "CTA Button",
          "theme": "dark|light",
          "align": "left|center",
          "effect": "gradient|none"
        }}
      }},
      {{
        "type": "FeatureGrid",
        "props": {{
          "title": "Our Features",
          "columns": 3,
          "items": [
            {{
              "title": "Feature 1",
              "description": "Feature description",
              "icon": "icon-name"
            }}
          ]
        }}
      }},
      {{
        "type": "Testimonials",
        "props": {{
          "title": "What Customers Say",
          "items": [
            {{
              "content": "Testimonial quote",
              "author": "Name",
              "role": "Title"
            }}
          ]
        }}
      }},
      {{
        "type": "CTASection",
        "props": {{
          "title": "Ready to Get Started?",
          "description": "Call to action text",
          "ctaText": "Get Started",
          "theme": "dark|light"
        }}
      }}
    ]
  }},
  "visual_spec": {{
    "typography": {{
      "heading": "48px Bold Font Name",
      "body": "16px Regular Font Name",
      "font": "Font Name"
    }},
    "layout": {{
      "aspect_ratio": "16:9",
      "resolution": "1920x1080",
      "radius": "md",
      "has_grid": true,
      "has_flex": true
    }},
    "theme": "dark|light|auto",
    "palette": {{
      "primary": "#HEX",
      "accent": "#HEX"
    }},
    "align": "left|center",
    "effect": "none"
  }}
}}
```"""

# Refinement prompt for improving generated templates
REFINEMENT_PROMPT = """Review and refine this template to improve:
1. Consistency with the visual analysis
2. Accessibility (contrast, semantic HTML)
3. Responsive behavior hints
4. Code quality and maintainability

Return ONLY the refined JSON with brief notes on changes made."""

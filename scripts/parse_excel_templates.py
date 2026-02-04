import argparse
import json
import re
from pathlib import Path

import pandas as pd


def normalize_url(value: str) -> str:
    value = value.strip()
    if not value:
        return value
    if value.startswith("http://") or value.startswith("https://"):
        return value
    return f"https://{value}"


def slug_from_url(url: str) -> str:
    host = re.sub(r"^https?://", "", url).strip()
    host = host.split("/")[0]
    return re.sub(r"[^a-zA-Z0-9]+", "-", host).strip("-").lower()


def extract_first(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text)
    return match.group(1) if match else None


def extract_segments(text: str) -> list[str]:
    segments = re.split(r"[，,；;]", text)
    return [seg.strip() for seg in segments if seg.strip()]


def contains_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def pick_theme(text: str) -> str:
    if contains_any(text, ["玻璃", "透明", "磨砂", "Glass"]):
        return "glass"
    if contains_any(text, ["黑", "暗", "深空", "深邃", "夜间", "全黑", "暗调"]):
        return "dark"
    if contains_any(text, ["白", "纯白", "白底", "高调", "明亮"]):
        return "light"
    return "dark"


def pick_palette(text: str) -> dict:
    if contains_any(text, ["暖灰", "暖", "奢华", "皮革", "铜", "金", "珠宝", "拉丝"]):
        return {"primary": "#2b2118", "accent": "#f59e0b"}
    if contains_any(text, ["绿色", "环保", "生态", "可持续", "自然"]):
        return {"primary": "#0f172a", "accent": "#22c55e"}
    if contains_any(text, ["紫", "霓虹", "量子", "未来", "激光"]):
        return {"primary": "#111827", "accent": "#a855f7"}
    if contains_any(text, ["红", "橙", "火", "热", "引擎", "热试", "燃烧"]):
        return {"primary": "#1f2937", "accent": "#f97316"}
    if contains_any(
        text, ["黑", "暗", "深空", "深邃", "暗调", "防御", "战地", "低照度"]
    ):
        return {"primary": "#0a0f1f", "accent": "#60a5fa"}
    if contains_any(text, ["深空蓝", "宇宙", "星空", "轨道", "星图"]):
        return {"primary": "#0b1226", "accent": "#4f9cff"}
    if contains_any(text, ["蓝", "冷光", "科技", "数字", "电光"]):
        return {"primary": "#0b1020", "accent": "#38bdf8"}
    if contains_any(text, ["白", "极简", "纯净", "实验室", "高调", "白底"]):
        return {"primary": "#111827", "accent": "#0ea5e9"}
    if contains_any(text, ["工业", "金属", "机械", "中性灰", "工业灰", "铝", "钢"]):
        return {"primary": "#111827", "accent": "#94a3b8"}
    return {"primary": "#0f172a", "accent": "#2563eb"}


def pick_align(text: str) -> str:
    if contains_any(text, ["居中", "中心", "对称", "中央", "绝对中心"]):
        return "text-center"
    return "text-left"


def pick_effect(text: str) -> str:
    if contains_any(
        text, ["网格", "扫描", "矩阵", "坐标", "Grid", "波束", "粒子", "星图", "轨道"]
    ):
        return "retro-grid"
    return "none"


def pick_cta(text: str) -> str:
    if contains_any(text, ["下载", "白皮书", "资料"]):
        return "Download Whitepaper"
    if contains_any(text, ["咨询", "联系", "沟通"]):
        return "Contact Sales"
    if contains_any(text, ["报价", "询价"]):
        return "Request Quote"
    if contains_any(text, ["订购", "购买", "下单"]):
        return "Buy Now"
    if contains_any(text, ["演示", "预约", "试用"]):
        return "Book a Demo"
    return "Learn More"


def pick_tone(text: str) -> str | None:
    if contains_any(text, ["英雄主义", "史诗", "使命"]):
        return "heroic"
    if contains_any(text, ["工匠", "匠心", "手工"]):
        return "craft"
    if contains_any(text, ["极简", "简约", "减法"]):
        return "minimal"
    if contains_any(text, ["奢华", "高端", "奢侈"]):
        return "luxury"
    if contains_any(text, ["专业", "工程", "严谨"]):
        return "professional"
    if contains_any(text, ["前卫", "先锋", "实验"]):
        return "avant-garde"
    return None


def pick_font(text: str) -> str:
    if contains_any(text, ["等宽", "代码", "档案", "像素", "仪表"]):
        return "Space Mono"
    if contains_any(text, ["衬线", "艺术", "画廊", "雕塑", "史诗"]):
        return "Cormorant Garamond"
    if contains_any(text, ["黑体", "粗体", "硬核", "工业"]):
        return "Oswald"
    if contains_any(text, ["包豪斯", "瑞士", "极简", "国际主义"]):
        return "Helvetica Neue"
    if contains_any(text, ["未来", "几何", "科技", "数字"]):
        return "Space Grotesk"
    return "Space Grotesk"


def pick_radius(text: str) -> str:
    if contains_any(text, ["硬核", "机械", "工业", "工程", "硬边"]):
        return "none"
    if contains_any(text, ["奢华", "柔和", "圆润", "高端"]):
        return "lg"
    if contains_any(text, ["极简", "包豪斯", "瑞士"]):
        return "sm"
    return "md"


def classify_page_kind(text: str) -> str:
    if contains_any(text, ["关于", "使命", "团队", "公司", "历史", "文化", "品牌故事"]):
        return "about"
    if contains_any(text, ["产品", "机型", "规格", "配置", "型号", "部件", "模块"]):
        return "product"
    return "landing"


def extract_feature_bullets(segments: list[str]) -> list[str]:
    picked = []
    for seg in segments:
        if contains_any(
            seg, ["可视化", "交互", "模拟", "系统", "结构", "材料", "参数", "数据"]
        ):
            picked.append(seg)
        if len(picked) >= 4:
            break
    return picked or [
        "High-precision systems",
        "Real-time monitoring",
        "Modular deployment",
    ]


def pick_cta_variant(text: str) -> str:
    if contains_any(text, ["下载", "白皮书", "资料"]):
        return "card"
    if contains_any(text, ["咨询", "联系", "预约"]):
        return "split"
    return "simple"


def build_value_props(segments: list[str]) -> dict:
    items = []
    for seg in segments:
        if contains_any(seg, ["系统", "方案", "价值", "能力", "集成", "性能", "效率"]):
            items.append({"title": seg[:12], "description": seg})
        if len(items) >= 3:
            break
    if not items:
        items = [
            {
                "title": "Modular Architecture",
                "description": "Composable modules with clear system boundaries.",
            },
            {
                "title": "Precision Output",
                "description": "Tight tolerance control with repeatable quality.",
            },
            {
                "title": "Operational Clarity",
                "description": "Live dashboards and traceable operations.",
            },
        ]
    return {
        "type": "ValuePropositions",
        "props": {"title": "Core Capabilities", "items": items},
    }


def build_product_preview(segments: list[str]) -> dict:
    items = []
    for seg in segments:
        if contains_any(seg, ["产品", "型号", "机型", "配置", "零件", "部件", "配件"]):
            items.append({"title": seg[:10], "description": seg})
        if len(items) >= 4:
            break
    if not items:
        items = [
            {
                "title": "Industrial Module",
                "description": "Configurable layout for production lines.",
            },
            {
                "title": "Precision Assembly",
                "description": "High-fidelity machining and tooling.",
            },
            {
                "title": "Integration Kit",
                "description": "Compatible with existing control stacks.",
            },
        ]
    return {"type": "ProductPreview", "props": {"title": "Systems", "items": items}}


def build_cta_section(cta_text: str, variant: str) -> dict:
    return {
        "type": "CTASection",
        "props": {
            "title": "Ready to deploy?",
            "description": "Align your operations with a proven industrial system.",
            "ctaText": cta_text,
            "ctaLink": "#",
            "variant": variant,
        },
    }


def build_stats() -> dict:
    return {
        "type": "Stats",
        "props": {
            "items": [
                {"label": "Reliability", "value": "99", "suffix": "%"},
                {"label": "Deployments", "value": "120", "suffix": "+"},
                {"label": "Latency", "value": "45", "suffix": "ms"},
                {"label": "Countries", "value": "18", "suffix": "+"},
            ]
        },
    }


def build_testimonials(flow_name: str | None) -> dict:
    return {
        "type": "Testimonials",
        "props": {
            "title": f"{flow_name or 'Customer'} Perspectives",
            "items": [
                {
                    "content": "Precision output and clear instrumentation across the workflow.",
                    "author": "Operations Lead",
                    "role": "Industrial Systems",
                },
                {
                    "content": "The deployment cadence and reliability metrics exceeded expectations.",
                    "author": "Program Director",
                    "role": "Manufacturing",
                },
            ],
        },
    }


def build_logos() -> dict:
    return {
        "type": "Logos",
        "props": {
            "title": "Trusted By",
            "items": [
                {
                    "name": "Atlas",
                    "logo": "https://dummyimage.com/120x40/0f172a/ffffff&text=Atlas",
                },
                {
                    "name": "Nova",
                    "logo": "https://dummyimage.com/120x40/0f172a/ffffff&text=Nova",
                },
                {
                    "name": "Helix",
                    "logo": "https://dummyimage.com/120x40/0f172a/ffffff&text=Helix",
                },
            ],
        },
    }


def build_faq() -> dict:
    return {
        "type": "FAQ",
        "props": {
            "title": "FAQ",
            "items": [
                {
                    "question": "What is the typical deployment timeline?",
                    "answer": "Most deployments ship within 6-8 weeks based on integration scope.",
                },
                {
                    "question": "How do you handle compliance?",
                    "answer": "We align with industry certifications and provide full traceability.",
                },
            ],
        },
    }


def pick_cta_variant(text: str) -> str:
    if contains_any(text, ["下载", "白皮书", "资料"]):
        return "card"
    if contains_any(text, ["咨询", "联系", "预约"]):
        return "split"
    return "simple"


def build_value_props(segments: list[str]) -> dict:
    items = []
    for seg in segments:
        if contains_any(seg, ["系统", "方案", "价值", "能力", "集成", "性能", "效率"]):
            items.append({"title": seg[:12], "description": seg})
        if len(items) >= 3:
            break
    if not items:
        items = [
            {
                "title": "Modular Architecture",
                "description": "Composable modules with clear system boundaries.",
            },
            {
                "title": "Precision Output",
                "description": "Tight tolerance control with repeatable quality.",
            },
            {
                "title": "Operational Clarity",
                "description": "Live dashboards and traceable operations.",
            },
        ]
    return {
        "type": "ValuePropositions",
        "props": {"title": "Core Capabilities", "items": items},
    }


def build_product_preview(segments: list[str]) -> dict:
    items = []
    for seg in segments:
        if contains_any(seg, ["产品", "型号", "机型", "配置", "零件", "部件", "配件"]):
            items.append({"title": seg[:10], "description": seg})
        if len(items) >= 4:
            break
    if not items:
        items = [
            {
                "title": "Industrial Module",
                "description": "Configurable layout for production lines.",
            },
            {
                "title": "Precision Assembly",
                "description": "High-fidelity machining and tooling.",
            },
            {
                "title": "Integration Kit",
                "description": "Compatible with existing control stacks.",
            },
        ]
    return {"type": "ProductPreview", "props": {"title": "Systems", "items": items}}


def build_cta_section(cta_text: str, variant: str) -> dict:
    return {
        "type": "CTASection",
        "props": {
            "title": "Ready to deploy?",
            "description": "Align your operations with a proven industrial system.",
            "ctaText": cta_text,
            "ctaLink": "#",
            "variant": variant,
        },
    }


def parse_row(url: str, description: str) -> dict:
    raw_description = description.strip()
    normalized_url = normalize_url(url)
    slug = slug_from_url(normalized_url)

    heading_size = extract_first(r"标题\s*(\d+px)", raw_description)
    body_size = extract_first(r"内文\s*(\d+px)", raw_description)
    aspect_ratio = extract_first(r"(\d+:\d+)", raw_description)
    resolution = extract_first(r"(\d{3,4}x\d{3,4})", raw_description)
    hero_key = extract_first(r"\b([A-Za-z0-9-]+-Hero)\b", raw_description)
    flow_name = extract_first(r"([\u4e00-\u9fff]{2,}流)", raw_description)

    segments = extract_segments(raw_description)
    theme = pick_theme(raw_description)
    palette = pick_palette(raw_description)
    align = pick_align(raw_description)
    effect = pick_effect(raw_description)
    cta_text = pick_cta(raw_description)
    cta_variant = pick_cta_variant(raw_description)
    tone = pick_tone(raw_description)
    font_family = pick_font(raw_description)
    radius = pick_radius(raw_description)
    page_kind = classify_page_kind(raw_description)
    feature_bullets = extract_feature_bullets(segments)
    has_metrics = contains_any(
        raw_description, ["参数", "数据", "指标", "里程碑", "看板", "矩阵", "指标"]
    )
    has_feature = contains_any(
        raw_description, ["解构", "原理", "逻辑", "结构", "材料", "模块"]
    )
    has_products = contains_any(
        raw_description, ["产品", "机型", "型号", "配置", "零件", "配件", "规格"]
    )
    has_value = contains_any(raw_description, ["方案", "价值", "能力", "集成", "效率"])
    has_cta = contains_any(
        raw_description, ["下载", "白皮书", "咨询", "联系", "预约", "购买", "询价"]
    )
    has_logos = contains_any(
        raw_description, ["客户", "伙伴", "合作", "品牌", "认证", "信任"]
    )
    has_testimonials = contains_any(
        raw_description, ["评价", "口碑", "案例", "故事", "评价", "推荐"]
    )
    has_faq = contains_any(raw_description, ["问题", "FAQ", "疑问"])

    if aspect_ratio in {"100vh", "21:9"}:
        theme = "dark"
        align = "text-center"
        effect = effect if effect != "none" else "retro-grid"

    if aspect_ratio in {"3:4", "4:3"} and contains_any(
        raw_description, ["画廊", "档案", "竖向", "证件", "画幅"]
    ):
        align = "text-center"

    visual_spec = {
        "typography": {
            "heading": heading_size,
            "body": body_size,
            "font": font_family,
        },
        "layout": {
            "aspect_ratio": aspect_ratio,
            "resolution": resolution,
            "radius": radius,
        },
        "hero_key": hero_key,
        "flow_name": flow_name,
        "theme": theme,
        "palette": palette,
        "align": align,
        "effect": effect,
        "raw_segments": segments,
    }

    copy_spec = {
        "tone": tone,
        "vocabulary": segments,
        "raw_description": raw_description,
    }

    content_blocks = [
        {
            "type": "Hero",
            "props": {
                "title": flow_name or "Template Hero",
                "description": raw_description,
                "ctaText": cta_text,
                "theme": theme,
                "align": align,
                "effect": effect,
            },
        }
    ]

    blocks_secondary: list[dict] = []

    if has_metrics:
        blocks_secondary.append(build_stats())

    if has_value:
        blocks_secondary.append(build_value_props(segments))

    if has_feature:
        blocks_secondary.append(
            {
                "type": "FeatureHighlight",
                "props": {
                    "title": f"{flow_name or 'Core'} Architecture",
                    "description": "Precision engineered systems with layered visualization and operational clarity.",
                    "align": "left",
                    "features": feature_bullets,
                },
            }
        )

    if has_products:
        blocks_secondary.append(build_product_preview(segments))

    if has_logos:
        blocks_secondary.append(build_logos())

    if has_testimonials:
        blocks_secondary.append(build_testimonials(flow_name))

    if has_faq:
        blocks_secondary.append(build_faq())

    if has_cta:
        blocks_secondary.append(build_cta_section(cta_text, cta_variant))

    if aspect_ratio in {"21:9", "100vh"}:
        content_blocks += blocks_secondary
    elif aspect_ratio in {"3:4", "4:3"}:
        ordered = []
        ordered += [
            block for block in blocks_secondary if block["type"] == "ProductPreview"
        ]
        ordered += [
            block for block in blocks_secondary if block["type"] == "FeatureHighlight"
        ]
        ordered += [
            block
            for block in blocks_secondary
            if block["type"] not in {"ProductPreview", "FeatureHighlight"}
        ]
        content_blocks += ordered
    else:
        content_blocks += blocks_secondary

    puck_data = {
        "root": {
            "props": {
                "title": flow_name or slug,
                "branding": {
                    "name": flow_name or slug,
                    "colors": palette,
                    "style": {
                        "typography": font_family,
                        "borderRadius": radius,
                    },
                },
            },
        },
        "content": content_blocks,
    }

    return {
        "name": flow_name or slug,
        "slug": f"{slug}-{hero_key.lower()}" if hero_key else slug,
        "source_url": normalized_url,
        "raw_description": raw_description,
        "visual_spec": visual_spec,
        "interaction_spec": {
            "raw_segments": segments,
        },
        "copy_spec": copy_spec,
        "puck_data": puck_data,
        "template_type": "page",
        "template_kind": page_kind,
        "template_source": "excel",
    }


def build_template(
    *,
    name: str,
    slug: str,
    template_type: str,
    template_kind: str,
    description: str,
    palette: dict,
    font_family: str,
    layout: dict,
    content: list[dict],
    theme: str = "dark",
    align: str = "text-left",
    effect: str = "none",
) -> dict:
    return {
        "name": name,
        "slug": slug,
        "source_url": None,
        "raw_description": description,
        "visual_spec": {
            "typography": {"heading": None, "body": None, "font": font_family},
            "layout": layout,
            "flow_name": name,
            "theme": theme,
            "palette": palette,
            "align": align,
            "effect": effect,
            "raw_segments": [],
        },
        "interaction_spec": {"raw_segments": []},
        "copy_spec": {"tone": None, "vocabulary": [], "raw_description": description},
        "puck_data": {
            "root": {
                "props": {
                    "title": name,
                    "branding": {
                        "name": name,
                        "colors": palette,
                        "style": {
                            "typography": font_family,
                            "borderRadius": layout.get("radius", "md"),
                        },
                    },
                }
            },
            "content": content,
        },
        "template_type": template_type,
        "template_kind": template_kind,
        "template_source": "library",
    }


def build_library_templates() -> list[dict]:
    templates: list[dict] = []

    landing_palette = {"primary": "#0b1020", "accent": "#38bdf8"}
    product_palette = {"primary": "#111827", "accent": "#94a3b8"}
    about_palette = {"primary": "#2b2118", "accent": "#f59e0b"}

    landing_layout = {"aspect_ratio": "16:9", "resolution": "2560x1440", "radius": "md"}
    product_layout = {
        "aspect_ratio": "21:9",
        "resolution": "2560x1440",
        "radius": "none",
    }
    about_layout = {"aspect_ratio": "4:3", "resolution": "1920x1080", "radius": "lg"}
    pricing_layout = {"aspect_ratio": "16:9", "resolution": "1920x1080", "radius": "md"}
    case_layout = {"aspect_ratio": "21:9", "resolution": "2560x1440", "radius": "md"}
    careers_layout = {"aspect_ratio": "16:9", "resolution": "1920x1080", "radius": "md"}
    docs_layout = {"aspect_ratio": "4:3", "resolution": "1920x1080", "radius": "sm"}

    landing_content = [
        {
            "type": "Hero",
            "props": {
                "title": "Industrial Launch System",
                "description": "Launch a production-ready industrial site with measurable performance and clear system architecture.",
                "ctaText": "Book a Demo",
                "theme": "dark",
                "align": "text-center",
                "effect": "retro-grid",
            },
        },
        build_stats(),
        build_value_props(
            ["Operational clarity", "Precision output", "Modular deployment"]
        ),
        build_product_preview(["System Alpha", "Integration Kit", "Monitoring Suite"]),
        build_testimonials("Launch"),
        build_cta_section("Start the Launch", "split"),
    ]

    templates.append(
        build_template(
            name="Landing Page Template",
            slug="library-landing-page",
            template_type="page",
            template_kind="landing",
            description="Landing page template for industrial SaaS and hardware brands.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=landing_layout,
            content=landing_content,
            theme="dark",
            align="text-center",
            effect="retro-grid",
        )
    )

    product_content = [
        {
            "type": "Hero",
            "props": {
                "title": "Product Systems",
                "description": "Highlight key SKUs, specs, and engineering advantages with modular sections.",
                "ctaText": "Request Quote",
                "theme": "dark",
                "align": "text-left",
                "effect": "none",
            },
        },
        build_product_preview(
            ["Core Platform", "Precision Assembly", "Automation Stack"]
        ),
        {
            "type": "FeatureHighlight",
            "props": {
                "title": "Engineering Highlights",
                "description": "Deep dive into specifications, performance, and reliability metrics.",
                "align": "right",
                "features": [
                    "Modular chassis",
                    "Thermal control",
                    "Telemetry ready",
                ],
            },
        },
        build_faq(),
        build_cta_section("Request Quote", "card"),
    ]

    templates.append(
        build_template(
            name="Product Page Template",
            slug="library-product-page",
            template_type="page",
            template_kind="product",
            description="Product page template for hardware and manufacturing systems.",
            palette=product_palette,
            font_family="Oswald",
            layout=product_layout,
            content=product_content,
            theme="dark",
            align="text-left",
            effect="none",
        )
    )

    about_content = [
        {
            "type": "Hero",
            "props": {
                "title": "Built for Precision",
                "description": "Showcase mission, leadership, and heritage with a premium editorial layout.",
                "ctaText": "Contact Leadership",
                "theme": "light",
                "align": "text-center",
                "effect": "none",
            },
        },
        build_logos(),
        build_value_props(["Mission focus", "Rigorous culture", "Global footprint"]),
        build_testimonials("About"),
        build_cta_section("Start a Partnership", "simple"),
    ]

    templates.append(
        build_template(
            name="About Page Template",
            slug="library-about-page",
            template_type="page",
            template_kind="about",
            description="About page template emphasizing mission, team, and credibility.",
            palette=about_palette,
            font_family="Cormorant Garamond",
            layout=about_layout,
            content=about_content,
            theme="light",
            align="text-center",
            effect="none",
        )
    )

    pricing_content = [
        {
            "type": "Hero",
            "props": {
                "title": "Pricing & Deployment",
                "description": "Flexible deployment tiers with clear operational scope and support levels.",
                "ctaText": "Request Quote",
                "theme": "light",
                "align": "text-center",
                "effect": "none",
            },
        },
        build_value_props(["Pilot", "Scale", "Enterprise"]),
        build_stats(),
        build_faq(),
        build_cta_section("Request Quote", "card"),
    ]

    templates.append(
        build_template(
            name="Pricing Page Template",
            slug="library-pricing-page",
            template_type="page",
            template_kind="pricing",
            description="Pricing and deployment options for industrial systems.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=pricing_layout,
            content=pricing_content,
            theme="light",
            align="text-center",
            effect="none",
        )
    )

    case_content = [
        {
            "type": "Hero",
            "props": {
                "title": "Case Study",
                "description": "Operational story with metrics, system diagrams, and delivery impact.",
                "ctaText": "Download Report",
                "theme": "dark",
                "align": "text-left",
                "effect": "retro-grid",
            },
        },
        build_logos(),
        {
            "type": "FeatureHighlight",
            "props": {
                "title": "Deployment Highlights",
                "description": "Timeline of critical deployment phases and system tuning.",
                "align": "left",
                "features": [
                    "Site survey",
                    "Integration",
                    "Calibration",
                    "Outcome review",
                ],
            },
        },
        build_stats(),
        build_testimonials("Case"),
        build_cta_section("Schedule a Briefing", "split"),
    ]

    templates.append(
        build_template(
            name="Case Study Template",
            slug="library-case-study-page",
            template_type="page",
            template_kind="case-study",
            description="Case study template for industrial deployments.",
            palette=landing_palette,
            font_family="Space Mono",
            layout=case_layout,
            content=case_content,
            theme="dark",
            align="text-left",
            effect="retro-grid",
        )
    )

    careers_content = [
        {
            "type": "Hero",
            "props": {
                "title": "Join the Mission",
                "description": "Showcase teams, culture, and open roles with clarity and impact.",
                "ctaText": "View Open Roles",
                "theme": "light",
                "align": "text-center",
                "effect": "none",
            },
        },
        build_value_props(["Engineering", "Operations", "Research"]),
        build_testimonials("Culture"),
        build_faq(),
        build_cta_section("Apply Now", "simple"),
    ]

    templates.append(
        build_template(
            name="Careers Page Template",
            slug="library-careers-page",
            template_type="page",
            template_kind="careers",
            description="Careers page template highlighting mission and roles.",
            palette=about_palette,
            font_family="Cormorant Garamond",
            layout=careers_layout,
            content=careers_content,
            theme="light",
            align="text-center",
            effect="none",
        )
    )

    docs_content = [
        {
            "type": "Hero",
            "props": {
                "title": "Documentation",
                "description": "Structured docs landing with quick start, APIs, and integrations.",
                "ctaText": "Start Reading",
                "theme": "light",
                "align": "text-left",
                "effect": "none",
            },
        },
        build_value_props(["Quickstart", "API Reference", "Deployment Guides"]),
        build_faq(),
        build_cta_section("Contact Support", "split"),
    ]

    templates.append(
        build_template(
            name="Docs Page Template",
            slug="library-docs-page",
            template_type="page",
            template_kind="docs",
            description="Documentation landing template for industrial products.",
            palette=product_palette,
            font_family="Space Mono",
            layout=docs_layout,
            content=docs_content,
            theme="light",
            align="text-left",
            effect="none",
        )
    )

    section_templates = [
        build_template(
            name="Hero Section",
            slug="section-hero",
            template_type="section",
            template_kind="hero",
            description="Hero section with CTA and motion-ready background.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=landing_layout,
            content=[
                {
                    "type": "Hero",
                    "props": {
                        "title": "Industrial Hero",
                        "description": "Primary hero section for industrial brands.",
                        "ctaText": "Book a Demo",
                        "theme": "dark",
                        "align": "text-center",
                        "effect": "retro-grid",
                    },
                }
            ],
            theme="dark",
            align="text-center",
            effect="retro-grid",
        ),
        build_template(
            name="Feature Highlight",
            slug="section-feature-highlight",
            template_type="section",
            template_kind="feature-highlight",
            description="Two-column feature highlight section.",
            palette=product_palette,
            font_family="Oswald",
            layout=product_layout,
            content=[
                {
                    "type": "FeatureHighlight",
                    "props": {
                        "title": "Engineering Precision",
                        "description": "Highlight a core differentiator with visuals and bullet proof points.",
                        "align": "left",
                        "features": [
                            "Multi-axis control",
                            "Sensor fusion",
                            "Remote diagnostics",
                        ],
                    },
                }
            ],
        ),
        build_template(
            name="Value Proposition Grid",
            slug="section-value-props",
            template_type="section",
            template_kind="value-props",
            description="Three-column value prop grid.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=landing_layout,
            content=[build_value_props(["Reliability", "Velocity", "Clarity"])],
        ),
        build_template(
            name="Product Preview",
            slug="section-product-preview",
            template_type="section",
            template_kind="product-preview",
            description="Bento-style product grid section.",
            palette=product_palette,
            font_family="Oswald",
            layout=product_layout,
            content=[
                build_product_preview(["System Alpha", "System Beta", "System Gamma"])
            ],
        ),
        build_template(
            name="Testimonials",
            slug="section-testimonials",
            template_type="section",
            template_kind="testimonials",
            description="Customer testimonials section.",
            palette=about_palette,
            font_family="Cormorant Garamond",
            layout=about_layout,
            content=[build_testimonials("Testimonials")],
        ),
        build_template(
            name="Logo Cloud",
            slug="section-logos",
            template_type="section",
            template_kind="logos",
            description="Partner logo cloud section.",
            palette=product_palette,
            font_family="Oswald",
            layout=product_layout,
            content=[build_logos()],
        ),
        build_template(
            name="FAQ Section",
            slug="section-faq",
            template_type="section",
            template_kind="faq",
            description="FAQ section with expandable answers.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=landing_layout,
            content=[build_faq()],
        ),
        build_template(
            name="CTA Section",
            slug="section-cta",
            template_type="section",
            template_kind="cta",
            description="Call to action section with primary CTA button.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=landing_layout,
            content=[build_cta_section("Book a Demo", "simple")],
        ),
    ]

    atomic_templates = [
        build_template(
            name="Stats Block",
            slug="atomic-stats",
            template_type="atomic",
            template_kind="stats",
            description="Metrics block for quick KPI highlights.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=landing_layout,
            content=[build_stats()],
        ),
        build_template(
            name="Logo Strip",
            slug="atomic-logos",
            template_type="atomic",
            template_kind="logos",
            description="Logo strip for trust and partner proof.",
            palette=product_palette,
            font_family="Oswald",
            layout=product_layout,
            content=[build_logos()],
        ),
        build_template(
            name="FAQ Block",
            slug="atomic-faq",
            template_type="atomic",
            template_kind="faq",
            description="FAQ section for objections and support.",
            palette=about_palette,
            font_family="Cormorant Garamond",
            layout=about_layout,
            content=[build_faq()],
        ),
        build_template(
            name="CTA Block",
            slug="atomic-cta",
            template_type="atomic",
            template_kind="cta",
            description="Compact CTA block with action button.",
            palette=landing_palette,
            font_family="Space Grotesk",
            layout=landing_layout,
            content=[build_cta_section("Book a Demo", "simple")],
        ),
        build_template(
            name="Testimonial Card",
            slug="atomic-testimonial",
            template_type="atomic",
            template_kind="testimonial",
            description="Single testimonial block for proof points.",
            palette=about_palette,
            font_family="Cormorant Garamond",
            layout=about_layout,
            content=[build_testimonials("Proof")],
        ),
    ]

    templates.extend(section_templates)
    templates.extend(atomic_templates)
    return templates


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default="/Users/beihuang/Documents/opencode/shpitto/网站视觉描述词库扩充建议.xlsx",
    )
    parser.add_argument(
        "--output",
        default="/Users/beihuang/Documents/opencode/shpitto/output/templates.json",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    df = pd.read_excel(input_path)
    if "网站链接" not in df.columns:
        raise ValueError("Missing column: 网站链接")
    if (
        "字体规格与全维度极致描述词库 (文案、头图、视觉、交互、摄影、渲染、逻辑、动效、调性)"
        not in df.columns
    ):
        raise ValueError("Missing description column")

    rows = []
    for _, row in df.iterrows():
        url = str(row.get("网站链接", "")).strip()
        description = str(
            row.get(
                "字体规格与全维度极致描述词库 (文案、头图、视觉、交互、摄影、渲染、逻辑、动效、调性)",
                "",
            )
        ).strip()
        if not url or not description:
            continue
        rows.append(parse_row(url, description))

    rows.extend(build_library_templates())

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(rows)} templates to {output_path}")


if __name__ == "__main__":
    main()

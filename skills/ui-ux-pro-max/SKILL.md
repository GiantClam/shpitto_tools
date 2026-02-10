---
name: "ui-ux-pro-max"
description: "UI/UX design intelligence with searchable style/color/typography/UX database and design-system generation."
---

# UI UX Pro Max

## 适用场景

当任务涉及网站/页面/组件的 UI 设计、视觉升级、UX 优化、风格统一时使用。

## 建议流程

1. 先生成设计系统（必须）

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<产品类型> <行业> <风格关键词>" --design-system -p "<ProjectName>"
```

2. 需要跨会话复用时持久化到项目目录

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "<ProjectName>"
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "<ProjectName>" --page "<page-name>"
```

会生成：
- `design-system/MASTER.md`
- `design-system/pages/<page-name>.md`

3. 补充查询（按需）

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain style
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain typography
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain color
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain ux
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack html-tailwind
```

## 设计约束要点

- 优先遵守 `design-system/MASTER.md`。
- 页面文件存在时，`design-system/pages/<page-name>.md` 覆盖 MASTER。
- 避免硬编码颜色与字体；统一使用主题 token。
- CTA、层级、留白、响应式和可访问性（对比度、focus、reduced-motion）必须检查。

---
name: theme-factory
description: |
  为 artifacts 生成和应用主题，提供10个预设主题和即时生成能力。
  
  **核心功能:**
  - 10个精心设计的预设主题
  - 支持自定义主题生成
  - 一键应用主题到 artifacts
  
  **应用场景:**
  - 幻灯片、文档、报告
  - HTML 落地页
  - React 组件
  - 任何需要统一样式的场景
  
  **激活方式:**
  - 命令: `/theme [主题名]`
  - 命令: `/apply-theme`
  - 上下文: 检测到样式需求时自动触发
---

# Theme Factory Skill

## Overview

这是一个主题生成和应用技能，为各种 artifacts 提供预设主题和即时主题生成能力。

## Preset Themes

### Theme 1: Modern Minimal

```css
:root {
  /* 基础颜色 */
  --background: #ffffff;
  --foreground: #0f172a;
  
  /* 主色 */
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  
  /* 辅助色 */
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  
  /* 强调色 */
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  
  /* 语义色 */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* 字体 */
  --font-sans: 'Inter', system-ui, sans-serif;
  
  /* 圆角 */
  --radius: 0.5rem;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Theme 2: Dark Elegance

```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  
  --secondary: #1e1e1e;
  --secondary-foreground: #ededed;
  
  --accent: #27272a;
  --accent-foreground: #ededed;
  
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius: 0.75rem;
}
```

### Theme 3: Nature Fresh

```css
:root {
  --background: #f8fafc;
  --foreground: #1e293b;
  
  --primary: #10b981;
  --primary-foreground: #ffffff;
  
  --secondary: #d1fae5;
  --secondary-foreground: #065f46;
  
  --accent: #ecfdf5;
  --accent-foreground: #065f46;
  
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  --font-sans: 'Nunito', system-ui, sans-serif;
  --radius: 1rem;
}
```

### Theme 4: Professional Navy

```css
:root {
  --background: #ffffff;
  --foreground: #1e3a5f;
  
  --primary: #1e3a8a;
  --primary-foreground: #ffffff;
  
  --secondary: #e0f2fe;
  --secondary-foreground: #0c4a6e;
  
  --accent: #f0f9ff;
  --accent-foreground: #0369a1;
  
  --success: #059669;
  --warning: #d97706;
  --error: #dc2626;
  --info: #0284c7;
  
  --font-sans: 'Roboto', system-ui, sans-serif;
  --radius: 0.25rem;
}
```

### Theme 5: Sunset Warm

```css
:root {
  --background: #fffbeb;
  --foreground: #451a03;
  
  --primary: #ea580c;
  --primary-foreground: #ffffff;
  
  --secondary: #ffedd5;
  --secondary-foreground: #9a3412;
  
  --accent: #fed7aa;
  --accent-foreground: #c2410c;
  
  --success: #16a34a;
  --warning: #ca8a04;
  --error: #dc2626;
  --info: #0284c7;
  
  --font-sans: 'Quicksand', system-ui, sans-serif;
  --radius: 0.75rem;
}
```

### Theme 6: Purple Dream

```css
:root {
  --background: #faf5ff;
  --foreground: #3c096c;
  
  --primary: #7c3aed;
  --primary-foreground: #ffffff;
  
  --secondary: #ede9fe;
  --secondary-foreground: #5b21b6;
  
  --accent: #ddd6fe;
  --accent-foreground: #6d28d9;
  
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  --font-sans: 'Poppins', system-ui, sans-serif;
  --radius: 1rem;
}
```

### Theme 7: Ocean Blue

```css
:root {
  --background: #f0f9ff;
  --foreground: #0c4a6e;
  
  --primary: #0284c7;
  --primary-foreground: #ffffff;
  
  --secondary: #e0f2fe;
  --secondary-foreground: #0369a1;
  
  --accent: #bae6fd;
  --accent-foreground: #0284c7;
  
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #0ea5e9;
  
  --font-sans: 'Open Sans', system-ui, sans-serif;
  --radius: 0.5rem;
}
```

### Theme 8: Forest Green

```css
:root {
  --background: #f0fdf4;
  --foreground: #14532d;
  
  --primary: #15803d;
  --primary-foreground: #ffffff;
  
  --secondary: #dcfce7;
  --secondary-foreground: #166534;
  
  --accent: #bbf7d0;
  --accent-foreground: #15803d;
  
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  --font-sans: 'Lato', system-ui, sans-serif;
  --radius: 0.5rem;
}
```

### Theme 9: Rose Blush

```css
:root {
  --background: #fff1f2;
  --foreground: #881337;
  
  --primary: #e11d48;
  --primary-foreground: #ffffff;
  
  --secondary: #ffe4e6;
  --secondary-foreground: #9f1239;
  
  --accent: #fecdd3;
  --accent-foreground: #be123c;
  
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #f43f5e;
  --info: #3b82f6;
  
  --font-sans: 'Nunito', system-ui, sans-serif;
  --radius: 1rem;
}
```

### Theme 10: Monochrome

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  
  --primary: #404040;
  --primary-foreground: #ffffff;
  
  --secondary: #f5f5f5;
  --secondary-foreground: #404040;
  
  --accent: #e5e5e5;
  --accent-foreground: #262626;
  
  --success: #404040;
  --warning: #737373;
  --error: #525252;
  --info: #404040;
  
  --font-sans: 'SF Mono', 'Fira Code', monospace;
  --radius: 0px;
}
```

## Theme Structure

### CSS Custom Properties

```css
:root {
  /* 必需变量 */
  --background: [颜色];
  --foreground: [颜色];
  --primary: [颜色];
  --primary-foreground: [颜色];
  
  /* 可选变量 */
  --secondary: [颜色];
  --secondary-foreground: [颜色];
  --accent: [颜色];
  --accent-foreground: [颜色];
  
  /* 语义变量 */
  --success: [颜色];
  --warning: [颜色];
  --error: [颜色];
  --info: [颜色];
  
  /* 排版变量 */
  --font-sans: [字体栈];
  --font-serif: [字体栈];
  --font-mono: [字体栈];
  
  /* 尺寸变量 */
  --radius: [圆角大小];
  
  /* 阴影变量 */
  --shadow-sm: [阴影];
  --shadow-md: [阴影];
  --shadow-lg: [阴影];
}
```

### Tailwind Theme Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
}
```

## Custom Theme Generation

### Generation Parameters

```typescript
interface ThemeParams {
  // 基础配置
  baseColor: string;      // 主色调
  mode: 'light' | 'dark'; // 模式
  
  // 扩展配置
  fontFamily?: string;
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  shadowStyle?: 'subtle' | 'medium' | 'prominent';
  
  // 高级配置
  contrast?: 'low' | 'normal' | 'high';
  saturation?: 'muted' | 'normal' | 'vibrant';
}
```

### Generation Examples

#### 从颜色生成

```bash
/theme generate --base-color "#3b82f6" --mode light
```

生成包含蓝色主调的浅色主题。

#### 从图片生成

```bash
/theme generate --from-image "banner.png"
```

从图片提取配色方案。

#### 预设变体

```bash
/theme create --preset ocean --variant dark
```

基于 ocean 预设生成深色变体。

## Theme Application

### HTML 应用

```html
<!DOCTYPE html>
<html data-theme="ocean">
<head>
  <link rel="stylesheet" href="theme-ocean.css">
</head>
<body>
  <!-- 你的内容 -->
</body>
</html>
```

### React 应用

```tsx
// ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)

export function ThemeProvider({ children, defaultTheme = "ocean" }) {
  const [theme, setTheme] = useState(defaultTheme)
  
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", theme)
    
    // 加载主题 CSS
    import(`./themes/${theme}.css`)
  }, [theme])
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

### CSS Variables 应用

```css
/* 主题切换 */
[data-theme="ocean"] {
  --background: #f0f9ff;
  --foreground: #0c4a6e;
  --primary: #0284c7;
  /* ... */
}

/* 暗黑模式 */
[data-theme="ocean"][data-mode="dark"] {
  --background: #0c4a6e;
  --foreground: #f0f9ff;
  /* ... */
}
```

## Theme Usage

### 预设主题列表

| 主题名 | 描述 | 适用场景 |
|--------|------|----------|
| modern-minimal | 现代极简 | 企业应用、仪表板 |
| dark-elegance | 暗黑优雅 | 开发者工具、游戏 |
| nature-fresh | 自然清新 | 健康、生活方式 |
| professional-navy | 专业海军蓝 | 金融、企业 |
| sunset-warm | 夕阳暖色 | 创意、时尚 |
| purple-dream | 紫色梦幻 | 娱乐、艺术 |
| ocean-blue | 海洋蓝 | 科技、SaaS |
| forest-green | 森林绿 | 环保、自然 |
| rose-blush | 玫瑰粉 | 美容、婚庆 |
| monochrome | 黑白 | 极简、文档 |

### 主题选择建议

**企业应用:**
- modern-minimal
- professional-navy
- ocean-blue

**创意项目:**
- purple-dream
- sunset-warm
- nature-fresh

**开发者工具:**
- dark-elegance
- monochrome

**消费产品:**
- forest-green
- nature-fresh
- rose-blush

## Command Reference

### 预设主题命令

```bash
# 应用预设主题
/theme modern-minimal
/theme dark-elegance
/theme nature-fresh
...

# 列出所有预设主题
/theme list

# 预览主题
/theme preview [主题名]
```

### 自定义主题命令

```bash
# 生成新主题
/theme generate --base-color "#ff6b6b"

/从图片生成
/theme generate --from-image "logo.png"

/创建主题变体
/theme variant --base ocean --name my-ocean --color-adjust

# 导出主题
/theme export [主题名] --format css
/theme export [主题名] --format tailwind
```

### 主题管理命令

```bash
# 查看当前主题
/theme status

# 切换主题
/theme switch [主题名]

# 重置主题
/theme reset

# 保存主题
/theme save [主题名]

# 删除主题
/theme delete [主题名]
```

## Best Practices

### 1. 一致性
整个应用使用统一的主题，不要混用。

### 2. 可访问性
确保颜色对比度符合 WCAG 标准。

### 3. 可扩展性
使用 CSS 变量，便于主题切换。

### 4. 性能
主题 CSS 应该最小化，避免未使用的变量。

## Output Format

### 主题报告

```markdown
## 主题报告

**主题名称:** ocean-blue
**模式:** light
**主色:** #0284c7

### CSS 变量

```css
:root {
  --background: #f0f9ff;
  --foreground: #0c4a6e;
  --primary: #0284c7;
  --primary-foreground: #ffffff;
  /* ... */
}
```

### 使用方法

1. 导入主题 CSS
2. 设置 `data-theme` 属性
3. 使用 CSS 变量

### 适用组件

- 适合: 科技、SaaS 应用
- 不适合: 需要高对比度的文档

### 变体选项

- 暗黑模式: ocean-blue-dark
- 高对比度: ocean-blue-hc
```

## Trigger Conditions

### 自动触发
- 检测到需要样式的主题
- 构建 UI 时需要统一样式
- 用户提到"主题"或"样式"

### 手动触发
- `/theme [主题名]` - 应用预设主题
- `/theme generate` - 生成自定义主题
- `/theme list` - 列出所有主题
- `/theme preview` - 预览主题效果

## Integration

### 与 Web Artifacts Builder 配合
- 为 artifact 提供一致的主题
- 快速应用主题到多个组件

### 与 Frontend Design 配合
- 使用 `frontend-design` 优化主题
- 获得专业的配色建议

### 与 Slide/Document Skills 配合
- 为幻灯片和文档应用主题
- 保持品牌一致性

## Success Metrics

- ✅ 主题应用正确
- ✅ 响应式设计正常
- ✅ 颜色对比度达标
- ✅ 主题切换流畅
- ✅ 用户满意度高

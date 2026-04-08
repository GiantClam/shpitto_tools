# OpenCode Skills Collection

## 概述

这是一个完整的本地 skills 集合，为 OpenCode 提供多种专业能力。所有 skills 采用混合触发模式，支持命令式和上下文自动触发。

## 目录结构

```
skills/
├── planning-with-files/        # Manus-style 持久化规划 (28KB)
├── superpowers-brainstorming/  # Socratic 头脑风暴 (12KB)
├── superpowers-writing-plans/  # 详细计划编写 (12KB)
├── superpowers-executing-plans/# 自主计划执行 (12KB)
├── skill-creator/              # 技能创建指南 (12KB)
├── web-artifacts-builder/      # React/Tailwind 构建 (16KB)
├── theme-factory/              # 主题生成器 (12KB)
├── webapp-testing/             # Playwright 测试 (16KB)
├── frontend-design/            # 前端设计 (16KB)
├── design-website-generator/   # 网站生成 (58+ 设计系统) (NEW)
├── code-simplifier/            # 代码简化 (4KB)
└── code-review/                # 代码审查 (8KB)
```

## Skills 分类

### 🗂️ 规划和协作

| Skill | 功能 | 触发命令 |
|-------|------|----------|
| **planning-with-files** | Manus-style 持久化 markdown 规划 | `/planning-with-files` |
| **superpowers-brainstorming** | Socratic 设计头脑风暴 | `/superpowers:brainstorm` |
| **superpowers-writing-plans** | 详细实施计划编写 | `/superpowers:write-plan` |
| **superpowers-executing-plans** | 自主计划执行 | `/superpowers:execute-plan` |

### 🛠️ 开发工具

| Skill | 功能 | 触发命令 |
|-------|------|----------|
| **skill-creator** | 创建新技能的完整指南 | `/skill-creator` |
| **code-simplifier** | 代码简化和重构 | 自动触发 或 `/code-simplifier` |
| **code-review** | 专业代码审查 | 自动触发 或 `/code-review` |

### 🎨 UI 和设计

| Skill | 功能 | 触发命令 |
|-------|------|----------|
| **design-website-generator** | 基于 58+ 设计系统生成网站 | `/design-generate` |
| **web-artifacts-builder** | 构建复杂 React artifacts | `/build-artifact` |
| **theme-factory** | 10个预设主题 + 自定义 | `/theme [主题名]` |
| **frontend-design** | 独特生产级前端设计 | `/design` |

### 🧪 测试和质量

| Skill | 功能 | 触发命令 |
|-------|------|----------|
| **webapp-testing** | Playwright UI 测试 | `/test-app` |

## 使用方法

### 1. 复制到 OpenCode Skills 目录

```bash
# 假设 OpenCode 的 skills 目录
cp -r /Users/beihuang/Documents/opencode/shpitto/skills/* ~/.opencode/skills/
```

### 2. 混合触发模式

所有 skills 支持两种触发方式：

**命令式触发：**
```markdown
/planning-with-files          # 启动规划会话
/superpowers:brainstorm       # 启动头脑风暴
/theme ocean                  # 应用 ocean 主题
/design                       # 启动设计会话
```

**上下文自动触发：**
- 当检测到复杂任务规划需求时自动激活 `planning-with-files`
- 当检测到代码编写或修改时自动激活 `code-simplifier`
- 当检测到代码提交或 PR 时自动激活 `code-review`
- 当检测到 UI 构建需求时自动激活 `web-artifacts-builder`

### 3. 技能组合使用

**典型开发工作流：**
```
1. /planning-with-files     # 启动项目规划
2. /superpowers:brainstorm  # 完善需求设计
3. /superpowers:write-plan  # 编写详细计划
4. /superpowers:execute-plan # 自主执行计划
5. /code-review             # 代码审查
6. /test-app                # 运行测试
```

**UI 开发工作流：**
```
1. /design                  # 获取设计建议
2. /build-artifact          # 构建 UI 组件
3. /theme [主题名]          # 应用主题
4. /test-app                # 验证功能
```

## 详细说明

### planning-with-files (Manus-style 规划)

**核心原理：**
- Context Window = RAM (volatile, limited)
- Filesystem = Disk (persistent, unlimited)
- 任何重要信息写入磁盘

**3文件模式：**
- `task_plan.md` - 跟踪阶段和进度
- `findings.md` - 存储研究和发现
- `progress.md` - 会话日志和测试结果

**关键规则：**
- 创建计划首先（永远不要在没有 `task_plan.md` 的情况下开始）
- 2-Action Rule（每2次操作后保存发现）
- 记录所有错误（帮助避免重复错误）
- 永远不重复失败（跟踪尝试，改变方法）

### superpowers 工作流

**Brainstorming (头脑风暴)**
- Socratic 风格提问
- 探索多种解决方案
- 展示设计选项供验证

**Writing Plans (编写计划)**
- 分解为 2-5 分钟任务
- 每个任务有精确文件路径和代码
- 包含验证步骤

**Executing Plans (执行计划)**
- 两种模式：subagent-driven 或 batch execution
- 两阶段审查：规范符合性 → 代码质量
- 阻塞关键问题防止继续

### web-artifacts-builder

**技术栈：**
- React + TypeScript
- Tailwind CSS
- shadcn/ui 组件
- Lucide React 图标

**适用场景：**
- ✅ 复杂的多组件 UI
- ✅ 需要状态管理
- ✅ 需要路由或视图切换
- ✅ 需要 shadcn/ui 组件

**不适用：**
- ❌ 简单的单文件 HTML/JSX
- ❌ 静态内容页面

### theme-factory

**10个预设主题：**

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

### frontend-design

**4大设计支柱：**

1. **排版 (Typography)**
   - 选择独特有趣的字体
   - 避开 Inter、Roboto、Arial 等通用字体
   - 使用字体组合增加品牌辨识度

2. **颜色 (Color)**
   - 使用 CSS 变量保持一致性
   - 主色配锐利强调色
   - 避免白底紫色渐变等陈词滥调

3. **运动 (Motion)**
   - 优先使用纯 CSS 动画
   - 关注高影响时刻
   - 避免过度弹跳和旋转

4. **背景 (Background)**
   - 使用层叠渐变创造氛围
   - 添加几何图案
   - 避免单调背景

### webapp-testing

**测试类型：**
- 功能测试
- 组件测试
- API 测试
- 响应式测试

**技术栈：**
- Playwright
- 支持 Chromium、Firefox、Safari
- 支持移动端模拟

### code-simplifier

**核心能力：**
- 保留功能：从不改变代码做什么
- 应用项目标准：遵循 CLAUDE.md
- 增强清晰度：简化代码结构
- 保持平衡：避免过度简化

**优化重点：**
- 减少不必要的复杂性
- 消除冗余代码
- 改善变量和函数命名
- 避免嵌套三元运算符

### code-review

**问题分级：**
- 🔴 **Critical** - 阻塞，必须修复
- 🟠 **Major** - 应该修复，阻塞批准
- 🟡 **Minor** - 应该address
- 🔵 **Cosmetic** - 可选优化

**审查维度：**
- 功能正确性
- 性能
- 安全性
- 代码质量
- 测试覆盖

### skill-creator

**标准技能结构：**
```
skill-name/
├── SKILL.md              # 必需：技能定义文件
├── scripts/              # 可选：可执行脚本
├── references/           # 可选：参考文档
└── assets/               # 可选：静态资源
```

**YAML Frontmatter 规范：**
- name: `^[a-z0-9-]+$` (小写字母、数字、连字符)
- description: 最大 1024 字符

## 最佳实践

### 1. 技能组合

```markdown
复杂任务:
planning-with-files → superpowers-brainstorming → superpowers-writing-plans → superpowers-executing-plans

UI 开发:
frontend-design → web-artifacts-builder → theme-factory → webapp-testing

代码质量:
code-simplifier → code-review → webapp-testing
```

### 2. 触发时机

- **自动触发**：当 OpenCode 检测到相关需求时
- **手动触发**：使用命令明确激活
- **预防性触发**：在复杂任务开始前主动使用

### 3. 持续优化

- 定期审查代码质量
- 优化性能瓶颈
- 更新测试覆盖
- 改进设计一致性

## 扩展和定制

### 自定义主题

```bash
/theme generate --base-color "#ff6b6b" --mode light
```

### 自定义工作流

```bash
/superpowers:write-plan --template custom
```

### 添加新技能

使用 skill-creator：
```bash
/skill-creator
/skill-create my-custom-skill
```

## 性能指标

- **规划效率**：任务分解粒度 2-5 分钟
- **代码质量**：代码简化提升可读性
- **测试覆盖**：关键路径 100% 覆盖
- **设计一致性**：主题应用覆盖所有组件
- **审查效率**：自动捕获 90%+ 问题

## 常见问题

### Q: Skills 不工作怎么办？

1. 检查 SKILL.md 文件存在
2. 验证 YAML frontmatter 格式正确
3. 确认命令拼写正确
4. 重启 OpenCode

### Q: 如何禁用某个 skill？

在 OpenCode 设置中禁用对应 skill，或删除 SKILL.md 文件。

### Q: 如何创建自定义 skill？

1. 使用 `/skill-creator` 获取模板
2. 编辑 SKILL.md
3. 添加必要的 scripts/references
4. 测试新 skill

## 更新日志

**v1.0.0** (2026-01-21)
- 初始版本
- 11个核心 skills
- 完整的文档和示例
- 支持混合触发模式

## 许可证

本 collection 中的 skills 来自多个开源项目，遵循各自的许可证。

---

**贡献者：** OpenCode Community

**反馈：** 如有问题或建议，请提交 Issue 或 PR。

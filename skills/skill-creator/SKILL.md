---
name: skill-creator
description: |
  创建新技能的完整指南，包括技能结构、YAML规范和最佳实践。
  
  **核心功能:**
  - 定义技能结构和必需文件
  - YAML frontmatter 规范
  - 技能创建过程指导
  - 打包和测试方法
  
  **触发条件:**
  - 需要创建新技能时
  - 学习如何组织 skill
  
  **激活方式:**
  - 命令: `/skill-creator`
  - 命令: `/skill-create [skill-name]`
  - 上下文: 检测到技能创建需求时
---

# Skill Creator Skill

## Overview

这是一个创建 Claude Code 新技能的完整指南。技能是模块化的能力单元，可以组合使用来解决复杂任务。

## Skill Structure

### 标准技能结构

```
skill-name/
├── SKILL.md                    # 必需：技能定义文件
│   ├── YAML frontmatter        # 技能元数据
│   # 技能指令 └── Markdown instructions  
├── scripts/                    # 可选：可执行脚本
│   ├── init.sh                # 初始化脚本
│   └── utils.sh               # 工具脚本
├── references/                 # 可选：参考文档
│   ├── overview.md            # 概述
│   └── examples.md            # 示例
└── assets/                     # 可选：静态资源
    ├── images/
    └── templates/
```

### 文件说明

**SKILL.md** (必需)
- 技能的核心定义文件
- 包含 YAML frontmatter 和 Markdown 指令
- 决定了技能的行为和触发条件

**scripts/** (可选)
- 包含可执行的脚本文件
- 可以在技能执行过程中调用
- 支持 Shell、Python、Node.js 等

**references/** (可选)
- 包含参考文档
- 提供更详细的信息
- 不影响技能核心行为

**assets/** (可选)
- 包含静态资源文件
- 如图片、模板等
- 可在输出中引用

## YAML Frontmatter 规范

### 必须字段

```yaml
---
name: skill-name
description: |
  技能的详细描述。
  最大长度：1024字符
  不能包含尖括号
---
```

### name 字段规范

- **格式:** `^[a-z0-9-]+$` (小写字母、数字、连字符)
- **最大长度:** 64字符
- **约束:**
  - 不能以连字符开头或结尾
  - 不能包含连续连字符
  - 使用描述性名称

**有效示例:**
- `code-review`
- `web-artifacts-builder`
- `theme-factory`

**无效示例:**
- `CodeReview` (大写字母)
- `code_review` (下划线)
- `-code-review` (开头连字符)
- `code--review` (连续连字符)

### description 字段规范

- **最大长度:** 1024字符
- **内容要求:**
  - 描述技能做什么
  - 说明何时使用
  - 列出核心功能
  - 不要包含尖括号 `<>`

**示例:**
```yaml
description: |
  专业代码审查助手，对代码变更进行深入分析，
  识别潜在问题、代码异味和改进机会。
  提供结构化的审查反馈，包括严重性级别
  和具体的修复建议。
```

## Markdown Instructions

### 结构建议

```markdown
# Skill Name

## Overview
简短的介绍，说明技能是什么、能做什么。

## Core Principles
核心原则和工作方式。

## Usage
使用方法和触发条件。

## Examples
使用示例。

## Best Practices
最佳实践建议。
```

### 内容指南

**应该包含:**
- 清晰的概述
- 具体的指令
- 可操作的步骤
- 触发条件说明
- 使用示例
- 最佳实践

**应该避免:**
- 模糊的描述
- 过长的段落
- 过多的层级
- 歧义的指令

## Skill Creation Process

### Phase 1: 理解需求

```markdown
## 理解技能需求

在创建技能之前，明确以下问题：

1. **这个技能解决什么问题？**
   - 核心问题是什么？
   - 现有方案有什么不足？

2. **这个技能需要什么能力？**
   - 需要调用哪些工具？
   - 需要访问哪些数据？
   - 需要什么特殊权限？

3. **这个技能如何被使用？**
   - 手动触发还是自动触发？
   - 预期使用频率？
   - 与其他技能的交互？

4. **成功标准是什么？**
   - 如何衡量效果？
   - 期望的输出是什么？
```

### Phase 2: 规划结构

```markdown
## 规划技能结构

### 定义元数据
- name: [技能名称]
- description: [详细描述]

### 设计指令
- 核心原则: [N条]
- 工作流程: [步骤]
- 触发条件: [条件]
- 输出格式: [格式]

### 规划资源
- scripts: [需要的脚本]
- references: [参考文档]
- assets: [资源文件]
```

### Phase 3: 初始化技能

使用以下模板初始化新技能：

**SKILL.md 模板:**
```markdown
---
name: [skill-name]
description: |
  [技能的详细描述。]
---

# [技能名称]

## Overview
[简短的介绍。]

## Core Principles

### 1. [原则1]
[描述。]

### 2. [原则2]
[描述。]

## Usage

### 触发条件
[何时使用这个技能。]

### 使用方式
[如何激活和使用。]

## Examples

### Example 1
[具体示例。]

## Best Practices

1. [实践1]
2. [实践2]
```

### Phase 4: 编辑技能

```markdown
## 编辑技能内容

### 核心原则
- 保持简洁：每个原则聚焦一个概念
- 保持一致：使用统一的格式和术语
- 保持实用：提供可操作的指令

### 工作流程
- 步骤清晰：每个步骤有明确的操作
- 条件明确：分支条件要清楚
- 验证方法：如何确认完成

### 输出格式
- 标准化：使用一致的格式
- 可解析：便于自动化处理
- 可读性好：人类也容易理解
```

### Phase 5: 打包技能

```markdown
## 打包技能

### 技能包结构
skills/
└── [skill-name]/
    ├── SKILL.md
    ├── scripts/
    ├── references/
    └── assets/

### 验证清单
- [ ] SKILL.md 存在且格式正确
- [ ] YAML frontmatter 有效
- [ ] Markdown 语法正确
- [ ] 脚本可执行
- [ ] 参考文档完整
```

## Skill Lifecycle

### 1. 开发阶段
```
创建 → 编辑 → 测试 → 迭代
```

### 2. 发布阶段
```
完成 → 打包 → 验证 → 部署
```

### 3. 维护阶段
```
使用 → 反馈 → 更新 → 优化
```

## Best Practices

### 1. 单一职责
每个技能应该专注于一个特定领域。

**好:**
- `code-review` - 专注于代码审查
- `planning-with-files` - 专注于持久化规划

**不好:**
- `code-review-and-testing-and-deployment` - 职责过多

### 2. 清晰触发
明确技能的触发条件和使用场景。

**好:**
```
触发条件: 当用户请求代码审查时
使用方式: /code-review 或自动触发
```

**模糊:**
```
触发条件: 有时候
使用方式: 看情况
```

### 3. 详细指令
提供具体、可操作的指令。

**好:**
```
步骤1: 读取文件 src/api/users.ts
步骤2: 检查以下项目：
- 错误处理是否完整
- 输入验证是否充分
- 命名是否一致
步骤3: 记录发现的问题
```

**模糊:**
```
检查代码质量
```

### 4. 适度长度
技能指令应该全面但不过度冗长。

**目标:**
- SKILL.md < 5000 字
- 核心指令 < 1000 字
- 详细参考可分离到 references/

### 5. 版本管理
使用语义化版本号。

```
主版本.次版本.补丁
- 主版本: 不兼容的重大变更
- 次版本: 向后兼容的新功能
- 补丁: 向后兼容的问题修复
```

## Testing Skills

### 手动测试

```markdown
## 手动测试清单

### 基本功能
- [ ] 技能可以被识别
- [ ] 指令可以被解析
- [ ] 触发条件正确
- [ ] 输出格式正确

### 边界情况
- [ ] 空输入处理
- [ ] 错误输入处理
- [ ] 超长输入处理
- [ ] 特殊字符处理

### 集成测试
- [ ] 与其他技能配合
- [ ] 在实际任务中使用
- [ ] 性能表现正常
```

### 自动化测试

```bash
# 验证 YAML 语法
python -c "import yaml; yaml.safe_load(open('SKILL.md'))"

# 验证 Markdown 语法
npx markdownlint SKILL.md

# 验证文件结构
./scripts/validate-structure.sh
```

## Common Patterns

### Pattern 1: Command Pattern
通过命令激活的技能。

```yaml
name: [skill-name]
description: |
  通过 /[command] 激活的技能。
  
  触发条件: 用户输入 /[command]
```

### Pattern 2: Context Pattern
通过上下文自动激活的技能。

```yaml
name: [skill-name]
description: |
  基于上下文自动触发的技能。
  
  触发条件: 检测到特定任务类型或代码模式
```

### Pattern 3: Hybrid Pattern
混合激活模式的技能。

```yaml
name: [skill-name]
description: |
  支持命令和上下文两种激活方式。
  
  触发条件:
  - 命令: /[command]
  - 上下文: 检测到特定需求
```

## Skill Metadata

### 可选字段

```yaml
---
name: skill-name
description: |
  技能描述。

# 可选字段
version: 1.0.0          # 技能版本
author: 作者名           # 作者
tags: [tag1, tag2]      # 标签
category: development   # 分类
---

# Skill Name
...
```

### 版本管理

- 遵循语义化版本
- 在 CHANGELOG.md 中记录变更
- 重大变更需要更新描述

## Examples

### 示例1: 简单技能

```
simple-skill/
├── SKILL.md            # 2KB
└── scripts/
    └── helper.sh
```

### 示例2: 中等复杂度技能

```
web-artifacts-builder/
├── SKILL.md            # 8KB
├── scripts/
│   ├── build.sh
│   └── validate.sh
├── references/
│   ├── react-patterns.md
│   └── tailwind-guide.md
└── assets/
    └── templates/
```

### 示例3: 复杂技能

```
superpowers/
├── SKILL.md            # 15KB
├── commands/
│   ├── brainstorm.sh
│   ├── write-plan.sh
│   └── execute-plan.sh
├── hooks/
│   ├── pre-tool-use.sh
│   └── post-tool-use.sh
├── lib/
│   ├── utils.sh
│   └── templates.sh
├── skills/
│   ├── brainstorming/
│   ├── writing-plans/
│   └── executing-plans/
└── references/
    ├── methodology.md
    └── examples.md
```

## Trigger Conditions

### 自动触发
- 用户请求创建技能
- 检测到技能创建需求
- 需要组织或优化现有技能

### 手动触发
- `/skill-creator` - 启动创建向导
- `/skill-create [name]` - 创建命名技能
- `/skill-template` - 获取模板
- `/skill-validate` - 验证技能结构

## Success Metrics

- ✅ 技能结构符合规范
- ✅ YAML frontmatter 有效
- ✅ 指令清晰可执行
- ✅ 资源文件完整
- ✅ 测试覆盖主要场景

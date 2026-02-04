---
name: web-artifacts-builder
description: |
  构建复杂的多组件 Claude HTML artifacts，使用 React、Tailwind CSS 和 shadcn/ui 组件。
  
  **核心功能:**
  - 创建交互式 React 组件
  - 使用 Tailwind CSS 实现响应式设计
  - 集成 shadcn/ui 组件库
  - 支持状态管理和路由需求
  
  **触发条件:**
  - 需要构建复杂的多组件 artifacts
  - 需要状态管理或路由
  - 需要 shadcn/ui 组件
  - 不适合简单的单文件 HTML/JSX
  
  **激活方式:**
  - 命令: `/build-artifact`
  - 命令: `/web-artifacts`
  - 上下文: 检测到复杂 UI 构建需求时
---

# Web Artifacts Builder Skill

## Overview

这是一个构建复杂多组件 Claude HTML artifacts 的技能。使用 React、Tailwind CSS 和 shadcn/ui 组件创建生产级的交互式 Web 应用。

## When to Use

### 使用这个技能的场景

- ✅ 复杂的多组件 UI
- ✅ 需要状态管理
- ✅ 需要路由或视图切换
- ✅ 需要 shadcn/ui 组件
- ✅ 交互式数据可视化
- ✅ 表单处理和验证
- ✅ 用户认证流程
- ✅ 仪表板和管理界面

### 不使用这个技能的场景

- ❌ 简单的单文件 HTML/JSX
- ❌ 静态内容页面
- ❌ 只需要基础 HTML/CSS
- ❌ 一次性演示代码

## Technology Stack

### Core Technologies

- **React** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - 组件库
- **Lucide React** - 图标库
- **Tailwind Animate** - 动画库

### Component Libraries

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
```

### Common Patterns

```tsx
// 状态管理
const [state, setState] = useState(initialValue)

// 副作用
useEffect(() => {
  // 副作用逻辑
}, [dependencies])

// 派生状态
const derivedValue = useMemo(() => {
  // 计算逻辑
}, [dependencies])

// 回调
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependencies])
```

## Project Structure

### 推荐结构

```
artifacts/
├── components/
│   ├── ui/              # shadcn/ui 组件
│   ├── features/        # 功能组件
│   ├── layouts/         # 布局组件
│   └── shared/          # 共享组件
├── hooks/               # 自定义 hooks
├── lib/                 # 工具函数
├── types/               # 类型定义
└── assets/              # 静态资源
```

### 组件模式

```tsx
// components/Button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## Development Workflow

### Phase 1: 需求分析

```markdown
## 需求分析

**目标:** [描述要构建的内容]

**功能需求:**
1. [需求1]
2. [需求2]
3. [需求3]

**非功能需求:**
- 性能: [要求]
- 可访问性: [要求]
- 响应式: [要求]

**设计约束:**
- [约束1]
- [约束2]
```

### Phase 2: 架构设计

```markdown
## 架构设计

### 组件树

```
App (Root)
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── MainContent
│       ├── Feature1
│       └── Feature2
└── Footer
```

### 状态管理

- **全局状态:** 用户认证信息
- **本地状态:** 表单数据、UI 状态
- **服务器状态:** API 数据

### 数据流

用户操作 → 事件处理 → 状态更新 → UI 渲染
```

### Phase 3: 实现

```markdown
## 实现步骤

### Step 1: 基础结构
- [ ] 创建主应用组件
- [ ] 设置路由结构
- [ ] 配置主题

### Step 2: 核心组件
- [ ] 实现 Header/Sidebar
- [ ] 实现主内容区
- [ ] 实现共享组件

### Step 3: 功能组件
- [ ] 实现功能1
- [ ] 实现功能2
- [ ] 实现交互逻辑

### Step 4: 样式和优化
- [ ] 完善样式
- [ ] 优化性能
- [ ] 添加动画
```

### Phase 5: 测试和验证

```markdown
## 测试清单

### 功能测试
- [ ] 所有交互正常
- [ ] 表单验证工作
- [ ] 状态更新正确

### 响应式测试
- [ ] 桌面端显示正确
- [ ] 平板端显示正确
- [ ] 移动端显示正确

### 性能测试
- [ ] 加载时间 < 2s
- [ ] 交互无延迟
- [ ] 无内存泄漏
```

## Code Examples

### Example 1: 任务列表

```tsx
import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  title: string
  completed: boolean
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks([...tasks, {
      id: crypto.randomUUID(),
      title: newTask,
      completed: false
    }])
    setNewTask("")
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>任务列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="添加新任务..."
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <Button onClick={addTask}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center gap-2 p-2 border rounded">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-4 h-4"
              />
              <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="ml-auto text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-sm text-muted-foreground">
          {tasks.filter(t => t.completed).length} / {tasks.length} 完成
        </div>
      </CardContent>
    </Card>
  )
}
```

### Example 2: 数据表格

```tsx
import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"

interface User {
  id: number
  name: string
  email: string
  role: string
}

const sampleUsers: User[] = [
  { id: 1, name: "张三", email: "zhangsan@example.com", role: "Admin" },
  { id: 2, name: "李四", email: "lisi@example.com", role: "User" },
  { id: 3, name: "王五", email: "wangwu@example.com", role: "Editor" },
]

export default function DataTable() {
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<keyof User>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredAndSorted = useMemo(() => {
    let result = [...sampleUsers]
    
    // 搜索过滤
    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
      )
    }
    
    // 排序
    result.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })
    
    return result
  }, [search, sortField, sortDirection])

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {["id", "name", "email", "role"].map(field => (
                <TableHead key={field} className="cursor-pointer" onClick={() => handleSort(field)}>
                  <div className="flex items-center gap-1">
                    {field === "id" ? "ID" : field === "name" ? "姓名" : field === "email" ? "邮箱" : "角色"}
                    {sortField === field && (
                      sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

## Best Practices

### 1. 组件设计
- 保持组件小而专注
- 使用组合而非继承
- 提取可复用的逻辑到 hooks

### 2. 状态管理
- 优先使用本地状态
- 需要共享时使用 Context
- 复杂状态考虑 Zustand/Jotai

### 3. 性能优化
- 使用 useMemo 缓存计算
- 使用 useCallback 缓存回调
- 虚拟化长列表
- 图片懒加载

### 4. 可访问性
- 使用语义化 HTML
- 添加 ARIA 属性
- 支持键盘导航
- 确保颜色对比度

### 5. 响应式设计
- 使用 Tailwind 的响应式类
- 移动优先的设计
- 测试多种屏幕尺寸

## Common Components

### Layout Components

```tsx
// 页面布局
export function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}

// 卡片容器
export function CardSection({ title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

### Form Components

```tsx
// 带标签的输入
export function FormField({ label, error, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
```

### Data Display

```tsx
// 状态标签
export function StatusBadge({ status }) {
  const colors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }
  
  return (
    <Badge className={colors[status] || "bg-gray-500"}>
      {status}
    </Badge>
  )
}
```

## Output Format

### Artifact 构建报告

```markdown
## Artifact 构建报告

**类型:** React + Tailwind + shadcn/ui
**组件数:** [N] 个
**代码行数:** [N] 行

### 文件结构

```
artifacts/
├── App.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── input.tsx
│   ├── feature/
│   │   └── TaskList.tsx
│   └── layout/
│       └── PageLayout.tsx
├── hooks/
│   └── useTaskStore.ts
└── lib/
    └── utils.ts
```

### 功能列表

1. ✅ 任务列表管理
2. ✅ 实时搜索过滤
3. ✅ 状态持久化
4. ✅ 响应式设计

### 使用说明

1. 在 Claude Code 中运行 artifact
2. 交互式使用 UI 组件
3. 数据保存在 localStorage

### 性能指标

- 首次加载: [时间]
- 交互延迟: < 100ms
- 包大小: [大小]
```

## Trigger Conditions

### 自动触发
- 用户请求构建复杂 UI
- 检测到需要 React 组件
- 需要多组件交互

### 手动触发
- `/build-artifact [描述]` - 构建 artifact
- `/web-artifacts` - 查看 artifact 相关命令
- `/add-component [组件名]` - 添加组件

## Integration

### 与 Theme Factory 配合
- 使用 `theme-factory` 应用主题
- 统一应用风格和颜色

### 与 Frontend Design 配合
- 使用 `frontend-design` 优化设计
- 获得专业的设计建议

### 与 Planning with Files 配合
- 记录 artifact 需求到 findings.md
- 更新 progress.md 记录进度

## Success Metrics

- ✅ 组件功能完整
- ✅ 响应式设计正常
- ✅ 交互流畅无延迟
- ✅ 代码质量达标
- ✅ 可访问性符合标准

---
name: webapp-testing
description: |
  使用 Playwright 与本地 Web 应用进行交互、测试和调试。
  
  **核心功能:**
  - 验证前端功能正确性
  - 调试 UI 行为问题
  - 捕获浏览器截图
  - 查看浏览器控制台日志
  
  **触发条件:**
  - 需要测试本地 Web 应用
  - 前端功能验证
  - UI 调试和截图
  - 浏览器兼容性测试
  
  **激活方式:**
  - 命令: `/test-app`
  - 命令: `/web-test`
  - 上下文: 检测到测试需求时自动触发
---

# Webapp Testing Skill

## Overview

这是一个使用 Playwright 进行 Web 应用测试和调试的技能。能够与本地运行的 Web 应用进行交互，验证功能正确性，捕获问题截图，并收集浏览器日志。

## Prerequisites

### 环境要求

```bash
# 安装 Playwright
npm install -D @playwright/test
npx playwright install chromium

# 或全局安装
npm install -g playwright
playwright install-deps
```

### 测试配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Test Categories

### 1. 功能测试

```typescript
// tests/features/user-auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('用户认证', () => {
  test('用户可以登录', async ({ page }) => {
    // 导航到登录页
    await page.goto('/login')
    
    // 填写表单
    await page.fill('[name=email]', 'test@example.com')
    await page.fill('[name=password]', 'password123')
    
    // 提交表单
    await page.click('button[type=submit]')
    
    // 验证跳转
    await expect(page).toHaveURL('/dashboard')
    
    // 验证用户已登录
    await expect(page.locator('.user-menu')).toBeVisible()
  })
  
  test('登录失败显示错误', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name=email]', 'invalid@example.com')
    await page.fill('[name=password]', 'wrongpassword')
    await page.click('button[type=submit]')
    
    // 验证错误消息
    await expect(page.locator('.error-message')).toContainText('Invalid credentials')
  })
})
```

### 2. 组件测试

```typescript
// tests/components/Button.spec.tsx
import { test, expect } from '@playwright/test'
import { mount } from '@playwright/react'

import { Button } from '@/components/Button'

test('按钮显示正确文本', async ({ mount }) => {
  await mount(<Button>Click me</Button>)
  await expect(page.locator('button')).toHaveText('Click me')
})

test('点击事件触发', async ({ mount }) => {
  let clicked = false
  await mount(<Button onClick={() => { clicked = true }}>Click me</Button>)
  await page.click('button')
  expect(clicked).toBe(true)
})

test('禁用状态不可点击', async ({ mount }) => {
  await mount(<Button disabled>Click me</Button>)
  await expect(page.locator('button')).toBeDisabled()
})
```

### 3. API 测试

```typescript
// tests/api/users.spec.ts
import { test, expect } from '@playwright/test'

test.describe('用户 API', () => {
  test('获取用户列表', async ({ request }) => {
    const response = await request.get('/api/users')
    
    expect(response.ok()).toBe(true)
    expect(response.status()).toBe(200)
    
    const users = await response.json()
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThan(0)
  })
  
  test('创建新用户', async ({ request }) => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
    }
    
    const response = await request.post('/api/users', {
      data: newUser,
    })
    
    expect(response.ok()).toBe(true)
    expect(response.status()).toBe(201)
    
    const created = await response.json()
    expect(created.name).toBe(newUser.name)
    expect(created.email).toBe(newUser.email)
  })
})
```

### 4. 响应式测试

```typescript
// tests/responsive.spec.ts
import { test, expect } from '@playwright/test'

test.describe('响应式设计', () => {
  test('桌面端布局', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('.header')).toBeVisible()
  })
  
  test('平板端布局', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    await expect(page.locator('.sidebar')).toBeHidden()
    await expect(page.locator('.hamburger-menu')).toBeVisible()
  })
  
  test('移动端布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.locator('.mobile-nav')).toBeVisible()
  })
})
```

## Debugging Techniques

### 1. 截图调试

```typescript
// 捕获失败截图
test('表单验证', async ({ page }) => {
  await page.goto('/form')
  
  // 提交空表单
  await page.click('button[type=submit]')
  
  // 验证错误显示
  await expect(page.locator('.error')).toBeVisible()
  
  // 截图记录状态
  await page.screenshot({ path: 'form-error.png' })
})
```

### 2. 控制台日志

```typescript
test('控制台日志收集', async ({ page }) => {
  const consoleMessages = []
  const consoleErrors = []
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() })
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  
  await page.goto('/')
  
  // 执行操作触发控制台消息
  await page.click('.trigger-button')
  
  // 检查控制台错误
  expect(consoleErrors).toEqual([])
})
```

### 3. 网络请求

```typescript
test('API 请求监控', async ({ page }) => {
  const apiCalls = []
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiCalls.push({
        url: request.url(),
        method: request.method(),
      })
    }
  })
  
  await page.goto('/dashboard')
  
  // 验证 API 调用
  expect(apiCalls).toContainEqual({
    url: '/api/users',
    method: 'GET',
  })
})
```

### 4. 元素定位

```typescript
test('元素定位调试', async ({ page }) => {
  await page.goto('/page')
  
  // 使用不同选择器定位
  const button = page.locator('button:has-text("Submit")')
  const alternative = page.locator('#submit-button')
  const fallback = page.locator('[data-testid="submit"]')
  
  // 调试哪个选择器有效
  console.log('Button count:', await button.count())
  console.log('Alternative count:', await alternative.count())
  console.log('Fallback count:', await fallback.count())
})
```

## Test Patterns

### Page Object Pattern

```typescript
// pages/DashboardPage.ts
export class DashboardPage {
  constructor(private page: Page) {}
  
  async navigate(): Promise<void> {
    await this.page.goto('/dashboard')
  }
  
  async getUserName(): Promise<string> {
    return this.page.locator('.user-name').textContent()
  }
  
  async clickSettings(): Promise<SettingsPage> {
    await this.page.click('[data-testid=settings]')
    return new SettingsPage(this.page)
  }
  
  async getStats(): Promise<{ users: number; revenue: string }> {
    const users = await this.page.locator('.stat-users').textContent()
    const revenue = await this.page.locator('.stat-revenue').textContent()
    return { users: parseInt(users), revenue }
  }
}

// tests/dashboard.spec.ts
test('仪表板显示统计', async ({ page }) => {
  const dashboard = new DashboardPage(page)
  await dashboard.navigate()
  
  const stats = await dashboard.getStats()
  expect(stats.users).toBeGreaterThan(0)
})
```

### API Mocking

```typescript
test('使用 Mock 数据', async ({ page }) => {
  // Mock API 响应
  await page.route('/api/users', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([
        { id: 1, name: 'Mock User 1' },
        { id: 2, name: 'Mock User 2' },
      ]),
    })
  })
  
  await page.goto('/users')
  
  // 验证使用 Mock 数据
  await expect(page.locator('.user-name')).toHaveText([
    'Mock User 1',
    'Mock User 2',
  ])
})
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run build
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run Playwright Tests
        run: npx playwright test
        
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

## Best Practices

### 1. 测试隔离
- 每个测试独立运行
- 使用干净的测试数据
- 避免测试间依赖

### 2. 定位器策略
- 优先使用 `data-testid`
- 避免使用脆弱的 CSS 选择器
- 使用语义化的定位器

### 3. 等待策略
- 使用自动等待
- 避免硬编码的 sleep
- 使用 `expect().toBeVisible()` 等断言

### 4. 测试数据
- 使用工厂模式创建数据
- 清理测试数据
- 使用有意义的测试数据

## Output Format

### 测试报告

```markdown
## 测试报告

**运行时间:** [时间]
**测试总数:** [N]
**通过:** [N]
**失败:** [N]
**跳过:** [N]

### 按浏览器

| 浏览器 | 通过 | 失败 |
|--------|------|------|
| Chrome | 45 | 1 |
| Firefox | 44 | 2 |
| Safari | 43 | 3 |

### 按测试套件

| 套件 | 测试数 | 通过率 |
|------|--------|--------|
| 用户认证 | 12 | 100% |
| 仪表板 | 8 | 87.5% |
| API 测试 | 15 | 100% |
| 响应式 | 6 | 100% |

### 失败测试

1. **用户认证/登录失败显示错误**
   - 文件: `tests/auth.spec.ts:42`
   - 错误: AssertionError: Expected to contain "Invalid credentials"
   - 截图: `test-results/auth.spec.ts-42-failed.png`

### 覆盖率

- 单元测试: [百分比]
- 集成测试: [百分比]
- E2E 测试: [百分比]
```

## Command Reference

### 测试命令

```bash
# 运行所有测试
/test-app run

# 运行特定测试文件
/test-app run tests/auth.spec.ts

# 运行特定测试
/test-app run --grep "登录"

/运行失败测试
/test-app run --last-failed

# UI 模式运行
/test-app ui

# 调试模式
/test-app debug tests/auth.spec.ts:42
```

### 浏览器命令

```bash
# 指定浏览器
/test-app run --browser chromium
/test-app run --browser firefox
/test-app run --browser webkit

# 多浏览器
/test-app run --all-browsers

# 移动端模拟
/test-app run --device "iPhone 12"
/test-app run --device "Pixel 5"
```

### 报告命令

```bash
# 生成 HTML 报告
/test-app report --html

# 生成 JSON 报告
/test-app report --json

# 生成 Allure 报告
/test-app report --allure

# 上传报告
/test-app report --upload
```

## Trigger Conditions

### 自动触发
- 代码提交后运行测试
- PR 创建时运行测试
- 部署前运行测试

### 手动触发
- `/test-app run` - 运行测试
- `/test-app debug` - 调试测试
- `/test-app report` - 查看报告

## Integration

### 与 Code Review 配合
- 测试结果反馈到代码审查
- 自动标记失败的测试

### 与 CI/CD 配合
- 集成到 CI/CD 流水线
- 阻塞合并当测试失败

### 与 Planning with Files 配合
- 测试结果记录到 progress.md
- 问题跟踪到 findings.md

## Success Metrics

- ✅ 测试通过率 > 95%
- ✅ 测试覆盖关键路径
- ✅ 测试执行时间 < 10min
- ✅ 零生产环境 bug
- ✅ 快速反馈循环

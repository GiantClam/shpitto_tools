# 工具对比：截图采集与爬虫模块技术选型

## 一、截图采集模块对比

### Playwright vs agent-browser

| 维度 | Playwright | **agent-browser** ✅ |
|------|------------|----------------------|
| **上下文优化** | 完整 DOM，token 多 | ✅ 比 Playwright 少 **93%** |
| **输出格式** | 原始 HTML | 可访问性树（AI 友好） |
| **元素定位** | CSS 选择器（易失效） | refs（如 `@e1`）更稳定 |
| **安装** | `pip install playwright` | `npm install -g agent-browser` |
| **启动速度** | 较慢 | ✅ Rust 原生，即时启动 |
| **适用场景** | 通用自动化 | ✅ AI Agent 专用 |

### 结论

**截图采集模块选择 agent-browser**，因为：
- 输出更简洁，更适合 LLM 分析
- 安装简单（Node.js 环境）
- refs 定位比 CSS 选择器更稳定
- 与 Claude Code/Cursor 等 AI 工具无缝集成

---

## 二、爬虫模块对比

| 维度 | **agent-browser** | **Jina Reader** | **Firecrawl** | **Crawl4AI** |
|------|-------------------|-----------------|---------------|--------------|
| **定位** | 浏览器自动化 CLI | URL → Markdown | Web scraping API | Python 爬虫库 |
| **交互能力** | ✅ 可点击/填表/截图 | ❌ 仅提取内容 | ✅ 可渲染 JS | ✅ 可渲染 JS |
| **输出格式** | 结构化快照 | Markdown/JSON | Markdown/HTML | Markdown/JSON |
| **JavaScript 渲染** | ✅ | ⚠️ 有限 | ✅ | ✅ |
| **AI 友好度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **定价** | 免费（本地） | $5/1K calls | 付费 API | 开源免费 |
| **批量爬取** | ⚠️ 每次新会话 | ✅ API 并发 | ✅ API 并发 | ✅ Python 并发 |
| **复杂导航** | ✅ 最佳 | ❌ 不支持 | ⚠️ 有限 | ⚠️ 有限 |

### 推荐方案

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| **截图 + DOM 快照** | **agent-browser** | 专为 AI 设计，输出最简洁 |
| **批量内容提取** | **Crawl4AI** 或 **Firecrawl** | 支持 JavaScript 渲染，Markdown 输出 |
| **简单 URL 转 Markdown** | **Jina Reader** | 快速，便宜，适合 RAG |

---

## 三、最终技术选型

### 截图采集模块
```bash
# 使用 agent-browser
npm install -g agent-browser

# 截图 + DOM 快照
agent-browser open https://example.com
agent-browser screenshot page.png --full-page
agent-browser snapshot --format json > snapshot.json
agent-browser close
```

### 爬虫模块（推荐 Crawl4AI）

```bash
# 安装
pip install crawl4ai

# 基础使用
from crawl4ai import AsyncCrawler

async def crawl():
    async with AsyncCrawler() as crawler:
        result = await crawler.arun(url="https://example.com")
        print(result.markdown)  # LLM 友好的 Markdown 输出
```

### 对比总结

| 模块 | 原方案 | **新方案** | 优势 |
|------|--------|------------|------|
| 截图采集 | Playwright | **agent-browser** | 93% 更少 token，AI 友好输出 |
| 爬虫内容 | aiohttp + BeautifulSoup | **Crawl4AI** | JavaScript 渲染，Markdown 输出，直接用于 LLM |

---

## 四、迁移指南

### 从 Playwright 迁移到 agent-browser

**之前（Playwright）：**
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(url)
    page.screenshot(path="screenshot.png")
    html = page.content()
```

**之后（agent-browser）：**
```bash
# 命令行使用
agent-browser open https://example.com
agent-browser screenshot screenshot.png --full-page
agent-browser snapshot --format json > snapshot.json
agent-browser close
```

### 从 aiohttp 迁移到 Crawl4AI

**之前（aiohttp + BeautifulSoup）：**
```python
import aiohttp
from bs4 import BeautifulSoup

async with aiohttp.ClientSession() as session:
    async with session.get(url) as response:
        html = await response.text()
        soup = BeautifulSoup(html, 'html.parser')
```

**之后（Crawl4AI）：**
```python
from crawl4ai import AsyncCrawler

async with AsyncCrawler() as crawler:
    result = await crawler.arun(url=url)
    # result.markdown - LLM 友好的 Markdown
    # result.html - 原始 HTML
    # result.links - 所有链接
```

---

## 五、文件变更

| 文件 | 变更 |
|------|------|
| `scripts/crawlers/snapshot_capture.py` | ✅ 已迁移到 agent-browser |
| `scripts/crawlers/run_crawler.py` | ✅ 自动使用新 snapshot_capture |
| `scripts/crawlers/crawler.py` | 可选迁移到 Crawl4AI（如需要） |

---

## 六、快速验证

```bash
# 1. 验证 agent-browser
agent-browser --version

# 2. 截图测试
python3 scripts/crawlers/snapshot_capture.py --url https://kymetacorp.com

# 3. 查看输出
ls -la output/snapshots/
```

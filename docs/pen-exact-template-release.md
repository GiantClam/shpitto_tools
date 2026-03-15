# Pen Exact Template Release

这条流水线用于把 `.pen` 设计文件生成成可换肤、按 `site -> page -> section -> block` 拆分的整站模板，并在发布前做严格一致性校验。

## 输入要求

- `.pen` 源目录通过 `--source-dir` 或环境变量 `PEN_SOURCE_DIR` 指定。
- 输出目录通过 `--out-dir` 或环境变量 `PEN_EXACT_OUT_DIR` 指定。
- 默认输出目录是仓库内的 `template-factory/generated/pen-exact-templates`。
- 完整发布校验依赖 macOS 上可用的 Pencil 桌面程序和 MCP bridge。

## 命令

生成模板：

```bash
node scripts/generate_pen_exact_templates.mjs --source-dir /absolute/path/to/pen
```

结构校验，不要求 Pencil：

```bash
node scripts/validate_pen_exact_templates.mjs --source-dir /absolute/path/to/pen --skip-pencil
```

完整发布校验，要求 Pencil：

```bash
node scripts/validate_pen_exact_templates.mjs --source-dir /absolute/path/to/pen --require-pencil
```

一键生成并执行完整发布门：

```bash
node scripts/release_pen_exact_templates.mjs --source-dir /absolute/path/to/pen
```

## 发布门定义

只有同时满足以下条件，才算可发布：

- `failedFiles === 0`
- `globalFailureCount === 0`
- `structuralPassedFiles === totalFiles`
- `pencilPassedFiles === totalFiles`

验证结果位于：

- `template-factory/generated/pen-exact-templates/validation/manifest.json`
- `template-factory/generated/pen-exact-templates/release-manifest.json`

## GitHub Actions

仓库提供一个手动触发的 macOS self-hosted workflow：

- 工作流文件：`.github/workflows/pen-exact-template-release.yml`
- 用途：在装有 Pencil 和源 `.pen` 目录的机器上执行完整发布门
- 触发方式：`workflow_dispatch`

这条 workflow 不替代本地发布门。它只是把同一套发布命令固化到仓库里，便于重复执行和审计。

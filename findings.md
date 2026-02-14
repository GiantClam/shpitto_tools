# Findings

- `template-factory` currently outputs section-level templates only (`templates`), single-page oriented.
- `p2w-graph` already supports multi-page blueprint generation and rendering output structure (`pages[]`), but template-first section planning applies one shared section-kind sequence to all pages.
- `section-template-registry` currently validates/loads style profiles with fields: `id`, `name`, `keywords`, `templates`; no page-level template metadata.
- A safe compatibility approach is to add optional `siteTemplates` metadata and only activate whole-site behavior when this metadata exists.
- Implemented: template-factory now emits optional `site_pages` (spec-pack) and `siteTemplates` (style-profile) when crawl mode is enabled.
- Implemented: section-template-registry now accepts/validates `siteTemplates` and `site_templates` while keeping legacy templates untouched.
- Implemented: `p2w-graph` template-first planner now reads page templates and applies per-page section-kind plans, injecting missing pages from template metadata.

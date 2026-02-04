# Template Migration

## Overview

This workflow parses the Excel file into structured JSON and imports the templates into Supabase.

## 1. Run database migration

Apply `supabase/migrations/001_templates.sql` in your Supabase SQL editor.

## 2. Generate templates JSON

```bash
python3 /Users/beihuang/Documents/opencode/shpitto/scripts/parse_excel_templates.py
```

Output:

```
/Users/beihuang/Documents/opencode/shpitto/output/templates.json
```

## 3. Import to Supabase

Set the service role key in your shell before running the import script:

```bash
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
python3 /Users/beihuang/Documents/opencode/shpitto/scripts/import_templates_supabase.py
```

If you want to preview without import:

```bash
python3 /Users/beihuang/Documents/opencode/shpitto/scripts/import_templates_supabase.py --dry-run
```

## Notes

- The import uses `slug` for upserts to avoid duplicates.
- `r2_urls` is created as an empty object for each template and can be filled later.

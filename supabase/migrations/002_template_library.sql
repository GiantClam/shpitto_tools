alter table shpitto_templates
  add column if not exists template_type text default 'page';

alter table shpitto_templates
  add column if not exists template_kind text;

alter table shpitto_templates
  add column if not exists template_source text default 'excel';

create index if not exists idx_templates_type on shpitto_templates(template_type);
create index if not exists idx_templates_kind on shpitto_templates(template_kind);

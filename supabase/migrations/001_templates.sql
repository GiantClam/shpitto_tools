create extension if not exists "uuid-ossp";

create table if not exists shpitto_template_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists shpitto_templates (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references shpitto_template_categories(id),
  name text not null,
  slug text not null,
  source_url text,
  description text,
  template_type text default 'page',
  template_kind text,
  template_source text default 'excel',
  puck_data jsonb not null,
  visual_spec jsonb,
  interaction_spec jsonb,
  copy_spec jsonb,
  r2_urls jsonb,
  restoration_scores jsonb,
  verification_status text default 'pending',
  is_featured boolean default false,
  is_public boolean default true,
  usage_count int default 0,
  created_by uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists shpitto_template_analysis (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references shpitto_templates(id),
  structure_analysis jsonb,
  visual_features jsonb,
  interactions jsonb,
  component_mapping jsonb,
  deficiencies jsonb,
  suggested_improvements jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists shpitto_template_reviews (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references shpitto_templates(id),
  reviewer_id uuid,
  visual_score numeric(3,1),
  interaction_score numeric(3,1),
  content_score numeric(3,1),
  overall_score numeric(3,1),
  notes text,
  status text default 'approved',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_templates_category on shpitto_templates(category_id);
create index if not exists idx_templates_slug on shpitto_templates(slug);
create index if not exists idx_templates_verified on shpitto_templates(verification_status) where verification_status = 'verified';

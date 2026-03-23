// lib/supabase.ts — Supabase client instances

import { createBrowserClient } from '@supabase/ssr'

// Browser client — use in Client Components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Supabase SQL to run in your Supabase dashboard → SQL Editor:
/*
-- Enable RLS
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  status text not null default 'pending',
  client_name text not null,
  due_date date,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table public.projects enable row level security;

create policy "Users can view all projects"
  on public.projects for select using (auth.role() = 'authenticated');

create policy "Users can insert own projects"
  on public.projects for insert with check (auth.uid() = created_by);

create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = created_by);

create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = created_by);
*/

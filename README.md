# RealVault — Video Review & Approval Platform

A full-stack video review dashboard built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **React Query**, and **Supabase**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Data fetching | TanStack React Query v5 |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Forms | React Hook Form |

---

## Features

- Login & Register with Supabase Auth
- Protected routes via Next.js middleware
- Dashboard with all projects, search & status filter
- Stats bar (total, in review, approved, changes requested)
- Create project form with validation
- Project detail page with video player (YouTube, Vimeo, MP4)
- Approve / Request Changes / In Review / Pending status actions
- Delete project
- React Query caching & automatic refetch after mutations
- Fully typed with TypeScript interfaces throughout

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and run this:

```sql
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

alter table public.projects enable row level security;

create policy "Authenticated users can view projects"
  on public.projects for select using (auth.role() = 'authenticated');

create policy "Users can insert own projects"
  on public.projects for insert with check (auth.uid() = created_by);

create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = created_by);

create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = created_by);
```

### 3. Add environment variables

Go to `.env.local` and fill in your Supabase keys:

```bash
cp .env.local.example .env.local
```

Get your keys from: Supabase Dashboard → Settings → API

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Fix dynamic route folders

Rename these two folders:
```
app/api/projects/id/     →  app/api/projects/[id]/
app/projects/id/         →  app/projects/[id]/
```

```bash
mv app/api/projects/id app/api/projects/\[id\]
mv app/projects/id app/projects/\[id\]
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard.

---

## Project Structure

```
reelvault/
├── app/
│   ├── auth/login/page.tsx        ← Login page
│   ├── auth/register/page.tsx     ← Register page
│   ├── dashboard/page.tsx         ← Main dashboard
│   ├── projects/new/page.tsx      ← Create project
│   ├── projects/[id]/page.tsx     ← Project detail
│   ├── api/projects/route.ts      ← GET all, POST new
│   ├── api/projects/[id]/route.ts ← GET one, PATCH, DELETE
│   ├── providers.tsx              ← React Query provider
│   └── layout.tsx
├── components/
│   ├── Navbar.tsx
│   ├── ProjectCard.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── types.ts                   ← All TypeScript types
│   ├── supabase.ts               ← Supabase client
│   └── queries.ts                ← All React Query hooks
└── middleware.ts                  ← Route protection
```

---

## Contact

Hassan Naseer — dev.hassan.naseer@gmail.com  
React Developer for Video Production · $25–$35/hr · US Remote

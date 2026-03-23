// app/api/projects/route.ts — GET /api/projects | POST /api/projects
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse, CreateProjectForm, ProjectWithStats } from '@/lib/types'

function createSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )
}

// GET /api/projects — fetch all projects for authenticated user
export async function GET(): Promise<NextResponse<ApiResponse<ProjectWithStats[]>>> {
  try {
    const supabase = createSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Add mock stats (extend this with real joins later)
    const projectsWithStats: ProjectWithStats[] = (data ?? []).map(p => ({
      ...p,
      comment_count: 0,
      version_count: 1,
    }))

    return NextResponse.json({ data: projectsWithStats, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ProjectWithStats>>> {
  try {
    const supabase = createSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateProjectForm = await req.json()

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json({ data: null, error: 'Title is required' }, { status: 400 })
    }
    if (!body.client_name?.trim()) {
      return NextResponse.json({ data: null, error: 'Client name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        client_name: body.client_name.trim(),
        video_url: body.video_url?.trim() || null,
        due_date: body.due_date || null,
        status: 'pending',
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data: { ...data, comment_count: 0, version_count: 1 },
      error: null
    }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}

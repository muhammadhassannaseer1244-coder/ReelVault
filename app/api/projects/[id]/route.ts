// app/api/projects/id/route.ts — GET | PATCH | DELETE /api/projects/:id
// NOTE: rename folder from 'id' to '[id]' on your machine
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse, Project, ProjectStatus, ProjectWithStats } from '@/lib/types'

const VALID_STATUSES: ProjectStatus[] = ['pending', 'in_review', 'approved', 'changes_requested']

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

type RouteContext = { params: { id: string } }

// GET /api/projects/:id
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<ProjectWithStats>>> {
  try {
    const supabase = createSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) return NextResponse.json({ data: null, error: 'Project not found' }, { status: 404 })

    return NextResponse.json({
      data: { ...data, comment_count: 0, version_count: 1 },
      error: null
    })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/projects/:id — update status
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const supabase = createSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const body: { status?: ProjectStatus } = await req.json()

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ data: null, error: 'Invalid status value' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/projects/:id
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const supabase = createSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('created_by', user.id) // only delete own projects

    if (error) throw error
    return NextResponse.json({ data: null, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Server error' }, { status: 500 })
  }
}

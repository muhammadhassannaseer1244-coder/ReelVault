// lib/types.ts — Central TypeScript types for RealVault

export type ProjectStatus = 'pending' | 'in_review' | 'approved' | 'changes_requested'

export type UserRole = 'admin' | 'reviewer' | 'client'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  video_url: string | null
  thumbnail_url: string | null
  status: ProjectStatus
  client_name: string
  due_date: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectWithStats extends Project {
  comment_count: number
  version_count: number
}

export interface Comment {
  id: string
  project_id: string
  user_id: string
  content: string
  timecode: number | null
  created_at: string
  user?: Pick<User, 'full_name' | 'email' | 'avatar_url'>
}

export interface ProjectVersion {
  id: string
  project_id: string
  version_number: number
  video_url: string
  notes: string | null
  created_at: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
}

// Form types
export interface CreateProjectForm {
  title: string
  description: string
  client_name: string
  due_date: string
  video_url: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  full_name: string
}

// Status display helpers
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  in_review: 'bg-blue-50 text-blue-700',
  approved: 'bg-green-50 text-green-700',
  changes_requested: 'bg-amber-50 text-amber-700',
}

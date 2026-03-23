// lib/queries.ts — All React Query hooks for RealVault

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project, ProjectWithStats, CreateProjectForm, ProjectStatus, ApiResponse } from './types'

// ── Query Keys (typed constants — great for interviews) ──
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
}

// ── Fetch all projects ──
async function fetchProjects(): Promise<ProjectWithStats[]> {
  const res = await fetch('/api/projects')
  if (!res.ok) throw new Error('Failed to fetch projects')
  const json: ApiResponse<ProjectWithStats[]> = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data ?? []
}

// ── Fetch single project ──
async function fetchProject(id: string): Promise<ProjectWithStats> {
  const res = await fetch(`/api/projects/${id}`)
  if (!res.ok) throw new Error('Failed to fetch project')
  const json: ApiResponse<ProjectWithStats> = await res.json()
  if (json.error) throw new Error(json.error)
  if (!json.data) throw new Error('Project not found')
  return json.data
}

// ── Create project ──
async function createProject(data: CreateProjectForm): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create project')
  const json: ApiResponse<Project> = await res.json()
  if (json.error) throw new Error(json.error)
  if (!json.data) throw new Error('Create failed')
  return json.data
}

// ── Update project status ──
async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update project')
  const json: ApiResponse<Project> = await res.json()
  if (json.error) throw new Error(json.error)
  if (!json.data) throw new Error('Update failed')
  return json.data
}

// ── Delete project ──
async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete project')
}

// ── React Query Hooks ──

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => fetchProject(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate and refetch projects list after creation
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      updateProjectStatus(id, status),
    onSuccess: (updatedProject) => {
      // Update both the list and the individual project in cache
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      queryClient.invalidateQueries({ queryKey: queryKeys.project(updatedProject.id) })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

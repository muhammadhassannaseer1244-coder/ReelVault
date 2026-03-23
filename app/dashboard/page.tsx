'use client'
// app/dashboard/page.tsx
import Link from 'next/link'
import { Plus, Film, Loader2, AlertCircle, FolderOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ProjectCard from '@/components/ProjectCard'
import StatusBadge from '@/components/StatusBadge'
import { useProjects } from '@/lib/queries'
import type { ProjectStatus, ProjectWithStats } from '@/lib/types'
import { useState } from 'react'

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Changes Requested', value: 'changes_requested' },
]

function StatsBar({ projects }: { projects: ProjectWithStats[] }) {
  const stats = {
    total: projects.length,
    approved: projects.filter(p => p.status === 'approved').length,
    in_review: projects.filter(p => p.status === 'in_review').length,
    changes: projects.filter(p => p.status === 'changes_requested').length,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Projects', value: stats.total, color: 'text-slate-900' },
        { label: 'In Review', value: stats.in_review, color: 'text-blue-600' },
        { label: 'Approved', value: stats.approved, color: 'text-green-600' },
        { label: 'Changes Requested', value: stats.changes, color: 'text-amber-600' },
      ].map(({ label, value, color }) => (
        <div key={label} className="card p-4">
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: projects, isLoading, isError, error } = useProjects()
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = (projects ?? []).filter(p => {
    const matchesStatus = activeFilter === 'all' || p.status === activeFilter
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and review your video projects</p>
          </div>
          <Link href="/projects/new">
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </Link>
        </div>

        {/* Stats */}
        {projects && projects.length > 0 && <StatsBar projects={projects} />}

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            className="input max-w-xs"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === f.value
                    ? 'bg-brand text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading projects...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="card p-6 flex items-center gap-3 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Failed to load projects</p>
              <p className="text-xs text-red-600 mt-0.5">{error?.message}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {search || activeFilter !== 'all' ? 'No projects match your filter' : 'No projects yet'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              {search || activeFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first project to start reviewing videos with your team.'}
            </p>
            {!search && activeFilter === 'all' && (
              <Link href="/projects/new">
                <button className="btn-primary">
                  <Plus className="w-4 h-4" /> Create first project
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Project grid */}
        {!isLoading && filtered.length > 0 && (
          <>
            <p className="text-xs text-slate-400 mb-4">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

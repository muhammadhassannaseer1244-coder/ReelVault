'use client'
// app/projects/id/page.tsx
// NOTE: rename this folder from 'id' to '[id]' on your machine
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, AlertCircle, Calendar,
  CheckCircle2, XCircle, Clock, RefreshCw, Trash2
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import { useProject, useUpdateProjectStatus, useDeleteProject } from '@/lib/queries'
import type { ProjectStatus } from '@/lib/types'

function VideoPlayer({ url }: { url: string }) {
  // Convert YouTube watch URLs to embed format
  const getEmbedUrl = (rawUrl: string): string | null => {
    try {
      const u = new URL(rawUrl)
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        const videoId = u.searchParams.get('v') || u.pathname.split('/').pop()
        return `https://www.youtube.com/embed/${videoId}`
      }
      if (u.hostname.includes('vimeo.com')) {
        const videoId = u.pathname.split('/').pop()
        return `https://player.vimeo.com/video/${videoId}`
      }
      // Direct video file
      return rawUrl
    } catch {
      return null
    }
  }

  const embedUrl = getEmbedUrl(url)
  const isEmbed = embedUrl && (embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com'))

  if (!embedUrl) {
    return (
      <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center">
        <p className="text-slate-400 text-sm">Invalid video URL</p>
      </div>
    )
  }

  if (isEmbed) {
    return (
      <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    )
  }

  return (
    <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
      <video controls className="w-full h-full" src={url}>
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

const ACTION_BUTTONS: { label: string; status: ProjectStatus; icon: React.ElementType; className: string }[] = [
  { label: 'Approve',           status: 'approved',           icon: CheckCircle2, className: 'btn-success' },
  { label: 'Request Changes',   status: 'changes_requested',  icon: XCircle,      className: 'btn-danger'  },
  { label: 'Mark In Review',    status: 'in_review',          icon: Clock,        className: 'btn-secondary'},
  { label: 'Reset to Pending',  status: 'pending',            icon: RefreshCw,    className: 'btn-ghost'   },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: project, isLoading, isError, error } = useProject(id)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateProjectStatus()
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject()

  const handleStatusChange = (status: ProjectStatus) => {
    updateStatus({ id, status })
  }

  const handleDelete = () => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    deleteProject(id, {
      onSuccess: () => router.push('/dashboard'),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="card p-6 flex items-center gap-3 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800 text-sm">Project not found</p>
              <p className="text-xs text-red-600 mt-0.5">{error?.message}</p>
            </div>
          </div>
          <Link href="/dashboard">
            <button className="btn-secondary mt-4"><ArrowLeft className="w-4 h-4" />Back to dashboard</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Video + Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video player */}
            {project.video_url ? (
              <VideoPlayer url={project.video_url} />
            ) : (
              <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No video URL added yet</p>
              </div>
            )}

            {/* Project info */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">{project.title}</h1>
                  <p className="text-sm text-slate-500 mt-1">{project.client_name}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              {project.description && (
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{project.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-100">
                {project.due_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Due {new Date(project.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                <span>Created {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Actions sidebar */}
          <div className="space-y-4">

            {/* Status actions */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Review Decision</h2>
              <p className="text-xs text-slate-400 mb-4">Update the status of this project</p>

              <div className="space-y-2">
                {ACTION_BUTTONS.map(({ label, status, icon: Icon, className }) => (
                  <button
                    key={status}
                    className={`${className} w-full justify-start`}
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdating || project.status === status}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    {label}
                    {project.status === status && (
                      <span className="ml-auto text-xs opacity-60">Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Project meta */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Project Details</h2>
              <dl className="space-y-2">
                {[
                  { label: 'Client', value: project.client_name },
                  { label: 'Status', value: <StatusBadge status={project.status} size="sm" /> },
                  { label: 'Due date', value: project.due_date ? new Date(project.due_date).toLocaleDateString() : '—' },
                  { label: 'Version', value: `v${project.version_count}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-xs text-slate-400">{label}</dt>
                    <dd className="text-xs font-medium text-slate-700">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Danger zone */}
            <div className="card p-5 border-red-100">
              <h2 className="text-sm font-semibold text-red-700 mb-3">Danger Zone</h2>
              <button
                className="btn-danger w-full justify-start"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete project
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'
// app/projects/new/page.tsx
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Film } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useCreateProject } from '@/lib/queries'
import type { CreateProjectForm } from '@/lib/types'

export default function NewProjectPage() {
  const router = useRouter()
  const { mutateAsync: createProject, isPending, error } = useCreateProject()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectForm>()

  const onSubmit = async (values: CreateProjectForm) => {
    try {
      const project = await createProject(values)
      router.push(`/projects/${project.id}`)
    } catch {
      // error shown via mutation error state
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="card p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">New Project</h1>
              <p className="text-sm text-slate-500">Add a video project for review</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Title */}
            <div>
              <label className="label">Project title <span className="text-red-500">*</span></label>
              <input
                className="input"
                placeholder="e.g. Product Launch Commercial — Q1 2026"
                {...register('title', { required: 'Project title is required' })}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            {/* Client name */}
            <div>
              <label className="label">Client name <span className="text-red-500">*</span></label>
              <input
                className="input"
                placeholder="e.g. Acme Corp"
                {...register('client_name', { required: 'Client name is required' })}
              />
              {errors.client_name && <p className="text-xs text-red-600 mt-1">{errors.client_name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[100px] resize-y"
                placeholder="Brief description of the project, goals, and review notes..."
                {...register('description')}
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="label">Video URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                {...register('video_url')}
              />
              <p className="text-xs text-slate-400 mt-1">YouTube, Vimeo, or direct MP4 links supported</p>
            </div>

            {/* Due date */}
            <div>
              <label className="label">Due date</label>
              <input
                type="date"
                className="input"
                {...register('due_date')}
              />
            </div>

            {/* Server error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
                ) : (
                  'Create project'
                )}
              </button>
              <Link href="/dashboard">
                <button type="button" className="btn-secondary">Cancel</button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

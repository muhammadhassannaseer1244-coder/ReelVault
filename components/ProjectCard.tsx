// components/ProjectCard.tsx
import Link from 'next/link'
import { Calendar, MessageSquare, GitBranch, ArrowRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { ProjectWithStats } from '@/lib/types'

interface ProjectCardProps {
  project: ProjectWithStats
}

function formatDate(date: string | null): string {
  if (!date) return 'No due date'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="card-hover p-6 group cursor-pointer h-full flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Client avatar */}
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-slate-600">
                {getInitials(project.client_name)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-brand transition-colors">
                {project.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">{project.client_name}</p>
            </div>
          </div>
          <StatusBadge status={project.status} size="sm" />
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
            {project.description}
          </p>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(project.due_date)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {project.comment_count}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              v{project.version_count}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}

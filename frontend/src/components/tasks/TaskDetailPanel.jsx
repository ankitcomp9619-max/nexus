import { useEffect, useState } from 'react'
import { X, Clock, Calendar, Flag, Tag, Link2 } from 'lucide-react'
import { taskService } from '../../services/taskService'
import Badge from '../common/Badge'
import { formatDate, priorityColor, statusColor, isOverdue } from '../../utils/helpers'

export default function TaskDetailPanel({ task, onClose }) {
  const [deps, setDeps]           = useState([])
  const [depsLoading, setDepsLoading] = useState(false)

  useEffect(() => {
    if (task?._id) {
      setDepsLoading(true)
      taskService.getDependencies(task._id)
        .then(res => setDeps(res.data.data.dependencies || []))
        .catch(() => setDeps([]))
        .finally(() => setDepsLoading(false))
    }
  }, [task?._id])

  if (!task) return null

  const overdue = isOverdue(task.deadline) && task.status !== 'completed'
  const rowCls  = 'flex items-center gap-3 text-sm'
  const keyCls  = 'text-slate-500 dark:text-slate-400 w-24 flex-shrink-0'
  const valCls  = 'font-medium text-slate-700 dark:text-slate-200'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge label={task.priority} color={priorityColor(task.priority)} />
            <Badge label={task.status}   color={statusColor(task.status)} />
            {overdue && <Badge label="Overdue" color="red" />}
          </div>

          {task.description && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Details</h3>

            <div className={rowCls}>
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className={keyCls}>Deadline</span>
              <span className={`font-medium ${overdue ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {formatDate(task.deadline)}
              </span>
            </div>
            <div className={rowCls}>
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className={keyCls}>Duration</span>
              <span className={valCls}>{task.estimatedDuration ? `${task.estimatedDuration} min` : '—'}</span>
            </div>
            <div className={rowCls}>
              <Flag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className={keyCls}>Priority</span>
              <span className={`${valCls} capitalize`}>{task.priority}</span>
            </div>
            <div className={rowCls}>
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className={keyCls}>Status</span>
              <span className={`${valCls} capitalize`}>{task.status}</span>
            </div>
            <div className={rowCls}>
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className={keyCls}>Created</span>
              <span className={valCls}>{formatDate(task.createdAt)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Prerequisites ({deps.length})
            </h3>
            {depsLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />)}
              </div>
            ) : deps.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">No prerequisites</p>
            ) : (
              <ul className="space-y-1.5">
                {deps.map((dep) => (
                  <li key={dep._id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/60 rounded-lg px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{dep.title}</span>
                    <span className={`ml-auto text-xs font-medium capitalize ${dep.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {dep.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

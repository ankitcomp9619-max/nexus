import { formatDate } from '../../utils/helpers'
import Badge from '../common/Badge'

export default function ActivityFeed({ tasks }) {
  const recent = [...tasks]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8)

  if (!recent.length) {
    return <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No recent activity</p>
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
      {recent.map((task) => (
        <li key={task._id} className="flex items-center gap-3 py-3">
          <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{task.title}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(task.createdAt)}</p>
          </div>
          <Badge
            label={task.status}
            color={task.status === 'completed' ? 'green' : task.status === 'in progress' ? 'blue' : 'slate'}
          />
        </li>
      ))}
    </ul>
  )
}

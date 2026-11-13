import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import Badge from '../common/Badge'
import { formatDate, priorityColor, statusColor, isOverdue } from '../../utils/helpers'

export default function TaskTable({ tasks, onEdit, onDelete, onRowClick, sortField, sortDir, onSort }) {
  const headers = [
    { key: 'title',             label: 'Title' },
    { key: 'priority',          label: 'Priority' },
    { key: 'status',            label: 'Status' },
    { key: 'deadline',          label: 'Deadline' },
    { key: 'estimatedDuration', label: 'Duration' },
  ]

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-slate-300 dark:text-slate-600" />
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-indigo-500" />
      : <ChevronDown className="w-3 h-3 text-indigo-500" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700/60">
            {headers.map(h => (
              <th
                key={h.key}
                className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none whitespace-nowrap"
                onClick={() => onSort(h.key)}
              >
                <div className="flex items-center gap-1">
                  {h.label}
                  <SortIcon field={h.key} />
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
          {tasks.map((task) => {
            const overdue = isOverdue(task.deadline) && task.status !== 'completed'
            return (
              <tr
                key={task._id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer group"
                onClick={() => onRowClick(task)}
              >
                <td className="px-4 py-3.5">
                  <div className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors max-w-[220px] truncate">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[220px] mt-0.5">{task.description}</div>
                  )}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <Badge label={task.priority} color={priorityColor(task.priority)} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <Badge label={task.status} color={statusColor(task.status)} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={`text-sm ${overdue ? 'text-red-500 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                    {formatDate(task.deadline)}
                    {overdue && <span className="ml-1 text-xs">(overdue)</span>}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {task.estimatedDuration ? `${task.estimatedDuration} min` : '—'}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

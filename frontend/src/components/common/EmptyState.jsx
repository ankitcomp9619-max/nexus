import { InboxIcon } from 'lucide-react'

export default function EmptyState({ title = 'No data found', description = 'Get started by creating your first item.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
        <InboxIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>
    </div>
  )
}

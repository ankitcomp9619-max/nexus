import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function DeleteConfirmModal({ open, onClose, task, onConfirm }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try { await onConfirm() }
    finally { setLoading(false) }
  }

  if (!open || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 text-center mb-1">Delete Task?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-1">This will permanently delete:</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center mb-5 px-4 truncate">"{task.title}"</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

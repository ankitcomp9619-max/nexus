import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { taskService } from '../../services/taskService'
import toast from 'react-hot-toast'

const defaultForm = {
  title: '', description: '', priority: 'medium',
  status: 'pending', deadline: '', estimatedDuration: '',
}

const inputCls = (err) =>
  `w-full border rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 transition ${err ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`

const selectCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 transition'
const labelCls  = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'

export default function TaskModal({ open, onClose, task, onSaved }) {
  const [form,    setForm]    = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const isEdit = !!task

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          title:             task.title || '',
          description:       task.description || '',
          priority:          task.priority || 'medium',
          status:            task.status  || 'pending',
          deadline:          task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
          estimatedDuration: task.estimatedDuration || '',
        })
      } else {
        setForm(defaultForm)
      }
      setErrors({})
    }
  }, [open, task])

  const validate = () => {
    const errs = {}
    if (!form.title       || form.title.trim().length       < 3) errs.title       = 'Title must be at least 3 characters'
    if (!form.description || form.description.trim().length < 5) errs.description = 'Description must be at least 5 characters'
    if (!form.priority) errs.priority = 'Priority is required'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = {
        title:             form.title.trim(),
        description:       form.description.trim(),
        priority:          form.priority,
        deadline:          form.deadline || undefined,
        estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
      }
      if (isEdit) {
        payload.status = form.status
        await taskService.update(task._id, payload)
        toast.success('Task updated successfully')
      } else {
        await taskService.create(payload)
        toast.success('Task created successfully')
      }
      onSaved()
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (data?.errors?.length) {
        const fieldErrs = {}
        data.errors.forEach(({ field, message }) => { fieldErrs[field] = message })
        setErrors(fieldErrs)
        toast.error(data.errors[0].message)
      } else {
        toast.error(data?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className={labelCls}>Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter task title" className={inputCls(errors.title)} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className={labelCls}>Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the task..." rows={3}
              className={`${inputCls(errors.description)} resize-none`} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className={selectCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className={labelCls}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                className={`${selectCls} [color-scheme:light] dark:[color-scheme:dark]`} />
            </div>
            <div>
              <label className={labelCls}>Duration (mins)</label>
              <input type="number" name="estimatedDuration" value={form.estimatedDuration} onChange={handleChange}
                min="1" placeholder="e.g. 60" className={inputCls(false)} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-60 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

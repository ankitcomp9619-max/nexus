import { useEffect, useState } from 'react'
import { Plus, GitBranch, ChevronRight, Loader2, X, CheckCircle2, Clock, Trash2, Edit2, AlertTriangle } from 'lucide-react'
import { taskService } from '../services/taskService'
import Badge from '../components/common/Badge'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import { priorityColor, statusColor } from '../utils/helpers'
import toast from 'react-hot-toast'

// ─── Add Dependency Modal ────────────────────────────────────────────────────
function AddDependencyModal({ open, onClose, tasks, onAdded }) {
  const [dependentId,    setDependentId]    = useState('')
  const [prerequisiteId, setPrerequisiteId] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setDependentId(''); setPrerequisiteId('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!dependentId || !prerequisiteId) { toast.error('Please select both tasks'); return }
    if (dependentId === prerequisiteId)  { toast.error('A task cannot depend on itself'); return }
    setLoading(true)
    try {
      await taskService.addDependency(dependentId, prerequisiteId)
      toast.success('Dependency added')
      onAdded()
      onClose()
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add dependency')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const selectCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-300'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Add Dependency</h2>
          <button onClick={() => { onClose(); reset() }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Set which task must be completed before another can begin.</p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Task (the dependent)</label>
            <select value={dependentId} onChange={e => setDependentId(e.target.value)} className={selectCls}>
              <option value="">Select a task...</option>
              {tasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ChevronRight className="w-4 h-4" /> depends on <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Prerequisite task</label>
            <select value={prerequisiteId} onChange={e => setPrerequisiteId(e.target.value)} className={selectCls}>
              <option value="">Select a prerequisite...</option>
              {tasks.filter(t => t._id !== dependentId).map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { onClose(); reset() }}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Dependency
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Edit Dependency Modal ────────────────────────────────────────────────────
// "Edit" = remove the old dependency and add a new one in its place
function EditDependencyModal({ open, onClose, tasks, taskId, oldDep, onEdited }) {
  const [newPrerequisiteId, setNewPrerequisiteId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setNewPrerequisiteId('')
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newPrerequisiteId) { toast.error('Please select a replacement prerequisite'); return }
    if (newPrerequisiteId === taskId) { toast.error('A task cannot depend on itself'); return }
    if (newPrerequisiteId === oldDep?._id) { toast.error('That is already the current prerequisite'); return }
    setLoading(true)
    try {
      // Step 1: remove old dependency
      await taskService.removeDependency(taskId, oldDep._id)
      // Step 2: add new dependency
      await taskService.addDependency(taskId, newPrerequisiteId)
      toast.success('Dependency updated')
      onEdited()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update dependency')
    } finally {
      setLoading(false)
    }
  }

  if (!open || !oldDep) return null

  const selectCls = 'w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-300'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Edit Dependency</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-700/60 rounded-lg px-3 py-2.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Replacing prerequisite</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{oldDep.title}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">New prerequisite task</label>
            <select value={newPrerequisiteId} onChange={e => setNewPrerequisiteId(e.target.value)} className={selectCls}>
              <option value="">Select replacement...</option>
              {tasks.filter(t => t._id !== taskId && t._id !== oldDep._id).map(t => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Dependency
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Dependency Confirm ────────────────────────────────────────────────
function DeleteDepConfirm({ open, onClose, dep, onConfirm, loading }) {
  if (!open || !dep) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Remove Dependency?</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Remove <span className="font-semibold text-slate-700 dark:text-slate-200">"{dep.title}"</span> as a prerequisite?
            This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BFS Panel ────────────────────────────────────────────────────────────────
function BFSPanel({ task, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (task?._id) {
      setLoading(true)
      taskService.getDependentsBFS(task._id)
        .then(res => setData(res.data.data))
        .catch(() => setData(null))
        .finally(() => setLoading(false))
    }
  }, [task?._id])

  if (!task) return null

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Downstream Impact (BFS)</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tasks unlocked by: {task.title}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : !data ? (
        <p className="text-sm text-slate-400">Failed to load BFS data</p>
      ) : (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{data.totalDependents} dependent task{data.totalDependents !== 1 ? 's' : ''} found</p>
          {data.traversalOrder?.length > 0 ? (
            <div className="space-y-2">
              {data.traversalOrder.map((t, idx) => (
                <div key={t._id || idx} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/60 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{t.title || t}</span>
                  {t.status && <Badge label={t.status} color={statusColor(t.status)} />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">No downstream tasks found.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Dependencies() {
  const [tasks,      setTasks]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [taskDeps,   setTaskDeps]   = useState({})
  const [depsLoading, setDepsLoading] = useState(false)

  const [addModalOpen,  setAddModalOpen]  = useState(false)
  const [editModal,     setEditModal]     = useState({ open: false, taskId: null, dep: null })
  const [deleteModal,   setDeleteModal]   = useState({ open: false, taskId: null, dep: null })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [bfsTask,       setBfsTask]       = useState(null)

  const fetchTasks = async () => {
    try {
      const res = await taskService.getAll()
      const data = res.data.data || []
      setTasks(data)
      return data
    } catch {
      toast.error('Failed to load tasks')
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchAllDeps = async (taskList) => {
    setDepsLoading(true)
    const depMap = {}
    await Promise.allSettled(
      taskList.map(async (t) => {
        try {
          const res = await taskService.getDependencies(t._id)
          depMap[t._id] = res.data.data.dependencies || []
        } catch {
          depMap[t._id] = []
        }
      })
    )
    setTaskDeps(depMap)
    setDepsLoading(false)
  }

  useEffect(() => {
    fetchTasks().then(data => { if (data.length) fetchAllDeps(data) })
  }, [])

  const refresh = async () => {
    const data = await fetchTasks()
    if (data.length) fetchAllDeps(data)
  }

  const isReady = (task) => {
    const deps = taskDeps[task._id] || []
    return deps.every(d => d.status === 'completed')
  }

  const handleDeleteDep = async () => {
    setDeleteLoading(true)
    try {
      await taskService.removeDependency(deleteModal.taskId, deleteModal.dep._id)
      toast.success('Dependency removed')
      setDeleteModal({ open: false, taskId: null, dep: null })
      refresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove dependency')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <LoadingSkeleton rows={5} />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dependencies</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage task prerequisites and execution order</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Dependency
        </button>
      </div>

      {/* BFS view */}
      {bfsTask && <BFSPanel task={bfsTask} onClose={() => setBfsTask(null)} />}

      {/* Task dependency cards */}
      {tasks.length === 0 ? (
        <EmptyState title="No tasks" description="Create some tasks first to manage dependencies." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(task => {
            const deps  = taskDeps[task._id] || []
            const ready = isReady(task)

            return (
              <div key={task._id} className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 hover:shadow-md transition-shadow">
                {/* Task header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge label={task.priority} color={priorityColor(task.priority)} />
                      <Badge label={task.status}   color={statusColor(task.status)} />
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${ready ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {ready
                          ? <><CheckCircle2 className="w-3 h-3" />Ready</>
                          : <><Clock className="w-3 h-3" />Blocked</>
                        }
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setBfsTask(bfsTask?._id === task._id ? null : task)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    Impact
                  </button>
                </div>

                {/* Dependencies list */}
                {depsLoading ? (
                  <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                ) : deps.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500">No prerequisites — can start anytime</p>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Prerequisites ({deps.length}):</p>
                    <ul className="space-y-1.5">
                      {deps.map(dep => (
                        <li key={dep._id} className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-700/60 rounded-lg px-2.5 py-2 group">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dep.status === 'completed' ? 'bg-green-400' : 'bg-amber-400'}`} />
                          <span className="text-slate-600 dark:text-slate-300 truncate flex-1">{dep.title}</span>
                          <Badge label={dep.status} color={statusColor(dep.status)} />
                          {/* Edit + Delete actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                            <button
                              onClick={() => setEditModal({ open: true, taskId: task._id, dep })}
                              className="p-1 rounded text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                              title="Change prerequisite"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ open: true, taskId: task._id, dep })}
                              className="p-1 rounded text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                              title="Remove prerequisite"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Add prerequisite shortcut */}
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add prerequisite
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <AddDependencyModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        tasks={tasks}
        onAdded={refresh}
      />
      <EditDependencyModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, taskId: null, dep: null })}
        tasks={tasks}
        taskId={editModal.taskId}
        oldDep={editModal.dep}
        onEdited={refresh}
      />
      <DeleteDepConfirm
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, taskId: null, dep: null })}
        dep={deleteModal.dep}
        onConfirm={handleDeleteDep}
        loading={deleteLoading}
      />
    </div>
  )
}

import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { taskService } from '../services/taskService'
import TaskTable from '../components/tasks/TaskTable'
import TaskModal from '../components/tasks/TaskModal'
import TaskDetailPanel from '../components/tasks/TaskDetailPanel'
import DeleteConfirmModal from '../components/tasks/DeleteConfirmModal'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import toast from 'react-hot-toast'

const selectCls = 'border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-300'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [sortField, setSortField] = useState('deadline')
  const [sortDir,   setSortDir]   = useState('asc')

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTask,   setEditTask]   = useState(null)
  const [detailTask, setDetailTask] = useState(null)
  const [deleteTask, setDeleteTask] = useState(null)

  const fetchTasks = async () => {
    try {
      const res = await taskService.getAll()
      setTasks(res.data.data || [])
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleDelete = async () => {
    try {
      await taskService.remove(deleteTask._id)
      toast.success('Task deleted')
      setDeleteTask(null)
      fetchTasks()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const filtered = useMemo(() => {
    let arr = [...tasks]
    if (search) arr = arr.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    if (priorityFilter !== 'all') arr = arr.filter(t => t.priority === priorityFilter)
    if (statusFilter   !== 'all') arr = arr.filter(t => t.status   === statusFilter)
    arr.sort((a, b) => {
      let va = a[sortField] ?? ''
      let vb = b[sortField] ?? ''
      if (sortField === 'deadline') {
        va = va ? new Date(va).getTime() : Infinity
        vb = vb ? new Date(vb).getTime() : Infinity
      } else if (sortField === 'estimatedDuration') {
        va = Number(va) || 0
        vb = Number(vb) || 0
      } else {
        va = String(va).toLowerCase()
        vb = String(vb).toLowerCase()
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
    return arr
  }, [tasks, search, priorityFilter, statusFilter, sortField, sortDir])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{tasks.length} total tasks</p>
        </div>
        <button
          onClick={() => { setEditTask(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters row */}
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className={selectCls}>
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton rows={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={tasks.length === 0 ? 'Create your first task to get started.' : 'No tasks match the current filters.'}
          />
        ) : (
          <TaskTable
            tasks={filtered}
            onEdit={task => { setEditTask(task); setModalOpen(true) }}
            onDelete={task => setDeleteTask(task)}
            onRowClick={task => setDetailTask(task)}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
          />
        )}
      </div>

      {/* Modals */}
      <TaskModal    open={modalOpen} onClose={() => setModalOpen(false)} task={editTask} onSaved={fetchTasks} />
      <TaskDetailPanel task={detailTask} onClose={() => setDetailTask(null)} />
      <DeleteConfirmModal open={!!deleteTask} task={deleteTask} onClose={() => setDeleteTask(null)} onConfirm={handleDelete} />
    </div>
  )
}

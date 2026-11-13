import { useState } from 'react'
import { Zap, List, Loader2, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { schedulerService } from '../services/schedulerService'
import Badge from '../components/common/Badge'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import EmptyState from '../components/common/EmptyState'
import { formatDate, priorityColor, statusColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Scheduler() {
  const [greedyTasks,  setGreedyTasks]  = useState([])
  const [topoTasks,    setTopoTasks]    = useState([])
  const [greedyLoading, setGreedyLoading] = useState(false)
  const [topoLoading,   setTopoLoading]   = useState(false)
  const [greedyLoaded,  setGreedyLoaded]  = useState(false)
  const [topoLoaded,    setTopoLoaded]    = useState(false)
  const [greedyError,  setGreedyError]  = useState('')
  const [topoError,    setTopoError]    = useState('')

  const loadGreedy = async () => {
    setGreedyLoading(true)
    setGreedyError('')
    try {
      const res = await schedulerService.getGreedySchedule()
      setGreedyTasks(res.data.data || [])
      setGreedyLoaded(true)
      toast.success('Smart schedule generated')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate schedule'
      setGreedyError(msg)
      toast.error(msg)
    } finally {
      setGreedyLoading(false)
    }
  }

  const loadTopo = async () => {
    setTopoLoading(true)
    setTopoError('')
    try {
      const res = await schedulerService.getTopologicalOrder()
      setTopoTasks(res.data.data || [])
      setTopoLoaded(true)
      toast.success('Execution order loaded')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load execution order'
      setTopoError(msg)
      toast.error(msg)
    } finally {
      setTopoLoading(false)
    }
  }

  const depsAllDone = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) return true
    return task.dependencies.every(d => d.status === 'completed')
  }

  const cardCls   = 'bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60'
  const errorBanner = (msg) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-600 dark:text-red-400">{msg}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Smart Scheduler</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Algorithmically optimized task scheduling powered by your backend
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Intelligent Scheduling</p>
          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
            <strong>Smart Task Scheduler</strong> prioritises tasks by deadline and priority weight.{' '}
            <strong>Dependency-Based Execution Order</strong> guarantees all prerequisites are satisfied before a task runs.
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Smart Task Scheduler (Greedy) ── */}
        <div className="space-y-4">
          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Smart Task Scheduler</h2>
              </div>
              <button
                onClick={loadGreedy}
                disabled={greedyLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-60"
              >
                {greedyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {greedyLoaded ? 'Refresh Schedule' : 'Generate Schedule'}
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Sorted by deadline urgency + priority weight</p>
          </div>

          {greedyLoading && <div className={`${cardCls} p-5`}><LoadingSkeleton rows={4} /></div>}
          {greedyError && !greedyLoading && errorBanner(greedyError)}

          {greedyLoaded && !greedyLoading && (
            greedyTasks.length === 0 ? (
              <div className={cardCls}><EmptyState title="No scheduled tasks" description="Create tasks with deadlines to generate a schedule." /></div>
            ) : (
              <div className="space-y-2.5">
                {greedyTasks.map((task, idx) => (
                  <div key={task._id} className={`${cardCls} p-4 hover:shadow-md transition-shadow`}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                          <span className={`text-xs font-medium flex-shrink-0 ${depsAllDone(task) ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {depsAllDone(task) ? '✓ Ready' : '⏳ Waiting'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge label={task.priority} color={priorityColor(task.priority)} />
                          <Badge label={task.status}   color={statusColor(task.status)} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                          {task.deadline && <span>📅 {formatDate(task.deadline)}</span>}
                          {task.estimatedDuration && <span>⏱ {task.estimatedDuration} min</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* ── Dependency-Based Execution Order (Topological) ── */}
        <div className="space-y-4">
          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dependency-Based Execution Order</h2>
              </div>
              <button
                onClick={loadTopo}
                disabled={topoLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-60"
              >
                {topoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <List className="w-3.5 h-3.5" />}
                {topoLoaded ? 'Refresh Order' : 'Load Order'}
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Guarantees all prerequisites are met before execution</p>
          </div>

          {topoLoading && <div className={`${cardCls} p-5`}><LoadingSkeleton rows={4} /></div>}
          {topoError && !topoLoading && errorBanner(topoError)}

          {topoLoaded && !topoLoading && (
            topoTasks.length === 0 ? (
              <div className={cardCls}><EmptyState title="No tasks" description="Create tasks to see the dependency-safe execution order." /></div>
            ) : (
              <div className="space-y-2.5">
                {topoTasks.map((task, idx) => (
                  <div key={task._id} className="relative">
                    <div className={`${cardCls} p-4 hover:shadow-md transition-shadow`}>
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{task.title}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge label={task.priority} color={priorityColor(task.priority)} />
                            <Badge label={task.status}   color={statusColor(task.status)} />
                            {task.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </span>
                            )}
                            {task.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {idx < topoTasks.length - 1 && (
                      <div className="flex justify-center my-1">
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

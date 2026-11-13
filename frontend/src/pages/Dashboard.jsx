import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, ListTodo, TrendingUp, CalendarDays } from 'lucide-react'
import { taskService } from '../services/taskService'
import StatCard from '../components/dashboard/StatCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import CompletionChart from '../components/charts/CompletionChart'
import PriorityChart from '../components/charts/PriorityChart'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import Badge from '../components/common/Badge'
import { formatDate, priorityColor } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

function getDayName(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
}

function getWeekChartData(tasks) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toDateString()
    const name = getDayName(d)
    const completed = tasks.filter(t =>
      t.status === 'completed' && t.updatedAt && new Date(t.updatedAt).toDateString() === key
    ).length
    days.push({ name, completed })
  }
  return days
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

// Inject CSS variables for Recharts based on current theme
function useChartVars() {
  useEffect(() => {
    const update = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const root = document.documentElement
      root.style.setProperty('--chart-grid',   isDark ? '#1e293b' : '#f1f5f9')
      root.style.setProperty('--chart-tick',   isDark ? '#64748b' : '#94a3b8')
      root.style.setProperty('--chart-bg',     isDark ? '#1e293b' : '#ffffff')
      root.style.setProperty('--chart-border', isDark ? '#334155' : '#e2e8f0')
      root.style.setProperty('--chart-text',   isDark ? '#e2e8f0' : '#1e293b')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  useChartVars()

  useEffect(() => {
    taskService.getAll()
      .then(res => setTasks(res.data.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  const total       = tasks.length
  const pending     = tasks.filter(t => t.status === 'pending').length
  const inProgress  = tasks.filter(t => t.status === 'in progress').length
  const completed   = tasks.filter(t => t.status === 'completed').length
  const highPriority = tasks.filter(t => t.priority === 'high').length

  const priorityData = [
    { name: 'high',   value: tasks.filter(t => t.priority === 'high').length },
    { name: 'medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'low',    value: tasks.filter(t => t.priority === 'low').length },
  ].filter(d => d.value > 0)

  const weekData = getWeekChartData(tasks)

  const now    = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcoming = tasks
    .filter(t => t.deadline && t.status !== 'completed' && new Date(t.deadline) >= now && new Date(t.deadline) <= in7Days)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  const today = tasks.filter(t => {
    if (!t.deadline) return false
    return new Date(t.deadline).toDateString() === now.toDateString()
  })

  const skeletonCls = 'bg-slate-100 dark:bg-slate-800 rounded animate-pulse'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Good {getGreeting()}, {user?.username} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's what's happening with your tasks today.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className={`h-24 ${skeletonCls}`} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Tasks"   value={total}        icon={ListTodo}    color="indigo" trend="All tasks" />
          <StatCard label="Pending"       value={pending}      icon={Clock}       color="amber"  trend="Not started" />
          <StatCard label="In Progress"   value={inProgress}   icon={TrendingUp}  color="blue"   trend="Active" />
          <StatCard label="Completed"     value={completed}    icon={CheckCircle2} color="green" trend={`${total ? Math.round(completed/total*100) : 0}% done`} />
          <StatCard label="High Priority" value={highPriority} icon={AlertCircle} color="red"   trend="Urgent tasks" />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Completion Trend (7 days)</h3>
          {loading ? <div className={`h-48 ${skeletonCls}`} /> : <CompletionChart data={weekData} />}
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Priority Distribution</h3>
          {loading ? (
            <div className={`h-48 ${skeletonCls}`} />
          ) : priorityData.length > 0 ? (
            <PriorityChart data={priorityData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">No tasks yet</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upcoming Deadlines (7 days)</h3>
          </div>
          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No upcoming deadlines</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {upcoming.slice(0, 5).map(task => (
                <li key={task._id} className="flex items-center gap-3 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(task.deadline)}</p>
                  </div>
                  <Badge label={task.priority} color={priorityColor(task.priority)} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Recent Tasks</h3>
          {loading ? <LoadingSkeleton rows={4} /> : <ActivityFeed tasks={tasks} />}
        </div>
      </div>

      {/* Today's tasks */}
      {!loading && today.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Due Today ({today.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {today.map(task => (
              <div key={task._id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
                  <Badge label={task.priority} color={priorityColor(task.priority)} />
                </div>
                <Badge label={task.status} color={task.status === 'completed' ? 'green' : task.status === 'in progress' ? 'blue' : 'slate'} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

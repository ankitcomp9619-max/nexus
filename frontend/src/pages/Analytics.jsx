import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts'
import { taskService } from '../services/taskService'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
const STATUS_COLORS   = { pending: '#94a3b8', 'in progress': '#6366f1', completed: '#22c55e' }

// Read CSS vars set by the Dashboard's useChartVars hook
const tooltipStyle = {
  fontSize: 12, borderRadius: 8,
  border:           'var(--chart-border, 1px solid #e2e8f0)',
  backgroundColor:  'var(--chart-bg, #ffffff)',
  color:            'var(--chart-text, #1e293b)',
}
const gridStroke = 'var(--chart-grid, #f1f5f9)'
const tickFill   = 'var(--chart-tick, #94a3b8)'

export default function Analytics() {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Inject chart CSS vars for dark mode awareness
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
    taskService.getAll()
      .then(res => setTasks(res.data.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
    return () => observer.disconnect()
  }, [])

  const total          = tasks.length
  const completed      = tasks.filter(t => t.status === 'completed').length
  const inProgress     = tasks.filter(t => t.status === 'in progress').length
  const pending        = tasks.filter(t => t.status === 'pending').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const overdue        = tasks.filter(t => !t.deadline || t.status === 'completed' ? false : new Date(t.deadline) < new Date()).length

  const priorityData = [
    { name: 'high',   value: tasks.filter(t => t.priority === 'high').length },
    { name: 'medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'low',    value: tasks.filter(t => t.priority === 'low').length },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'Pending',     value: pending,    color: STATUS_COLORS['pending'] },
    { name: 'In Progress', value: inProgress, color: STATUS_COLORS['in progress'] },
    { name: 'Completed',   value: completed,  color: STATUS_COLORS['completed'] },
  ]

  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const daysAgo = 6 - i
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    const dateStr = d.toDateString()
    return {
      name:      d.toLocaleDateString('en-US', { weekday: 'short' }),
      created:   tasks.filter(t => t.createdAt && new Date(t.createdAt).toDateString() === dateStr).length,
      completed: tasks.filter(t => t.status === 'completed' && t.updatedAt && new Date(t.updatedAt).toDateString() === dateStr).length,
    }
  })

  const deadlineData = [
    { name: 'Overdue',   value: overdue,                                  fill: '#ef4444' },
    { name: 'On Track',  value: Math.max(0, total - completed - overdue), fill: '#6366f1' },
    { name: 'Completed', value: completed,                                fill: '#22c55e' },
  ]

  const cardCls = 'bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5'
  const hCls    = 'text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4'
  const skl     = 'bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Insights into your task performance and productivity</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className={`h-48 ${skl}`} />)}
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Tasks',      value: total,            color: 'text-slate-800 dark:text-slate-100' },
              { label: 'Completion Rate',  value: `${completionRate}%`, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Overdue',          value: overdue,          color: 'text-red-500' },
              { label: 'In Progress',      value: inProgress,       color: 'text-blue-500' },
            ].map(k => (
              <div key={k.label} className={`${cardCls} text-center`}>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={cardCls}>
              <h3 className={hCls}>Tasks by Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusData.map(d => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={cardCls}>
              <h3 className={hCls}>Priority Distribution</h3>
              {priorityData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">No tasks</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {priorityData.map(e => <Cell key={e.name} fill={PRIORITY_COLORS[e.name] || '#6366f1'} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={cardCls}>
              <h3 className={hCls}>Activity Trend (7 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="created"   name="Created"   stroke="#6366f1" strokeWidth={2} fill="url(#aCreated)" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" strokeWidth={2} fill="url(#aDone)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={cardCls}>
              <h3 className={hCls}>Deadline Tracking</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deadlineData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis type="number"   tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {deadlineData.map(d => <Cell key={d.name} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion progress */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Overall Completion Progress</h3>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{completionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
              <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
              <span>{completed} completed</span>
              <span>{total - completed} remaining</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

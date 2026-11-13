import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { taskService } from '../services/taskService'
import Badge from '../components/common/Badge'
import { priorityColor, statusColor } from '../utils/helpers'

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function Calendar() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    taskService.getAll()
      .then(res => setTasks(res.data.data || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay    = getFirstDayOfMonth(viewYear, viewMonth)

  const getTasksForDay = (day) => tasks.filter(t => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day
  })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
  }

  const isToday = (day) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
  const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : []

  const monthTaskCount = tasks.filter(t => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  }).length

  const monthDoneCount = tasks.filter(t => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && t.status === 'completed'
  }).length

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Calendar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View tasks by their deadline dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {monthNames[viewMonth]} {viewYear}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(today.getDate()) }}
                className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              >
                Today
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-700/40 rounded-lg overflow-hidden">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="bg-white dark:bg-slate-800 min-h-[60px] p-1" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day       = i + 1
              const dayTasks  = getTasksForDay(day)
              const isSelected = selectedDate === day
              const todayDay  = isToday(day)
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                  className={`bg-white dark:bg-slate-800 min-h-[60px] p-1.5 cursor-pointer transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20
                    ${isSelected ? 'ring-2 ring-inset ring-indigo-400 bg-indigo-50/40 dark:bg-indigo-900/20' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 mx-auto
                    ${todayDay ? 'bg-indigo-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 2).map(t => (
                      <div key={t._id} className={`w-full h-1.5 rounded-full ${
                        t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                      }`} />
                    ))}
                    {dayTasks.length > 2 && <p className="text-[9px] text-slate-400 text-center">+{dayTasks.length - 2}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs text-slate-400 dark:text-slate-500">Priority:</span>
            {[{ label: 'High', color: 'bg-red-400' }, { label: 'Medium', color: 'bg-amber-400' }, { label: 'Low', color: 'bg-green-400' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            {selectedDate
              ? `${monthNames[viewMonth]} ${selectedDate} — ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''}`
              : 'Select a date'}
          </h3>

          {!selectedDate ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Click on a day to see tasks due that day.</p>
          ) : loading ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />)}
            </div>
          ) : selectedTasks.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No tasks due on this day.</p>
          ) : (
            <ul className="space-y-3">
              {selectedTasks.map(task => (
                <li key={task._id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">{task.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge label={task.priority} color={priorityColor(task.priority)} />
                    <Badge label={task.status}   color={statusColor(task.status)} />
                  </div>
                  {task.estimatedDuration && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{task.estimatedDuration} min estimated</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!loading && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Month Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Total tasks this month</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{monthTaskCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Completed</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{monthDoneCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

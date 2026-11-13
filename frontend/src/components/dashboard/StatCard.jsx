export default function StatCard({ label, value, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', icon: 'text-indigo-500 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/30',   icon: 'text-green-500 dark:text-green-400',   border: 'border-green-100 dark:border-green-800' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/30',   icon: 'text-amber-500 dark:text-amber-400',   border: 'border-amber-100 dark:border-amber-800' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/30',       icon: 'text-red-500 dark:text-red-400',       border: 'border-red-100 dark:border-red-800' },
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/30',     icon: 'text-blue-500 dark:text-blue-400',     border: 'border-blue-100 dark:border-blue-800' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-2.5 rounded-lg ${c.bg} ${c.border} border`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
        {trend && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{trend}</p>}
      </div>
    </div>
  )
}

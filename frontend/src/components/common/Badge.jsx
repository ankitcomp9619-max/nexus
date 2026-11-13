export default function Badge({ label, color = 'slate' }) {
  const colors = {
    red:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    slate:  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.slate}`}>
      {label}
    </span>
  )
}

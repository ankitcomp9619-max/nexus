import { useState } from 'react'
import { Bell, Search, Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

export default function Topbar({ onMenuClick, breadcrumb }) {
  const { user } = useAuth()
  const [dark, setDark] = useState(
    () => localStorage.getItem('nexus-theme') === 'dark'
  )

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('nexus-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('nexus-theme', 'light')
    }
  }

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex-1">
        <nav className="text-sm">
          <span className="text-slate-400 dark:text-slate-500">NEXUS</span>
          {breadcrumb && (
            <>
              <span className="mx-1.5 text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium">{breadcrumb}</span>
            </>
          )}
        </nav>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 w-56">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full"
          placeholder="Search tasks..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold ml-1">
          {getInitials(user?.username)}
        </div>
      </div>
    </header>
  )
}

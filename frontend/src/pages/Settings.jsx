import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Moon, Sun, Shield, LogOut, ChevronRight } from 'lucide-react'
import { getInitials } from '../utils/helpers'
import toast from 'react-hot-toast'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [emailDigest,   setEmailDigest]   = useState(false)
  const [compactView,   setCompactView]   = useState(false)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('nexus-theme') === 'dark'
  )

  const handleDarkMode = (val) => {
    setDarkMode(val)
    if (val) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('nexus-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('nexus-theme', 'light')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Signed out successfully')
    } catch {
      toast.error('Sign out failed')
    }
  }

  const cardCls   = 'bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden'
  const headerCls = 'px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2'
  const titleCls  = 'text-sm font-semibold text-slate-700 dark:text-slate-200'
  const rowCls    = 'flex items-center justify-between px-5 py-4'
  const labelCls  = 'text-sm font-medium text-slate-700 dark:text-slate-200'
  const subCls    = 'text-xs text-slate-400 dark:text-slate-500 mt-0.5'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className={cardCls}>
        <div className={headerCls}>
          <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className={titleCls}>Profile</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              {getInitials(user?.username)}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.username}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              {user?.role && (
                <span className="inline-block mt-1 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full px-2.5 py-0.5 font-medium capitalize">
                  {user.role}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {[{ label: 'Username', value: user?.username }, { label: 'Email address', value: user?.email }].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{f.label}</label>
                <div className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/60">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Profile editing is not available. Contact your administrator to update account information.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className={cardCls}>
        <div className={headerCls}>
          <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className={titleCls}>Notifications</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          <div className={rowCls}>
            <div>
              <p className={labelCls}>Push notifications</p>
              <p className={subCls}>Get notified about task deadlines and updates</p>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
          <div className={rowCls}>
            <div>
              <p className={labelCls}>Email digest</p>
              <p className={subCls}>Receive a weekly summary of your tasks</p>
            </div>
            <Toggle checked={emailDigest} onChange={setEmailDigest} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className={cardCls}>
        <div className={headerCls}>
          {darkMode ? <Moon className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <Sun className="w-4 h-4 text-slate-500" />}
          <h2 className={titleCls}>Appearance</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          <div className={rowCls}>
            <div>
              <p className={labelCls}>Dark mode</p>
              <p className={subCls}>Switch to dark theme for low-light environments</p>
            </div>
            <Toggle checked={darkMode} onChange={handleDarkMode} />
          </div>
          <div className={rowCls}>
            <div>
              <p className={labelCls}>Compact view</p>
              <p className={subCls}>Show more items in less space</p>
            </div>
            <Toggle checked={compactView} onChange={setCompactView} />
          </div>
        </div>
      </div>

      {/* Account */}
      <div className={cardCls}>
        <div className={headerCls}>
          <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className={titleCls}>Account</h2>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/60 rounded-lg">
            <div>
              <p className={labelCls}>Session</p>
              <p className={subCls}>Your current active session</p>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full px-2.5 py-1 font-medium">Active</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-100 dark:border-red-900/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <div className="text-left">
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-red-400">You'll need to sign in again</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      <div className="text-center pb-4">
        <p className="text-xs text-slate-400 dark:text-slate-500">NEXUS v0.0.1 — Plan smarter. Execute better.</p>
      </div>
    </div>
  )
}

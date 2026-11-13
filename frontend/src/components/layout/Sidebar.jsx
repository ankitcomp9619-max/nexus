import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, GitBranch, Zap, BarChart2, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { getInitials } from '../../utils/helpers'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'My Tasks', icon: CheckSquare, to: '/tasks' },
  { label: 'Calendar', icon: Calendar, to: '/calendar' },
  { label: 'Dependencies', icon: GitBranch, to: '/dependencies' },
  { label: 'Smart Scheduler', icon: Zap, to: '/scheduler' },
  { label: 'Analytics', icon: BarChart2, to: '/analytics' },
  { label: 'Settings', icon: Settings, to: '/settings' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-30 h-full w-60 bg-slate-900 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-lg select-none">N</div>
          <div>
            <div className="text-white font-semibold text-sm tracking-wide">NEXUS</div>
            <div className="text-slate-500 text-[10px]">Plan smarter. Execute better.</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                ${isActive
                  ? 'bg-indigo-500/20 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-800 p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {getInitials(user?.username)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.username}</div>
              <div className="text-slate-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex dark:bg-slate-950">
      {/* Left brand panel — always dark */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-white text-xl">N</div>
          <div>
            <div className="text-white font-bold text-lg tracking-wide">NEXUS</div>
            <div className="text-slate-500 text-xs">Plan smarter. Execute better.</div>
          </div>
        </div>

        <div>
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-400 text-xs font-medium">Intelligent Task Management</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Organize your work.<br />
              <span className="text-indigo-400">Achieve more.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              NEXUS combines smart scheduling, dependency tracking, and analytics
              to help you stay on top of your work.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Smart Scheduler', desc: 'AI-powered task prioritization using greedy algorithms' },
              { title: 'Dependency Tracking', desc: 'Visualize and manage task dependencies with BFS traversal' },
              { title: 'Analytics Dashboard', desc: 'Deep insights into your productivity and completion rates' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-600 text-xs">
          © {new Date().getFullYear()} NEXUS. All rights reserved.
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-950">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">N</div>
          <span className="text-slate-800 dark:text-slate-100 font-bold text-lg">NEXUS</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Sign in to NEXUS</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-400 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 transition placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-400 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 transition pr-10 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-500 font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

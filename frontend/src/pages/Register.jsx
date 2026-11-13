import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.username || form.username.trim().length < 2) errs.username = 'Username must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Please enter a valid email'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register({ username: form.username, email: form.email, password: form.password })
      toast.success('Account created! ')
         navigate('/dashboard')
    } catch (err) {
      // Surface the actual backend message — including Zod validation errors
      const data = err.response?.data
      if (data?.errors?.length) {
        // Zod validation errors — map field-level messages into the form
        const fieldErrs = {}
        data.errors.forEach(({ field, message }) => {
          fieldErrs[field] = message
        })
        setErrors(fieldErrs)
        toast.error(data.errors[0].message)
      } else {
        const msg = data?.message || 'Registration failed. Please try again.'
        toast.error(msg)
        if (msg.toLowerCase().includes('email')) setErrors({ email: msg })
        else if (msg.toLowerCase().includes('username')) setErrors({ username: msg })
      }
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
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start your<br />
            <span className="text-indigo-400">productivity journey.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Create your free account and experience intelligent task management with NEXUS.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '99%', label: 'Uptime guarantee' },
              { num: 'Free', label: 'To get started' },
              { num: '∞', label: 'Tasks supported' },
              { num: 'Real-time', label: 'Updates' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800 rounded-xl p-4">
                <p className="text-indigo-400 text-xl font-bold">{s.num}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-600 text-xs">
          © {new Date().getFullYear()} NEXUS. All rights reserved.
        </div>
      </div>

      {/* Right register form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 dark:bg-slate-950">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">N</div>
          <span className="text-slate-800 dark:text-slate-100 font-bold text-lg">NEXUS</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Create your account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Start managing tasks smarter</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-400 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 transition placeholder-slate-400 dark:placeholder-slate-500 ${errors.username ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
              />
              {errors.username && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-400 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 transition placeholder-slate-400 dark:placeholder-slate-500 ${errors.email ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
              />
              {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-400 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 transition pr-10 placeholder-slate-400 dark:placeholder-slate-500 ${errors.password ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-400 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 transition pr-10 placeholder-slate-400 dark:placeholder-slate-500 ${errors.confirmPassword ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

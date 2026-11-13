import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to refresh token on mount to restore session
    authService.refresh()
      .then(() => {
        const stored = sessionStorage.getItem('nexus_user')
        if (stored) setUser(JSON.parse(stored))
      })
      .catch(() => {
        setUser(null)
        sessionStorage.removeItem('nexus_user')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    const userData = res.data.data.user
    setUser(userData)
    sessionStorage.setItem('nexus_user', JSON.stringify(userData))
    return res
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    sessionStorage.removeItem('nexus_user')
  }

  const register = async (data) => {
    return authService.register(data)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

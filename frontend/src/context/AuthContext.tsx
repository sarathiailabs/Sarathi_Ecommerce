import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'

interface UserProfile {
  email: string
  is_admin: boolean
  full_name?: string
}

interface AuthContextType {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const storedUser = localStorage.getItem('user')
        setUser({
          email: decoded.sub,
          is_admin: decoded.is_admin || false,
          full_name: storedUser ? JSON.parse(storedUser).full_name : undefined
        })
      } else {
        // Token expired
        logout()
      }
    } else {
      setUser(null)
    }
    setLoading(false)

    // Handle token expiration events from api interceptor
    const handleAuthExpired = () => {
      logout()
    }
    window.addEventListener('auth-expired', handleAuthExpired)
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const accessToken = response.data.access_token
    localStorage.setItem('token', accessToken)
    
    // Decode user info
    const decoded = parseJwt(accessToken)
    const userProfile: UserProfile = {
      email: decoded.sub,
      is_admin: decoded.is_admin || false,
      full_name: email.split('@')[0], // Fallback name
    }
    
    localStorage.setItem('user', JSON.stringify(userProfile))
    setToken(accessToken)
    setUser(userProfile)
  }

  const register = async (email: string, password: string, fullName: string) => {
    await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isAdmin: !!user?.is_admin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

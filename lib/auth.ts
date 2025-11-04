'use client'

// Simple client-side auth helper (for demo purposes)
// In production, use proper session management or NextAuth

export function setUser(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
    // Also sync to cookie for cross-tab access
    const maxAge = 30 * 24 * 60 * 60 // 30 days
    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Lax`
    if (user._id) {
      document.cookie = `auth_token=${user._id}; path=/; max-age=${maxAge}; SameSite=Lax`
    }
  }
}

export function getUser() {
  if (typeof window !== 'undefined') {
    // Try localStorage first
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
    
    // Fallback to cookie if localStorage is empty (for new tabs)
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'user_data') {
        try {
          const userData = JSON.parse(decodeURIComponent(value))
          // Sync back to localStorage
          localStorage.setItem('user', JSON.stringify(userData))
          return userData
        } catch {
          // Invalid JSON, continue
        }
      }
    }
  }
  return null
}

export function removeUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    // Also remove cookie
    document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export function isAuthenticated() {
  return getUser() !== null
}

export function isAdmin() {
  const user = getUser()
  return user?.role === 'admin'
}


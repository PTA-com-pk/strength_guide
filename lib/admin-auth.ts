'use client'

import { getUser } from './auth'

export function isAdmin(): boolean {
  const user = getUser()
  return user?.role === 'admin'
}

export function requireAdmin(): boolean {
  if (typeof window === 'undefined') return false
  
  const user = getUser()
  if (!user || user.role !== 'admin') {
    return false
  }
  return true
}


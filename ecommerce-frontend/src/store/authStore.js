import { create } from 'zustand'

const getUserFromStorage = () => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

const getTokenFromStorage = () => localStorage.getItem('token') || null

export const useAuthStore = create((set) => ({
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

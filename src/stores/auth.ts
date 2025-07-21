import { defineStore } from 'pinia'
import { login, register } from '../services/auth'
import type { DecodeToken, RegisterRequest } from '../models/token'
import { decodeToken } from '../services/utils'

interface User {
  id: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  exp: number | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    exp: null
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token
  },
  actions: {
    async register(userData: RegisterRequest) {
      const response = await register(userData)
      return response
    },
    async login(id: string, password: string) {
      const data = await login(id, password)
      const decoded: DecodeToken | null = await decodeToken(data.access_token)
      if (decoded) {

        this.user = { id: decoded.sub, role: decoded.role }
        this.token = data.access_token
        this.exp = decoded.exp
        localStorage.setItem('token', data.access_token)
      }
      console.log('Token:', localStorage.getItem('token'))
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
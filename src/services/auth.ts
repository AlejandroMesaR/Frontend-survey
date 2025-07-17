import api from './api'
import type { LoginResponse } from '../models/token'

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}
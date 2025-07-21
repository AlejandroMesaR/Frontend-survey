import api from './api'
import type { LoginResponse, RegisterRequest, RegisterResponse } from '../models/token'

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  console.log(api)
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post('/auth/register', userData)
  return response.data
}
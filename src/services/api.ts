import axios from 'axios'
import type { AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  console.log('[Interceptor] token =', token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
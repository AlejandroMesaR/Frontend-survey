import axios from 'axios'
import type { AxiosInstance } from 'axios'

let API_BASE_URL = null
if (!import.meta.env.VITE_API_URL) {
  API_BASE_URL = '/api'
} else {
  API_BASE_URL = import.meta.env.VITE_API_URL;
}


const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.API_BASE_URL+"/api" || '/api';

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
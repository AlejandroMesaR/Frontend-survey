import api from './api'
import type { Summary, Alert, RecentSurvey } from '../models/Dashboard'


export function useDashboardService() {
  const getSummary = async (): Promise<Summary> => {
    try {
      const response = await api.get('/dashboard/summary')
      console.log('Dashboard summary response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }
  }

  const getAlerts = async (): Promise<Alert[]> => {
    try {
      const response = await api.get('/dashboard/alerts')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error)
      throw error
    }
  }

  const getRecentSurveys = async (): Promise<RecentSurvey[]> => {
    try {
      const response = await api.get('/dashboard/recent')
      return response.data
    } catch (error) {
      console.error('Error fetching recent surveys:', error)
      throw error
    }
  }

  return {
    getSummary,
    getAlerts,
    getRecentSurveys
  }
}
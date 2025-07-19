import { defineStore } from 'pinia'
import { createSurvey, fetchSurvey, updateSurvey, fetchSurveys, fetchSurveysAdmin, deleteSurvey, updateSurveyStatus} from '../services/survey'
import type { Survey, SurveyShow } from '../models/survey'

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    surveys: [] as SurveyShow[]
  }),
  actions: {
    async createSurvey(survey: Survey): Promise<Survey> {
      try {
        const newSurvey = await createSurvey(survey)
        return newSurvey
      } catch (error) {
        console.error('Error creando encuesta:', error)
        throw error
      }
    },
    async fetchSurvey(id: string): Promise<Survey> {
      try {
        const survey = await fetchSurvey(id)
        return survey
      } catch (error) {
        console.error('Error obteniendo encuesta:', error)
        throw error
      }
    },
    async updateSurvey(id: string, survey: Survey): Promise<Survey> {
      try {
        const updatedSurvey = await updateSurvey(id, survey)
        return updatedSurvey
      } catch (error) {
        console.error('Error actualizando encuesta:', error)
        throw error
      }
    },
    async fetchSurveys(): Promise<SurveyShow[]> {
      try {
        const surveys = await fetchSurveys()
        return surveys
      } catch (error) {
        console.error('Error obteniendo encuestas:', error)
        throw error
      }
    },
    async fetchSurveysAdmin(): Promise<SurveyShow[]> {
      try {
        const surveys = await fetchSurveysAdmin()
        return surveys
      } catch (error) {
        console.error('Error obteniendo encuestas:', error)
        throw error
      }
    },
    async updateSurveyStatus(id: string, statusUpdate: { status: string; open_date?: string; close_date?: string }) {
      const updatedSurvey = await updateSurveyStatus(id, statusUpdate)
      const index = this.surveys.findIndex((s) => s.id === id)
      if (index !== -1) {
        this.surveys[index] = updatedSurvey
      }
      return updatedSurvey
    },
    async deleteSurvey(id: string): Promise<void> {
      try {
        await deleteSurvey(id)
      } catch (error) {
        console.error('Error eliminando encuesta:', error)
        throw error
      }
    }
  }
})
import api from './api'
import type { Survey, SurveyShow } from '../models/survey'
import { decodeToken } from './utils'

export const createSurvey = async (survey: Survey): Promise<Survey> => {

  const correctSurvey = await correctFormat(survey)

  console.log('Creating survey:', correctSurvey)
  const response = await api.post('/surveys', survey)
  return response.data
}

const correctFormat = async (survey: Survey): Promise<Survey> => {

  console.log('Correcting survey format:', survey)

  if (survey.questions) {
    survey.questions.forEach(question => {
      if (question.type === 'scale') {
        question.options = null
      } else if (question.type === 'single' || question.type === 'multiple') {
        question.scale = null
      }else{
        question.scale = null
        question.options = null
      }
    });
  }

  console.log('Corrected survey format:', survey)

  return survey
}


export const getUserIdFromToken = async (): Promise<string | undefined> => {
  const token = localStorage.getItem('token')
  if (!token) return undefined
  
  const decoded = await decodeToken(token)
  return decoded?.sub
}

export const fetchSurvey = async (id: string): Promise<Survey> => {
  const response = await api.get(`/surveys/${id}`)
  return response.data
}

export const updateSurvey = async (id: string, survey: Survey): Promise<Survey> => {
  const correctSurvey = await correctFormat(survey)
  console.log('Updating survey:', correctSurvey)
  const response = await api.put(`/surveys/${id}`, correctSurvey)
  return response.data
}

export async function updateSurveyStatus(id: string, statusUpdate: { status: string; open_date?: string; close_date?: string }): Promise<SurveyShow> {
  try {
    console.log('Updating survey status:', { id, statusUpdate })
    const response = await api.patch(`/surveys/${id}/status`, statusUpdate)
    console.log('Updated survey status:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating survey status:', error)
    throw error
  }
}

export const fetchSurveys = async (): Promise<SurveyShow[]> => {
  const response = await api.get('/surveys')
  return response.data
}

export const deleteSurvey = async (id: string): Promise<void> => {
  await api.delete(`/surveys/${id}`)
}
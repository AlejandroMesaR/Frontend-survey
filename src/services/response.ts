import api from './api'
import type { SurveyResponse } from '../models/response'

export async function submitResponses(response: SurveyResponse): Promise<SurveyResponse> {
  try {
    console.log('Submitting responses:', response)
    const responseData = await api.post('/responses', response)
    console.log('Responses submitted:', responseData.data)
    return responseData.data
  } catch (error) {
    console.error('Error submitting responses:', error)
    throw error
  }
}

export async function uploadFile(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    console.log('File uploaded:', response.data)
    return response.data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export async function checkUserResponse(surveyId: string): Promise<boolean> {
  try {
    const response = await api.get(`/api/surveys/${surveyId}/has-responded`)
    return response.data.has_responded
  } catch (error) {
    console.error('Error checking user response:', error)
    return false // Permitir intentar responder si hay error
  }
}
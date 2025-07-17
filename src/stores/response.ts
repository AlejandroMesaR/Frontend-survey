import { defineStore } from 'pinia'
import { submitResponses, uploadFile, checkUserResponse } from '../services/response'
import type { SurveyResponse } from '../models/response'

export const useResponseStore = defineStore('response', {
  state: () => ({
    responses: [] as SurveyResponse[]
  }),
  actions: {
    async submitResponses(response: SurveyResponse) {
      const submittedResponse = await submitResponses(response)
      this.responses.push(submittedResponse)
      return submittedResponse
    },
    async uploadFile(file: File) {
      return await uploadFile(file)
    },
    async hasUserResponded(surveyId: string) {
      return await checkUserResponse(surveyId)
    }
  }
})
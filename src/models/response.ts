export interface Answer {
  question_id: string
  answer: string | string[] | number | null
}

export interface SurveyResponse {
  id?: string
  survey_id: string
  user_id?: string
  completion_time?: number
  answers: Answer[]
  submitted_at?: string
}
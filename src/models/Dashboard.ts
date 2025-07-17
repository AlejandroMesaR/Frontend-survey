export interface Summary {
  active_surveys: number
  closed_surveys: number
  total_responses: number
}

export interface Alert {
  survey_id: string
  title: string
}

export interface RecentSurvey {
  survey_id: string
  title: string
}

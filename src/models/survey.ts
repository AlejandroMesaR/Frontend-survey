export interface Question {
  question_id?: string
  type: 'text' | 'single' | 'multiple' | 'scale' | 'file'
  text: string
  required: boolean
  options?: string[] | null
  scale?: { min: number; max: number } | null
  conditional?: { dependsOn: string; valueEquals: any } | null
}

export interface Branding {
  logo_url?: string
  colors: { primary: string; secondary: string }
  font?: string
}

export interface Scheduling {
  open_date?: Date
  close_date?: Date
}

export interface Survey {
  _id?: string
  title: string
  description?: string
  status: 'draft' | 'published' | 'closed'
  branding: Branding
  scheduling: Scheduling
  questions: Question[]
}

export interface SurveyShow {
  id: string
  title: string
  description?: string
  status: 'draft' | 'published' | 'closed'
  branding: Branding
  scheduling: Scheduling
  questions: Question[]
  response_count?: number
  created_by?: string
  created_at?: Date
  updated_at?: Date 
}

export interface SurveyState {
  surveys: Survey[]
  currentSurvey: Survey | null
}
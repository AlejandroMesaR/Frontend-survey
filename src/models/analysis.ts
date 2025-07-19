export interface QuestionMetricsOut {
  question_id: string;
  question_text: string;
  type: string;
  response_distribution: { [key: string]: number };
  average_score: number;
  file_count: number;
  scale_scores: number[];  
}

export interface ParticipationByDateOut {
  date: string; // ISO format
  response_count: number;
}

export interface SurveyMetricsOut {
  response_rate: number;
  average_completion_time: number;
  question_metrics: QuestionMetricsOut[];
  participation_by_date: ParticipationByDateOut[];
}
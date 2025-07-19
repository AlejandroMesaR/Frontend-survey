import api from './api';
import type { SurveyMetricsOut } from '../models/analysis';

export async function getSurveyMetrics(surveyId: string): Promise<SurveyMetricsOut> {
  try {
    const response = await api.get(`/analysis/surveys/${surveyId}/metrics`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching survey metrics');
  }
}

export async function exportSurveyResponses(surveyId: string): Promise<void> {
  try {
    const response = await api.get(`/analysis/surveys/${surveyId}/export/csv`, {
      responseType: 'blob', // Para manejar el archivo binario
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey_${surveyId}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Error exporting survey responses');
  }
}
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSurveyStore } from '../stores/survey'
import type { Survey, Question } from '../models/survey'

export function useSurveyPreview() {
  const route = useRoute()
  const surveyStore = useSurveyStore()
  const survey = ref<Survey>({
    title: '',
    description: '',
    status: 'draft',
    branding: { logo_url: '', colors: { primary: '#000000', secondary: '#ffffff' }, font: '' },
    scheduling: { open_date: undefined, close_date: undefined},
    questions: []
  })
  const isEditing = ref(false)

  // Cargar encuesta desde el backend
  const loadSurvey = async (surveyId: string) => {
    try {
      const fetchedSurvey = await surveyStore.fetchSurvey(surveyId)
      survey.value = {
        ...fetchedSurvey,
        scheduling: {
          open_date: fetchedSurvey.scheduling.open_date ? new Date(fetchedSurvey.scheduling.open_date) : undefined,
          close_date: fetchedSurvey.scheduling.close_date ? new Date(fetchedSurvey.scheduling.close_date) : undefined
        }
      }
    } catch (error) {
      console.error('Error al cargar la encuesta:', error)
      alert('Error al cargar la encuesta')
    }
  }

  // Agregar una nueva pregunta
  const addQuestion = () => {
    survey.value.questions.push({
      type: 'text',
      text: '',
      required: false,
      options: [],
      scale: { min: 1, max: 5 },
      conditional: { dependsOn: '', valueEquals: '' }
    })
  }

  // Eliminar una pregunta
  const removeQuestion = (index: number) => {
    survey.value.questions.splice(index, 1)
  }

  // Actualizar una pregunta
  const updateQuestion = (index: number, updatedQuestion: Question) => {
    survey.value.questions[index] = updatedQuestion
  }

  // Guardar cambios en la encuesta
  const saveSurvey = async () => {
    try {
      if (!survey.value.title) {
        alert('El título es obligatorio')
        return
      }
      if (survey.value.scheduling.open_date || survey.value.scheduling.close_date) {
        const openDate = survey.value.scheduling.open_date ? new Date(survey.value.scheduling.open_date) : null
        const closeDate = survey.value.scheduling.close_date ? new Date(survey.value.scheduling.close_date) : null
        if ((openDate && isNaN(openDate.getTime())) || (closeDate && isNaN(closeDate.getTime()))) {
          alert('Las fechas deben ser válidas')
          return
        }
        if (openDate && closeDate && openDate > closeDate) {
          alert('La fecha de apertura no puede ser posterior a la fecha de cierre')
          return
        }
      }
      if (survey.value.branding.logo_url && !isValidUrl(survey.value.branding.logo_url)) {
        alert('La URL del logo no es válida')
        return
      }
      await surveyStore.updateSurvey(route.params.id as string, survey.value)
      alert('Encuesta actualizada con éxito')
      isEditing.value = false
    } catch (error) {
      console.error('Error al guardar la encuesta:', error)
      alert('Error al guardar la encuesta')
    }
  }

  // Validar URL del logo
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Estilos dinámicos para el branding
  const surveyStyles = computed(() => ({
    primaryColor: survey.value.branding.colors.primary || '#000000',
    secondaryColor: survey.value.branding.colors.secondary || '#ffffff',
    font: survey.value.branding.font || 'Arial, sans-serif'
  }))

  return {
    survey,
    isEditing,
    loadSurvey,
    addQuestion,
    removeQuestion,
    updateQuestion,
    saveSurvey,
    surveyStyles
  }
}
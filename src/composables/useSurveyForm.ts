import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSurveyStore } from '../stores/survey'
import type { Survey, Question } from '../models/survey'

export function useSurveyForm(surveyId?: string) {
  const survey = ref<Survey>({
    title: '',
    description: '',
    status: 'draft',
    branding: {
      logo_url: '',
      colors: { primary: '#000000', secondary: '#ffffff' },
      font: ''
    },
    scheduling: {
      open_date: undefined,
      close_date: undefined
    },
    questions: []
  })
  const isEditing = ref(false)
  const route = useRoute()
  const surveyStore = useSurveyStore()

  onMounted(async () => {
    if (surveyId || route.params.id) {
      isEditing.value = true
      try {
        const id = surveyId || (route.params.id as string)
        survey.value = await surveyStore.fetchSurvey(id)
      } catch (error) {
        alert('Error al cargar la encuesta')
      }
    }
  })

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

  const removeQuestion = (index: number) => {
    survey.value.questions.splice(index, 1)
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    survey.value.questions[index] = updatedQuestion
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!survey.value.title) {
        alert('El título es obligatorio')
        return
      }
      if (survey.value.scheduling.open_date && survey.value.scheduling.close_date && survey.value.scheduling.open_date > survey.value.scheduling.close_date) {
        alert('La fecha de apertura no puede ser posterior a la fecha de cierre')
        return
      }
      if (isEditing.value) {
        await surveyStore.updateSurvey(route.params.id as string, survey.value)
        alert('Encuesta actualizada con éxito')
      } else {
        await surveyStore.createSurvey(survey.value)
        alert('Encuesta creada con éxito')
      }
    } catch (error) {
      alert('Error al guardar la encuesta')
    }
  }

  return {
    survey,
    isEditing,
    addQuestion,
    removeQuestion,
    updateQuestion,
    handleSubmit
  }
}
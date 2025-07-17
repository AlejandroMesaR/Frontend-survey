<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">{{ survey?.title || 'Cargando...' }}</h1>
    <p class="text-gray-600 mb-6">{{ survey?.description || '' }}</p>
    <div v-if="loading" class="text-center">Cargando encuesta...</div>
    <div v-else-if="survey?.status !== 'published'" class="text-center text-red-500">
      Esta encuesta no está publicada.
    </div>
    <div v-else>
      <div v-for="(question, index) in survey.questions" :key="question.question_id" class="mb-6">
        <label class="block text-sm font-medium mb-2">{{ question.text }} {{ question.required ? '*' : '' }}</label>
        <div v-if="question.type === 'text'">
          <input
            v-model="responses[index].answer"
            type="text"
            class="block w-full p-2 border rounded"
            :required="question.required"
          />
        </div>
        <div v-else-if="question.type === 'single'">
          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center mb-2">
            <input
              type="radio"
              :value="option"
              v-model="responses[index].answer"
              class="mr-2"
              :required="question.required"
            />
            <span>{{ option }}</span>
          </div>
        </div>
        <div v-else-if="question.type === 'multiple'">
          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center mb-2">
            <input
              type="checkbox"
              :value="option"
              v-model="responses[index].answer"
              class="mr-2"
            />
            <span>{{ option }}</span>
          </div>
        </div>
        <div v-else-if="question.type === 'scale'">
          <div v-for="value in Array.from({ length: (question.scale?.max || 5) - (question.scale?.min || 1) + 1 }, (_, i) => (question.scale?.min || 1) + i)" :key="value" class="flex items-center mb-2">
            <input
              type="radio"
              :value="value"
              v-model="responses[index].answer"
              class="mr-2"
              :required="question.required"
            />
            <span>{{ value }}</span>
          </div>
        </div>
        <div v-else-if="question.type === 'file'">
          <input
            type="file"
            @change="handleFileUpload(index, $event)"
            class="block w-full p-2 border rounded"
            :required="question.required"
          />
          <p v-if="responses[index].answer" class="text-sm text-gray-500 mt-1">Archivo cargado: {{ responses[index].answer }}</p>
        </div>
      </div>
      <button
        @click="openConfirmDialog"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="!survey || survey.status !== 'published'"
      >
        Enviar Respuestas
      </button>
    </div>
    <!-- Popup de confirmación -->
    <ConfirmDialog
      :is-open="isConfirmDialogOpen"
      title="Confirmar Envío de Respuestas"
      message="¿Estás seguro de que quieres enviar tus respuestas? Esta acción no se puede deshacer."
      @confirm="submitResponses"
      @cancel="isConfirmDialogOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSurveyStore } from '../../stores/survey'
import { useResponseStore } from '../../stores/response'
import { useAuthStore } from '../../stores/auth'
import type { SurveyShow } from '../../models/survey'
import type { SurveyResponse, Answer } from '../../models/response'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const surveyStore = useSurveyStore()
const responseStore = useResponseStore()
const authStore = useAuthStore()
const survey = ref<SurveyShow | null>(null)
const responses = ref<Answer[]>([])
const loading = ref(true)
const isConfirmDialogOpen = ref(false)
const startTime = ref<number>(Date.now())

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  try {
    const fetchedSurvey = await surveyStore.fetchSurvey(route.params.id as string)
    console.log('Encuesta cargada:', fetchedSurvey)
    if (fetchedSurvey && !('id' in fetchedSurvey)) {
      survey.value = { ...fetchedSurvey, id: route.params.id as string } as SurveyShow
    } else {
      survey.value = fetchedSurvey as SurveyShow
    }
    if (!survey.value || survey.value.status !== 'published') {
      alert('Esta encuesta no está disponible para responder.')
      router.push('/surveys')
      return
    }
    responses.value = survey.value.questions.map((q) => ({
      question_id: q.question_id!,
      answer: q.type === 'multiple' ? [] : q.type === 'file' ? null : q.type === 'scale' ? null : ''
    }))
  } catch (error) {
    console.error('Error al cargar la encuesta:', error)
    alert('Error al cargar la encuesta')
    router.push('/surveys')
  } finally {
    loading.value = false
  }
})

const handleFileUpload = async (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    try {
      const fileUrl = await responseStore.uploadFile(target.files[0])
      responses.value[index].answer = fileUrl
    } catch (error) {
      alert('Error al cargar el archivo')
    }
  }
}

const openConfirmDialog = () => {
  const requiredQuestions = survey.value!.questions.filter((q) => q.required)
  for (const q of requiredQuestions) {
    const response = responses.value.find((r) => r.question_id === q.question_id)
    if (!response || !response.answer || (Array.isArray(response.answer) && response.answer.length === 0)) {
      alert(`Por favor, responde la pregunta obligatoria: ${q.text}`)
      return
    }
  }
  isConfirmDialogOpen.value = true
}

const submitResponses = async () => {
  try {
    const completionTime = (Date.now() - startTime.value) / 1000 // Tiempo en segundos
    const responseData: SurveyResponse = {
      survey_id: route.params.id as string,
      user_id: authStore.user?.id || '',
      completion_time: completionTime,
      answers: responses.value
    }
    await responseStore.submitResponses(responseData)
    alert('Respuestas enviadas con éxito')
    router.push('/surveys')
  } catch (error) {
    console.error('Error al enviar respuestas:', error)
    alert('Error al enviar respuestas')
  } finally {
    isConfirmDialogOpen.value = false
  }
}
</script>
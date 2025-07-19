<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Encuestas Disponibles</h2>
    <div v-if="loading" class="text-center">Cargando...</div>
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-96">Descripción</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          <th v-if="isAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuestas</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="survey in filteredSurveys" :key="survey.id">
          <td class="px-6 py-4 whitespace-nowrap">{{ survey.title }}</td>
          <td class="px-6 py-4 whitespace-nowrap w-96 truncate" style="max-width: 16rem;">{{ survey.description }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <select v-if="isAdmin"
              v-model="selectedStatus[survey.id]"
              @change="openConfirmDialog('status', survey.id, $event)"
              class="px-2 py-1 border rounded text-sm"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicada</option>
              <option value="closed">Cerrada</option>
            </select>
            <span v-else>
              {{ survey.status === 'draft' ? 'Borrador' : survey.status === 'published' ? 'Publicada' : 'Cerrada' }}
            </span>
          </td>
          <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap">{{ survey.response_count || 0 }}</td>
          <td class="px-6 py-4 whitespace-nowrap flex gap-2">
            <div v-if="isUser">
              <router-link
                v-if="!hasResponded[survey.id]"
                :to="`/surveys/${survey.id}/respond`"
                class="text-blue-500 hover:text-blue-700"
                :class="{ 'opacity-50 cursor-not-allowed': hasResponded[survey.id] }"
              >
                Responder
              </router-link>
              <span v-else class="text-gray-500">Ya has respondido</span>
            </div>
            <template v-if="isAdmin">
              <router-link :to="`/surveys/${survey.id}/preview`" class="text-blue-500 hover:text-blue-700">
                Previsualizar
              </router-link>
              <button @click="openConfirmDialog('delete', survey.id)" class="text-red-500 hover:text-red-700">
                Eliminar
              </button>
              <router-link v-if="isAdmin" :to="`/surveys/${survey.id}/analysis`" class="text-green-500 hover:text-green-700">
                Ver Análisis
              </router-link>   
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Popup de confirmación -->
    <ConfirmDialog
      :is-open="isConfirmDialogOpen"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      @confirm="confirmAction"
      @cancel="cancelAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSurveyStore } from '../../stores/survey'
import { useResponseStore } from '../../stores/response'
import { useAuthStore } from '../../stores/auth'
import type { SurveyShow } from '../../models/survey'
import ConfirmDialog from '../dialogs/ConfirmDialog.vue'

const surveyStore = useSurveyStore()
const responseStore = useResponseStore()
const authStore = useAuthStore()
const surveys = ref<SurveyShow[]>([])
const loading = ref(true)
const selectedStatus = ref<{ [key: string]: string }>({})
const isConfirmDialogOpen = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
let currentSurveyId: string | null = null
let newStatus: string | null = null
let actionType: 'status' | 'delete' | null = null
const hasResponded = ref<{ [key: string]: boolean }>({})

const isAdmin = computed(() => authStore.user?.role === 'Admin' || authStore.user?.role === 'SuperAdmin' || authStore.user?.role === 'admin')
const isUser = computed(() => authStore.user?.role === 'user' || authStore.user?.role === 'User')
const filteredSurveys = computed(() => {
  if (isAdmin.value) {
    return surveys.value
  }
  return surveys.value.filter((survey) => survey.status === 'published')
})

onMounted(async () => {
  try {
    if (isAdmin.value) {
      console.log('Cargando encuestas para administrador...')
      surveys.value = await surveyStore.fetchSurveysAdmin()
    } else {
      console.log('Cargando encuestas para usuario...')
      surveys.value = await surveyStore.fetchSurveys()
    }
    surveys.value.forEach((survey) => {
      selectedStatus.value[survey.id] = survey.status
    })
    if (!isAdmin.value) {
      for (const survey of surveys.value) {
        hasResponded.value[survey.id] = await responseStore.hasUserResponded(survey.id)
      }
    }
  } catch (error) {
    console.error('Error al cargar las encuestas:', error)
    alert('Error al cargar las encuestas')
  } finally {
    loading.value = false
  }
})

const openConfirmDialog = (type: 'status' | 'delete', surveyId: string, event?: Event) => {
  if (!isAdmin.value) return // Solo admins pueden cambiar estado o eliminar
  actionType = type
  currentSurveyId = surveyId
  if (type === 'status' && event) {
    const target = event.target as HTMLSelectElement
    newStatus = target.value
    confirmDialogTitle.value = 'Confirmar Cambio de Estado'
    confirmDialogMessage.value = `¿Estás seguro de que quieres cambiar el estado de la encuesta a "${newStatus}"?`
  } else if (type === 'delete') {
    confirmDialogTitle.value = 'Confirmar Eliminación'
    confirmDialogMessage.value = '¿Estás seguro de que quieres eliminar esta encuesta? Esta acción no se puede deshacer.'
  }
  isConfirmDialogOpen.value = true
}

const confirmAction = async () => {
  if (!currentSurveyId || !isAdmin.value) return
  try {
    if (actionType === 'status' && newStatus) {
      const currentDate = new Date('2025-07-15T22:54:00-05:00').toISOString()
      const statusUpdate = {
        status: newStatus,
        open_date: newStatus === 'published' ? currentDate : undefined,
        close_date: newStatus === 'closed' ? currentDate : undefined
      }
      await surveyStore.updateSurveyStatus(currentSurveyId, statusUpdate)
      alert('Estado de la encuesta actualizado con éxito')
    } else if (actionType === 'delete') {
      await surveyStore.deleteSurvey(currentSurveyId)
      alert('Encuesta eliminada con éxito')
    }
    if (isAdmin.value) {
      console.log('Recargando encuestas para administrador...')
      surveys.value = await surveyStore.fetchSurveysAdmin()
    } else {
      console.log('Recargando encuestas para usuario...')
      surveys.value = await surveyStore.fetchSurveys()
    }
  } catch (error) {
    console.error(`Error al ${actionType === 'status' ? 'actualizar el estado' : 'eliminar la encuesta'}:`, error)
    alert(`Error al ${actionType === 'status' ? 'actualizar el estado' : 'eliminar la encuesta'}`)
  } finally {
    isConfirmDialogOpen.value = false
    currentSurveyId = null
    newStatus = null
    actionType = null
  }
}

const cancelAction = () => {
  if (currentSurveyId && actionType === 'status') {
    selectedStatus.value[currentSurveyId] = surveys.value.find((s) => s.id === currentSurveyId)!.status
  }
  isConfirmDialogOpen.value = false
  currentSurveyId = null
  newStatus = null
  actionType = null
}
</script>
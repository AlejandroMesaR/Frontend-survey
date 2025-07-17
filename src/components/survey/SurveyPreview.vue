<template>
  <div class="container mx-auto p-4" :style="{ fontFamily: surveyStyles.font }">
    <div v-if="loading" class="text-center">Cargando...</div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md">
      <!-- Encabezado editable -->
      <div v-if="isEditing" class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Editar Encuesta</h2>
        <input
          v-model="survey.title"
          type="text"
          class="block w-full p-2 border rounded mb-2"
          :style="{ borderColor: surveyStyles.primaryColor }"
          placeholder="Título de la encuesta"
        />
        <textarea
          v-model="survey.description"
          class="block w-full p-2 border rounded mb-2"
          :style="{ borderColor: surveyStyles.primaryColor }"
          placeholder="Descripción de la encuesta"
        />
        <!-- Fechas -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Programación</h3>
          <div class="flex gap-4 mb-2">
            <div>
              <label class="block text-sm font-medium mb-1">Fecha de Apertura</label>
              <input
                v-model="survey.scheduling.open_date"
                type="datetime-local"
                class="block w-full p-2 border rounded"
                :style="{ borderColor: surveyStyles.primaryColor }"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Fecha de Cierre</label>
              <input
                v-model="survey.scheduling.close_date"
                type="datetime-local"
                class="block w-full p-2 border rounded"
                :style="{ borderColor: surveyStyles.primaryColor }"
              />
            </div>
          </div>
        </div>
        <!-- Branding -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Branding</h3>
          <div class="flex gap-4 mb-2">
            <div>
              <label class="block text-sm font-medium mb-1">Color Primario</label>
              <input
                v-model="survey.branding.colors.primary"
                type="color"
                class="block w-24 h-10 p-1 border rounded"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Color Secundario</label>
              <input
                v-model="survey.branding.colors.secondary"
                type="color"
                class="block w-24 h-10 p-1 border rounded"
              />
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">URL del Logo</label>
            <input
              v-model="survey.branding.logo_url"
              type="text"
              class="block w-full p-2 border rounded"
              :style="{ borderColor: surveyStyles.primaryColor }"
              placeholder="https://example.com/logo.png"
            />
            <img
              v-if="survey.branding.logo_url"
              :src="survey.branding.logo_url"
              alt="Logo Preview"
              class="mt-2 h-16 object-contain"
              @error="survey.branding.logo_url = ''"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Fuente</label>
            <select
              v-model="survey.branding.font"
              class="block w-full p-2 border rounded"
              :style="{ borderColor: surveyStyles.primaryColor }"
            >
              <option value="">Por defecto</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Helvetica', sans-serif">Helvetica</option>
              <option value="'Georgia', serif">Georgia</option>
              <option value="'Roboto', sans-serif">Roboto</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Previsualización -->
      <div :style="{ borderColor: surveyStyles.primaryColor }" class="border p-4 rounded-lg mb-6">
        <img
          v-if="survey.branding.logo_url"
          :src="survey.branding.logo_url"
          alt="Survey Logo"
          class="h-16 mb-4 object-contain"
          :style="{ borderColor: surveyStyles.secondaryColor }"
        />
        <h1 class="text-2xl font-bold" :style="{ color: surveyStyles.primaryColor }">
          {{ survey.title || 'Título de la encuesta' }}
        </h1>
        <p class="text-gray-600 mb-2">{{ survey.description || 'Descripción de la encuesta' }}</p>
        <p class="text-sm text-gray-500 mb-4">
          {{ surveyStatus }}
        </p>
        <div v-for="(question, index) in survey.questions" :key="index">
          <QuestionPreview
            :question="question"
            :questions="survey.questions"
            :index="index"
            :is-editing="isEditing"
            :survey-styles="surveyStyles"
            @update:question="updateQuestion(index, $event)"
            @remove-question="removeQuestion(index)"
          />
        </div>
      </div>
      <!-- Acciones -->
      <div class="flex gap-4">
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar Encuesta
        </button>
        <button
          v-if="isEditing"
          @click="saveSurvey"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Guardar Cambios
        </button>
        <button
          v-if="isEditing"
          @click="isEditing = false"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          v-if="isEditing"
          @click="addQuestion"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Agregar Pregunta
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import QuestionPreview from './QuestionPreview.vue'
import { useSurveyPreview } from '../../composables/useSurveyPreview'

const route = useRoute()
const { survey, isEditing, loadSurvey, addQuestion, removeQuestion, updateQuestion, saveSurvey, surveyStyles } =
  useSurveyPreview()

const loading = ref(true)

// Calcular el estado de la encuesta basado en las fechas
const surveyStatus = computed(() => {
  const now = new Date()
  const openDate = survey.value.scheduling.open_date ? new Date(survey.value.scheduling.open_date) : null
  const closeDate = survey.value.scheduling.close_date ? new Date(survey.value.scheduling.close_date) : null

  if (!openDate && !closeDate) return 'Sin programar'
  if (openDate && now < openDate) return `Programada para abrir el ${openDate.toLocaleString()}`
  if (closeDate && now > closeDate) return `Cerrada el ${closeDate.toLocaleString()}`
  if (openDate && closeDate && now >= openDate && now <= closeDate) return `Abierta hasta el ${closeDate.toLocaleString()}`
  return 'Abierta'
})

loadSurvey(route.params.id as string).finally(() => {
  loading.value = false
})
</script>
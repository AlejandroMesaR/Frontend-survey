<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">{{ isEditing ? 'Editar Encuesta' : 'Crear Encuesta' }}</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Título -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Título</label>
        <input v-model="survey.title" type="text" class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300" required placeholder="Título de la encuesta" />
      </div>
      <!-- Descripción -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea v-model="survey.description" class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300" rows="4" placeholder="Descripción de la encuesta"></textarea>
      </div>
      <!-- Estado -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Estado</label>
        <select v-model="survey.status" class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300">
          <option value="draft">Borrador</option>
          <option value="published">Publicada</option>
          <option value="closed">Cerrada</option>
        </select>
      </div>
      <!-- Fechas de programación -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Fecha de Apertura</label>
          <input v-model="survey.scheduling.open_date" type="datetime-local" class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Fecha de Cierre</label>
          <input v-model="survey.scheduling.close_date" type="datetime-local" class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300" />
        </div>
      </div>
      <!-- Branding -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2">Personalización Visual</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">URL del Logo</label>
            <input v-model="survey.branding.logo_url" type="url" class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300" placeholder="https://ejemplo.com/logo.png" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Fuente</label>
            <input v-model="survey.branding.font" type="text" class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300" placeholder="Arial, sans-serif" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Color Primario</label>
            <div class="flex items-center gap-2">
              <input v-model="survey.branding.colors.primary" type="color" class="mt-1 p-1 h-10 border rounded" />
              <div class="w-10 h-10 rounded border" :style="{ backgroundColor: survey.branding.colors.primary }"></div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Color Secundario</label>
            <div class="flex items-center gap-2">
              <input v-model="survey.branding.colors.secondary" type="color" class="mt-1 p-1 h-10 border rounded" />
              <div class="w-10 h-10 rounded border" :style="{ backgroundColor: survey.branding.colors.secondary }"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Preguntas -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2">Preguntas</h3>
        <div v-for="(question, index) in survey.questions" :key="index" class="mb-4 p-4 border rounded bg-gray-50">
          <QuestionForm :question="question" :questions="survey.questions" @update:question="updateQuestion(index, $event)" />
          <button type="button" @click="removeQuestion(index)" class="mt-2 text-red-500 hover:text-red-700">Eliminar Pregunta</button>
        </div>
        <button type="button" @click="addQuestion" class="bg-green-500 text-white p-2 rounded hover:bg-green-600">Agregar Pregunta</button>
      </div>
      <!-- Botón de envío -->
      <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
        {{ isEditing ? 'Actualizar Encuesta' : 'Crear Encuesta' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useSurveyForm } from '../../composables/useSurveyForm'
import QuestionForm from './QuestionForm.vue'

const { survey, isEditing, addQuestion, removeQuestion, updateQuestion, handleSubmit } = useSurveyForm()
</script>
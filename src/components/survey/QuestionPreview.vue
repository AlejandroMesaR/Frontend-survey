<template>
  <div>
    <div v-if="!isEditing">
      <!-- Previsualización según el tipo de pregunta -->
      <h3 class="text-lg font-semibold" :style="{ color: surveyStyles.primaryColor }">{{ question.text }} {{ question.required ? '*' : '' }}</h3>
      <div v-if="question.type === 'text'" class="mt-2">
        <input type="text" class="block w-full p-2 border rounded" :style="{ borderColor: surveyStyles.secondaryColor }" disabled />
      </div>
      <div v-if="question.type === 'single'" class="mt-2">
        <div v-for="(option, optIndex) in question.options ?? []" :key="optIndex" class="flex items-center">
          <input type="radio" disabled class="mr-2" />
          <span>{{ option }}</span>
        </div>
      </div>
      <div v-if="question.type === 'multiple'" class="mt-2">
        <div v-for="(option, optIndex) in question.options ?? []" :key="optIndex" class="flex items-center">
          <input type="checkbox" disabled class="mr-2" />
          <span>{{ option }}</span>
        </div>
      </div>
      <div v-if="question.type === 'scale'" class="mt-2">
        <div v-for="value in Array.from({ length: (question.scale?.max ?? 5) - (question.scale?.min ?? 1) + 1 }, (_, i) => (question.scale?.min ?? 1) + i)" :key="value" class="flex items-center">
          <input type="radio" disabled class="mr-2" />
          <span>{{ value }}</span>
        </div>
      </div>
      <div v-if="question.type === 'file'" class="mt-2">
        <input type="file" disabled class="block w-full p-2 border rounded" :style="{ borderColor: surveyStyles.secondaryColor }" />
      </div>
    </div>
    <div v-else>
      <!-- Edición de la pregunta -->
      <input v-model="localQuestion.text" type="text" class="block w-full p-2 border rounded mb-2" :style="{ borderColor: surveyStyles.primaryColor }" placeholder="Enunciado de la pregunta" @input="emitUpdate" />
      <select v-model="localQuestion.type" class="block w-full p-2 border rounded mb-2" :style="{ borderColor: surveyStyles.primaryColor }" @change="handleTypeChange">
        <option value="text">Texto Libre</option>
        <option value="single">Selección Única</option>
        <option value="multiple">Selección Múltiple</option>
        <option value="scale">Escala</option>
        <option value="file">Carga de Archivo</option>
      </select>
      <label class="flex items-center mb-2">
        <input v-model="localQuestion.required" type="checkbox" class="mr-2" @change="emitUpdate" />
        <span>¿Es obligatoria?</span>
      </label>
      <!-- Opciones para selección única/múltiple -->
      <div v-if="localQuestion.type === 'single' || localQuestion.type === 'multiple'" class="mb-2">
        <div v-for="(_, optIndex) in localQuestion.options || []" :key="optIndex" class="flex items-center mb-2">
          <input v-model="(localQuestion.options || [])[optIndex]" type="text" class="block w-full p-2 border rounded" :style="{ borderColor: surveyStyles.secondaryColor }" placeholder="Escribe una opción" @input="emitUpdate" />
          <button type="button" @click="removeOption(optIndex)" class="ml-2 text-red-500 hover:text-red-700">Eliminar</button>
        </div>
        <button type="button" @click="addOption" class="text-blue-500 hover:text-blue-700">+ Agregar Opción</button>
      </div>
      <!-- Escala -->
      <div v-if="localQuestion.type === 'scale'" class="mb-2">
        <div class="flex gap-4">
          <input v-model.number="localQuestion.scale!.min" type="number" class="block w-24 p-2 border rounded" :style="{ borderColor: surveyStyles.secondaryColor }" placeholder="Mínimo" @input="emitUpdate" />
          <input v-model.number="localQuestion.scale!.max" type="number" class="block w-24 p-2 border rounded" :style="{ borderColor: surveyStyles.secondaryColor }" placeholder="Máximo" @input="emitUpdate" />
        </div>
      </div>
      <!-- Lógica Condicional -->
      <div v-if="questions.length > 1 && localQuestion.conditional" class="mb-2">
        <div class="flex gap-4">
          <select v-model="localQuestion.conditional.dependsOn" class="block w-full p-2 border rounded" :style="{ borderColor: surveyStyles.primaryColor }" @change="emitUpdate">
            <option value="">Ninguna</option>
            <option v-for="(q, idx) in questions.filter((_, i) => i !== index)" :key="q.question_id || idx" :value="q.question_id || idx">{{ q.text || `Pregunta ${idx + 1}` }}</option>
          </select>
          <input v-model="localQuestion.conditional.valueEquals" type="text" class="block w-full p-2 border rounded" :style="{ borderColor: surveyStyles.primaryColor }" placeholder="Valor para mostrar" @input="emitUpdate" />
        </div>
      </div>
      <button type="button" @click="$emit('remove-question')" class="mt-2 text-red-500 hover:text-red-700">Eliminar Pregunta</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question } from '../../models/survey'

const props = defineProps<{
  question: Question,
  questions: Question[],
  index: number,
  isEditing: boolean,
  surveyStyles: { primaryColor: string; secondaryColor: string; font: string }
}>()

const emit = defineEmits<{
  (e: 'update:question', value: Question): void
  (e: 'remove-question'): void
}>()

const localQuestion = ref<Question>({
  ...props.question,
  options: props.question.options ?? [],
  scale: props.question.scale ?? { min: 1, max: 5 },
  conditional: props.question.conditional ?? { dependsOn: '', valueEquals: '' }
})

// Asegurar que scale siempre esté definido
if (!localQuestion.value.scale) {
  localQuestion.value.scale = { min: 1, max: 5 }
}

watch(localQuestion, (newQuestion) => {
  emit('update:question', { ...newQuestion })
}, { deep: true })

const handleTypeChange = () => {
  if (localQuestion.value.type === 'scale') {
    localQuestion.value.scale = { min: 1, max: 5 }
    localQuestion.value.options = []
  } else if (localQuestion.value.type === 'single' || localQuestion.value.type === 'multiple') {
    localQuestion.value.options = localQuestion.value.options?.length ? localQuestion.value.options : ['']
    localQuestion.value.scale = { min: 1, max: 5 }
  } else {
    localQuestion.value.options = []
    localQuestion.value.scale = { min: 1, max: 5 }
  }
  emitUpdate()
}

const addOption = () => {
  localQuestion.value.options = [...(localQuestion.value.options ?? []), '']
  emitUpdate()
}

const removeOption = (index: number) => {
  localQuestion.value.options = (localQuestion.value.options ?? []).filter((_, i) => i !== index)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:question', { ...localQuestion.value })
}
</script>
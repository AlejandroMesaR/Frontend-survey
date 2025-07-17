<template>
  <div>
    <!-- Enunciado de la Pregunta -->
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700">Enunciado de la Pregunta</label>
      <input
        v-model="localQuestion.text"
        type="text"
        class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300"
        placeholder="Escribe la pregunta"
        required
        @input="emitUpdate"
      />
    </div>
    <!-- Tipo de Pregunta -->
    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700">Tipo de Pregunta</label>
      <select
        v-model="localQuestion.type"
        class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300"
        @change="handleTypeChange"
      >
        <option value="text">Texto Libre</option>
        <option value="single">Selección Única</option>
        <option value="multiple">Selección Múltiple</option>
        <option value="scale">Escala</option>
        <option value="file">Carga de Archivo</option>
      </select>
    </div>
    <!-- Obligatoriedad -->
    <div class="mb-2">
      <label class="flex items-center">
        <input v-model="localQuestion.required" type="checkbox" class="mr-2" @change="emitUpdate" />
        <span class="text-sm font-medium text-gray-700">¿Es obligatoria?</span>
      </label>
    </div>
    <!-- Opciones para Selección Única o Múltiple -->
    <div v-if="localQuestion.type === 'single' || localQuestion.type === 'multiple'" class="mb-2">
      <label class="block text-sm font-medium text-gray-700">Opciones</label>
      <div v-for="optIndex in (localQuestion.options ?? []).length" :key="optIndex" class="flex items-center mb-2">
        <input
          v-model="(localQuestion.options ?? [])[optIndex]"
          type="text"
          class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300"
          placeholder="Escribe una opción"
          @input="emitUpdate"
        />
        <button
          type="button"
          @click="removeOption(optIndex)"
          class="ml-2 text-red-500 hover:text-red-700"
        >
          Eliminar
        </button>
      </div>
      <button
        type="button"
        @click="addOption"
        class="text-blue-500 hover:text-blue-700"
      >
        + Agregar Opción
      </button>
    </div>
    <!-- Escala para preguntas de tipo escala -->
    <div v-if="localQuestion.type === 'scale'" class="mb-2">
      <label class="block text-sm font-medium text-gray-700">Rango de la Escala</label>
      <div class="flex gap-4">
        <input
          v-model.number="(localQuestion.scale ?? { min: 1, max: 5 }).min"
          type="number"
          class="mt-1 block w-24 p-2 border rounded focus:ring focus:ring-blue-300"
          placeholder="Mínimo"
          @input="emitUpdate"
        />
        <input
          v-model.number="(localQuestion.scale ?? { min: 1, max: 5 }).max"
          type="number"
          class="mt-1 block w-24 p-2 border rounded focus:ring focus:ring-blue-300"
          placeholder="Máximo"
          @input="emitUpdate"
        />
      </div>
    </div>
    <!-- Lógica Condicional -->
    <div v-if="questions.length > 1" class="mb-2">
      <label class="block text-sm font-medium text-gray-700">Lógica Condicional (Opcional)</label>
      <div class="flex gap-4">
        <select
          v-model="(localQuestion.conditional ?? {}).dependsOn"
          class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300"
          @change="emitUpdate"
        >
          <option value="">Ninguna</option>
          <option
            v-for="(q, idx) in questions.filter((_, i) => i !== questionIndex)"
            :key="q.question_id || idx"
            :value="q.question_id || idx"
          >
            {{ q.text || `Pregunta ${idx + 1}` }}
          </option>
        </select>
        <input
          v-model="(localQuestion.conditional ?? {}).valueEquals"
          type="text"
          class="mt-1 block w-full p-2 border rounded focus:ring focus:ring-blue-300"
          placeholder="Valor para mostrar"
          @input="emitUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question } from '../../models/survey'

const props = defineProps<{
  question: Question
  questions: Question[]
  questionIndex?: number
}>()

const emit = defineEmits<{
  (e: 'update:question', value: Question): void
}>()

// Initialize localQuestion with default values to avoid undefined errors
const localQuestion = ref<Question>({
  ...props.question,
  options: props.question.options ?? [],
  scale: props.question.scale ?? { min: 1, max: 5 },
  conditional: props.question.conditional ?? { dependsOn: '', valueEquals: '' }
})

watch(
  localQuestion,
  (newQuestion) => {
    emit('update:question', { ...newQuestion })
  },
  { deep: true }
)

const handleTypeChange = () => {
  if (localQuestion.value.type === 'scale') {
    localQuestion.value.scale = { min: 1, max: 5 }
    localQuestion.value.options = []
  } else if (localQuestion.value.type === 'single' || localQuestion.value.type === 'multiple') {
    if (!Array.isArray(localQuestion.value.options)) {
      localQuestion.value.options = ['']
    } else {
      localQuestion.value.options = localQuestion.value.options.length ? localQuestion.value.options : ['']
    }
    localQuestion.value.scale = { min: 1, max: 5 }
  } else {
    localQuestion.value.options = []
    localQuestion.value.scale = { min: 1, max: 5 }
  }
  emitUpdate()
}

const addOption = () => {
  if (!Array.isArray(localQuestion.value.options)) {
    localQuestion.value.options = []
  }
  localQuestion.value.options.push('')
  emitUpdate()
}

const removeOption = (index: number) => {
  if (Array.isArray(localQuestion.value.options)) {
    localQuestion.value.options.splice(index, 1)
    emitUpdate()
  }
}

const emitUpdate = () => {
  emit('update:question', { ...localQuestion.value })
}
</script>
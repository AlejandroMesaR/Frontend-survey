<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
      <p class="text-gray-600 mb-6">{{ message }}</p>
      <div class="flex justify-end gap-4">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title: string
  message: string
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
<template>
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Mis Encuestas</h2>
      <router-link v-if="isAdmin" to="/surveys/create" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block">
        Crear Encuesta
      </router-link>
      <SurveyList />
    </div>
  </template>

  <script setup lang="ts">
  import SurveyList from '../components/survey/SurveyList.vue'
  import { computed } from 'vue'
  import { useAuthStore } from '../stores/auth'

  const authStore = useAuthStore()

  const isAdmin = computed(() => authStore.user?.role === 'Admin' || authStore.user?.role === 'SuperAdmin' || authStore.user?.role === 'admin')
  </script>
<template>
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Mis Encuestas</h2>
      <router-link to="/surveys/create" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block">
        Crear Encuesta
      </router-link>
      <SurveyList />
    </div>
  </template>

  <script setup lang="ts">
  import SurveyList from '../components/survey/SurveyList.vue'
  </script>
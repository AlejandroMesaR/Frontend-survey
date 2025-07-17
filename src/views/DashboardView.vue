<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
    <div v-if="loading" class="text-center">Cargando...</div>
    <div v-else>
      <!-- Resumen -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2">Resumen</h3>
        <p>Tienes {{ summary.active_surveys }} encuestas activas, {{ summary.closed_surveys }} cerradas y un total de {{ summary.total_responses }} respuestas este mes.</p>
      </div>
      <!-- Alertas -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2">Alertas</h3>
        <ul>
          <li v-for="alert in alerts" :key="alert.survey_id" class="text-red-500">
            ¡La encuesta '{{ alert.title }}' cierra en 24 horas y tiene una tasa de respuesta baja!
          </li>
          <li v-if="alerts.length === 0" class="text-gray-500">No hay alertas por ahora.</li>
        </ul>
      </div>
      <!-- Accesos Directos -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Accesos Directos</h3>
        <ul>
          <li v-for="survey in recentSurveys" :key="survey.survey_id">
            <router-link :to="`/surveys/${survey.survey_id}`" class="text-blue-500 hover:text-blue-700">{{ survey.title }}</router-link>
          </li>
          <li v-if="recentSurveys.length === 0" class="text-gray-500">No hay encuestas recientes.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDashboardService } from '../services/dashboard'
import type { Summary, Alert, RecentSurvey } from '../models/Dashboard'
import router from '../router'

const authStore = useAuthStore()
const dashboardService = useDashboardService()

const loading = ref(true)
const summary = ref<Summary>({ active_surveys: 0, closed_surveys: 0, total_responses: 0 })
const alerts = ref<Alert[]>([])
const recentSurveys = ref<RecentSurvey[]>([])

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  try {
    const [summaryRes, alertsRes] = await Promise.all([
      dashboardService.getSummary(),
      dashboardService.getAlerts(),
      // dashboardService.getRecentSurveys()
    ])
    console.log('Resumen:', summaryRes.active_surveys, summaryRes.closed_surveys, summaryRes.total_responses)
    console.log('Alertas:', alertsRes)
    //console.log('Encuestas Recientes:', recentRes)
    summary.value = summaryRes
    alerts.value = alertsRes
    // recentSurveys.value = recentRes
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error)
    alert('Error al cargar los datos del dashboard')
  } finally {
    loading.value = false
  }
})
</script>
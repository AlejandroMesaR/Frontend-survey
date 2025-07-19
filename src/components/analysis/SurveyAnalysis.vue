<template>
  <div class="container mx-auto p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-4">Análisis de la Encuesta</h1>
    <div v-if="loading" class="text-center">Cargando métricas...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else>
      <div class="mb-6">
        <h2 class="text-lg font-semibold">Resumen General</h2>
        <p v-if="metrics">Tasa de respuesta: {{ metrics.response_rate.toFixed(2) }}%</p>
        <p v-if="metrics">Tiempo promedio de completitud: {{ metrics.average_completion_time.toFixed(1) }} segundos</p>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold">Métricas por Pregunta</h2>
        <div v-for="qm in metrics?.question_metrics || []" :key="qm.question_id" class="mb-6 p-4 border rounded">
          <p class="font-medium">Pregunta: {{ qm.question_text }} (Tipo: {{ qm.type }})</p>

          <!-- Gráfico para opciones múltiples (single/multiple) -->
          <div v-if="qm.type === 'single' || qm.type === 'multiple'">
            <h3 class="mt-2 text-md font-semibold">Distribución de Respuestas</h3>
            <canvas :id="'chart-' + qm.question_id" class="w-full h-64"></canvas>
            <p class="mt-2">Opción más votada: {{ getMostVoted(qm.response_distribution) }}</p>
          </div>

          <!-- Estadísticas para numéricas (scale) -->
          <div v-if="qm.type === 'scale'">
            <h3 class="mt-2 text-md font-semibold">Estadísticas</h3>
            <p>Promedio: {{ qm.average_score.toFixed(1) }}</p>
            <p>Mediana: {{ calculateMedian(qm.scale_scores) }}</p>
            <canvas :id="'histogram-' + qm.question_id" class="w-full h-64"></canvas>
          </div>

          <p v-if="qm.type === 'file' && qm.file_count > 0">
            Cantidad de archivos: {{ qm.file_count }}
          </p>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold">Participación por Fecha</h2>
        <div v-if="metrics && metrics.participation_by_date">
          <div v-for="pbd in metrics.participation_by_date" :key="pbd.date" class="mb-2">
            <p>{{ pbd.date }}: {{ pbd.response_count }} respuestas</p>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="exportCSV"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="loading || !metrics"
        >
          Exportar CSV
        </button>
      </div>

      <button
        @click="$router.push('/surveys')"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Volver a Encuestas
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSurveyMetrics, exportSurveyResponses } from '../../services/analysis';
import type { SurveyMetricsOut } from '../../models/analysis';
import Chart from 'chart.js/auto';

const route = useRoute();
const metrics = ref<SurveyMetricsOut | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const charts = ref<{ [key: string]: Chart }>({});

onMounted(async () => {
  const surveyId = route.params.id as string;
  try {
    metrics.value = await getSurveyMetrics(surveyId);
  } catch (err) {
    error.value = 'Error al cargar las métricas de la encuesta';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  Object.values(charts.value).forEach((chart) => chart.destroy());
});

watch(metrics, (newMetrics) => {
  if (newMetrics) {
    nextTick(() => {
      newMetrics.question_metrics.forEach((qm) => {
        if (qm.type === 'single' || qm.type === 'multiple') {
          createPieChart(qm.question_id, qm.response_distribution);
        } else if (qm.type === 'scale' && qm.scale_scores.length > 0) {
          createHistogram(qm.question_id, qm.question_text, qm.scale_scores);
        }
      });
    });
  }
});

const getMostVoted = (distribution: { [key: string]: number }): string => {
  return Object.entries(distribution).reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

const calculateMedian = (scores: number[]): number => {
  const sortedScores = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sortedScores.length / 2);
  return sortedScores.length % 2 === 0
    ? (sortedScores[mid - 1] + sortedScores[mid]) / 2
    : sortedScores[mid];
};

const createPieChart = (questionId: string, distribution: { [key: string]: number }) => {
  const ctx = (document.getElementById(`chart-${questionId}`) as HTMLCanvasElement).getContext('2d');
  if (ctx && !charts.value[questionId]) {
    charts.value[questionId] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(distribution),
        datasets: [{
          data: Object.values(distribution),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: `Distribución - ${questionId}` }
        }
      }
    });
  }
};

const createHistogram = (questionId: string, question_text:string, scores: number[]) => {
  const canvas = document.getElementById(`histogram-${questionId}`) as HTMLCanvasElement | null;
  if (!canvas) {
    console.error(`Canvas with ID 'histogram-${questionId}' not found`);
    return;
  }
  const ctx = canvas.getContext('2d');
  if (ctx && !charts.value[questionId]) {
    charts.value[questionId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: scores.map((_, i) => i + 1), // Índices como etiquetas
        datasets: [{
          label: 'Puntuaciones',
          data: scores,
          backgroundColor: '#36A2EB'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: `Histograma - ${question_text}` }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Frecuencia' } }
        }
      }
    });
  }
};

const exportCSV = async () => {
  if (!metrics.value) return;
  const surveyId = route.params.id as string;
  try {
    loading.value = true;
    await exportSurveyResponses(surveyId);
  } catch (err) {
    error.value = (err as Error).message || 'Error al exportar el CSV';
  } finally {
    loading.value = false;
  }
};
</script>
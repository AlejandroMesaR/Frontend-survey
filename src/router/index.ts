import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SurveyView from '../views/SurveyView.vue'
import SurveyCreateView from '../views/SurveyCreateView.vue'
import TemplateView from '../views/TemplateView.vue'
import ResponseView from '../views/ResponseView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import LoginView from '../views/LoginView.vue'
import SurveyPreview from '../components/survey/SurveyPreview.vue'
import SurveyResponse from '../components/response/SurveyResponse.vue'
import SurveyAnalysis from '../components/analysis/SurveyAnalysis.vue'
import { useAuthStore } from '../stores/auth'

  const routes: RouteRecordRaw[] = [
    { path: '/', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/login', component: LoginView },
    { path: '/surveys', component: SurveyView, meta: { requiresAuth: true } },
    { path: '/surveys/create', component: SurveyCreateView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/templates', component: TemplateView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/responses/:surveyId', component: ResponseView, meta: { requiresAuth: false } },
    { path: '/analytics/:surveyId', component: AnalysisView, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/surveys/:id/preview', component: SurveyPreview, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/surveys/:id/respond', name: 'SurveyResponse', component: SurveyResponse, meta: { requiresAuth: true }},
    { path: '/surveys/:id/analysis', name: 'SurveyAnalysis', component: SurveyAnalysis, meta: { requiresAuth: true }}
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  router.beforeEach((to, _, next) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else if (to.meta.requiresAdmin && authStore.user?.role !== 'Admin') {
      next('/login')
    } else {
      next()
    }
  })

  export default router
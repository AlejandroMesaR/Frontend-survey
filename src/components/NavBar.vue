<template>
    <nav class="bg-gray-800 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-lg font-bold">Plataforma de Encuestas</div>
        <div class="hidden md:flex space-x-4">
          <router-link to="/" class="hover:text-gray-300">Dashboard</router-link>
          <router-link v-if="isAdmin" to="/surveys" class="hover:text-gray-300">Encuestas</router-link>
          <router-link v-if="isAdmin" to="/templates" class="hover:text-gray-300">Templates</router-link>
          <router-link to="/responses" class="hover:text-gray-300">Respuestas</router-link>
          <router-link to="/analytics" class="hover:text-gray-300">Análisis</router-link>
        </div>
        <button class="md:hidden" @click="toggleMenu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      <div v-if="menuOpen" class="md:hidden mt-2 space-y-2">
        <router-link to="/" class="block hover:text-gray-300">Dashboard</router-link>
        <router-link v-if="isAdmin" to="/surveys" class="block hover:text-gray-300">Encuestas</router-link>
        <router-link v-if="isAdmin" to="/templates" class="block hover:text-gray-300">Templates</router-link>
        <router-link to="/responses" class="block hover:text-gray-300">Respuestas</router-link>
        <router-link to="/analytics" class="block hover:text-gray-300">Análisis</router-link>
      </div>
    </nav>
  </template>

  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useAuthStore } from '../stores/auth'

  const authStore = useAuthStore()
  const menuOpen = ref(false)

  const isAdmin = computed(() => authStore.user?.role === 'Admin' || authStore.user?.role === 'admin')

  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
  }
  </script>
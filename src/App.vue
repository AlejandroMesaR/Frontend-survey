<template>
    <div class="min-h-screen bg-gray-100">
      <NavBar />
      <div class="container mx-auto p-4">
        <router-view />
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import NavBar from './components/NavBar.vue'
  </script>
<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input v-model="email" type="email" class="mt-1 block w-full p-2 border rounded" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Contraseña</label>
        <input v-model="password" type="password" class="mt-1 block w-full p-2 border rounded" required />
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Iniciar Sesión</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const email = ref<string>('')
const password = ref<string>('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    console.log('Login successful')
    console.log('User:', authStore.user?.id)
    console.log('role:', authStore.user?.role)
    console.log('Token:', authStore.token)
    router.push('/surveys')
  } catch (error) {
    alert('Error al iniciar sesión')
  }
}
</script>
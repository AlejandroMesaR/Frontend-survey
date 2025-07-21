<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Registrarse</h2>
    <form @submit.prevent="handleRegister">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Nombre completo</label>
        <input 
          v-model="form.name" 
          type="text" 
          class="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
          required 
          :class="{ 'border-red-500': errors.name }"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input 
          v-model="form.email" 
          type="email" 
          class="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
          required 
          :class="{ 'border-red-500': errors.email }"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Contraseña</label>
        <input 
          v-model="form.password" 
          type="password" 
          class="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
          required 
          :class="{ 'border-red-500': errors.password }"
        />
        <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
        <p class="mt-1 text-sm text-gray-500">La contraseña debe tener al menos 8 caracteres</p>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
        <input 
          v-model="confirmPassword" 
          type="password" 
          class="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
          required 
          :class="{ 'border-red-500': errors.confirmPassword }"
        />
        <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">{{ errors.confirmPassword }}</p>
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700">Tipo de usuario</label>
        <select 
          v-model="form.role" 
          class="mt-1 block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="User">Usuario regular</option>
          <option value="Admin">Administrador</option>
        </select>
      </div>
      
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
      
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          ¿Ya tienes una cuenta? 
          <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            Iniciar sesión
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import type { RegisterRequest } from '../../models/token'

const form = reactive<RegisterRequest>({
  name: '',
  email: '',
  password: '',
  role: 'User'
})

const confirmPassword = ref('')
const loading = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateForm = (): boolean => {
  // Limpiar errores
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Validar nombre
  if (!form.name.trim()) {
    errors.name = 'El nombre es requerido'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
    isValid = false
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'El email no tiene un formato válido'
    isValid = false
  }

  // Validar contraseña
  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }

  // Validar confirmación de contraseña
  if (!confirmPassword.value) {
    errors.confirmPassword = 'Debes confirmar la contraseña'
    isValid = false
  } else if (form.password !== confirmPassword.value) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const response = await authStore.register(form)
    alert(`¡Registro exitoso! ${response.message}`)
    
    // Redirigir al login después del registro exitoso
    router.push('/login')
    
  } catch (error: any) {
    console.error('Error durante el registro:', error)
    
    // Manejar errores específicos del servidor
    if (error.response?.data?.detail) {
      alert(`Error: ${error.response.data.detail}`)
    } else if (error.response?.status === 400) {
      alert('Error: Los datos proporcionados no son válidos')
    } else if (error.response?.status === 409) {
      alert('Error: El email ya está registrado')
    } else {
      alert('Error al registrar el usuario. Por favor, intenta de nuevo.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>

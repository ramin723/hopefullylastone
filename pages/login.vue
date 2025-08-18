<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        ورود فروشگاه
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              شماره تلفن
            </label>
            <div class="mt-1">
              <input
                id="phone"
                v-model="form.phone"
                name="phone"
                type="tel"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="09120000000"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="رمز عبور"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="loading">در حال ورود...</span>
              <span v-else>ورود</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $fetch } = useNuxtApp()
const router = useRouter()

const form = ref({
  phone: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value
    })

    // ذخیره توکن
    localStorage.setItem('auth_token', response.token)
    
    // ریدایرکت به صفحه POS
    await router.push('/vendor/pos')
  } catch (err) {
    error.value = 'خطا در ورود: ' + (err.data?.message || err.message || 'خطای نامشخص')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">تعیین رمز عبور</h2>
        <p class="mt-2 text-sm text-gray-600">لطفاً رمز عبور خود را تعیین کنید</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="submitPassword" class="space-y-6">
          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="رمز عبور خود را وارد کنید"
              />
            </div>
            <p class="mt-2 text-sm text-gray-600">
              حداقل 8 کاراکتر، شامل حروف انگلیسی و اعداد
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              تأیید رمز عبور
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="رمز عبور را مجدداً وارد کنید"
              />
            </div>
          </div>

          <!-- Error Messages -->
          <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  خطا
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  موفق
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>{{ successMessage }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">در حال ثبت...</span>
              <span v-else>ثبت رمز عبور</span>
            </button>
          </div>

          <!-- Logout Button -->
          <div class="text-center">
            <button
              type="button"
              @click="logout"
              class="text-sm text-gray-600 hover:text-gray-500"
            >
              خروج از حساب کاربری
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  auth: true,
  layout: 'authenticated'
})

// State
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed
const isFormValid = computed(() => {
  return password.value.length >= 8 && 
         password.value === confirmPassword.value &&
         /[a-zA-Z]/.test(password.value) &&
         /\d/.test(password.value)
})

// Methods
const submitPassword = async () => {
  if (!isFormValid.value) {
    errorMessage.value = 'لطفاً رمز عبور را طبق قوانین وارد کنید'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { post } = useApi()
    const response = await post('/api/auth/password/set-initial', {
      password: password.value
    }) as any

    if (response.ok) {
      successMessage.value = 'رمز عبور با موفقیت ثبت شد'
      
      // Redirect to appropriate hub after 2 seconds
      setTimeout(() => {
        redirectToRoleHub()
      }, 2000)
    }
  } catch (err: any) {
    if (err.statusCode === 409) {
      errorMessage.value = 'این مرحله قبلاً انجام شده است. شما می‌توانید به پنل کاربری خود بروید.'
      // Redirect to hub after showing message
      setTimeout(() => {
        redirectToRoleHub()
      }, 3000)
    } else if (err.statusCode === 400 || err.statusCode === 422) {
      errorMessage.value = err.data?.message || 'رمز عبور نامعتبر است'
    } else if (err.statusCode === 429) {
      errorMessage.value = 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.'
    } else {
      errorMessage.value = 'خطا در ثبت رمز عبور. لطفاً دوباره تلاش کنید.'
    }
  } finally {
    loading.value = false
  }
}

const redirectToRoleHub = () => {
  const user = useState<any>('auth:user', () => null)
  
  if (user.value?.role === 'ADMIN') {
    navigateTo('/admin')
  } else if (user.value?.role === 'VENDOR') {
    navigateTo('/vendor')
  } else if (user.value?.role === 'MECHANIC') {
    navigateTo('/mechanic')
  } else {
    navigateTo('/')
  }
}

const logout = async () => {
  try {
    const { post } = useApi()
    await post('/api/auth/logout')
    navigateTo('/login')
  } catch (err) {
    console.error('Logout failed:', err)
    navigateTo('/login')
  }
}

// Clear messages when form changes
watch([password, confirmPassword], () => {
  errorMessage.value = ''
  successMessage.value = ''
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">دعوت به همکاری</h2>
        <p class="mt-2 text-sm text-gray-600">لطفاً اطلاعات خود را تکمیل کنید</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">در حال بررسی دعوت...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900">دعوت نامعتبر</h3>
          <p class="mt-2 text-sm text-gray-600">{{ error }}</p>
          <div class="mt-6">
            <NuxtLink
              to="/"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              بازگشت به صفحه اصلی
            </NuxtLink>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900">ثبت‌نام موفق</h3>
          <p class="mt-2 text-sm text-gray-600">شما با موفقیت ثبت‌نام شدید و وارد سیستم شدید.</p>
          <div class="mt-6">
            <button
              @click="redirectToDashboard"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ورود به پنل کاربری
            </button>
          </div>
        </div>

        <!-- Invite Form -->
        <div v-else-if="inviteData" class="space-y-6">
          <!-- Invite Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="mr-3">
                <h3 class="text-sm font-medium text-blue-800">
                  دعوت به عنوان {{ inviteData.role === 'MECHANIC' ? 'مکانیک' : 'فروشگاه' }}
                </h3>
                <div class="mt-2 text-sm text-blue-700">
                  <p>شماره تلفن: {{ inviteData.phoneMasked }}</p>
                  <p v-if="inviteData.meta?.fullName">نام: {{ inviteData.meta.fullName }}</p>
                  <p v-if="inviteData.meta?.city">شهر: {{ inviteData.meta.city }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- OTP Form -->
          <form @submit.prevent="submitOtp" class="space-y-6">
            <div>
              <label for="otp" class="block text-sm font-medium text-gray-700">
                کد تأیید ارسال شده به شماره {{ inviteData.phoneMasked }}
              </label>
              <div class="mt-1">
                <input
                  id="otp"
                  v-model="otpCode"
                  type="text"
                  maxlength="5"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="12345"
                />
              </div>
              <p class="mt-2 text-sm text-gray-600">
                کد 5 رقمی که به شماره شما ارسال شده را وارد کنید
              </p>
            </div>

            <div>
              <button
                type="submit"
                :disabled="submitting || !otpCode"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="submitting">در حال پردازش...</span>
                <span v-else>تأیید و ورود</span>
              </button>
            </div>
          </form>

          <!-- Resend OTP -->
          <div class="text-center">
            <button
              @click="requestOtp"
              :disabled="otpRequesting"
              class="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              <span v-if="otpRequesting">در حال ارسال...</span>
              <span v-else>ارسال مجدد کد</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  layout: 'default',
  middleware: []
})

// State
const route = useRoute()
const token = route.params.token as string
const loading = ref(true)
const error = ref('')
const success = ref(false)
const submitting = ref(false)
const otpRequesting = ref(false)
const inviteData = ref<any>(null)
const otpCode = ref('')

// Methods
const validateInvite = async () => {
  try {
    const { get } = useApi()
    const response = await get(`/api/invite/validate/${token}`) as any
    if (response.ok) {
      inviteData.value = response.data
    } else {
      error.value = 'دعوت نامعتبر یا منقضی شده است'
    }
  } catch (err: any) {
    if (err.statusCode === 404) {
      error.value = 'دعوت یافت نشد'
    } else if (err.statusCode === 410) {
      error.value = err.data?.message || 'دعوت منقضی شده یا قبلاً استفاده شده است'
    } else {
      error.value = 'خطا در بررسی دعوت'
    }
  } finally {
    loading.value = false
  }
}

const requestOtp = async () => {
  if (!inviteData.value) return
  
  otpRequesting.value = true
  try {
    // For invite flow, we need to get the actual phone from the invite
    // The phone is already stored in the invite, so we can use the token to get it
    const { post } = useApi()
    const response = await post('/api/auth/otp/request', {
      phone: inviteData.value.phone, // Use the actual phone from invite data
      purpose: 'login'
    }) as any
    
    if (response.ok) {
      alert('کد تأیید مجدداً ارسال شد')
    }
  } catch (err) {
    alert('خطا در ارسال کد تأیید')
  } finally {
    otpRequesting.value = false
  }
}

const submitOtp = async () => {
  if (!otpCode.value || otpCode.value.length !== 5) return
  
  submitting.value = true
  try {
    const { post } = useApi()
    const response = await post('/api/invite/accept', {
      token,
      otpCode: otpCode.value
    }) as any
    
    if (response.ok) {
      // Store tokens
      const { accessToken, refreshToken } = response.data.tokens
      const tokenCookie = useCookie('access_token', { 
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      })
      const refreshCookie = useCookie('refresh_token', { 
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      })
      
      tokenCookie.value = accessToken
      refreshCookie.value = refreshToken
      
      success.value = true
      
      // Redirect after 2 seconds
      setTimeout(() => {
        redirectToDashboard()
      }, 2000)
    }
  } catch (err: any) {
    if (err.statusCode === 400) {
      error.value = 'کد تأیید نامعتبر است'
    } else if (err.statusCode === 410) {
      error.value = 'دعوت منقضی شده یا قبلاً استفاده شده است'
    } else {
      error.value = 'خطا در تأیید دعوت'
    }
  } finally {
    submitting.value = false
  }
}

const redirectToDashboard = () => {
  if (inviteData.value?.role === 'MECHANIC') {
    navigateTo('/mechanic')
  } else if (inviteData.value?.role === 'VENDOR') {
    navigateTo('/vendor')
  } else {
    navigateTo('/')
  }
}

// Lifecycle
onMounted(() => {
  if (!token) {
    error.value = 'توکن دعوت نامعتبر است'
    loading.value = false
    return
  }
  
  validateInvite()
})
</script>

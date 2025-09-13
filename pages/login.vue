<template>
  <main style="max-width:420px;margin:48px auto">
    <!-- هدر صفحه لاگین -->
    <div class="text-center mb-8">
      <!-- لوگو -->
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <span class="text-white font-bold text-2xl">هـ</span>
      </div>
      
      <!-- عنوان اصلی -->
      <h1 class="text-2xl font-bold text-gray-800 mb-2">ورود به پنل همکاری</h1>
      
      <!-- زیرعنوان -->
      <p class="text-gray-600 text-sm">لطفا اطلاعات خود را وارد کنید</p>
    </div>

    <AppCard title="">
      <!-- فرم ورود با رمز عبور -->
      <form v-if="!showOtpForm" @submit.prevent="onPasswordSubmit" novalidate>
        <div style="margin-bottom:12px">
          <AppInput
            v-model="phone"
            label="شماره تلفن"
            type="tel"
            placeholder="09120000000"
            required
          />
        </div>

        <div style="margin-bottom:12px">
          <AppInput
            v-model="password"
            label="رمز عبور"
            type="password"
            placeholder="رمز عبور"
            required
          />
        </div>

        <AppAlert v-if="errorMsg" :message="errorMsg" variant="error" />

        <AppButton 
          type="submit" 
          :loading="loading"
          loading-text="در حال ورود..."
          class="w-full"
        >
          ورود
        </AppButton>
        
        <!-- لینک ورود با OTP -->
        <div class="text-center mt-4">
          <button 
            type="button"
            @click="showOtpForm = true"
            class="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            ورود با کد یکبارمصرف
          </button>
        </div>
      </form>

      <!-- فرم ورود با OTP -->
      <div v-if="showOtpForm">
        <!-- دکمه برگشت -->
        <div class="mb-4">
          <button 
            type="button"
            @click="showOtpForm = false; resetOtpFlow()"
            class="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            ← برگشت به ورود با رمز عبور
          </button>
        </div>
        
        <!-- مرحله 1: درخواست کد -->
        <form v-if="!otpSent" @submit.prevent="onOtpRequest" novalidate>
          <div style="margin-bottom:12px">
            <AppInput
              v-model="otpPhone"
              label="شماره تلفن"
              type="tel"
              placeholder="09120000000"
              required
            />
          </div>

          <AppAlert v-if="errorMsg" :message="errorMsg" variant="error" />
          <AppAlert v-if="successMsg" :message="successMsg" variant="success" />

          <AppButton 
            type="submit" 
            :loading="otpRequestLoading"
            loading-text="در حال ارسال کد..."
            class="w-full"
          >
            دریافت کد
          </AppButton>
        </form>

        <!-- مرحله 2: تأیید کد -->
        <form v-if="otpSent" @submit.prevent="onOtpVerify" novalidate>
          <div style="margin-bottom:12px">
            <AppInput
              v-model="otpCode"
              label="کد ۵ رقمی"
              type="text"
              placeholder="12345"
              maxlength="5"
              required
            />
          </div>

          <div class="text-sm text-gray-600 mb-4">
            کد به شماره {{ maskPhone(otpPhone) }} ارسال شد
          </div>

          <AppAlert v-if="errorMsg" :message="errorMsg" variant="error" />

          <div class="flex gap-2">
            <AppButton 
              type="button"
              @click="resetOtpFlow"
              variant="secondary"
              class="flex-1"
            >
              تغییر شماره
            </AppButton>
            <AppButton 
              type="submit" 
              :loading="otpVerifyLoading"
              loading-text="در حال تأیید..."
              class="flex-1"
            >
              تأیید کد
            </AppButton>
          </div>
        </form>
      </div>
    </AppCard>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ auth: false })

const router = useRouter()
const { post } = useApi()

// استفاده از state سراسری برای نگه داشتن کاربر
const user = useState<any>('auth:user', () => null)
const hydrated = useState<boolean>('auth:hydrated', () => false)

// Password login state
const phone = ref('')
const password = ref('')
const loading = ref(false)

// OTP login state
const showOtpForm = ref(false)
const otpPhone = ref('')
const otpCode = ref('')
const otpSent = ref(false)
const otpRequestLoading = ref(false)
const otpVerifyLoading = ref(false)

// Common state
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// Utility function to mask phone
function maskPhone(phone: string): string {
  if (!phone || phone.length <= 5) return '***'
  return `${phone.slice(0, 3)}***${phone.slice(-2)}`
}

// Reset OTP flow
function resetOtpFlow() {
  showOtpForm.value = false
  otpSent.value = false
  otpCode.value = ''
  errorMsg.value = null
  successMsg.value = null
}

// Clear messages when switching forms
watch(showOtpForm, () => {
  errorMsg.value = null
  successMsg.value = null
})

// Password login
async function onPasswordSubmit(e?: Event) {
  e?.preventDefault?.()
  errorMsg.value = null
  loading.value = true
  try {
    const res = await post('/api/auth/login', {
      phone: phone.value,
      password: password.value
    }) as any

    user.value = res.user || null
    hydrated.value = true
    if (!user.value) { 
      errorMsg.value = 'عدم دسترسی: لطفاً دوباره تلاش کنید'
      return 
    }
    
    // Redirect based on role
    if (user.value.role === 'VENDOR') await router.replace('/vendor')
    else if (user.value.role === 'MECHANIC') await router.replace('/mechanic')
    else if (user.value.role === 'ADMIN') await router.replace('/admin')
    else await router.replace('/')
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'ورود ناموفق بود'
  } finally {
    loading.value = false
  }
}

// OTP request
async function onOtpRequest(e?: Event) {
  e?.preventDefault?.()
  errorMsg.value = null
  successMsg.value = null
  otpRequestLoading.value = true
  
  try {
    const res = await post('/api/auth/otp/request', {
      phone: otpPhone.value,
      purpose: 'login'
    }) as any

    successMsg.value = res.message || 'کد به شماره ارسال شد'
    otpSent.value = true
  } catch (err: any) {
    // Map error codes to user-friendly messages
    if (err?.statusCode === 502) {
      errorMsg.value = 'ارسال پیامک موقتاً با مشکل مواجه شد. لطفاً چند دقیقه بعد دوباره تلاش کنید.'
    } else if (err?.statusCode === 429) {
      errorMsg.value = 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.'
    } else {
      errorMsg.value = err?.data?.message || err?.data?.statusMessage || 'خطا در ارسال کد'
    }
  } finally {
    otpRequestLoading.value = false
  }
}

// OTP verify
async function onOtpVerify(e?: Event) {
  e?.preventDefault?.()
  errorMsg.value = null
  otpVerifyLoading.value = true
  
  try {
    const res = await post('/api/auth/otp/verify', {
      phone: otpPhone.value,
      purpose: 'login',
      code: otpCode.value
    }) as any

    user.value = res.user || null
    hydrated.value = true
    if (!user.value) { 
      errorMsg.value = 'عدم دسترسی: لطفاً دوباره تلاش کنید'
      return 
    }
    
    // Redirect based on role
    if (user.value.role === 'VENDOR') await router.replace('/vendor')
    else if (user.value.role === 'MECHANIC') await router.replace('/mechanic')
    else if (user.value.role === 'ADMIN') await router.replace('/admin')
    else await router.replace('/')
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'کد نامعتبر است'
  } finally {
    otpVerifyLoading.value = false
  }
}
</script>

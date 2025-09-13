<script setup lang="ts">
const { show } = useToast()
const router = useRouter()

// State برای فرم
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const saving = ref(false)

// اعتبارسنجی رمز عبور
const validatePassword = (password: string) => {
  if (password.length < 6) {
    return 'رمز عبور باید حداقل 6 کاراکتر باشد'
  }
  return null
}

// اعتبارسنجی فرم
const validateForm = () => {
  if (!form.value.currentPassword.trim()) {
    show('رمز عبور فعلی الزامی است', 'error')
    return false
  }

  if (!form.value.newPassword.trim()) {
    show('رمز عبور جدید الزامی است', 'error')
    return false
  }

  const passwordError = validatePassword(form.value.newPassword)
  if (passwordError) {
    show(passwordError, 'error')
    return false
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    show('رمز عبور جدید و تکرار آن مطابقت ندارند', 'error')
    return false
  }

  if (form.value.currentPassword === form.value.newPassword) {
    show('رمز عبور جدید باید با رمز عبور فعلی متفاوت باشد', 'error')
    return false
  }

  return true
}

// تغییر رمز عبور
const changePassword = async () => {
  if (!validateForm()) {
    return
  }

  try {
    saving.value = true

    const { post } = useApi()
    await post('/api/users/me/change-password', {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })

    show('رمز عبور با موفقیت تغییر کرد', 'success')
    
    // پاک کردن فرم
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    // بازگشت به صفحه قبلی
    setTimeout(() => {
      router.back()
    }, 1500)

  } catch (error: any) {
    console.error('Error changing password:', error)
    show(error.data?.message || 'خطا در تغییر رمز عبور', 'error')
  } finally {
    saving.value = false
  }
}

// تنظیم layout
definePageMeta({
  layout: 'authenticated'
})
</script>

<template>
  <div class="max-w-md mx-auto">
    <!-- دکمه برگشت -->
    <div class="mb-6">
      <button 
        @click="router.push('/vendor')"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
      >
        <div class="w-8 h-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-white transition-all duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </div>
        <span class="text-sm font-medium">بازگشت</span>
      </button>
    </div>

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">تغییر رمز عبور</h1>
      <p class="text-gray-600 mt-1">رمز عبور خود را تغییر دهید</p>
    </div>

    <AppCard>
      <form @submit.prevent="changePassword" class="space-y-4">
        <!-- رمز عبور فعلی -->
        <div>
          <AppInput
            id="currentPassword"
            v-model="form.currentPassword"
            type="password"
            label="رمز عبور فعلی"
            placeholder="رمز عبور فعلی خود را وارد کنید"
            required
            :disabled="saving"
          />
        </div>

        <!-- رمز عبور جدید -->
        <div>
          <AppInput
            id="newPassword"
            v-model="form.newPassword"
            type="password"
            label="رمز عبور جدید"
            placeholder="رمز عبور جدید خود را وارد کنید"
            help="حداقل 6 کاراکتر"
            required
            :disabled="saving"
          />
        </div>

        <!-- تکرار رمز عبور جدید -->
        <div>
          <AppInput
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            label="تکرار رمز عبور جدید"
            placeholder="رمز عبور جدید را مجدداً وارد کنید"
            required
            :disabled="saving"
          />
        </div>

        <!-- دکمه‌های عملیات -->
        <div class="flex gap-3 justify-end pt-4">
          <AppButton
            type="button"
            variant="secondary"
            @click="router.back()"
            :disabled="saving"
          >
            انصراف
          </AppButton>
          
          <AppButton
            type="submit"
            :loading="saving"
            :disabled="saving"
          >
            {{ saving ? 'در حال تغییر...' : 'تغییر رمز عبور' }}
          </AppButton>
        </div>
      </form>
    </AppCard>

    <!-- نکات امنیتی -->
    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-sm font-medium text-blue-900 mb-2">نکات امنیتی</h3>
      <ul class="text-xs text-blue-800 space-y-1">
        <li>• پس از تغییر رمز عبور، از تمام دستگاه‌ها خارج خواهید شد</li>
        <li>• رمز عبور قوی انتخاب کنید که حداقل 6 کاراکتر باشد</li>
        <li>• از ترکیب حروف، اعداد و نمادها استفاده کنید</li>
      </ul>
    </div>
  </div>
</template>

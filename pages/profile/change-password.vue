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
const showPasswords = ref({
  current: false,
  new: false,
  confirm: false
})

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
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">تغییر رمز عبور</h1>
      <p class="text-gray-600 mt-1">رمز عبور خود را تغییر دهید</p>
    </div>

    <AppCard>
      <form @submit.prevent="changePassword" class="space-y-4">
        <!-- رمز عبور فعلی -->
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
            رمز عبور فعلی <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <AppInput
              id="currentPassword"
              v-model="form.currentPassword"
              :type="showPasswords.current ? 'text' : 'password'"
              placeholder="رمز عبور فعلی خود را وارد کنید"
              required
              :disabled="saving"
            />
            <button
              type="button"
              @click="showPasswords.current = !showPasswords.current"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              :disabled="saving"
            >
              <svg v-if="!showPasswords.current" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- رمز عبور جدید -->
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
            رمز عبور جدید <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <AppInput
              id="newPassword"
              v-model="form.newPassword"
              :type="showPasswords.new ? 'text' : 'password'"
              placeholder="رمز عبور جدید خود را وارد کنید"
              required
              :disabled="saving"
            />
            <button
              type="button"
              @click="showPasswords.new = !showPasswords.new"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              :disabled="saving"
            >
              <svg v-if="!showPasswords.new" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">حداقل 6 کاراکتر</p>
        </div>

        <!-- تکرار رمز عبور جدید -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
            تکرار رمز عبور جدید <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <AppInput
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showPasswords.confirm ? 'text' : 'password'"
              placeholder="رمز عبور جدید را مجدداً وارد کنید"
              required
              :disabled="saving"
            />
            <button
              type="button"
              @click="showPasswords.confirm = !showPasswords.confirm"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              :disabled="saving"
            >
              <svg v-if="!showPasswords.confirm" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            </button>
          </div>
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

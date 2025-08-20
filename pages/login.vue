<template>
  <main style="max-width:420px;margin:48px auto">
    <AppCard title="ورود">
      <!-- فرم مینیمال: submit.prevent + دکمه submit -->
      <form @submit.prevent="onSubmit" novalidate>
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
      <AppAlert v-if="successMsg" :message="successMsg" variant="success" />

      <AppButton 
        type="submit" 
        :loading="loading"
        loading-text="در حال ورود..."
        class="w-full"
      >
        ورود
      </AppButton>
      </form>
    </AppCard>
  </main>
</template>

<script setup lang="ts">
// تست با useAuth واقعی
const router = useRouter()
const { login } = useAuth()

const phone = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

async function onSubmit(e: Event) {
  // کمربند ایمنی دوم: حتی اگر .prevent حذف شد، باز هم مانع سابمیت پیش‌فرض می‌شویم
  e?.preventDefault?.()

  errorMsg.value = null
  successMsg.value = null
  
  if (!phone.value || !password.value) {
    errorMsg.value = 'شماره و رمز را وارد کنید'
    return
  }

  try {
    loading.value = true
    
    console.log('تلاش برای لاگین:', { phone: phone.value, password: password.value })
    
    // استفاده از useAuth واقعی
    const response = await login(phone.value, password.value)
    
    successMsg.value = `لاگین موفق! نام: ${response.user.fullName}, نقش: ${response.user.role}`
    console.log('لاگین موفق:', response)
    
    // ریدایرکت بر اساس نقش کاربر
    if (response.user.role === 'MECHANIC') {
      await router.push('/mechanic')
    } else if (response.user.role === 'VENDOR') {
      await router.push('/vendor/pos')
    } else {
      await router.push('/')
    }
    
  } catch (err: any) {
    console.error('خطا در لاگین:', err)
    if (err.data?.statusMessage) {
      errorMsg.value = err.data.statusMessage
    } else if (err.statusMessage) {
      errorMsg.value = err.statusMessage
    } else if (err.message) {
      errorMsg.value = err.message
    } else {
      errorMsg.value = 'خطای نامشخص در ورود'
    }
  } finally {
    loading.value = false
  }
}
</script>

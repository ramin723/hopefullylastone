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
definePageMeta({ auth: false })

const router = useRouter()

// استفاده از state سراسری برای نگه داشتن کاربر
const user = useState<any>('auth:user', () => null)
const hydrated = useState<boolean>('auth:hydrated', () => false)

const phone = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const loading = ref(false)
const csrf = useState<string | null>('csrf', () => null)

async function onSubmit(e?: Event) {
  e?.preventDefault?.()
  errorMsg.value = null
  loading.value = true
  try {
    // اگر هنوز csrf نگرفتیم، همین‌جا بگیریم (race-safe)
    if (!csrf.value) {
      const r = await $fetch('/api/auth/csrf')
      csrf.value = (r as any).csrf
    }

    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { phone: phone.value, password: password.value },
      headers: csrf.value ? { 'x-csrf-token': csrf.value } : undefined, // ← محکم‌کاری
    }) as any

    // ادامه‌ی منطق قبلی…
    user.value = res.user || null
    hydrated.value = true
    if (!user.value) { errorMsg.value = 'عدم دسترسی: لطفاً دوباره تلاش کنید'; return }
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
</script>

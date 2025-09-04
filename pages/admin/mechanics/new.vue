<template>
  <div>
    <Breadcrumbs :items="[
      { label: 'ادمین', to: '/admin' },
      { label: 'مکانیک‌ها', to: '/admin/mechanics' },
      { label: 'ایجاد' }
    ]" />

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">ایجاد مکانیک جدید</h1>
      <p class="mt-2 text-xl text-gray-600">اطلاعات مکانیک جدید را وارد کنید</p>
    </div>

    <div class="max-w-2xl">
      <AppCard title="اطلاعات مکانیک">
        <form @submit.prevent="onSubmit" novalidate>
          <!-- Full Name -->
          <div class="mb-6">
            <AppInput
              v-model="form.fullName"
              label="نام و نام خانوادگی *"
              type="text"
              placeholder="نام کامل مکانیک"
              required
              :error="errors.fullName"
            />
          </div>

          <!-- Phone -->
          <div class="mb-6">
            <AppInput
              v-model="form.phone"
              label="شماره تلفن *"
              type="tel"
              placeholder="09120000000"
              required
              :error="errors.phone"
            />
          </div>

          <!-- Note -->
          <div class="mb-6">
            <AppInput
              v-model="form.note"
              label="یادداشت (اختیاری)"
              type="text"
              placeholder="توضیحات اضافی"
              :error="errors.note"
            />
          </div>

          <!-- Assign QR Now -->
          <div class="mb-6">
            <div class="flex items-center">
              <input
                id="assignQrNow"
                v-model="form.assignQrNow"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="assignQrNow" class="ml-2 block text-sm text-gray-900">
                صدور فوری کد QR
              </label>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              اگر این گزینه را انتخاب کنید، کد QR بلافاصله برای مکانیک تولید و فعال می‌شود
            </p>
          </div>

          <!-- Server Error -->
          <AppAlert v-if="serverError" :message="serverError" variant="error" />

          <!-- Buttons -->
          <div class="flex gap-4">
            <AppButton
              type="submit"
              :loading="loading"
              loading-text="در حال ثبت..."
              class="flex-1"
            >
              ثبت مکانیک
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              @click="goBack"
              :disabled="loading"
            >
              بازگشت
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  auth: true,
  layout: 'authenticated'
})

// Composables
const { show: showToast } = useToast()
const { post } = useApi()
const router = useRouter()

// Form state
const form = ref({
  fullName: '',
  phone: '',
  note: '',
  assignQrNow: false
})

// Validation errors
const errors = ref({
  fullName: '',
  phone: '',
  note: ''
})

// Loading and error states
const loading = ref(false)
const serverError = ref('')

// Validation
function validateForm(): boolean {
  errors.value = {
    fullName: '',
    phone: '',
    note: ''
  }

  let isValid = true

  // Full name validation
  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'نام و نام خانوادگی الزامی است'
    isValid = false
  } else if (form.value.fullName.trim().length < 3) {
    errors.value.fullName = 'نام باید حداقل 3 کاراکتر باشد'
    isValid = false
  }

  // Phone validation
  if (!form.value.phone.trim()) {
    errors.value.phone = 'شماره تلفن الزامی است'
    isValid = false
  } else if (form.value.phone.trim().length < 10) {
    errors.value.phone = 'شماره تلفن باید حداقل 10 رقم باشد'
    isValid = false
  } else if (form.value.phone.trim().length > 15) {
    errors.value.phone = 'شماره تلفن نباید بیش از 15 رقم باشد'
    isValid = false
  }

  return isValid
}

// Form submission
async function onSubmit() {
  if (!validateForm()) {
    return
  }

  loading.value = true
  serverError.value = ''

  try {
    const response = await post('/api/admin/mechanics', {
      fullName: form.value.fullName.trim(),
      phone: form.value.phone.trim(),
      note: form.value.note.trim() || undefined,
      assignQrNow: form.value.assignQrNow
    })

    if (response.ok) {
      let message = 'مکانیک با موفقیت ساخته شد'
      if (response.qrAssigned) {
        message += ' و کد QR اختصاص یافت'
      }
      
      showToast(message, 'success')
      
      // Navigate to mechanic details
      await navigateTo(`/admin/mechanics/${response.mechanic.id}`)
    }
  } catch (error: any) {
    console.error('Error creating mechanic:', error)
    
    const message = error.data?.statusMessage || error.message || 'خطا در ایجاد مکانیک'
    serverError.value = message
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}

// Navigation
function goBack() {
  router.push('/admin/mechanics')
}
</script>

<template>
  <div>
    <!-- عنوان صفحه -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">ساخت تسویه جدید</h1>
      <p class="text-gray-600 mt-2">ایجاد تسویه جدید برای vendor انتخاب شده</p>
    </div>

    <!-- فرم -->
    <div class="bg-white p-6 rounded-lg border max-w-2xl">
      <form @submit.prevent="submitForm">
        <!-- انتخاب Vendor -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">انتخاب Vendor</label>
          <select
            v-model="form.vendorId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="pending"
          >
            <option value="">انتخاب کنید...</option>
            <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
              {{ vendor.name }}
            </option>
          </select>
        </div>

        <!-- تاریخ از -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">تاریخ از</label>
          <input
            v-model="form.from"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="pending"
          />
        </div>

        <!-- تاریخ تا -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">تاریخ تا</label>
          <input
            v-model="form.to"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="pending"
          />
        </div>

        <!-- توضیح -->
        <div class="mb-6 p-4 bg-blue-50 rounded-md">
          <p class="text-sm text-blue-800">
            تمام تراکنش‌های PENDING این Vendor در این بازه جمع‌آوری می‌شود.
          </p>
        </div>

        <!-- دکمه‌ها -->
        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="pending || !isFormValid"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="pending">در حال ایجاد...</span>
            <span v-else>ایجاد تسویه</span>
          </button>
          
          <NuxtLink
            to="/admin/settlements"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            انصراف
          </NuxtLink>
        </div>

        <!-- پیام خطا -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'authenticated' })

// تعریف interface برای Vendor
interface Vendor {
  id: number
  name: string
}

// تعریف interface برای پاسخ API vendors
interface VendorsResponse {
  items: Vendor[]
}

// تعریف interface برای پاسخ API settlements
interface SettlementResponse {
  created: boolean
  settlementId?: number
  vendorId?: number
  vendorName: string
  periodFrom?: string
  periodTo?: string
  totals?: {
    eligible: number
    mechanic: number
    platform: number
  }
  count?: number
  message: string
}

// فرم
const form = ref({
  vendorId: '',
  from: '',
  to: ''
})

// دریافت لیست vendors
const { data: vendorsData, pending: vendorsPending, error: vendorsError } = await useFetch<VendorsResponse>('/api/vendors')

// computed برای vendors
const vendors = computed(() => vendorsData.value?.items || [])

// وضعیت فرم
const pending = ref(false)
const error = ref('')

// اعتبارسنجی فرم
const isFormValid = computed(() => {
  return form.value.vendorId && 
         form.value.from && 
         form.value.to && 
         form.value.from <= form.value.to
})

// ارسال فرم
async function submitForm() {
  if (!isFormValid.value) return
  
  try {
    pending.value = true
    error.value = ''
    
    const { csrfFetch } = useApi()
    const response = await csrfFetch<SettlementResponse>('/api/settlements', {
      method: 'POST',
      body: {
        vendorId: Number(form.value.vendorId),
        from: form.value.from,
        to: form.value.to
      }
    })
    
    // موفقیت - انتقال به صفحه جزئیات
    if (response.created && response.settlementId) {
      await navigateTo(`/admin/settlements/${response.settlementId}`)
    } else {
      error.value = 'خطا در ایجاد تسویه'
    }
    
  } catch (err: any) {
    console.error('Error creating settlement:', err)
    error.value = err.data?.message || 'خطا در ایجاد تسویه'
  } finally {
    pending.value = false
  }
}
</script>

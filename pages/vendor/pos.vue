<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">ثبت فروش</h1>
        <p class="mt-2 text-gray-600">فروشگاه: {{ vendorName || 'نامشخص' }}</p>
      </div>

      <!-- Mechanic Code Section -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">کد مکانیک</h2>
        
        <div v-if="!mechanicCode" class="space-y-4">
          <div>
            <label for="mechanicCode" class="block text-sm font-medium text-gray-700">
              کد مکانیک
            </label>
            <div class="mt-1 flex space-x-3 rtl:space-x-reverse">
              <input
                id="mechanicCode"
                v-model="inputMechanicCode"
                type="text"
                class="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="ABC123"
              />
              <button
                @click="validateMechanicCode"
                :disabled="!inputMechanicCode || validating"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span v-if="validating">اعتبارسنجی...</span>
                <span v-else>اعتبارسنجی</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                مکانیک: {{ mechanicName }}
              </p>
              <p class="text-sm text-green-700 mt-1">
                کد: {{ mechanicCode }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="mechanicError" class="mt-3 text-red-600 text-sm">
          {{ mechanicError }}
        </div>
      </div>

      <!-- Sales Form -->
      <div v-if="mechanicCode" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">فرم فروش</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="customerPhone" class="block text-sm font-medium text-gray-700">
                شماره تلفن مشتری
              </label>
              <input
                id="customerPhone"
                v-model="form.customerPhone"
                type="tel"
                required
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="09123334444"
              />
            </div>

            <div>
              <label for="amountTotal" class="block text-sm font-medium text-gray-700">
                مبلغ کل (تومان)
              </label>
              <input
                id="amountTotal"
                v-model.number="form.amountTotal"
                type="number"
                required
                min="0"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="2500000"
              />
            </div>

            <div>
              <label for="amountEligible" class="block text-sm font-medium text-gray-700">
                مبلغ واجد شرایط (تومان)
              </label>
              <input
                id="amountEligible"
                v-model.number="form.amountEligible"
                type="number"
                required
                min="0"
                :max="form.amountTotal"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="2500000"
              />
            </div>

            <div>
              <label for="note" class="block text-sm font-medium text-gray-700">
                یادداشت (اختیاری)
              </label>
              <input
                id="note"
                v-model="form.note"
                type="text"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="توضیحات"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              @click="resetForm"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              پاک کردن
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="submitting">ثبت فروش...</span>
              <span v-else>ثبت فروش</span>
            </button>
          </div>
        </form>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 text-red-600 text-sm text-center">
          {{ error }}
        </div>
      </div>

      <!-- Success Result -->
      <div v-if="transactionResult" class="bg-white shadow rounded-lg p-6 mt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">فروش با موفقیت ثبت شد</h3>
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">شناسه تراکنش</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ transactionResult.id }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">مبلغ کل</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(transactionResult.amountTotal) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">مبلغ واجد شرایط</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(transactionResult.amountEligible) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">کمیسیون</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(transactionResult.commission) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { $fetch } = useNuxtApp()

// State
const mechanicCode = ref('')
const mechanicName = ref('')
const inputMechanicCode = ref('')
const mechanicError = ref('')
const validating = ref(false)

const form = ref({
  customerPhone: '',
  amountTotal: null,
  amountEligible: null,
  note: ''
})

const submitting = ref(false)
const error = ref('')
const transactionResult = ref(null)

// Check if mechanic code exists in URL
onMounted(() => {
  if (route.query.code) {
    inputMechanicCode.value = route.query.code
    validateMechanicCode()
  }
})

// Validate mechanic code
async function validateMechanicCode() {
  if (!inputMechanicCode.value) return
  
  validating.value = true
  mechanicError.value = ''

  try {
    const response = await $fetch(`/api/referral/resolve/${inputMechanicCode.value}`)
    
    mechanicCode.value = inputMechanicCode.value
    mechanicName.value = response.mechanic.fullName
  } catch (err) {
    mechanicError.value = 'کد مکانیک نامعتبر است'
  } finally {
    validating.value = false
  }
}

// Submit sales form
async function handleSubmit() {
  submitting.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('توکن احراز هویت یافت نشد')
    }

    const response = await $fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        mechanicCode: mechanicCode.value,
        customerPhone: form.value.customerPhone,
        amountTotal: form.value.amountTotal,
        amountEligible: form.value.amountEligible,
        note: form.value.note
      }
    })

    transactionResult.value = response
    resetForm()
  } catch (err) {
    error.value = 'خطا در ثبت فروش: ' + (err.data?.message || err.message || 'خطای نامشخص')
  } finally {
    submitting.value = false
  }
}

// Reset form
function resetForm() {
  form.value = {
    customerPhone: '',
    amountTotal: null,
    amountEligible: null,
    note: ''
  }
  transactionResult.value = null
  error.value = ''
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}
</script>

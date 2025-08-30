<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbItems" />
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">ثبت فروش</h1>
            <p class="mt-2 text-gray-600">فروشگاه: {{ vendorName }}</p>
          </div>
          <NuxtLink 
            to="/vendor/settlements"
            class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            تسویه‌ها
          </NuxtLink>
        </div>
      </div>

      <!-- Mechanic Code Section -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">کد مکانیک</h2>
        
        <div v-if="!mechanic" class="space-y-4">
          <div>
            <label for="mechanicCode" class="block text-sm font-medium text-gray-700">
              کد مکانیک
            </label>
            <div class="mt-1 flex space-x-3 rtl:space-x-reverse">
              <input
                id="mechanicCode"
                v-model="mechanicCode"
                type="text"
                class="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="ABC123"
                @keyup.enter="validateMechanicCode"
              />
              <button
                @click="validateMechanicCode"
                :disabled="!mechanicCode || validating"
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
                مکانیک: {{ mechanic.name }}
              </p>
              <p class="text-sm text-green-700 mt-1">
                کد: {{ mechanic.code }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="mechanicError" class="mt-3 text-red-600 text-sm">
          {{ mechanicError }}
        </div>

        <!-- QR Scanner Section -->
        <details class="mt-3">
          <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800">اسکن QR (اختیاری)</summary>
          <QrScanner class="mt-2" @read="(code:string)=>{ mechanicCode = code }" />
        </details>
      </div>

      <!-- Sales Form -->
      <div v-if="mechanic" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">فرم فروش</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Items Section -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-md font-medium text-gray-900">آیتم‌های فروش</h3>
              <div class="flex space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  @click="toggleAllEligible"
                  class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  {{ allEligible ? 'نامشمول همه' : 'مشمول همه' }}
                </button>
                <button
                  type="button"
                  @click="addItem"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  + ردیف
                </button>
              </div>
            </div>

            <!-- Items Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نام قطعه
                    </th>
                    <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تعداد
                    </th>
                    <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      قیمت واحد
                    </th>
                    <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      جمع
                    </th>
                    <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      مشمول
                    </th>
                    <th class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, index) in items" :key="index" class="hover:bg-gray-50">
                    <td class="px-3 py-2">
                      <input
                        v-model="item.name"
                        type="text"
                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="نام قطعه"
                        @keyup.enter="addItem"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model.number="item.qty"
                        type="number"
                        min="1"
                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="1"
                        @keyup.enter="addItem"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model.number="item.unitPrice"
                        type="number"
                        min="0"
                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="0"
                        @keyup.enter="addItem"
                      />
                    </td>
                    <td class="px-3 py-2 text-sm text-gray-900">
                      {{ formatCurrency(item.qty * item.unitPrice) }}
                    </td>
                    <td class="px-3 py-2">
                      <input
                        v-model="item.eligible"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <button
                        type="button"
                        @click="removeItem(index)"
                        class="text-red-600 hover:text-red-800"
                        :disabled="items.length === 1"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totals Section -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">مبلغ کل</dt>
                <dd class="mt-1 text-lg font-semibold text-gray-900">{{ formatCurrency(amountTotal) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">مبلغ مشمول</dt>
                <dd class="mt-1 text-lg font-semibold text-indigo-600">{{ formatCurrency(amountEligible) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">کمیسیون (تخمینی)</dt>
                <dd class="mt-1 text-sm text-gray-600">{{ formatCurrency(estimatedCommission) }}</dd>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="customerPhone" class="block text-sm font-medium text-gray-700">
                شماره تلفن مشتری *
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

          <!-- Validation Errors -->
          <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">خطاهای اعتبارسنجی</h3>
                <div class="mt-2 text-sm text-red-700">
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 rtl:space-x-reverse items-center">
            <button
              type="button"
              @click="() => resetForm()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              پاک کردن
            </button>
            <button
              type="submit"
              :disabled="submitting || !isFormValid"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="submitting">ثبت فروش...</span>
              <span v-else>ثبت فروش</span>
            </button>
            <span v-if="submitMessage.text" :class="submitMessage.type === 'success' ? 'text-green-600' : 'text-red-600'" class="text-sm">
              {{ submitMessage.text }}
            </span>
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
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(transactionResult.amounts.total) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">مبلغ واجد شرایط</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(transactionResult.amounts.eligible) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">کمیسیون مکانیک</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(transactionResult.amounts.commission.mechanic) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">کمیسیون پلتفرم</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(transactionResult.amounts.commission.platform) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// اضافه کردن middleware auth و layout
definePageMeta({
  auth: true,
  layout: 'authenticated'
})

// Import QR Scanner component
import QrScanner from '~/components/QrScanner.vue'

const route = useRoute()
const { user } = useAuth()
const { post } = useApi()
import { useToast } from '~/composables/useToast'

// Types
type Item = { name: string; qty: number; unitPrice: number; eligible: boolean }
type Mechanic = { id: number; code: string; name: string } | null

// State
const mechanic = ref<Mechanic>(null)
const mechanicCode = ref<string>('')
const mechanicError = ref<string>('')
const validating = ref<boolean>(false)

const items = ref<Item[]>([
  { name: '', qty: 1, unitPrice: 0, eligible: true }
])

const form = ref({
  customerPhone: '',
  note: ''
})

const submitting = ref<boolean>(false)
const error = ref<string>('')
const submitMessage = ref<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' })
const transactionResult = ref<any>(null)

// Computed
const vendorName = computed(() => user.value?.fullName || 'نامشخص')

const breadcrumbItems = computed(() => [
  { label: 'خانه فروشگاه', to: '/vendor' },
  { label: 'ثبت تراکنش' }
])

const amountTotal = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + (item.qty * item.unitPrice)
  }, 0)
})

const amountEligible = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + (item.eligible ? (item.qty * item.unitPrice) : 0)
  }, 0)
})

const estimatedCommission = computed(() => {
  return Math.round(amountEligible.value * 0.05) // 3% + 2% = 5%
})

const allEligible = computed(() => {
  return items.value.length > 0 && items.value.every(item => item.eligible)
})

const validationErrors = computed(() => {
  const errors = []
  
  if (!mechanic.value) {
    errors.push('کد مکانیک باید اعتبارسنجی شود')
  }
  
  if (!form.value.customerPhone.trim()) {
    errors.push('شماره تلفن مشتری الزامی است')
  }
  
  const validItems = items.value.filter(item => 
    item.name.trim() && item.qty > 0 && item.unitPrice > 0
  )
  
  if (validItems.length === 0) {
    errors.push('حداقل یک آیتم معتبر باید وارد شود')
  }
  
  if (amountEligible.value > amountTotal.value) {
    errors.push('مبلغ مشمول نمی‌تواند بیشتر از مبلغ کل باشد')
  }
  
  return errors
})

const isFormValid = computed(() => {
  return validationErrors.value.length === 0
})

// Check if mechanic code exists in URL
onMounted(() => {
  const code = route.query.code as string | undefined
  if (code) {
    mechanicCode.value = code
    validateMechanicCode()
  }
})

// Validate mechanic code
async function validateMechanicCode() {
  if (!mechanicCode.value) return
  
  validating.value = true
  mechanicError.value = ''

  try {
    const { data: response } = await useFetch(`/api/referral/resolve/${encodeURIComponent(mechanicCode.value)}`)
    const res: any = response.value
    if (res && res.ok === true && typeof res.mechanicId === 'number') {
      mechanic.value = {
        id: res.mechanicId as number,
        name: mechanicCode.value,
        code: mechanicCode.value
      }
    } else {
      throw new Error('invalid code')
    }
  } catch (err: any) {
    console.error('Mechanic resolve error:', err)
    mechanicError.value = 'کد مکانیک نامعتبر است'
  } finally {
    validating.value = false
  }
}

// Add new item
function addItem() {
  items.value.push({ name: '', qty: 1, unitPrice: 0, eligible: true })
}

// Remove item
function removeItem(index: number) {
  if (items.value.length > 1) {
    items.value.splice(index, 1)
  }
}

// Toggle all items eligible
function toggleAllEligible() {
  const newValue = !allEligible.value
  items.value.forEach(item => {
    item.eligible = newValue
  })
}

// Submit sales form
async function handleSubmit() {
  if (!isFormValid.value || !mechanic.value) return
  
  submitting.value = true
  error.value = ''
  submitMessage.value = { text: '', type: '' }

  try {
    const response = await post('/api/transactions', {
      mechanicCode: mechanic.value.code,
      customerPhone: form.value.customerPhone,
      amountTotal: amountTotal.value,
      amountEligible: amountEligible.value,
      note: form.value.note
    })

    if (response) {
      transactionResult.value = response
      useToast().show('تراکنش با موفقیت ثبت شد', 'success')
      submitMessage.value = { text: 'ثبت موفق', type: 'success' }
      resetForm(true)
    }
  } catch (err: any) {
    const msg = 'خطا در ثبت فروش: ' + (err.data?.statusMessage || err.message || 'خطای نامشخص')
    error.value = msg
    submitMessage.value = { text: msg, type: 'error' }
    useToast().show(msg, 'error')
  } finally {
    submitting.value = false
  }
}

// Reset form
function resetForm(preserveInputs: boolean = false) {
  items.value = [{ name: '', qty: 1, unitPrice: 0, eligible: true }]
  form.value = {
    customerPhone: preserveInputs ? form.value.customerPhone : form.value.customerPhone,
    note: ''
  }
  transactionResult.value = null
  error.value = ''
  // Keep mechanic code for convenience
}

// Format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}


</script>

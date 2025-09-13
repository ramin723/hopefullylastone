<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbItems" />
      
      <!-- Header -->
      <div class="mb-8">
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

        <div>
          <h1 class="text-3xl font-bold text-gray-900">ثبت فروش</h1>
          <p class="mt-2 text-gray-600">فروشگاه: {{ vendorName }}</p>
        </div>
      </div>

      <!-- Mechanic Code Section -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-6">کد مکانیک</h2>
        
        <!-- مکانیک انتخاب شده -->
        <div v-if="mechanic" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="mr-3">
              <p class="text-sm font-medium text-green-800">
                مکانیک: {{ mechanic.name }}
              </p>
              <p class="text-sm text-green-700 mt-1">
                کد: {{ mechanic.code }}
              </p>
            </div>
          </div>
        </div>

        <!-- دکمه‌های اسکن -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <!-- دکمه اسکن QR مکانیک -->
          <button
            @click="showMechanicScanner = !showMechanicScanner"
            class="group flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-4 text-center hover:from-blue-100 hover:to-indigo-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800 mb-1">اسکن QR مکانیک</h3>
            <p class="text-xs text-gray-600">اسکن کد QR مکانیک</p>
          </button>

          <!-- دکمه اسکن سفارش مشتری -->
          <button
            @click="showOrderScanner = !showOrderScanner"
            class="group flex-1 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-lg p-4 text-center hover:from-green-100 hover:to-emerald-200 hover:border-green-300 transition-all duration-200 hover:shadow-md"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800 mb-1">اسکن سفارش مشتری</h3>
            <p class="text-xs text-gray-600">اسکن QR سفارش</p>
          </button>
        </div>

        <!-- اسکنر QR مکانیک -->
        <div v-if="showMechanicScanner" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-blue-800">اسکنر QR مکانیک</h4>
            <button @click="showMechanicScanner = false" class="text-blue-600 hover:text-blue-800">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <QrScanner @read="parseAndHandleQR" />
        </div>

        <!-- اسکنر سفارش مشتری -->
        <div v-if="showOrderScanner" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-green-800">اسکنر سفارش مشتری</h4>
            <button @click="showOrderScanner = false" class="text-green-600 hover:text-green-800">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <QrScanner @read="scanOrder" />
          <div v-if="orderScanning" class="mt-2 text-sm text-green-600">
            در حال بررسی سفارش...
          </div>
          <div v-if="orderError" class="mt-2 text-sm text-red-600">
            {{ orderError }}
          </div>
          <div v-if="orderScanned" class="mt-2 text-sm text-green-600">
            ✅ سفارش یافت شد - اطلاعات پر شد
          </div>
        </div>

        <!-- فیلد متنی کد مکانیک (برای اطمینان خاطر) -->
        <div class="border-t pt-4">
          <label for="mechanicCode" class="block text-sm font-medium text-gray-700 mb-2">
            کد مکانیک (دستی)
          </label>
          <div class="flex space-x-3 rtl:space-x-reverse">
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

        <div v-if="mechanicError" class="mt-3 text-red-600 text-sm">
          {{ mechanicError }}
        </div>
      </div>

      <!-- Sales Form -->
      <div v-if="mechanic" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">فرم فروش</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Items Section -->
          <div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h3 class="text-lg font-medium text-gray-900">آیتم‌های فروش</h3>
              <div class="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  @click="toggleAllEligible"
                  class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {{ allEligible ? 'نامشمول همه' : 'مشمول همه' }}
                </button>
              </div>
            </div>

            <!-- Items Cards (Mobile-friendly) -->
            <div class="space-y-4">
              <div 
                v-for="(item, index) in items" 
                :key="index" 
                class="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <!-- Header with item number and delete button -->
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-sm font-medium text-gray-700">آیتم {{ index + 1 }}</h4>
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    :disabled="items.length === 1"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <!-- Form fields in grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- نام قطعه -->
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-600 mb-1">نام قطعه</label>
                    <input
                      v-model="item.name"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="نام قطعه را وارد کنید"
                      @keyup.enter="addItem"
                    />
                  </div>

                  <!-- تعداد -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">تعداد</label>
                    <input
                      v-model.number="item.qty"
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="1"
                      @keyup.enter="addItem"
                    />
                  </div>

                  <!-- قیمت واحد -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">قیمت واحد (تومان)</label>
                    <input
                      v-model.number="item.unitPrice"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                      @keyup.enter="addItem"
                    />
                  </div>

                  <!-- جمع و مشمول -->
                  <div class="sm:col-span-2">
                    <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <div class="flex items-center gap-3">
                        <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            v-model="item.eligible"
                            type="checkbox"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          مشمول کمیسیون
                        </label>
                      </div>
                      <div class="text-left">
                        <div class="text-xs text-gray-500">جمع کل</div>
                        <div class="text-sm font-semibold text-gray-900">
                          {{ formatCurrency(item.qty * item.unitPrice) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- دکمه افزودن آیتم در هر کارت -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    @click="addItem"
                    class="w-full inline-flex items-center justify-center px-4 py-2 border-2 border-dashed border-indigo-300 text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 hover:text-indigo-700 transition-colors"
                  >
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    افزودن آیتم جدید
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">اطلاعات مشتری</h3>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="customerPhone" class="block text-sm font-medium text-gray-700 mb-2">
                  شماره تلفن مشتری <span class="text-red-500">*</span>
                </label>
                <input
                  id="customerPhone"
                  v-model="form.customerPhone"
                  type="tel"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="09123334444"
                />
              </div>

              <div>
                <label for="note" class="block text-sm font-medium text-gray-700 mb-2">
                  یادداشت (اختیاری)
                </label>
                <input
                  id="note"
                  v-model="form.note"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="توضیحات اضافی"
                />
              </div>
            </div>
          </div>

          <!-- Totals Section -->
          <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <h3 class="text-lg font-medium text-gray-800 mb-4 text-center">خلاصه مالی</h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="bg-white rounded-lg p-4 text-center shadow-sm">
                <dt class="text-sm font-medium text-gray-500 mb-2">مبلغ کل</dt>
                <dd class="text-xl font-bold text-gray-900">{{ formatCurrency(amountTotal) }}</dd>
              </div>
              <div class="bg-white rounded-lg p-4 text-center shadow-sm">
                <dt class="text-sm font-medium text-gray-500 mb-2">مبلغ مشمول</dt>
                <dd class="text-xl font-bold text-indigo-600">{{ formatCurrency(amountEligible) }}</dd>
              </div>
              <div class="bg-white rounded-lg p-4 text-center shadow-sm">
                <dt class="text-sm font-medium text-gray-500 mb-2">کمیسیون (تخمینی)</dt>
                <dd class="text-lg font-semibold text-green-600">{{ formatCurrency(estimatedCommission) }}</dd>
              </div>
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

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div class="flex-1">
              <span v-if="submitMessage.text" :class="submitMessage.type === 'success' ? 'text-green-600' : 'text-red-600'" class="text-sm block text-center sm:text-right">
                {{ submitMessage.text }}
              </span>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                @click="() => resetForm()"
                class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                پاک کردن فرم
              </button>
              <button
                type="submit"
                :disabled="submitting || !isFormValid"
                class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                <svg v-if="!submitting" class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-else class="w-4 h-4 ml-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span v-if="submitting">در حال ثبت...</span>
                <span v-else>ثبت فروش</span>
              </button>
            </div>
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
const router = useRouter()
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

// Order scanning state
const orderScanning = ref<boolean>(false)
const orderError = ref<string>('')
const orderScanned = ref<boolean>(false)
const fromOrder = ref<boolean>(false)
const orderCode = ref<string>('')

// Scanner visibility state
const showMechanicScanner = ref<boolean>(false)
const showOrderScanner = ref<boolean>(false)

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

// Handle QR scan based on content type
async function parseAndHandleQR(code: string) {
  if (!code) return
  
  const parsed = parseScanned(code)
  
  if (parsed.kind === 'order') {
    // Handle order QR
    await scanOrder(parsed.code)
  } else {
    // Handle mechanic QR
    mechanicCode.value = parsed.code
    await validateMechanicCode()
  }
}

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

// Parse scanned QR content and determine type
function parseScanned(str: string) {
  const s = (str || '').trim()
  
  // Check for explicit prefixes
  if (s.startsWith('ORDER:')) {
    return { kind: 'order', code: s.slice(6) }
  }
  if (s.startsWith('MECH:')) {
    return { kind: 'mechanic', code: s.slice(5) }
  }
  
  // Fallback: try to determine by pattern
  // Order codes are typically longer and may contain letters/numbers
  // Mechanic codes are typically shorter (3-6 characters)
  if (s.length >= 8) {
    return { kind: 'order', code: s }
  } else if (s.length >= 3 && s.length <= 8) {
    return { kind: 'mechanic', code: s }
  }
  
  // Default to mechanic if unclear
  return { kind: 'mechanic', code: s }
}

// Scan order QR code
async function scanOrder(code: string) {
  if (!code) return
  
  orderScanning.value = true
  orderError.value = ''
  orderScanned.value = false
  
  try {
    const response = await $fetch(`/api/orders/${code}`)
    
    if (response.ok && (response as any).order) {
      const order = (response as any).order
      
      // Prefill form with order data
      if (order.mechanic) {
        mechanic.value = {
          id: order.mechanic.id,
          code: order.mechanic.code,
          name: order.mechanic.name
        }
        mechanicCode.value = order.mechanic.code
      }
      
      form.value.customerPhone = order.customerPhone
      if (order.note) {
        form.value.note = order.note
      }
      
      // Set order flags
      fromOrder.value = true
      orderCode.value = code
      orderScanned.value = true
      
      // Show success message
      useToast().show('اطلاعات سفارش با موفقیت پر شد', 'success')
      
      // If POS supports items, try to map them
      if (order.items && order.items.length > 0) {
        // For now, just show info message
        useToast().show(`اقلام سفارش دریافت شد (${order.items.length} آیتم) - نسخه فعلی POS از جزئیات آیتم‌ها پشتیبانی نمی‌کند`, 'info')
      }
      
    } else {
      throw new Error('Invalid order response')
    }
    
  } catch (err: any) {
    console.error('Order scan error:', err)
    
    if (err.statusCode === 409) {
      orderError.value = 'این سفارش قبلاً استفاده شده است'
    } else if (err.statusCode === 404) {
      orderError.value = 'سفارش یافت نشد'
    } else if (err.statusCode === 403) {
      orderError.value = 'شما مجاز به دسترسی به این سفارش نیستید'
    } else {
      orderError.value = 'خطا در بررسی سفارش'
    }
    
    fromOrder.value = false
    orderCode.value = ''
  } finally {
    orderScanning.value = false
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
      note: form.value.note,
      orderCode: fromOrder.value ? orderCode.value : undefined
    })

    if (response) {
      transactionResult.value = response
      
      let successMessage = 'تراکنش با موفقیت ثبت شد'
      if (fromOrder.value) {
        successMessage += ' - سفارش مصرف شد'
      }
      
      useToast().show(successMessage, 'success')
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
  
  // Reset order flags
  fromOrder.value = false
  orderCode.value = ''
  orderScanned.value = false
  orderError.value = ''
  
  // Keep mechanic code for convenience
}

// Format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}


</script>

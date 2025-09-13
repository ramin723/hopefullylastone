<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with Back Button -->
      <div class="mb-8">
        <!-- دکمه برگشت مینیمال -->
        <div class="mb-6">
          <button 
            @click="$router.push('/mechanic')"
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
          <h1 class="text-3xl font-bold text-gray-900">تراکنش‌ها</h1>
          <p class="mt-2 text-gray-600">سلام، {{ mechanicName }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-8 border border-white/20">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">فیلترها و جستجو</h2>
          <p class="text-sm text-gray-600">تراکنش‌های خود را فیلتر کنید</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">از تاریخ</label>
            <JalaliDatePicker 
              v-model="filters.from" 
              placeholder="1403-06-05 (شمسی)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تا تاریخ</label>
            <JalaliDatePicker 
              v-model="filters.to" 
              placeholder="1403-06-05 (شمسی)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select 
              v-model="filters.status" 
              class="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">همه</option>
              <option value="PENDING">در انتظار</option>
              <option value="SETTLED">تسویه‌شده</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">صفحه</label>
            <input 
              v-model.number="filters.page" 
              type="number" 
              min="1"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="applyFilters"
              :disabled="loading"
              class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              <span v-if="loading">در حال بارگذاری...</span>
              <span v-else>اعمال فیلتر</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          <p class="mt-4 text-gray-600 text-lg">در حال بارگذاری تراکنش‌ها...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">خطا در بارگذاری تراکنش‌ها</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="refresh()"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تلاش مجدد
          </button>
        </div>
      </div>

      <!-- Transactions List -->
      <div v-else-if="transactions && transactions.length > 0" class="space-y-4">
        <!-- Summary -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-8 border border-white/20">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">خلاصه تراکنش‌ها</h2>
            <p class="text-sm text-gray-600">آمار کلی تراکنش‌های شما</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 text-center">
              <div class="text-sm font-medium text-orange-800 mb-2">تعداد تراکنش‌ها</div>
              <div class="text-2xl font-bold text-orange-600">{{ transactions.length }}</div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 text-center">
              <div class="text-sm font-medium text-green-800 mb-2">جمع سهم مکانیک</div>
              <div class="text-2xl font-bold text-green-600">{{ formatCurrency(totalMechanic) }}</div>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 text-center">
              <div class="text-sm font-medium text-blue-800 mb-2">صفحه فعلی</div>
              <div class="text-2xl font-bold text-blue-600">{{ filters.page }}</div>
            </div>
          </div>
        </div>

        <!-- Transactions Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="transaction in transactions" 
            :key="transaction.id" 
            class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <!-- Header Row -->
            <div class="flex justify-between items-start mb-6">
              <div>
                <div class="text-xs text-gray-500 mb-1">شماره تراکنش</div>
                <div class="font-mono text-lg font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">
                  #{{ transaction.id }}
                </div>
              </div>
              <div class="text-left">
                <span 
                  :class="[
                    'px-3 py-2 text-xs font-semibold rounded-xl',
                    transaction.status === 'SETTLED' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  ]"
                >
                  {{ transaction.status === 'SETTLED' ? 'تسویه‌شده' : 'در انتظار' }}
                </span>
              </div>
            </div>

            <!-- Date Row -->
            <div class="mb-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="text-sm font-medium text-gray-800">تاریخ ایجاد</div>
              </div>
              <div class="font-semibold text-gray-900">{{ formatDate(transaction.createdAt) }}</div>
            </div>

            <!-- Amounts Row -->
            <div class="space-y-4 mb-6">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <div class="text-sm font-medium text-blue-800">مبلغ کل</div>
                </div>
                <div class="font-bold text-gray-900">{{ formatCurrency(transaction.amountTotal) }}</div>
              </div>
              
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div class="text-sm font-medium text-green-800">مبلغ مشمول</div>
                </div>
                <div class="font-bold text-gray-900">{{ formatCurrency(transaction.amountEligible) }}</div>
              </div>
              
              <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <div class="text-sm font-medium text-orange-800">سهم مکانیک</div>
                </div>
                <div class="font-bold text-orange-600">{{ formatCurrency(transaction.mechanicAmount) }}</div>
              </div>
            </div>

            <!-- Vendor & Customer Row -->
            <div class="space-y-4 mb-6">
              <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <div class="text-sm font-medium text-purple-800">فروشگاه</div>
                </div>
                <div class="font-semibold text-gray-900">{{ transaction.vendor }}</div>
              </div>
              
              <div v-if="transaction.customerPhone" class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <div class="text-sm font-medium text-blue-800">مشتری</div>
                </div>
                <div class="font-semibold text-gray-900">{{ transaction.customerPhone }}</div>
              </div>
              
              <div v-if="transaction.note" class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  <div class="text-sm font-medium text-gray-800">یادداشت</div>
                </div>
                <div class="text-sm text-gray-700">{{ transaction.note }}</div>
              </div>
            </div>

            <!-- QR Code (Optional) -->
            <div v-if="transaction.mechanicCode" class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div class="text-sm font-medium text-orange-800">کد مکانیک</div>
              </div>
              <div class="bg-orange-100 p-3 rounded-lg text-center font-mono text-sm font-bold text-orange-800">{{ transaction.mechanicCode }}</div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="hasMorePages" class="mt-8">
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-white/20">
            <div class="flex justify-center items-center gap-4">
              <button 
                @click="previousPage"
                :disabled="filters.page <= 1"
                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                قبلی
              </button>
              
              <div class="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-xl border border-orange-200">
                <span class="text-sm font-bold text-orange-800">صفحه {{ filters.page }}</span>
              </div>
              
              <button 
                @click="nextPage"
                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                بعدی
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="h-10 w-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">هیچ تراکنشی یافت نشد</h3>
          <p class="text-gray-600 mb-6">برای این فیلترها تراکنشی وجود ندارد.</p>
          <button 
            @click="applyFilters"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            بارگذاری مجدد
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: true,
  layout: 'authenticated'
})

const { user } = useAuth()

// State
const loading = ref(false)
const error = ref('')
const transactions = ref<any[]>([])
const totalMechanic = ref(0)
const hasMorePages = ref(false)

// Filters
const filters = reactive({
  from: '',
  to: '',
  status: '',
  page: 1,
  pageSize: 20
})

// Computed
const mechanicName = computed(() => user.value?.fullName || 'نامشخص')

// Fetch transactions with stable key
const { data, pending, error: fetchError, refresh } = await useFetch(
  () => {
    const params = new URLSearchParams()
    if (filters.from) params.append('from', toISOFromJalaliInput(filters.from) || '')
    if (filters.to) params.append('to', toISOEndOfDayFromJalaliInput(filters.to) || '')
    if (filters.status) params.append('status', filters.status)
    params.append('page', filters.page.toString())
    params.append('pageSize', filters.pageSize.toString())
    
    return `/api/mechanic/transactions?${params.toString()}`
  },
  {
    key: () => `mech-tx-${filters.status}-${filters.from}-${filters.to}-${filters.page}-${filters.pageSize}`,
    default: () => ({ items: [], count: 0, totalMechanic: 0 }),
    watch: false
  }
)

// Watch data changes
watch(data, (newData) => {
  if (newData) {
    transactions.value = newData.items || []
    totalMechanic.value = newData.totalMechanic || 0
    hasMorePages.value = (newData.items || []).length === filters.pageSize
  }
}, { immediate: true })

// Watch loading and error
watch(pending, (newPending) => {
  loading.value = newPending
})

watch(fetchError, (newError) => {
  error.value = newError?.data?.statusMessage || newError?.message || 'خطا در بارگذاری'
})

// Methods
function applyFilters() {
  filters.page = 1 // Reset to first page
  refresh()
}

function nextPage() {
  filters.page++
  refresh()
}

function previousPage() {
  if (filters.page > 1) {
    filters.page--
    refresh()
  }
}

// Date utilities
import { toISOFromJalaliInput, toISOEndOfDayFromJalaliInput, formatJalali } from '~/utils/date'
import JalaliDatePicker from '~/components/JalaliDatePicker.vue'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}

function formatCurrency(amount: any): string {
  if (!amount) return '0 تومان'
  const num = typeof amount === 'object' && amount.toNumber ? amount.toNumber() : Number(amount)
  return num.toLocaleString('fa-IR') + ' تومان'
}
</script>

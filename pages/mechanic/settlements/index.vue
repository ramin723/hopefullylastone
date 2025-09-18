<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-visible">
      <!-- Header -->
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
          <h1 class="text-3xl font-bold text-gray-900">تسویه‌های مکانیک</h1>
          <p class="mt-2 text-gray-600">لیست تمام تسویه‌های انجام شده</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-8 border border-white/20">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">فیلترها و جستجو</h2>
          <p class="text-sm text-gray-600">تسویه‌های خود را فیلتر کنید</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select 
              v-model="filters.status" 
              class="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">همه</option>
              <option value="OPEN">باز</option>
              <option value="PAID">پرداخت شده</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">از تاریخ</label>
            <SimpleDatePicker
              v-model="filters.from"
              placeholder="تاریخ شروع را انتخاب کنید"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تا تاریخ</label>
            <SimpleDatePicker
              v-model="filters.to"
              placeholder="تاریخ پایان را انتخاب کنید"
            />
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
          <p class="mt-4 text-gray-600 text-lg">در حال بارگذاری تسویه‌ها...</p>
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
          <h3 class="text-lg font-medium text-gray-900 mb-2">خطا در بارگذاری تسویه‌ها</h3>
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

      <!-- Settlements List -->
      <div v-else-if="settlements && settlements.length > 0" class="space-y-4">
        <!-- Summary -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-8 border border-white/20 relative z-10">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">خلاصه تسویه‌ها</h2>
            <p class="text-sm text-gray-600">آمار کلی تسویه‌های شما</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 text-center">
              <div class="text-sm font-medium text-orange-800 mb-2">تعداد تسویه‌ها</div>
              <div class="text-2xl font-bold text-orange-600">{{ settlements.length }}</div>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 text-center">
              <div class="text-sm font-medium text-blue-800 mb-2">جمع مبلغ مشمول</div>
              <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(totalEligible) }}</div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 text-center">
              <div class="text-sm font-medium text-green-800 mb-2">جمع سهم مکانیک</div>
              <div class="text-2xl font-bold text-green-600">{{ formatCurrency(totalMechanic) }}</div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 text-center">
              <div class="text-sm font-medium text-purple-800 mb-2">صفحه فعلی</div>
              <div class="text-2xl font-bold text-purple-600">{{ filters.page }}</div>
            </div>
          </div>
        </div>

        <!-- Settlements Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="settlement in settlements" 
            :key="settlement.id" 
            class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative z-10"
          >
            <!-- Header Row -->
            <div class="flex justify-between items-start mb-6">
              <div>
                <div class="text-xs text-gray-500 mb-1">شناسه تسویه</div>
                <div class="font-mono text-lg font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">
                  #{{ settlement.id }}
                </div>
              </div>
              <div class="text-left">
                <span 
                  :class="[
                    'px-3 py-2 text-xs font-semibold rounded-xl',
                    settlement.status === 'PAID' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  ]"
                >
                  {{ settlement.status === 'PAID' ? 'پرداخت شده' : 'باز' }}
                </span>
              </div>
            </div>

            <!-- Period Row -->
            <div class="mb-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <div class="text-sm font-medium text-gray-800">دوره تسویه</div>
              </div>
              <div class="font-semibold text-gray-900">
                {{ formatDate(settlement.periodFrom) }} تا {{ formatDate(settlement.periodTo) }}
              </div>
            </div>

            <!-- Amounts Row -->
            <div class="space-y-4 mb-6">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <div class="text-sm font-medium text-blue-800">مبلغ مشمول</div>
                </div>
                <div class="font-bold text-gray-900">{{ formatCurrency(settlement.totals.eligible) }}</div>
              </div>
              
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <div class="text-sm font-medium text-green-800">سهم مکانیک</div>
                </div>
                <div class="font-bold text-green-600">{{ formatCurrency(settlement.totals.mechanic) }}</div>
              </div>
              
              <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <div class="text-sm font-medium text-purple-800">سهم پلتفرم</div>
                </div>
                <div class="font-bold text-gray-900">{{ formatCurrency(settlement.totals.platform) }}</div>
              </div>
            </div>

            <!-- Vendor Row -->
            <div class="mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <div class="text-sm font-medium text-purple-800">فروشگاه</div>
              </div>
              <div class="font-semibold text-gray-900">{{ settlement.vendorName }}</div>
              <div v-if="settlement.vendorCity" class="text-sm text-gray-600 mt-1">{{ settlement.vendorCity }}</div>
            </div>

            <!-- Dates Row -->
            <div class="space-y-4 mb-6">
              <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div class="text-sm font-medium text-gray-800">تاریخ ایجاد</div>
                </div>
                <div class="font-semibold text-gray-900">{{ formatDate(settlement.createdAt) }}</div>
              </div>
              
              <div v-if="settlement.paidAt" class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div class="text-sm font-medium text-green-800">تاریخ پرداخت</div>
                </div>
                <div class="font-semibold text-gray-900">{{ formatDate(settlement.paidAt) }}</div>
              </div>
            </div>

            <!-- Item Count -->
            <div v-if="settlement.itemCount" class="mb-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <div class="text-sm font-medium text-orange-800">تعداد تراکنش‌ها</div>
              </div>
              <div class="font-bold text-orange-600">{{ settlement.itemCount }}</div>
            </div>

            <!-- Actions -->
            <div class="pt-6 border-t border-gray-200">
              <NuxtLink 
                :to="`/mechanic/settlements/${settlement.id}`"
                class="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                مشاهده جزئیات
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="hasMorePages" class="mt-8">
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-white/20 relative z-10">
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
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20 relative z-10">
          <div class="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="h-10 w-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">هیچ تسویه‌ای یافت نشد</h3>
          <p class="text-gray-600 mb-6">برای این فیلترها تسویه‌ای وجود ندارد.</p>
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
const settlements = ref<any[]>([])
const totalEligible = ref(0)
const totalMechanic = ref(0)
const hasMorePages = ref(false)

// Filters
const filters = reactive({
  status: '',
  from: '',
  to: '',
  page: 1,
  pageSize: 20
})

// Fetch settlements with stable key - فقط با کلیک دکمه اعمال فیلتر
const { data, pending, error: fetchError, refresh } = await useFetch(
  () => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.from) params.append('from', toISOFromJalaliInput(filters.from) || '')
    if (filters.to) params.append('to', toISOEndOfDayFromJalaliInput(filters.to) || '')
    params.append('page', filters.page.toString())
    params.append('pageSize', filters.pageSize.toString())
    
    return `/api/mechanic/settlements?${params.toString()}`
  },
  {
    key: () => `mech-settlements-${filters.status}-${filters.from}-${filters.to}-${filters.page}-${filters.pageSize}`,
    default: () => ({ items: [], count: 0, totalEligible: 0, totalMechanic: 0 }),
    watch: false,
    immediate: false // فقط با فراخوانی دستی
  }
)

// Watch data changes
watch(data, (newData) => {
  if (newData) {
    settlements.value = newData.items || []
    totalEligible.value = newData.totalEligible || 0
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
  refresh() // فقط با کلیک دکمه اعمال فیلتر درخواست ارسال می‌شود
}

// بارگذاری اولیه داده‌ها
onMounted(() => {
  refresh()
})

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
import SimpleDatePicker from '~/components/SimpleDatePicker.vue'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}

function formatCurrency(amount: any): string {
  if (!amount) return '0 تومان'
  const num = typeof amount === 'object' && amount.toNumber ? amount.toNumber() : Number(amount)
  return num.toLocaleString('fa-IR') + ' تومان'
}
</script>

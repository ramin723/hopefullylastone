<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'داشبورد', to: '/vendor' },
          { label: 'آمار و تحلیل' }
        ]" />
        
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
          <h1 class="text-3xl font-bold text-gray-900">آمار و تحلیل پیشرفته</h1>
          <p class="mt-2 text-gray-600">تحلیل عمیق عملکرد کسب‌وکار شما در پلتفرم همکاری</p>
        </div>
      </div>

      <!-- Time Period Filter -->
      <div class="mb-8">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 p-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4 text-center">انتخاب بازه زمانی</h3>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <button
              v-for="period in timePeriods"
              :key="period.value"
              @click="changeTimePeriod(period.value)"
              :class="[
                'px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md',
                selectedPeriod === period.value
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
          <div class="text-sm text-gray-600 mt-4 text-center bg-gray-50 rounded-lg p-3">
            {{ periodInfo || 'انتخاب بازه زمانی برای مشاهده آمار' }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p class="mt-4 text-gray-600 text-lg">در حال بارگذاری آمار...</p>
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
          <h3 class="text-lg font-medium text-gray-900 mb-2">خطا در بارگذاری آمار</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="refreshData"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تلاش مجدد
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- KPIs Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Sales Card -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 text-center border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">کل فروش</h3>
            <div class="text-3xl font-bold text-green-600 mb-2">{{ formatCurrency(kpis.totalSales || 0) }}</div>
            <p class="text-sm text-gray-600">مبلغ کل فروش‌ها</p>
          </div>

          <!-- Total Eligible Amount Card -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 text-center border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">مبلغ واجد شرایط</h3>
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ formatCurrency(kpis.totalEligibleAmount || 0) }}</div>
            <p class="text-sm text-gray-600">مبلغ مشمول کمیسیون</p>
          </div>

          <!-- Total Commission Card -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 text-center border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">کل کمیسیون</h3>
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ formatCurrency(kpis.totalCommission || 0) }}</div>
            <p class="text-sm text-gray-600">کمیسیون کل پرداخت شده</p>
          </div>

          <!-- Mechanics Count Card -->
          <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 text-center border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div class="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">مکانیک‌های فعال</h3>
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ kpis.mechanicCount || 0 }}</div>
            <p class="text-sm text-gray-600">تعداد مکانیک‌های همکار</p>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Sales Over Time Chart -->
          <TimeSeriesChart
            :data="chartsData.salesOverTime || []"
            :loading="loading"
            :error="error"
          />

          <!-- Top Mechanics Chart -->
          <TopMechanicsBarChart
            :data="chartsData.topMechanics || []"
            :loading="loading"
            :error="error"
          />
        </div>

        <!-- Recent Transactions Table -->
        <div class="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">تراکنش‌های اخیر</h2>
              <NuxtLink 
                to="/vendor/transactions"
                class="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                مشاهده همه تراکنش‌ها
              </NuxtLink>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <AppTable
              :headers="tableHeaders"
              :data="recentTransactions"
              :loading="loading"
              empty-message="هنوز تراکنشی ثبت نشده است"
            >
              <template #row="{ row }">
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{{ row.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(row.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ row.mechanicName }}
                    <span class="text-gray-500 text-xs block">{{ row.mechanicCode }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(row.amountTotal) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(row.totalCommission) }}
                  </td>
                </tr>
              </template>
            </AppTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: 'authenticated',
  auth: true,
  roles: ['VENDOR']
})

const { user } = useAuth()
const router = useRouter()

// Computed
const vendorName = computed(() => user.value?.fullName || 'نامشخص')

// Time period options
const timePeriods = [
  { value: 'weekly', label: 'هفته اخیر' },
  { value: 'monthly', label: 'ماه اخیر' },
  { value: 'yearly', label: 'سال اخیر' }
]

// State
const selectedPeriod = ref('monthly')
const loading = ref(true)
const error = ref('')
const kpis = ref({
  totalSales: 0,
  totalEligibleAmount: 0,
  totalCommission: 0,
  mechanicCount: 0
})
const chartsData = ref({
  salesOverTime: [],
  topMechanics: []
})
const recentTransactions = ref([])
const periodInfo = ref('')

// Table headers
const tableHeaders = [
  { key: 'id', label: 'شناسه تراکنش' },
  { key: 'createdAt', label: 'تاریخ' },
  { key: 'mechanicName', label: 'مکانیک' },
  { key: 'amountTotal', label: 'مبلغ کل' },
  { key: 'totalCommission', label: 'کمیسیون کل' }
]

// Computed API URL
const apiUrl = computed(() => {
  return `/api/vendors/stats?period=${selectedPeriod.value}`
})

// Fetch data with reactivity
const { data: statsData, error: fetchError, refresh } = await useFetch(apiUrl, {
  key: 'vendor-advanced-stats',
  default: () => ({ 
    kpis: { 
      totalSales: 0, 
      totalEligibleAmount: 0, 
      totalCommission: 0,
      mechanicCount: 0
    }, 
    chartsData: {
      salesOverTime: [],
      topMechanics: []
    },
    recentTransactions: [],
    period: {
      type: 'monthly',
      from: '',
      to: ''
    }
  }),
  watch: false
})

// Watch stats data
watch(statsData, (newData) => {
  if (newData && typeof newData === 'object') {
    if ('kpis' in newData) {
      kpis.value = {
        totalSales: (newData as any).kpis?.totalSales || 0,
        totalEligibleAmount: (newData as any).kpis?.totalEligibleAmount || 0,
        totalCommission: (newData as any).kpis?.totalCommission || 0,
        mechanicCount: (newData as any).kpis?.mechanicCount || 0
      }
    }
    if ('chartsData' in newData) {
      chartsData.value = {
        salesOverTime: (newData as any).chartsData?.salesOverTime || [],
        topMechanics: (newData as any).chartsData?.topMechanics || []
      }
    }
    if ('recentTransactions' in newData) {
      recentTransactions.value = (newData as any).recentTransactions || []
    }
    if ('period' in newData) {
      const period = (newData as any).period
      if (period.from && period.to) {
        const fromDate = new Date(period.from).toLocaleDateString('fa-IR')
        const toDate = new Date(period.to).toLocaleDateString('fa-IR')
        periodInfo.value = `نمایش داده‌ها از ${fromDate} تا ${toDate}`
      }
    }
  }
  loading.value = false
}, { immediate: true })

// Watch for errors
watch(fetchError, (newError) => {
  if (newError) {
    error.value = 'خطا در بارگذاری آمار. لطفاً دوباره تلاش کنید.'
    loading.value = false
  }
})

// Change time period
const changeTimePeriod = async (period: string) => {
  selectedPeriod.value = period
  loading.value = true
  error.value = ''
  await refresh()
}

// Refresh data function
const refreshData = async () => {
  loading.value = true
  error.value = ''
  await refresh()
}

// Utility functions
function formatCurrency(amount: any): string {
  if (!amount) return '0 تومان'
  const num = typeof amount === 'object' && amount.toNumber ? amount.toNumber() : Number(amount)
  return num.toLocaleString('fa-IR') + ' تومان'
}

function formatDate(date: string | Date): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

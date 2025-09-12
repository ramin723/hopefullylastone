<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'داشبورد', to: '/vendor' },
          { label: 'آمار و تحلیل' }
        ]" />
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">آمار و تحلیل پیشرفته</h1>
            <p class="mt-2 text-gray-600">تحلیل عمیق عملکرد کسب‌وکار شما در پلتفرم همکاری</p>
          </div>
          <NuxtLink 
            to="/vendor"
            class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            بازگشت به داشبورد
          </NuxtLink>
        </div>
      </div>

      <!-- Time Period Filter -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex flex-wrap items-center justify-center gap-2">
            <span class="text-sm font-medium text-gray-700">بازه زمانی:</span>
            <button
              v-for="period in timePeriods"
              :key="period.value"
              @click="changeTimePeriod(period.value)"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                selectedPeriod === period.value
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ period.label }}
            </button>
            <div class="text-xs text-gray-500 mt-2 w-full text-center">
              {{ periodInfo }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">در حال بارگذاری آمار...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">خطا در بارگذاری آمار</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="refreshData"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          تلاش مجدد
        </button>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- KPIs Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Sales Card -->
          <AppCard class="text-center">
            <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">کل فروش</h3>
            <div class="text-3xl font-bold text-green-600 mb-2">{{ formatCurrency(kpis.totalSales || 0) }}</div>
            <p class="text-sm text-gray-600">مبلغ کل فروش‌ها</p>
          </AppCard>

          <!-- Total Eligible Amount Card -->
          <AppCard class="text-center">
            <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">مبلغ واجد شرایط</h3>
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ formatCurrency(kpis.totalEligibleAmount || 0) }}</div>
            <p class="text-sm text-gray-600">مبلغ مشمول کمیسیون</p>
          </AppCard>

          <!-- Total Commission Card -->
          <AppCard class="text-center">
            <div class="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">کل کمیسیون</h3>
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ formatCurrency(kpis.totalCommission || 0) }}</div>
            <p class="text-sm text-gray-600">کمیسیون کل پرداخت شده</p>
          </AppCard>

          <!-- Mechanics Count Card -->
          <AppCard class="text-center">
            <div class="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">مکانیک‌های فعال</h3>
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ kpis.mechanicCount || 0 }}</div>
            <p class="text-sm text-gray-600">تعداد مکانیک‌های همکار</p>
          </AppCard>
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

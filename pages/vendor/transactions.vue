<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'داشبورد', to: '/vendor' },
          { label: 'تراکنش‌ها' }
        ]" />
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">تراکنش‌ها</h1>
            <p class="mt-2 text-gray-600">مشاهده و مدیریت تمام تراکنش‌های فروشگاه</p>
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

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">در حال بارگذاری تراکنش‌ها...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">خطا در بارگذاری تراکنش‌ها</h3>
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
        <!-- Transactions Table -->
        <div class="bg-white shadow-lg rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">لیست تراکنش‌ها</h2>
              <div class="text-sm text-gray-500">
                {{ transactions.length }} تراکنش
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <AppTable
              :headers="tableHeaders"
              :data="transactions"
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
                    {{ row.customerPhone }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(row.amountTotal) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(row.amountEligible) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(row.totalCommission) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      row.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    ]">
                      {{ getStatusText(row.status) }}
                    </span>
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

// State
const loading = ref(true)
const error = ref('')
const transactions = ref([])

// Table headers
const tableHeaders = [
  { key: 'id', label: 'شناسه' },
  { key: 'createdAt', label: 'تاریخ' },
  { key: 'mechanicName', label: 'مکانیک' },
  { key: 'customerPhone', label: 'تلفن مشتری' },
  { key: 'amountTotal', label: 'مبلغ کل' },
  { key: 'amountEligible', label: 'مبلغ واجد شرایط' },
  { key: 'totalCommission', label: 'کمیسیون کل' },
  { key: 'status', label: 'وضعیت' }
]

// Fetch data
const { data: transactionsData, error: fetchError, refresh } = await useFetch('/api/vendors/transactions', {
  key: 'vendor-transactions',
  default: () => ({ data: [], pagination: {} }),
  watch: false
})

// Watch for data changes
watch(transactionsData, (newData) => {
  if (newData && newData.data && Array.isArray(newData.data)) {
    transactions.value = newData.data
  }
  loading.value = false
}, { immediate: true })

// Watch for errors
watch(fetchError, (newError) => {
  if (newError) {
    error.value = 'خطا در بارگذاری تراکنش‌ها. لطفاً دوباره تلاش کنید.'
    loading.value = false
  }
})

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

function getStatusText(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'در انتظار'
    case 'COMPLETED':
      return 'تکمیل شده'
    case 'CANCELLED':
      return 'لغو شده'
    default:
      return status
  }
}
</script>

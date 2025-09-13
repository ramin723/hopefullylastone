<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'داشبورد', to: '/vendor' },
          { label: 'تراکنش‌ها' }
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
          <h1 class="text-3xl font-bold text-gray-900">تراکنش‌ها</h1>
          <p class="mt-2 text-gray-600">مشاهده و مدیریت تمام تراکنش‌های فروشگاه</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
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
        <!-- Transactions Table -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-white/20">
          <div class="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
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
                <tr class="hover:bg-gray-50 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-xs font-mono">#{{ row.id }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(row.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div class="font-medium">{{ row.mechanicName }}</div>
                      <span class="text-gray-500 text-xs">{{ row.mechanicCode }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ row.customerPhone }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="font-semibold text-green-600">{{ formatCurrency(row.amountTotal) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="font-semibold text-blue-600">{{ formatCurrency(row.amountEligible) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="font-semibold text-orange-600">{{ formatCurrency(row.totalCommission) }}</span>
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
const router = useRouter()

// Types
interface Transaction {
  id: number
  createdAt: string | Date
  customerPhone: string
  amountTotal: any
  amountEligible: any
  status: string
  note: string | null
  mechanicName: string
  mechanicCode: string
  mechanicCommission: any
  platformCommission: any
  totalCommission: any
}

// State
const loading = ref(true)
const error = ref('')
const transactions = ref<Transaction[]>([])

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
    transactions.value = newData.data as Transaction[]
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

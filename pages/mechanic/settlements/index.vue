<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">تسویه‌های من</h1>
            <p class="mt-2 text-gray-600">لیست تمام تسویه‌های انجام شده</p>
          </div>
          <NuxtLink 
            to="/mechanic"
            class="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            ← بازگشت به داشبورد
          </NuxtLink>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">فیلترها</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select 
              v-model="filters.status" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">همه</option>
              <option value="OPEN">باز</option>
              <option value="PAID">پرداخت شده</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">از تاریخ</label>
            <input 
              type="date" 
              v-model="filters.from"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تا تاریخ</label>
            <input 
              type="date" 
              v-model="filters.to"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="applyFilters"
              class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              اعمال فیلتر
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-500">در حال بارگذاری...</div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="text-red-800">{{ error }}</div>
      </div>

      <!-- Settlements List -->
      <div v-else-if="settlements.length" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">تسویه‌ها</h3>
          <p class="text-sm text-gray-500 mt-1">تعداد: {{ settlements.length }}</p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شناسه</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">فروشگاه</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دوره</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مبلغ کل مشمول</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سهم من</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ ایجاد</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="settlement in settlements" :key="settlement.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ settlement.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ settlement.vendorName }}</div>
                    <div class="text-sm text-gray-500">{{ settlement.vendorCity || 'نامشخص' }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(settlement.periodFrom) }} تا {{ formatDate(settlement.periodTo) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(settlement.totals.eligible) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                  {{ formatNumber(settlement.totals.mechanic) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      settlement.status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ settlement.status === 'PAID' ? 'پرداخت شده' : 'باز' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(settlement.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <NuxtLink 
                    :to="`/mechanic/settlements/${settlement.id}`"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    مشاهده جزئیات
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white shadow rounded-lg p-12 text-center">
        <div class="text-gray-500">
          <p class="text-lg mb-2">هیچ تسویه‌ای یافت نشد</p>
          <p class="text-sm">هنوز تسویه‌ای برای شما ایجاد نشده است.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1) کلید صفحه
definePageMeta({
  auth: true,
  layout: 'authenticated',
  key: 'mechanic-settlements',
})

const { user } = useAuth()

// Type definitions
interface SettlementTotals {
  eligible: number
  mechanic: number
  platform: number
}

interface MechanicSettlement {
  id: number
  vendorId: number
  vendorName: string
  vendorCity: string | null
  periodFrom: string | Date
  periodTo: string | Date
  totals: SettlementTotals
  status: string
  createdAt: string | Date
  paidAt: string | Date | null
  itemCount: number
}

// Filters
const filters = ref({
  status: '',
  from: '',
  to: ''
})

// Fetch settlements
const { data: settlements, pending: loading, error, refresh } = await useFetch<MechanicSettlement[]>(
  () => {
    const params = new URLSearchParams()
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.from) params.append('from', filters.value.from)
    if (filters.value.to) params.append('to', filters.value.to)
    
    return `/api/mechanic/settlements?${params.toString()}`
  },
  {
    key: () => `mechanic-settlements-${filters.value.status}-${filters.value.from}-${filters.value.to}`,
    default: () => [],
    watch: false
  }
)

// Methods
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fa-IR')
}

function formatNumber(value: any): string {
  if (!value) return '0'
  const num = typeof value === 'object' && value.toNumber ? value.toNumber() : Number(value)
  return num.toLocaleString('fa-IR')
}

function applyFilters() {
  refresh()
}

// No need to watch user changes anymore since we use the new API
</script>

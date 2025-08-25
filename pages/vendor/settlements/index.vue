<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">تسویه‌های فروشگاه</h1>
        <p class="mt-2 text-gray-600">فروشگاه: {{ vendorName }}</p>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">فیلترها</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">از تاریخ</label>
            <input 
              v-model="filters.from" 
              type="date" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">تا تاریخ</label>
            <input 
              v-model="filters.to" 
              type="date" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
            <select 
              v-model="filters.status" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">همه</option>
              <option value="OPEN">باز</option>
              <option value="PAID">پرداخت شده</option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              @click="loadSettlements" 
              :disabled="loading"
              class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <span v-if="loading">در حال بارگذاری...</span>
              <span v-else>اعمال فیلتر</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Settlements List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">فهرست تسویه‌ها</h3>
        </div>
        
        <div v-if="loading" class="p-6 text-center text-gray-500">
          در حال بارگذاری...
        </div>
        
        <div v-else-if="error" class="p-6 text-center text-red-600">
          {{ error }}
        </div>
        
        <div v-else-if="settlements.length === 0" class="p-6 text-center text-gray-500">
          تسویه‌ای یافت نشد.
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شناسه</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دوره</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مبلغ کل</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سهم مکانیک</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سهم پلتفرم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="settlement in settlements" :key="settlement.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ settlement.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(settlement.periodFrom) }} تا {{ formatDate(settlement.periodTo) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(settlement.totals.eligible) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(settlement.totals.mechanic) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(settlement.totals.platform) }}
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
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <NuxtLink 
                    :to="`/vendor/settlements/${settlement.id}`"
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
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: true,
  layout: 'authenticated'
})

const { user } = useAuth()
const { get } = useApi()

// State
const loading = ref(false)
const error = ref('')
const settlements = ref<any[]>([])

// Filters
const filters = reactive({
  from: '',
  to: '',
  status: ''
})

// Computed
const vendorName = computed(() => user.value?.fullName || 'نامشخص')

// Methods
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fa-IR')
}

function formatNumber(value: any): string {
  if (!value) return '0'
  const num = typeof value === 'object' && value.toNumber ? value.toNumber() : Number(value)
  return num.toLocaleString('fa-IR')
}

async function loadSettlements() {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams()
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)
    if (filters.status) params.append('status', filters.status)
    
    // دریافت vendor ID از user context
    if (!user.value) {
      error.value = 'کاربر احراز هویت نشده'
      return
    }
    
    // ابتدا vendor ID را دریافت می‌کنیم
    const vendorResponse = await get('/api/vendors/me')
    const vendorId = vendorResponse.id
    
    const response = await get(`/api/vendors/${vendorId}/settlements?${params.toString()}`)
    settlements.value = response || []
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'خطا در بارگذاری تسویه‌ها'
    console.error('Error loading settlements:', err)
  } finally {
    loading.value = false
  }
}

// Load initial data
onMounted(() => {
  loadSettlements()
})
</script>

<template>
  <main class="p-6 space-y-6">
    <header class="space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">داشبورد مکانیک</h1>
          <p v-if="user">سلام، {{ user.fullName }}</p>
        </div>
      </div>
    </header>

    <!-- تب‌بندی -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8 rtl:space-x-reverse">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="() => selectTab(tab.id)"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            tab.id === activeTab
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- محتوای تب تسویه‌ها -->
    <div v-if="activeTab === 'settlements'" class="space-y-6">
      <!-- فیلترهای تسویه -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">فیلترها</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select 
              v-model="settlementFilters.status" 
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
              v-model="settlementFilters.from"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">تا تاریخ</label>
            <input 
              type="date" 
              v-model="settlementFilters.to"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="() => refreshSettlements()"
              class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              اعمال فیلتر
            </button>
          </div>
        </div>
      </div>

      <!-- لیست تسویه‌ها -->
      <div v-if="settlementsLoading" class="text-center py-12">
        <div class="text-gray-500">در حال بارگذاری...</div>
      </div>

      <div v-else-if="settlementsError" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="text-red-800">{{ settlementsError }}</div>
      </div>

      <div v-else-if="settlementsData && settlementsData.length" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">تسویه‌ها</h3>
          <p class="text-sm text-gray-500 mt-1">تعداد: {{ settlementsData.length }}</p>
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
              <tr v-for="settlement in settlementsData" :key="settlement.id" class="hover:bg-gray-50">
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

    <!-- محتوای تب تراکنش‌ها -->
    <div v-if="activeTab === 'transactions'" class="space-y-6">
      <section class="space-y-3">
        <!-- فیلترهای سریع تاریخ -->
        <div class="flex gap-2 items-center flex-wrap">
          <span class="text-sm font-medium text-gray-700">فیلترهای سریع:</span>
          <button 
            @click="setDateRange('today')" 
            class="px-3 py-1 text-xs border rounded hover:bg-gray-50"
          >
            امروز
          </button>
          <button 
            @click="setDateRange('last3days')" 
            class="px-3 py-1 text-xs border rounded hover:bg-gray-50"
          >
            ۳ روز گذشته
          </button>
          <button 
            @click="setDateRange('lastWeek')" 
            class="px-3 py-1 text-xs border rounded hover:bg-gray-50"
          >
            هفته گذشته
          </button>
          <button 
            @click="clearDateRange" 
            class="px-3 py-1 text-xs border rounded hover:bg-gray-50 text-red-600"
          >
            پاک کردن
          </button>
        </div>

        <!-- فیلترهای دستی -->
        <div class="flex gap-3 items-end flex-wrap">
          <div>
            <label class="block text-sm mb-1">از تاریخ</label>
            <input v-model="q.from" type="date" class="border px-2 py-1 rounded" />
          </div>
          <div>
            <label class="block text-sm mb-1">تا تاریخ</label>
            <input v-model="q.to" type="date" class="border px-2 py-1 rounded" />
          </div>
          <AppSelect
            v-model="q.status"
            label="وضعیت"
            placeholder="انتخاب کنید"
            :options="statusOptions"
          />
          <button @click="load" class="border px-3 py-1 rounded">اعمال فیلتر</button>
        </div>
      </section>

      <section v-if="loading">در حال بارگذاری…</section>
      <section v-else-if="errorMsg" class="text-red-600">{{ errorMsg }}</section>

      <section v-else-if="data" class="space-y-4">
        <div class="border rounded p-4">
          <p>تعداد تراکنش‌ها: <b>{{ data.count }}</b></p>
          <p>جمع سهم مکانیک: <b>{{ data.totalMechanic.toLocaleString() }}</b></p>
        </div>

        <AppTable :columns="tableColumns">
          <template #body>
            <tr v-for="(it, i) in data.items" :key="it.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ new Date(it.createdAt).toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.vendor }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.status }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.amountTotal.toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.amountEligible.toLocaleString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ it.mechanicAmount.toLocaleString() }}</td>
            </tr>
            <tr v-if="!data.items.length">
              <td class="px-6 py-4 text-center text-gray-500" colspan="7">موردی یافت نشد.</td>
            </tr>
          </template>
        </AppTable>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  auth: true
})

const router = useRouter()
const { user, hydrated } = useAuth()
const { get } = useApi()

onMounted(() => {
  if (hydrated.value && !user.value) return router.push('/login')
})

// تعریف تب‌ها
const tabs = [
  { id: 'settlements' as const, label: 'تسویه‌ها' },
  { id: 'transactions' as const, label: 'تراکنش‌ها' }
]

// state تب فعال
const activeTab = useState<'settlements'|'transactions'>('mechTab', () => 'settlements')

// فیلترهای تسویه
const settlementFilters = ref({
  status: '',
  from: '',
  to: ''
})

// فیلترهای تراکنش
const q = reactive<{ from?: string; to?: string; status?: string }>({})
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const data = ref<{ totalMechanic: number; count: number; items: any[] } | null>(null)

// تعریف ستون‌های جدول
const tableColumns = [
  { key: 'id', label: '#' },
  { key: 'createdAt', label: 'تاریخ' },
  { key: 'vendor', label: 'فروشگاه' },
  { key: 'status', label: 'وضعیت' },
  { key: 'amountTotal', label: 'مبلغ کل' },
  { key: 'amountEligible', label: 'مبلغ مشمول' },
  { key: 'mechanicAmount', label: 'سهم مکانیک' }
]

// گزینه‌های وضعیت
const statusOptions = [
  { value: '', label: 'همه' },
  { value: 'PENDING', label: 'در انتظار' },
  { value: 'SETTLED', label: 'تسویه‌شده' },
  { value: 'CANCELLED', label: 'لغو' }
]

// انتخاب تب
function selectTab(tabId: 'settlements' | 'transactions') {
  activeTab.value = tabId
  localStorage.setItem('mech_tab', tabId)
}

// بارگذاری تب از localStorage
onMounted(() => {
  const savedTab = localStorage.getItem('mech_tab')
  if (savedTab && (savedTab === 'settlements' || savedTab === 'transactions')) {
    activeTab.value = savedTab
  }
})

// واکشی تسویه‌ها
const { data: settlementsData, pending: settlementsLoading, error: settlementsError, refresh: refreshSettlements } = await useFetch(
  () => {
    const params = new URLSearchParams()
    if (settlementFilters.value.status) params.append('status', settlementFilters.value.status)
    if (settlementFilters.value.from) params.append('from', settlementFilters.value.from)
    if (settlementFilters.value.to) params.append('to', settlementFilters.value.to)
    
    return `/api/mechanic/settlements?${params.toString()}`
  },
  {
    key: () => `mechanic-settlements-${settlementFilters.value.status}-${settlementFilters.value.from}-${settlementFilters.value.to}`,
    default: () => [],
    watch: false
  }
)

async function load() {
  try {
    console.log('[MECHANIC PAGE] Starting load function')
    loading.value = true
    errorMsg.value = null
    const params = new URLSearchParams()
    if (q.from) params.set('from', q.from)
    if (q.to) params.set('to', q.to)
    if (q.status) params.set('status', q.status)
    const url = '/api/mechanic/transactions' + (params.toString() ? `?${params.toString()}` : '')
    console.log('[MECHANIC PAGE] Requesting URL:', url)
    console.log('[MECHANIC PAGE] Query params:', q)
    
    // اضافه کردن timeout و retry logic
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('[MECHANIC PAGE] Request timeout, aborting')
      controller.abort()
    }, 30000) // 30 ثانیه timeout
    
    try {
      data.value = await get(url, { signal: controller.signal })
      console.log('[MECHANIC PAGE] Response received:', data.value)
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        throw new Error('درخواست به دلیل timeout لغو شد')
      }
      throw fetchError
    } finally {
      clearTimeout(timeoutId)
    }
    
  } catch (e: any) {
    console.error('[MECHANIC PAGE] Error in load function:', e)
    errorMsg.value = e?.data?.statusMessage || e?.message || 'خطا در بارگذاری'
  } finally {
    loading.value = false
    console.log('[MECHANIC PAGE] Load function completed')
  }
}

// توابع فیلترهای سریع تاریخ
function setDateRange(range: 'today' | 'last3days' | 'lastWeek') {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (range) {
    case 'today':
      q.from = today.toISOString().split('T')[0]
      q.to = today.toISOString().split('T')[0]
      break
    case 'last3days':
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(today.getDate() - 3)
      q.from = threeDaysAgo.toISOString().split('T')[0]
      q.to = today.toISOString().split('T')[0]
      break
    case 'lastWeek':
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 7)
      q.from = lastWeek.toISOString().split('T')[0]
      q.to = today.toISOString().split('T')[0]
      break
  }
  
  // بارگذاری خودکار پس از تنظیم تاریخ
  load()
}

function clearDateRange() {
  q.from = undefined
  q.to = undefined
  q.status = undefined
  // بارگذاری خودکار پس از پاک کردن فیلترها
  load()
}

// بارگذاری اولیه
onMounted(() => {
  if (hydrated.value && user.value) {
    console.log('[MECHANIC PAGE] onMounted - starting initial load')
    if (activeTab.value === 'transactions') {
      load()
    }
  }
})

// watcher برای تغییرات user
watch([hydrated, user], ([newHydrated, newUser]) => {
  if (newHydrated && newUser && !loading.value) {
    console.log('[MECHANIC PAGE] User state changed, starting load')
    if (activeTab.value === 'transactions') {
      load()
    }
  }
}, { immediate: false })

// watcher برای تغییر تب
watch(activeTab, (newTab) => {
  if (newTab === 'transactions' && !data.value) {
    load()
  }
})

// توابع کمکی
import { formatJalali } from '~/utils/date'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}

function formatNumber(value: any): string {
  if (!value) return '0'
  const num = typeof value === 'object' && value.toNumber ? value.toNumber() : Number(value)
  return num.toLocaleString('fa-IR')
}
</script>

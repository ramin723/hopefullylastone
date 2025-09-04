<template>
  <div>
    <!-- Breadcrumbs -->
    <Breadcrumbs :items="[
      { label: 'ادمین', to: '/admin' },
      { label: 'تسویه‌ها' }
    ]" />

    <!-- عنوان صفحه -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">مدیریت تسویه‌ها</h1>
      <p class="text-gray-600 mt-2">مشاهده و مدیریت تمام تسویه‌های سیستم</p>
    </div>

    <!-- فیلترها -->
    <div class="bg-white p-4 rounded-lg border mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- تاریخ از -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاریخ از</label>
          <JalaliDatePicker
            v-model="filters.from"
            placeholder="1403-06-05 (شمسی)"
          />
        </div>

        <!-- تاریخ تا -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاریخ تا</label>
          <JalaliDatePicker
            v-model="filters.to"
            placeholder="1403-06-05 (شمسی)"
          />
        </div>

        <!-- وضعیت -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">همه</option>
            <option value="OPEN">باز</option>
            <option value="PAID">پرداخت شده</option>
          </select>
        </div>

        <!-- دکمه اعمال فیلتر -->
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
      <!-- دکمه‌های سریع تاریخ -->
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          @click="quickRange(7)"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          هفته گذشته
        </button>
        <button
          @click="quickRange(30)"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ماه گذشته
        </button>
      </div>
    </div>

    <!-- دکمه ساخت تسویه جدید -->
    <div class="mb-4">
      <NuxtLink
        to="/admin/settlements/new"
        class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <span>ساخت تسویه جدید</span>
      </NuxtLink>
    </div>

    <!-- جدول تسویه‌ها -->
    <div class="bg-white rounded-lg border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دوره</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مبلغ واجد شرایط</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مکانیک</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">پلتفرم</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ ایجاد</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="pending" class="animate-pulse">
              <td colspan="9" class="px-6 py-4 text-center text-gray-500">
                در حال بارگذاری...
              </td>
            </tr>
            <tr v-else-if="error" class="bg-red-50">
              <td colspan="9" class="px-6 py-4 text-center text-red-600">
                خطا در بارگذاری
              </td>
            </tr>
            <tr v-else-if="!settlementsData?.items?.length" class="bg-gray-50">
              <td colspan="9" class="px-6 py-4 text-center text-gray-500">
                هیچ تسویه‌ای یافت نشد
              </td>
            </tr>
            <tr v-else v-for="settlement in settlementsData.items" :key="settlement.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ settlement.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center gap-2">
                  <span>{{ settlement.vendor.name }}</span>
                  <span v-if="settlement.uniqueMechanicId" class="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    M#{{ settlement.uniqueMechanicId }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(settlement.periodFrom) }} تا {{ formatDate(settlement.periodTo) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatNumber(settlement.totals.eligible) }} تومان
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatNumber(settlement.totals.mechanic) }} تومان
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatNumber(settlement.totals.platform) }} تومان
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-yellow-100 text-yellow-800': settlement.status === 'OPEN',
                    'bg-green-100 text-green-800': settlement.status === 'PAID'
                  }"
                >
                  {{ settlement.status === 'OPEN' ? 'باز' : 'پرداخت شده' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(settlement.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <NuxtLink
                  :to="`/admin/settlements/${settlement.id}`"
                  class="text-blue-600 hover:text-blue-900"
                >
                  جزئیات
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- صفحه‌بندی -->
    <div v-if="settlementsData && settlementsData.count > settlementsData.pageSize" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        نمایش {{ (settlementsData.page - 1) * settlementsData.pageSize + 1 }} تا {{ Math.min(settlementsData.page * settlementsData.pageSize, settlementsData.count) }} از {{ settlementsData.count }} نتیجه
      </div>
      <div class="flex space-x-2 space-x-reverse">
        <button
          @click="changePage(settlementsData.page - 1)"
          :disabled="settlementsData.page <= 1"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          قبلی
        </button>
        <span class="px-3 py-2 text-sm text-gray-700">
          صفحه {{ settlementsData.page }} از {{ Math.ceil(settlementsData.count / settlementsData.pageSize) }}
        </span>
        <button
          @click="changePage(settlementsData.page + 1)"
          :disabled="settlementsData.page >= Math.ceil(settlementsData.count / settlementsData.pageSize)"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          بعدی
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { formatJalali } from '~/utils/date'
import { normalizeDateInputToISO, normalizeDateInputToISOEndOfDay } from '~/utils/date-ui'
import JalaliDatePicker from '~/components/JalaliDatePicker.vue'
definePageMeta({ 
  auth: true,
  layout: 'authenticated' 
})

// تعریف interface برای Settlement
interface Settlement {
  id: number
  vendor: {
    id: number
    name: string
  }
  periodFrom: string
  periodTo: string
  totals: {
    eligible: number
    mechanic: number
    platform: number
  }
  uniqueMechanicId?: number | null
  status: 'OPEN' | 'PAID'
  createdAt: string
  paidAt: string | null
}

// تعریف interface برای پاسخ API
interface SettlementsResponse {
  items: Settlement[]
  count: number
  page: number
  pageSize: number
}

// فیلترها
const filters = ref({
  from: '',
  to: '',
  status: '',
  page: 1,
  pageSize: 10
})

// پارامترهای تبدیل‌شده به ISO برای API
const queryParams = computed(() => ({
  from: filters.value.from ? normalizeDateInputToISO(filters.value.from) : undefined,
  to: filters.value.to ? normalizeDateInputToISOEndOfDay(filters.value.to) : undefined,
  status: filters.value.status || undefined,
  page: filters.value.page,
  pageSize: filters.value.pageSize
}))

// دریافت داده‌ها
const { data, pending, error, refresh } = await useFetch<SettlementsResponse>('/api/settlements', {
  query: queryParams,
  key: computed(() => `settlements-${queryParams.value.from}-${queryParams.value.to}-${queryParams.value.status}-${queryParams.value.page}-${queryParams.value.pageSize}`)
})

// computed برای دسترسی آسان‌تر به داده‌ها
const settlementsData = computed(() => data.value)

// اعمال فیلترها
function applyFilters() {
  filters.value.page = 1
  refresh()
}

watch(error, (e) => {
  if (e) {
    useToast().show('خطا در بارگذاری فهرست تسویه‌ها', 'error')
  }
})

function quickRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  
  // تبدیل به تاریخ شمسی
  const startJalali = `${start.getFullYear() + 621}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`
  const endJalali = `${end.getFullYear() + 621}-${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`
  
  filters.value.from = startJalali
  filters.value.to = endJalali
  applyFilters()
}

// تغییر صفحه
function changePage(newPage: number) {
  if (settlementsData.value) {
    filters.value.page = newPage
    refresh()
  }
}

// فرمت تاریخ
function formatDate(date: string | Date) {
  if (!date) return '-'
  return formatJalali(date)
}

// فرمت اعداد
function formatNumber(num: number) {
  if (!num) return '0'
  return new Intl.NumberFormat('fa-IR').format(num)
}
</script>

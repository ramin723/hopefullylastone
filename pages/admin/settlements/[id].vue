<template>
  <div>
    <!-- عنوان صفحه -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">جزئیات تسویه #{{ settlementId }}</h1>
          <p class="text-gray-600 mt-2">مشاهده و مدیریت تسویه</p>
        </div>
        <NuxtLink
          to="/admin/settlements"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          بازگشت به فهرست
        </NuxtLink>
      </div>
    </div>

    <!-- لودینگ -->
    <div v-if="pending" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">در حال بارگذاری...</p>
    </div>

    <!-- خطا -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- محتوای اصلی -->
    <div v-else-if="settlement" class="space-y-6">
      <!-- کارت خلاصه -->
      <div class="bg-white rounded-lg border p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">خلاصه تسویه</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Vendor -->
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Vendor</label>
            <p class="text-lg font-medium text-gray-900">{{ settlement.vendor.name }}</p>
          </div>

          <!-- دوره -->
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">دوره</label>
            <p class="text-lg font-medium text-gray-900">
              {{ formatDate(settlement.periodFrom) }} تا {{ formatDate(settlement.periodTo) }}
            </p>
          </div>

          <!-- وضعیت -->
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">وضعیت</label>
            <span
              :class="{
                'px-3 py-1 text-sm font-medium rounded-full': true,
                'bg-yellow-100 text-yellow-800': settlement.status === 'OPEN',
                'bg-green-100 text-green-800': settlement.status === 'PAID'
              }"
            >
              {{ settlement.status === 'OPEN' ? 'باز' : 'پرداخت شده' }}
            </span>
          </div>

          <!-- تاریخ ایجاد -->
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">تاریخ ایجاد</label>
            <p class="text-lg font-medium text-gray-900">{{ formatDate(settlement.createdAt) }}</p>
          </div>

          <!-- تاریخ پرداخت -->
          <div v-if="settlement.paidAt">
            <label class="block text-sm font-medium text-gray-500 mb-1">تاریخ پرداخت</label>
            <p class="text-lg font-medium text-gray-900">{{ formatDate(settlement.paidAt) }}</p>
          </div>
        </div>

        <!-- مبالغ -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-md font-semibold text-gray-900 mb-3">مبالغ</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <label class="block text-sm font-medium text-blue-600 mb-1">مبلغ واجد شرایط</label>
              <p class="text-xl font-bold text-blue-900">{{ formatNumber(settlement.totals.eligible) }} تومان</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <label class="block text-sm font-medium text-green-600 mb-1">سهم مکانیک</label>
              <p class="text-xl font-bold text-green-900">{{ formatNumber(settlement.totals.mechanic) }} تومان</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <label class="block text-sm font-medium text-purple-600 mb-1">سهم پلتفرم</label>
              <p class="text-xl font-bold text-purple-900">{{ formatNumber(settlement.totals.platform) }} تومان</p>
            </div>
          </div>
        </div>

        <!-- اکشن‌ها -->
        <div v-if="settlement.status === 'OPEN'" class="mt-6 pt-6 border-t border-gray-200">
          <button
            @click="markAsPaid"
            :disabled="markingPaid"
            class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <svg v-if="markingPaid" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>{{ markingPaid ? 'در حال پرداخت...' : 'علامت‌گذاری به عنوان پرداخت شده' }}</span>
          </button>
        </div>
      </div>

      <!-- جدول آیتم‌ها -->
      <div class="bg-white rounded-lg border overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">آیتم‌های تسویه</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ID تراکنش</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مکانیک</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">شماره مشتری</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کل</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">واجد شرایط</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سهم مکانیک</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سهم پلتفرم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">یادداشت</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in settlement.items" :key="item.txId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.txId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div class="font-medium">{{ item.mechanic.name }}</div>
                    <div class="text-gray-500 text-xs">{{ item.mechanic.code }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ maskPhone(item.customerPhone) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(item.amounts.total) }} تومان
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(item.amounts.eligible) }} تومان
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(item.amounts.mechanic) }} تومان
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatNumber(item.amounts.platform) }} تومان
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ item.note || '-' }}
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
import { useToast } from '~/composables/useToast'
import { formatJalali } from '~/utils/date'

// تعریف interface برای Settlement Item
interface SettlementItem {
  txId: number
  createdAt: string
  customerPhone: string
  note: string | null
  mechanic: {
    id: number
    name: string
    code: string
  }
  amounts: {
    total: number
    eligible: number
    mechanic: number
    platform: number
  }
  commission: {
    rateMechanic: number
    ratePlatform: number
  } | null
}

// تعریف interface برای Settlement
interface Settlement {
  id: number
  vendor: {
    id: number
    name: string
    city: string
  }
  periodFrom: string
  periodTo: string
  totals: {
    eligible: number
    mechanic: number
    platform: number
  }
  status: 'OPEN' | 'PAID'
  createdAt: string
  paidAt: string | null
  items: SettlementItem[]
}

// دریافت ID از route
const route = useRoute()
const settlementId = route.params.id

// دریافت داده‌های تسویه
const { data: settlement, pending, error, refresh } = await useFetch<Settlement>(`/api/settlements/${settlementId}`)

// وضعیت mark as paid
const markingPaid = ref(false)

// علامت‌گذاری به عنوان پرداخت شده
async function markAsPaid() {
  if (!settlement.value) return
  
  try {
    markingPaid.value = true
    
    const { csrfFetch } = useApi()
    await csrfFetch(`/api/settlements/${settlementId}/mark-paid`, {
      method: 'POST'
    })
    
    // refresh صفحه
    await refresh()
    useToast().show('تسویه پرداخت شد', 'success')
    
  } catch (err: any) {
    console.warn('Error marking settlement as paid:', err)
    useToast().show(err?.data?.statusMessage || 'خطا در علامت‌گذاری به عنوان پرداخت شده', 'error')
  } finally {
    markingPaid.value = false
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

// مخفی کردن شماره تلفن
function maskPhone(phone: string) {
  if (!phone) return '-'
  if (phone.length <= 4) return phone
  return phone.slice(0, 4) + '*'.repeat(phone.length - 4)
}
</script>

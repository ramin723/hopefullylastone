<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900">هاب مکانیک</h1>
          <p class="mt-2 text-xl text-gray-600">سلام، {{ mechanicName }}</p>
          <p class="mt-1 text-gray-500">لطفاً یکی از گزینه‌های زیر را انتخاب کنید</p>
        </div>
      </div>

      <!-- Main Hub Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Transactions Card -->
        <NuxtLink 
          to="/mechanic/transactions"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">تراکنش‌ها</h3>
            <p class="text-sm text-gray-600">مشاهده و مدیریت تراکنش‌های انجام شده</p>
          </div>
        </NuxtLink>

        <!-- Settlements Card -->
        <NuxtLink 
          to="/mechanic/settlements"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">تسویه‌ها</h3>
            <p class="text-sm text-gray-600">پیگیری وضعیت تسویه‌های مالی</p>
          </div>
        </NuxtLink>

        <!-- New Order Card - Highlighted -->
        <NuxtLink 
          to="/mechanic/orders/new"
          class="group bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-green-300"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-300 transition-colors">
              <svg class="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-900 mb-2">سفارش جدید</h3>
            <p class="text-sm text-green-700">ایجاد سفارش جدید و اشتراک‌گذاری QR</p>
            <div class="mt-3 text-xs text-green-600 bg-green-200 rounded-full px-3 py-1 inline-block">
              🚀 سریع و آسان
            </div>
          </div>
        </NuxtLink>

        <!-- My Orders Card - Highlighted -->
        <NuxtLink 
          to="/mechanic/orders"
          class="group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-300 transition-colors">
              <svg class="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-blue-900 mb-2">لیست سفارش‌ها</h3>
            <p class="text-sm text-blue-700">مشاهده و مدیریت سفارش‌های ایجاد شده</p>
            <div class="mt-3 text-xs text-blue-600 bg-blue-200 rounded-full px-3 py-1 inline-block">
              📋 مدیریت کامل
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Quick Guide Section -->
      <div class="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 class="text-2xl font-bold text-blue-900 mb-4 text-center">راهنمای سریع</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start space-x-3 rtl:space-x-reverse">
            <div class="flex-shrink-0 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 font-bold">1</span>
            </div>
            <div>
              <h3 class="font-semibold text-blue-900 mb-1">سفارش جدید</h3>
              <p class="text-sm text-blue-700">روی کارت سبز کلیک کنید تا سفارش جدید ایجاد کنید</p>
            </div>
          </div>
          <div class="flex items-start space-x-3 rtl:space-x-reverse">
            <div class="flex-shrink-0 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 font-bold">2</span>
            </div>
            <div>
              <h3 class="font-semibold text-blue-900 mb-1">مدیریت سفارش‌ها</h3>
              <p class="text-sm text-blue-700">روی کارت آبی کلیک کنید تا سفارش‌های خود را ببینید</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Section -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">آمار سریع</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalTransactions || 0 }}</div>
            <div class="text-gray-600">کل تراکنش‌ها</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ stats.totalOrders || 0 }}</div>
            <div class="text-gray-600">کل سفارش‌ها</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-3xl font-bold text-indigo-600 mb-2">{{ formatCurrency(stats.totalEarnings || 0) }}</div>
            <div class="text-gray-600">کل درآمد</div>
          </div>
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

// Computed
const mechanicName = computed(() => user.value?.fullName || 'نامشخص')

// Stats state
const stats = ref({
  totalTransactions: 0,
  totalOrders: 0,
  totalEarnings: 0
})

// Fetch quick stats
const { data: statsData } = await useFetch('/api/mechanic/stats', {
  key: 'mechanic-hub-stats',
  default: () => ({ totalTransactions: 0, totalOrders: 0, totalEarnings: 0 }),
  watch: false
})

// Watch stats data
watch(statsData, (newData) => {
  if (newData && typeof newData === 'object' && 'totalTransactions' in newData) {
    stats.value = {
      totalTransactions: (newData as any).totalTransactions || 0,
      totalOrders: (newData as any).totalOrders || 0,
      totalEarnings: (newData as any).totalEarnings || 0
    }
  }
}, { immediate: true })

// Utility functions
function formatCurrency(amount: any): string {
  if (!amount) return '0 تومان'
  const num = typeof amount === 'object' && amount.toNumber ? amount.toNumber() : Number(amount)
  return num.toLocaleString('fa-IR') + ' تومان'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <!-- آیکون بزرگ تعمیرگاه -->
        <div class="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        
        <!-- متن خوش‌آمدگویی -->
        <h1 class="text-3xl font-bold text-gray-800 mb-2">تعمیرگاه {{ mechanicName }}</h1>
        <p class="text-lg text-gray-600">خوش آمدید</p>
      </div>

      <!-- Quick Summary (Optional) -->
      <div class="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 mb-8 border border-white/20">
        <div class="text-center">
          <h2 class="text-lg font-medium text-gray-800 mb-2">خلاصه سریع</h2>
          <p class="text-gray-600">برای شروع کار، یکی از گزینه‌های زیر را انتخاب کنید</p>
        </div>
      </div>

      <!-- Main Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- سفارش جدید Card -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
          <div class="mb-6">
            <div class="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-4">سفارش جدید</h3>
          <p class="text-gray-600 mb-6">ایجاد سفارش جدید و اشتراک‌گذاری QR</p>
          
          <NuxtLink 
            to="/mechanic/orders/new"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 w-full justify-center shadow-lg hover:shadow-xl"
          >
            شروع سفارش جدید
            <svg class="mr-2 w-5 h-5 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>

        <!-- لیست سفارش‌ها Card -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
          <div class="mb-6">
            <div class="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-4">لیست سفارش‌ها</h3>
          <p class="text-gray-600 mb-6">مشاهده و مدیریت سفارش‌های ایجاد شده</p>
          
          <NuxtLink 
            to="/mechanic/orders"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-full justify-center shadow-lg hover:shadow-xl"
          >
            مشاهده سفارش‌ها
            <svg class="mr-2 w-5 h-5 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- Additional Options -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- تراکنش‌ها Card -->
        <NuxtLink 
          to="/mechanic/transactions"
          class="group bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-orange-300/70"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-300 transition-colors">
              <svg class="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-orange-900 mb-2">تراکنش‌ها</h3>
            <p class="text-sm text-orange-700">مشاهده و مدیریت تراکنش‌های انجام شده</p>
            <div class="mt-3 text-xs text-orange-600 bg-orange-200 rounded-full px-3 py-1 inline-block">
              💰 مدیریت مالی
            </div>
          </div>
        </NuxtLink>

        <!-- تسویه‌ها Card -->
        <NuxtLink 
          to="/mechanic/settlements"
          class="group bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-green-300/70"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-300 transition-colors">
              <svg class="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-900 mb-2">تسویه‌ها</h3>
            <p class="text-sm text-green-700">پیگیری وضعیت تسویه‌های مالی</p>
            <div class="mt-3 text-xs text-green-600 bg-green-200 rounded-full px-3 py-1 inline-block">
              📊 پیگیری درآمد
            </div>
          </div>
        </NuxtLink>

        <!-- پروفایل Card -->
        <NuxtLink 
          to="/profile/edit"
          class="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300/70"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-300 transition-colors">
              <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">پروفایل</h3>
            <p class="text-sm text-gray-700">مدیریت اطلاعات شخصی و تعمیرگاه</p>
            <div class="mt-3 text-xs text-gray-600 bg-gray-200 rounded-full px-3 py-1 inline-block">
              ⚙️ تنظیمات
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Quick Guide Section -->
      <div class="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <h2 class="text-2xl font-bold text-orange-900 mb-4 text-center">راهنمای سریع</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start space-x-3 rtl:space-x-reverse">
            <div class="flex-shrink-0 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
              <span class="text-orange-700 font-bold">1</span>
            </div>
            <div>
              <h3 class="font-semibold text-orange-900 mb-1">سفارش جدید</h3>
              <p class="text-sm text-orange-700">روی کارت نارنجی کلیک کنید تا سفارش جدید ایجاد کنید</p>
            </div>
          </div>
          <div class="flex items-start space-x-3 rtl:space-x-reverse">
            <div class="flex-shrink-0 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
              <span class="text-orange-700 font-bold">2</span>
            </div>
            <div>
              <h3 class="font-semibold text-orange-900 mb-1">مدیریت سفارش‌ها</h3>
              <p class="text-sm text-orange-700">روی کارت آبی کلیک کنید تا سفارش‌های خود را ببینید</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Section -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">آمار سریع</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border border-white/20">
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ stats.totalTransactions || 0 }}</div>
            <div class="text-gray-600">کل تراکنش‌ها</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border border-white/20">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalOrders || 0 }}</div>
            <div class="text-gray-600">کل سفارش‌ها</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border border-white/20">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ formatCurrency(stats.totalEarnings || 0) }}</div>
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
  layout: 'authenticated',
  roles: ['MECHANIC']
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

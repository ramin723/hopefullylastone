<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-gray-900">خانه فروشگاه</h1>
        <p class="mt-4 text-xl text-gray-600">خوش آمدید، {{ vendorName }}</p>
      </div>

      <!-- Quick Summary (Optional) -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <div class="text-center">
          <h2 class="text-lg font-medium text-gray-900 mb-2">خلاصه سریع</h2>
          <p class="text-gray-600">برای شروع کار، یکی از گزینه‌های زیر را انتخاب کنید</p>
        </div>
      </div>

      <!-- Main Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- ثبت تراکنش Card -->
        <div class="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-xl transition-shadow duration-300">
          <div class="mb-6">
            <div class="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-4">ثبت تراکنش</h3>
          <p class="text-gray-600 mb-6">ثبت فروش جدید و محاسبه کمیسیون</p>
          
          <NuxtLink 
            to="/vendor/pos"
            class="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 w-full justify-center"
          >
            شروع ثبت تراکنش
            <svg class="mr-2 w-5 h-5 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>

        <!-- تسویه‌ها Card -->
        <div class="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-xl transition-shadow duration-300">
          <div class="mb-6">
            <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-4">تسویه‌ها</h3>
          <p class="text-gray-600 mb-6">مشاهده و پیگیری تسویه‌های مالی</p>
          
          <NuxtLink 
            to="/vendor/settlements"
            class="inline-flex items-center px-8 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 w-full justify-center"
          >
            مشاهده تسویه‌ها
            <svg class="mr-2 w-5 h-5 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- Additional Options -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- آمار و تحلیل Card -->
        <NuxtLink 
          to="/vendor/stats"
          class="group bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-300"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-300 transition-colors">
              <svg class="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-purple-900 mb-2">آمار و تحلیل</h3>
            <p class="text-sm text-purple-700">مشاهده آمار پیشرفته و نمودارهای تحلیلی</p>
            <div class="mt-3 text-xs text-purple-600 bg-purple-200 rounded-full px-3 py-1 inline-block">
              📊 تحلیل عمیق
            </div>
          </div>
        </NuxtLink>

        <!-- تراکنش‌ها Card -->
        <NuxtLink 
          to="/vendor/transactions"
          class="group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-300 transition-colors">
              <svg class="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-blue-900 mb-2">تراکنش‌ها</h3>
            <p class="text-sm text-blue-700">مشاهده و مدیریت تمام تراکنش‌ها</p>
            <div class="mt-3 text-xs text-blue-600 bg-blue-200 rounded-full px-3 py-1 inline-block">
              📋 مدیریت کامل
            </div>
          </div>
        </NuxtLink>

        <!-- پروفایل Card -->
        <NuxtLink 
          to="/profile/edit"
          class="group bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300"
        >
          <div class="p-6 text-center">
            <div class="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-300 transition-colors">
              <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">پروفایل</h3>
            <p class="text-sm text-gray-700">مدیریت اطلاعات شخصی و فروشگاه</p>
            <div class="mt-3 text-xs text-gray-600 bg-gray-200 rounded-full px-3 py-1 inline-block">
              ⚙️ تنظیمات
            </div>
          </div>
        </NuxtLink>
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
</script>

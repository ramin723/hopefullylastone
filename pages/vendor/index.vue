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
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: 'authenticated',
  auth: true
})

const { user } = useAuth()

// Computed
const vendorName = computed(() => user.value?.fullName || 'نامشخص')
</script>

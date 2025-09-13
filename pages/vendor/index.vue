<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <!-- آیکون بزرگ فروشگاه -->
        <div class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        
        <!-- متن خوش‌آمدگویی -->
        <h1 class="text-3xl font-bold text-gray-800 mb-2">فروشگاه {{ vendorName }}</h1>
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
        <!-- ثبت تراکنش Card -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
          <div class="mb-6">
            <div class="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-4">ثبت تراکنش</h3>
          <p class="text-gray-600 mb-6">ثبت فروش جدید و محاسبه کمیسیون</p>
          
          <NuxtLink 
            to="/vendor/pos"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 w-full justify-center shadow-lg hover:shadow-xl"
          >
            شروع ثبت تراکنش
            <svg class="mr-2 w-5 h-5 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>

        <!-- تسویه‌ها Card -->
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
          <div class="mb-6">
            <div class="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-4">تسویه‌ها</h3>
          <p class="text-gray-600 mb-6">مشاهده و پیگیری تسویه‌های مالی</p>
          
          <NuxtLink 
            to="/vendor/settlements"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 w-full justify-center shadow-lg hover:shadow-xl"
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
          class="group bg-white/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-300/70"
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
          class="group bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300/70"
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
          class="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-300/70"
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

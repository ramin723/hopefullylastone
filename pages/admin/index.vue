<template>
  <div>
    <Breadcrumbs :items="[
      { label: 'ادمین' }
    ]" />

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">پنل مدیریت</h1>
      <p class="mt-2 text-xl text-gray-600">خوش آمدید، {{ adminName }}</p>
    </div>

    <!-- Quick Stats -->
    <div v-if="loadingStats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white rounded-lg shadow p-6 animate-pulse">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
          <div class="ml-4 flex-1">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="errorStats" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
      <p class="text-red-600 text-center">{{ errorStats }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">مکانیک‌ها</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.mechanics || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">سفارش‌ها</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.orders || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">تراکنش‌ها</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.transactions || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">فروشگاه‌ها</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.vendors || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Management Sections -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- مکانیک‌ها -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="ml-3 text-lg font-medium text-gray-900">مکانیک‌ها</h3>
        </div>
        <p class="text-gray-600 mb-4">مدیریت مکانیک‌ها، ایجاد کدهای QR و نظارت بر فعالیت‌ها</p>
        <div class="space-y-3">
          <NuxtLink
            to="/admin/mechanics"
            class="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            مدیریت مکانیک‌ها
          </NuxtLink>
          <NuxtLink
            to="/admin/mechanics/new"
            class="block w-full bg-blue-100 text-blue-700 text-center py-2 px-4 rounded-md hover:bg-blue-200 transition-colors"
          >
            ایجاد مکانیک جدید
          </NuxtLink>
        </div>
      </div>

      <!-- سفارش‌ها -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="ml-3 text-lg font-medium text-gray-900">سفارش‌ها</h3>
        </div>
        <p class="text-gray-600 mb-4">نظارت بر سفارش‌های مشتریان و وضعیت آن‌ها</p>
        <div class="space-y-3">
          <NuxtLink
            to="/admin/orders"
            class="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            مشاهده سفارش‌ها
          </NuxtLink>
          <div class="text-sm text-gray-500 text-center">
            سیستم سفارش آنلاین
          </div>
        </div>
      </div>

      <!-- تسویه‌ها -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <h3 class="ml-3 text-lg font-medium text-gray-900">تسویه‌ها</h3>
        </div>
        <p class="text-gray-600 mb-4">مدیریت تسویه‌های مکانیک‌ها و فروشگاه‌ها</p>
        <div class="space-y-3">
          <NuxtLink
            to="/admin/settlements"
            class="block w-full bg-yellow-600 text-white text-center py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
          >
            مدیریت تسویه‌ها
          </NuxtLink>
          <NuxtLink
            to="/admin/settlements/new"
            class="block w-full bg-yellow-100 text-yellow-700 text-center py-2 px-4 rounded-md hover:bg-yellow-200 transition-colors"
          >
            ایجاد تسویه جدید
          </NuxtLink>
        </div>
      </div>

      <!-- گزارشات -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="ml-3 text-lg font-medium text-gray-900">گزارشات</h3>
        </div>
        <p class="text-gray-600 mb-4">گزارشات تحلیلی و آمار سیستم</p>
        <div class="space-y-3">
          <button
            @click="generateReport"
            :disabled="generatingReport"
            class="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <span v-if="generatingReport">در حال تولید...</span>
            <span v-else>تولید گزارش</span>
          </button>
          <div class="text-sm text-gray-500 text-center">
            گزارش جامع سیستم
          </div>
        </div>
      </div>

      <!-- تنظیمات -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <div class="p-3 rounded-full bg-gray-100 text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 class="ml-3 text-lg font-medium text-gray-900">تنظیمات</h3>
        </div>
        <p class="text-gray-600 mb-4">تنظیمات سیستم و پیکربندی</p>
        <div class="space-y-3">
          <button
            @click="showSettings = true"
            class="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            تنظیمات سیستم
          </button>
          <div class="text-sm text-gray-500 text-center">
            پیکربندی و تنظیمات
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-8 bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">فعالیت‌های اخیر</h3>
      </div>
      <div class="p-6">
        <div v-if="loadingActivity" class="space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center space-x-3 rtl:space-x-reverse animate-pulse">
            <div class="w-8 h-8 rounded-full bg-gray-200"></div>
            <div class="flex-1 min-w-0">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div v-else-if="errorActivity" class="text-center text-red-600 py-8">
          {{ errorActivity }}
        </div>
        <div v-else-if="recentActivity.length === 0" class="text-center text-gray-500 py-8">
          هیچ فعالیتی یافت نشد
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="text-sm font-medium text-gray-600">{{ activity.type[0] }}</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(activity.createdAt) }}</p>
            </div>
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

// State
const stats = ref({
  mechanics: 0,
  orders: 0,
  transactions: 0,
  vendors: 0
})

const recentActivity = ref<any[]>([])
const generatingReport = ref(false)
const showSettings = ref(false)

// Computed
const adminName = computed(() => 'مدیر سیستم')

// Methods
async function generateReport() {
  generatingReport.value = true
  
  try {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    useToast().show('گزارش با موفقیت تولید شد', 'success')
  } catch (error) {
    useToast().show('خطا در تولید گزارش', 'error')
  } finally {
    generatingReport.value = false
  }
}

function formatDate(date: string | Date): string {
  return formatJalali(date)
}

// Loading states
const loadingStats = ref(false)
const loadingActivity = ref(false)
const errorStats = ref('')
const errorActivity = ref('')

// Fetch initial data
onMounted(async () => {
  // Fetch stats
  loadingStats.value = true
  try {
    const statsResponse = await $fetch('/api/admin/stats') as any
    if (statsResponse?.ok) {
      stats.value = statsResponse.stats || {}
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    errorStats.value = 'خطا در بارگذاری آمار'
  } finally {
    loadingStats.value = false
  }
  
  // Fetch recent activity
  loadingActivity.value = true
  try {
    const activityResponse = await $fetch('/api/admin/activity') as any
    if (activityResponse?.ok) {
      recentActivity.value = activityResponse.activities || []
    }
  } catch (error) {
    console.error('Error fetching admin activity:', error)
    errorActivity.value = 'خطا در بارگذاری فعالیت‌ها'
  } finally {
    loadingActivity.value = false
  }
})

// Composables
import { useToast } from '~/composables/useToast'
import { formatJalali } from '~/utils/date'
</script>

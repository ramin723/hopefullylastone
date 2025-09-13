<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with Back Button -->
      <div class="mb-8">
        <!-- دکمه برگشت مینیمال -->
        <div class="mb-6">
          <button 
            @click="$router.push('/mechanic')"
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <div class="w-8 h-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-white transition-all duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </div>
            <span class="text-sm font-medium">بازگشت</span>
          </button>
        </div>

        <div>
          <h1 class="text-3xl font-bold text-gray-900">سفارش‌های من</h1>
          <p class="mt-2 text-gray-600">لیست تمام سفارش‌های ایجاد شده</p>
        </div>
      </div>

      <!-- فیلترها -->
      <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-8 border border-white/20">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">فیلترها و جستجو</h2>
          <p class="text-sm text-gray-600">سفارش‌های خود را فیلتر کنید</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <AppSelect
              v-model="filters.status"
              :options="[
                { value: '', label: 'همه' },
                { value: 'PENDING', label: 'در انتظار' },
                { value: 'CONSUMED', label: 'مصرف شده' }
              ]"
              @change="applyFilters"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">جستجو (شماره تلفن)</label>
            <AppInput
              v-model="filters.search"
              placeholder="09120000000"
              @input="debouncedSearch"
            />
          </div>
          
          <div class="flex items-end">
            <AppButton @click="applyFilters" variant="secondary" class="w-full px-6 py-3">
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              اعمال فیلتر
            </AppButton>
          </div>
        </div>
      </div>

      <!-- لیست سفارش‌ها -->
      <div v-if="loading" class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          <p class="mt-4 text-gray-600 text-lg">در حال بارگذاری سفارش‌ها...</p>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">خطا در بارگذاری سفارش‌ها</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="refresh()"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            تلاش مجدد
          </button>
        </div>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-16">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 border border-white/20">
          <div class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">هیچ سفارشی یافت نشد</h3>
          <p class="text-gray-600 mb-6">هنوز سفارشی ایجاد نکرده‌اید</p>
          <NuxtLink 
            to="/mechanic/orders/new"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            ایجاد سفارش جدید
          </NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div class="flex justify-between items-start mb-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <div class="font-mono text-xl font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-lg">
                  {{ order.code }}
                </div>
                <button
                  @click="copyOrderCode(order.code)"
                  class="text-orange-400 hover:text-orange-600 p-2 rounded-lg hover:bg-orange-50 transition-all duration-200"
                  title="کپی کد"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
              <div class="text-sm text-gray-600 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <span
                :class="{
                  'px-3 py-2 rounded-xl text-sm font-semibold': true,
                  'bg-yellow-100 text-yellow-800 border border-yellow-200': order.status === 'PENDING',
                  'bg-green-100 text-green-800 border border-green-200': order.status === 'CONSUMED'
                }"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <div class="text-sm font-medium text-blue-800">مشتری</div>
              </div>
              <div class="font-semibold text-gray-900">{{ order.customerPhone }}</div>
            </div>
            
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <div class="text-sm font-medium text-green-800">آیتم‌های سفارش</div>
              </div>
              <div class="space-y-1">
                <div v-if="order.items && order.items.length > 0" class="text-xs text-gray-700">
                  <div v-for="(item, index) in order.items.slice(0, 3)" :key="index" class="flex justify-between items-center">
                    <span class="truncate flex-1">{{ item.title }}</span>
                    <span class="text-green-600 font-medium mr-2">×{{ item.quantity }}</span>
                  </div>
                  <div v-if="order.items.length > 3" class="text-green-600 font-medium text-center mt-1">
                    +{{ order.items.length - 3 }} آیتم دیگر
                  </div>
                </div>
                <div v-else class="text-xs text-gray-500">
                  {{ order.itemCount || 0 }} آیتم
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="order.note" class="mb-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <div class="text-sm font-medium text-gray-800">یادداشت</div>
            </div>
            <div class="text-sm text-gray-700">{{ order.note }}</div>
          </div>
          
          <!-- Actions for PENDING orders only -->
          <div v-if="order.status === 'PENDING'" class="flex flex-wrap gap-2">
            <button
              @click="copyOrderLink(order)"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200"
              title="کپی لینک"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              کپی
            </button>
            
            <button
              @click="openOrderLink(order)"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-green-600 hover:text-green-800 text-xs font-medium border border-green-200 rounded-lg hover:bg-green-50 transition-all duration-200"
              title="باز کردن لینک"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              باز کردن
            </button>
            
            <button
              @click="sendOrderSMS(order)"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-purple-600 hover:text-purple-800 text-xs font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-200"
              title="ارسال SMS"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              SMS
            </button>
          </div>
          
          <!-- Status display for non-PENDING orders -->
          <div v-else class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm text-gray-600">{{ getStatusDescription(order.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="hasMorePages" class="mt-8 flex justify-center">
        <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-4 border border-white/20">
          <div class="flex items-center gap-3">
            <button 
              @click="previousPage"
              :disabled="filters.page <= 1"
              class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              قبلی
            </button>
            <span class="px-4 py-2 text-sm font-medium text-gray-700 bg-orange-100 rounded-xl">صفحه {{ filters.page }}</span>
            <button 
              @click="nextPage"
              class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              بعدی
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
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

const router = useRouter()
const { user } = useAuth()
const { show } = useToast()
const { post } = useApi()

// State
const loading = ref(false)
const error = ref('')
const orders = ref<any[]>([])
const hasMorePages = ref(false)

// Filters
const filters = ref({
  status: '',
  search: '',
  page: 1,
  pageSize: 20
})

// Fetch orders with stable key
const { data, pending, error: fetchError, refresh } = await useFetch(
  () => {
    const params = new URLSearchParams()
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.search) params.append('search', filters.value.search)
    params.append('page', filters.value.page.toString())
    params.append('pageSize', filters.value.pageSize.toString())
    
    return `/api/mechanic/orders?${params.toString()}`
  },
  {
    key: () => `mech-orders-${filters.value.status}-${filters.value.search}-${filters.value.page}-${filters.value.pageSize}`,
    default: () => ({ items: [], count: 0 }),
    watch: false
  }
)

// Watch data changes
watch(data, (newData: any) => {
  if (newData) {
    orders.value = newData.items || []
    hasMorePages.value = (newData.items || []).length === filters.value.pageSize
  }
}, { immediate: true })

// Watch loading and error
watch(pending, (newPending) => {
  loading.value = newPending
})

watch(fetchError, (newError) => {
  error.value = newError?.data?.statusMessage || newError?.message || 'خطا در بارگذاری'
})

// Methods
function applyFilters() {
  filters.value.page = 1
  refresh()
}

function debouncedSearch() {
  // Simple debounce - reset page and refresh after 500ms
  clearTimeout((window as any).searchTimeout)
  ;(window as any).searchTimeout = setTimeout(() => {
    filters.value.page = 1
    refresh()
  }, 500)
}

function nextPage() {
  filters.value.page++
  refresh()
}

function previousPage() {
  if (filters.value.page > 1) {
    filters.value.page--
    refresh()
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING': return 'در انتظار'
    case 'CONSUMED': return 'مصرف شده'
    case 'CANCELLED': return 'لغو شده'
    case 'EXPIRED': return 'منقضی شده'
    default: return status
  }
}

function maskPhone(phone: string): string {
  if (!phone || phone.length <= 5) return '***'
  return `${phone.slice(0, 3)}***${phone.slice(-2)}`
}

function formatDate(date: string | Date): string {
  return formatJalali(date)
}

function copyOrderCode(code: string) {
  navigator.clipboard.writeText(code)
    .then(() => show('کد سفارش کپی شد', 'success'))
    .catch(() => show('خطا در کپی کردن کد', 'error'))
}

function shareOrder(order: any) {
  const shareUrl = `${window.location.origin}/o/${order.code}`
  
  if (navigator.share) {
    navigator.share({
      title: 'سفارش جدید',
      text: `سفارش شما آماده است`,
      url: shareUrl
    }).catch(() => {
      // Fallback to copy
      copyShareUrl(shareUrl)
    })
  } else {
    copyShareUrl(shareUrl)
  }
}

function copyShareUrl(url: string) {
  navigator.clipboard.writeText(url)
    .then(() => show('لینک اشتراک‌گذاری کپی شد', 'success'))
    .catch(() => show('خطا در کپی کردن لینک', 'error'))
}

async function copyOrderLink(order: any) {
  const siteUrl = config.public.siteUrl || window.location.origin
  const shareUrl = `${siteUrl}/o/${order.code}`
  
  navigator.clipboard.writeText(shareUrl)
    .then(() => show('لینک سفارش کپی شد', 'success'))
    .catch(() => show('خطا در کپی کردن لینک', 'error'))
}

function openOrderLink(order: any) {
  const siteUrl = config.public.siteUrl || window.location.origin
  const shareUrl = `${siteUrl}/o/${order.code}`
  
  window.open(shareUrl, '_blank')
}

function getStatusDescription(status: string): string {
  switch (status) {
    case 'CONSUMED': return 'این سفارش قبلاً مصرف شده است'
    case 'CANCELLED': return 'این سفارش لغو شده است'
    case 'EXPIRED': return 'این سفارش منقضی شده است'
    default: return `وضعیت: ${getStatusLabel(status)}`
  }
}

async function sendOrderSMS(order: any) {
  try {
    const siteUrl = config.public.siteUrl || window.location.origin
    const shareUrl = `${siteUrl}/o/${order.code}`
    
    // Use post from useApi() to include CSRF token
    const response = await post('/api/notify/sms', {
      phone: order.customerPhone,
      text: `لینک سفارش شما: ${shareUrl}`
    })
    
    show('درخواست SMS ثبت شد', 'success')
    
  } catch (error: any) {
    console.error('SMS error:', error)
    show('خطا در ارسال SMS', 'error')
  }
}

// Runtime config
const config = useRuntimeConfig()

// Date utilities
import { formatJalali } from '~/utils/date'
</script>

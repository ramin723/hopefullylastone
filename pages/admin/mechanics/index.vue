<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'ادمین', to: '/admin' },
          { label: 'مکانیک‌ها' }
        ]" />
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">مدیریت مکانیک‌ها</h1>
            <p class="mt-2 text-gray-600">مدیریت QR و اطلاعات مکانیک‌ها</p>
          </div>
          <NuxtLink 
            to="/admin"
            class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            بازگشت به هاب
          </NuxtLink>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="نام، تلفن یا کد مکانیک..."
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت کد</label>
            <select
              v-model="filters.hasCode"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @change="applyFilters"
            >
              <option value="">همه</option>
              <option value="true">دارد</option>
              <option value="false">ندارد</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت QR</label>
            <select
              v-model="filters.qrActive"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @change="applyFilters"
            >
              <option value="">همه</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="applyFilters"
              :disabled="loading"
              class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span v-if="loading">در حال بارگذاری...</span>
              <span v-else>اعمال فیلتر</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 6" :key="i" class="bg-white shadow rounded-lg p-6 animate-pulse">
          <div class="flex space-x-4">
            <div class="rounded-full bg-gray-200 h-12 w-12"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="text-red-800 text-center">
          <p class="text-lg font-medium mb-2">خطا در بارگذاری</p>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Mechanics List -->
      <div v-else-if="mechanics && mechanics.length > 0" class="space-y-4">
        <!-- Summary -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <dt class="text-sm font-medium text-gray-500">کل مکانیک‌ها</dt>
              <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ totalCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">QR فعال</dt>
              <dd class="mt-1 text-2xl font-semibold text-green-600">{{ activeQrCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">QR غیرفعال</dt>
              <dd class="mt-1 text-2xl font-semibold text-red-600">{{ inactiveQrCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">صفحه فعلی</dt>
              <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ filters.page }}</dd>
            </div>
          </div>
        </div>

        <!-- Mechanics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="mechanic in mechanics" 
            :key="mechanic.id" 
            class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <!-- Header Row -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="text-sm text-gray-500">نام مکانیک</div>
                <div class="font-semibold text-gray-900">{{ mechanic.fullName || 'نامشخص' }}</div>
              </div>
              <div class="text-left">
                <span 
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    mechanic.qrActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ mechanic.qrActive ? 'QR فعال' : 'QR غیرفعال' }}
                </span>
              </div>
            </div>

            <!-- Phone Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">تلفن</div>
              <div class="font-medium text-gray-900">{{ mechanic.phone || 'نامشخص' }}</div>
            </div>

            <!-- Code Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">کد QR</div>
              <div class="font-mono text-lg font-semibold text-blue-600">
                {{ mechanic.code || 'ندارد' }}
              </div>
            </div>

            <!-- Date Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">تاریخ ایجاد</div>
              <div class="font-medium text-gray-900">{{ formatDate(mechanic.createdAt) }}</div>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <AdminMechanicRowActions
                :mechanic-id="mechanic.id"
                :code="mechanic.code"
                :qr-active="mechanic.qrActive"
                @success="refresh"
              />
              <NuxtLink 
                :to="`/admin/mechanics/${mechanic.id}`"
                class="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                جزئیات
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="hasMorePages" class="flex justify-center space-x-2 rtl:space-x-reverse">
          <button 
            @click="previousPage"
            :disabled="filters.page <= 1"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            قبلی
          </button>
          <span class="px-4 py-2 text-sm text-gray-700">صفحه {{ filters.page }}</span>
          <button 
            @click="nextPage"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            بعدی
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white shadow rounded-lg p-12 text-center">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <p class="text-lg mb-2">هیچ مکانیکی یافت نشد</p>
          <p class="text-sm">برای این فیلترها مکانیکی وجود ندارد.</p>
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

// State
const loading = ref(false)
const error = ref('')
const mechanics = ref<any[]>([])
const totalCount = ref(0)
const hasMorePages = ref(false)

// Filters
const filters = ref({
  search: '',
  hasCode: '',
  qrActive: '',
  page: 1,
  pageSize: 20
})

// Computed
const activeQrCount = computed(() => 
  mechanics.value.filter(m => m.qrActive).length
)

const inactiveQrCount = computed(() => 
  mechanics.value.filter(m => !m.qrActive).length
)

// Fetch mechanics with stable key
const { data, pending, error: fetchError, refresh } = await useFetch(
  () => {
    const params = new URLSearchParams()
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.hasCode) params.append('hasCode', filters.value.hasCode)
    if (filters.value.qrActive) params.append('qrActive', filters.value.qrActive)
    params.append('page', filters.value.page.toString())
    params.append('pageSize', filters.value.pageSize.toString())
    
    return `/api/admin/mechanics?${params.toString()}`
  },
  {
    key: () => `adm-mech-${filters.value.search}-${filters.value.hasCode}-${filters.value.qrActive}-${filters.value.page}-${filters.value.pageSize}`,
    default: () => ({ items: [], count: 0 }),
    watch: false
  }
)

// Watch data changes
watch(data, (newData: any) => {
  if (newData) {
    mechanics.value = newData.items || []
    totalCount.value = newData.count || 0
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
  filters.value.page = 1 // Reset to first page
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

// Date utilities
import { formatJalali } from '~/utils/date'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'ادمین', to: '/admin' },
          { label: 'فروشگاه‌ها' }
        ]" />
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">مدیریت فروشگاه‌ها</h1>
            <p class="mt-2 text-gray-600">مدیریت اطلاعات فروشگاه‌ها</p>
          </div>
          <div class="flex space-x-3 rtl:space-x-reverse">
            <button
              @click="showInviteModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              دعوت فروشگاه جدید
            </button>
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
      </div>

      <!-- Search and Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="نام فروشگاه، تلفن یا شهر..."
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت</label>
            <select
              v-model="filters.status"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @change="applyFilters"
            >
              <option value="">همه</option>
              <option value="ACTIVE">فعال</option>
              <option value="INACTIVE">غیرفعال</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">وضعیت تعلیق</label>
            <select
              v-model="filters.suspended"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @change="applyFilters"
            >
              <option value="">همه</option>
              <option value="false">فعال</option>
              <option value="true">تعلیق شده</option>
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

      <!-- Vendors List -->
      <div v-else-if="vendors && vendors.length > 0" class="space-y-4">
        <!-- Summary -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <dt class="text-sm font-medium text-gray-500">کل فروشگاه‌ها</dt>
              <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ totalCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">فعال</dt>
              <dd class="mt-1 text-2xl font-semibold text-green-600">{{ activeCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">تعلیق شده</dt>
              <dd class="mt-1 text-2xl font-semibold text-red-600">{{ suspendedCount }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">صفحه فعلی</dt>
              <dd class="mt-1 text-2xl font-semibold text-gray-900">{{ filters.page }}</dd>
            </div>
          </div>
        </div>

        <!-- Vendors Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="vendor in vendors" 
            :key="vendor.id" 
            class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <!-- Header Row -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="text-sm text-gray-500">نام فروشگاه</div>
                <div class="font-semibold text-gray-900">{{ vendor.storeName || 'نامشخص' }}</div>
              </div>
              <div class="text-left space-y-1">
                <span 
                  :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    vendor.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ vendor.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' }}
                </span>
                <span 
                  v-if="vendor.suspended"
                  class="block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                >
                  تعلیق شده
                </span>
              </div>
            </div>

            <!-- Owner Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">مالک</div>
              <div class="font-medium text-gray-900">{{ vendor.fullName || 'نامشخص' }}</div>
            </div>

            <!-- Phone Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">تلفن</div>
              <div class="font-medium text-gray-900">{{ vendor.phone || 'نامشخص' }}</div>
            </div>

            <!-- City Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">شهر</div>
              <div class="font-medium text-gray-900">{{ vendor.city || 'نامشخص' }}</div>
            </div>

            <!-- Date Row -->
            <div class="mb-4">
              <div class="text-sm text-gray-500">تاریخ ایجاد</div>
              <div class="font-medium text-gray-900">{{ formatDate(vendor.createdAt) }}</div>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <AdminVendorRowActions
                :vendor-id="vendor.id"
                :suspended="vendor.suspended"
                @success="refresh"
              />
              <div class="grid grid-cols-2 gap-2">
                <NuxtLink 
                  :to="`/admin/vendors/${vendor.id}`"
                  class="inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  جزئیات
                </NuxtLink>
                <button
                  @click="editProfile(vendor)"
                  class="inline-flex justify-center items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ویرایش
                </button>
              </div>
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <p class="text-lg mb-2">هیچ فروشگاهی یافت نشد</p>
          <p class="text-sm">برای این فیلترها فروشگاهی وجود ندارد.</p>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">دعوت فروشگاه جدید</h3>
          
          <form @submit.prevent="createInvite" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">شماره تلفن *</label>
              <input
                v-model="newInvite.phone"
                type="tel"
                placeholder="09123456789"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
              <input
                v-model="newInvite.fullName"
                type="text"
                placeholder="نام و نام خانوادگی"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">نام فروشگاه</label>
              <input
                v-model="newInvite.storeName"
                type="text"
                placeholder="نام فروشگاه"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">شهر</label>
              <input
                v-model="newInvite.city"
                type="text"
                placeholder="شهر"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">آدرس</label>
              <input
                v-model="newInvite.addressLine"
                type="text"
                placeholder="آدرس"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">استان</label>
              <input
                v-model="newInvite.province"
                type="text"
                placeholder="استان"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">کد پستی</label>
              <input
                v-model="newInvite.postalCode"
                type="text"
                placeholder="کد پستی (10 رقم)"
                maxlength="10"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                :disabled="creating"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <span v-if="creating">در حال ارسال...</span>
                <span v-else>ارسال دعوت</span>
              </button>
              <button
                type="button"
                @click="closeInviteModal"
                class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                انصراف
              </button>
            </div>
          </form>
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
const vendors = ref<any[]>([])
const totalCount = ref(0)
const hasMorePages = ref(false)
const showInviteModal = ref(false)
const creating = ref(false)

const newInvite = ref({
  phone: '',
  fullName: '',
  storeName: '',
  city: '',
  addressLine: '',
  province: '',
  postalCode: ''
})

// Filters
const filters = ref({
  search: '',
  status: '',
  suspended: '',
  page: 1,
  pageSize: 20
})

// Computed
const activeCount = computed(() => 
  vendors.value.filter(v => v.status === 'ACTIVE').length
)

const suspendedCount = computed(() => 
  vendors.value.filter(v => v.suspended).length
)

// Fetch vendors with stable key
const { data, pending, error: fetchError, refresh } = await useFetch(
  () => {
    const params = new URLSearchParams()
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.status) params.append('status', filters.value.status)
    if (filters.value.suspended) params.append('suspended', filters.value.suspended)
    params.append('page', filters.value.page.toString())
    params.append('pageSize', filters.value.pageSize.toString())
    
    return `/api/admin/vendors?${params.toString()}`
  },
  {
    key: () => `adm-vendors-${filters.value.search}-${filters.value.status}-${filters.value.suspended}-${filters.value.page}-${filters.value.pageSize}`,
    default: () => ({ items: [], count: 0 }),
    watch: false
  }
)

// Watch data changes
watch(data, (newData: any) => {
  if (newData) {
    vendors.value = newData.items || []
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

// Invite methods
async function createInvite() {
  creating.value = true
  try {
    const api = useApi()
    const response = await api.post('/api/admin/invites', {
      role: 'VENDOR',
      ...newInvite.value
    })
    
    if (response.ok) {
      alert('دعوت با موفقیت ارسال شد')
      closeInviteModal()
      refresh() // Refresh vendors list
    }
  } catch (error) {
    alert('خطا در ارسال دعوت')
  } finally {
    creating.value = false
  }
}

function closeInviteModal() {
  showInviteModal.value = false
  newInvite.value = {
    phone: '',
    fullName: '',
    storeName: '',
    city: '',
    addressLine: '',
    province: '',
    postalCode: ''
  }
}

// Edit profile method (placeholder for future implementation)
function editProfile(vendor: any) {
  // TODO: Implement edit profile functionality
  console.log('Edit profile for vendor:', vendor.id)
}

// Date utilities
import { formatJalali } from '~/utils/date'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}
</script>

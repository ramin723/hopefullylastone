<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">مدیریت دعوت‌ها</h1>
        <p class="mt-1 text-sm text-gray-500">مدیریت دعوت‌های مکانیک‌ها و فروشگاه‌ها</p>
      </div>
      <div class="flex space-x-3">
        <AppButton @click="loadInvites" variant="outline" class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          بروزرسانی
        </AppButton>
        <AppButton @click="showCreateModal = true" class="bg-blue-600 hover:bg-blue-700">
          دعوت جدید
        </AppButton>
      </div>
    </div>

    <!-- Filters -->
    <AppCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppSelect
          v-model="filters.role"
          :options="roleOptions"
          placeholder="همه نقش‌ها"
          label="نقش"
          @change="loadInvites"
        />
        <AppInput
          v-model="filters.phone"
          placeholder="جستجو بر اساس شماره تلفن"
          label="شماره تلفن"
        />
        <AppSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="همه وضعیت‌ها"
          label="وضعیت"
          @change="loadInvites"
        />
        <div class="flex items-end space-x-2">
          <AppButton @click="loadInvites" class="flex-1 bg-indigo-600 hover:bg-indigo-700">
            اعمال فیلتر
          </AppButton>
          <AppButton @click="resetFilters" variant="outline" class="flex-1">
            پاک کردن فیلترها
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Invites Table -->
    <AppCard>
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="invites.length === 0" class="text-center py-8">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">هیچ دعوتی یافت نشد</h3>
          <p class="mt-1 text-sm text-gray-500">با فیلترهای فعلی هیچ دعوتی وجود ندارد.</p>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نقش
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                شماره تلفن
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وضعیت
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ایجاد شده توسط
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاریخ ایجاد
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                انقضا
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="invite in invites" :key="invite.id" 
                class="hover:bg-gray-50"
                :class="{ 'bg-green-50 border-l-4 border-green-400': isJustCreated(invite.id) }">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="invite.role === 'MECHANIC' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  {{ invite.role === 'MECHANIC' ? 'مکانیک' : 'فروشگاه' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ invite.phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(invite.status)">
                  {{ getStatusText(invite.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ invite.createdBy.fullName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invite.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invite.expiresAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="invite.status === 'ACTIVE'"
                  @click="cancelInvite(invite.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  لغو
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          نمایش {{ (pagination.page - 1) * pagination.limit + 1 }} تا 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} از 
          {{ pagination.total }} نتیجه
        </div>
        <div class="flex space-x-2">
          <AppButton
            @click="changePage(pagination.page - 1)"
            :disabled="!pagination.hasPrev"
            variant="outline"
            size="sm"
          >
            قبلی
          </AppButton>
          <AppButton
            @click="changePage(pagination.page + 1)"
            :disabled="!pagination.hasNext"
            variant="outline"
            size="sm"
          >
            بعدی
          </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Create Invite Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">دعوت جدید</h3>
          
          <form @submit.prevent="createInvite" class="space-y-4">
            <AppSelect
              v-model="newInvite.role"
              :options="roleOptions"
              placeholder="انتخاب نقش"
              label="نقش *"
              required
            />
            
            <AppInput
              v-model="newInvite.phone"
              placeholder="09123456789"
              label="شماره تلفن *"
              required
            />
            
            <AppInput
              v-model="newInvite.fullName"
              placeholder="نام و نام خانوادگی"
              label="نام و نام خانوادگی"
            />
            
            <AppInput
              v-model="newInvite.city"
              placeholder="شهر"
              label="شهر"
            />
            
            <div v-if="newInvite.role === 'MECHANIC'">
              <AppInput
                v-model="newInvite.specialties"
                placeholder="تخصص‌ها (اختیاری)"
                label="تخصص‌ها"
              />
            </div>
            
            <div v-if="newInvite.role === 'VENDOR'">
              <AppInput
                v-model="newInvite.storeName"
                placeholder="نام فروشگاه"
                label="نام فروشگاه"
              />
              
              <AppInput
                v-model="newInvite.addressLine"
                placeholder="آدرس"
                label="آدرس"
              />
              
              <AppInput
                v-model="newInvite.province"
                placeholder="استان"
                label="استان"
              />
              
              <AppInput
                v-model="newInvite.postalCode"
                placeholder="کد پستی (10 رقم)"
                label="کد پستی"
                maxlength="10"
              />
            </div>
            
            <div class="flex space-x-3 pt-4">
              <AppButton
                type="submit"
                :loading="creating"
                class="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                ارسال دعوت
              </AppButton>
              <AppButton
                type="button"
                @click="showCreateModal = false"
                variant="outline"
                class="flex-1"
              >
                انصراف
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToast } from '~/composables/useToast'
import { formatJalali } from '~/utils/date'

// Helper function for date formatting
const formatDate = (date: string | Date): string => {
  return formatJalali(date)
}

// Meta
definePageMeta({
  layout: 'authenticated'
})

// Composables
const { get, post } = useApi()
const { show: showToast } = useToast()
const route = useRoute()

// State
const loading = ref(false)
const creating = ref(false)
const showCreateModal = ref(false)
const invites = ref<any[]>([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
})

const filters = ref({
  role: '',
  phone: '',
  status: ''
})

const newInvite = ref({
  role: '',
  phone: '',
  fullName: '',
  city: '',
  specialties: '',
  storeName: '',
  addressLine: '',
  province: '',
  postalCode: ''
})

// Options
const roleOptions = [
  { value: '', label: 'همه نقش‌ها' },
  { value: 'MECHANIC', label: 'مکانیک' },
  { value: 'VENDOR', label: 'فروشگاه' }
]

const statusOptions = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'ACTIVE', label: 'فعال' },
  { value: 'USED', label: 'استفاده شده' },
  { value: 'EXPIRED', label: 'منقضی شده' },
  { value: 'CANCELED', label: 'لغو شده' }
]

// Methods
const loadInvites = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.role) params.append('role', filters.value.role)
    if (filters.value.phone) params.append('phone', filters.value.phone)
    if (filters.value.status) params.append('status', filters.value.status)
    params.append('page', pagination.value.page.toString())
    params.append('limit', pagination.value.limit.toString())
    
    // Use stable cache key for better caching
    const cacheKey = `admin-invites-${filters.value.role || 'all'}-${filters.value.status || 'all'}-${filters.value.phone || 'no-phone'}-${pagination.value.page}-${pagination.value.limit}`
    
    const response = await get(`/api/admin/invites?${params}`, {
      key: cacheKey
    })
    
    if (response.ok) {
      invites.value = response.data.invites
      pagination.value = response.data.pagination
    }
  } catch (error) {
    showToast('خطا در بارگذاری دعوت‌ها', 'error')
  } finally {
    loading.value = false
  }
}

const createInvite = async () => {
  creating.value = true
  try {
    const response = await post('/api/admin/invites', newInvite.value)
    
    if (response.ok) {
      showToast('دعوت با موفقیت ارسال شد', 'success')
      showCreateModal.value = false
      resetNewInvite()
      
      // Redirect to invites list with justCreated parameter
      const inviteId = response.data.inviteId
      await navigateTo(`/admin/invites?justCreated=${inviteId}`)
    }
  } catch (error: any) {
    // Map error codes to user-friendly messages
    let errorMessage = 'خطا در ارسال دعوت'
    
    if (error?.statusCode === 502) {
      errorMessage = 'ایجاد دعوت انجام نشد (ارسال پیامک ناموفق).'
    } else if (error?.statusCode === 429) {
      errorMessage = 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.'
    } else if (error?.statusCode === 409) {
      errorMessage = error.data?.message || 'دعوت فعالی برای این شماره و نقش از قبل وجود دارد'
    } else {
      errorMessage = error.data?.message || error.statusMessage || 'خطا در ارسال دعوت'
    }
    
    showToast(errorMessage, 'error')
  } finally {
    creating.value = false
  }
}

const cancelInvite = async (inviteId: number) => {
  if (!confirm('آیا از لغو این دعوت اطمینان دارید؟')) return
  
  try {
    const response = await post(`/api/admin/invites/${inviteId}/cancel`)
    
    if (response.ok) {
      showToast('دعوت با موفقیت لغو شد', 'success')
      loadInvites()
    }
  } catch (error: any) {
    let errorMessage = 'خطا در لغو دعوت'
    
    if (error?.statusCode === 404) {
      errorMessage = 'دعوت یافت نشد'
    } else if (error?.statusCode === 409) {
      errorMessage = error.data?.message || 'این دعوت قبلاً لغو یا استفاده شده است'
    } else {
      errorMessage = error.data?.message || error.statusMessage || 'خطا در لغو دعوت'
    }
    
    showToast(errorMessage, 'error')
  }
}

const resetFilters = () => {
  filters.value = {
    role: '',
    phone: '',
    status: ''
  }
  pagination.value.page = 1
  loadInvites()
}

const resetNewInvite = () => {
  newInvite.value = {
    role: '',
    phone: '',
    fullName: '',
    city: '',
    specialties: '',
    storeName: '',
    addressLine: '',
    province: '',
    postalCode: ''
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadInvites()
}

// Removed debouncedSearch - now using manual filter application

// Utility functions
const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800'
    case 'USED': return 'bg-blue-100 text-blue-800'
    case 'EXPIRED': return 'bg-red-100 text-red-800'
    case 'CANCELED': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'فعال'
    case 'USED': return 'استفاده شده'
    case 'EXPIRED': return 'منقضی شده'
    case 'CANCELED': return 'لغو شده'
    default: return 'نامشخص'
  }
}

const isJustCreated = (inviteId: number) => {
  const justCreatedId = route.query.justCreated
  return justCreatedId && Number(justCreatedId) === inviteId
}

// Debounce utility removed - no longer needed

// Lifecycle
onMounted(() => {
  loadInvites()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'ادمین', to: '/admin' },
          { label: 'فروشگاه‌ها', to: '/admin/vendors' },
          { label: vendorData?.profile?.storeName || 'جزئیات فروشگاه' }
        ]" />
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ vendorData?.profile?.storeName || 'جزئیات فروشگاه' }}
            </h1>
            <p class="mt-2 text-gray-600">اطلاعات کامل فروشگاه و آمار عملکرد</p>
          </div>
          <div class="flex space-x-3 rtl:space-x-reverse">
            <NuxtLink 
              to="/admin/vendors"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              بازگشت به لیست
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div v-for="i in 4" :key="i" class="bg-white shadow rounded-lg p-6 animate-pulse">
          <div class="space-y-4">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="space-y-2">
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

      <!-- Content -->
      <div v-else-if="vendorData" class="space-y-6">
        <!-- Profile Information Card -->
        <AppCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900">اطلاعات پروفایل</h2>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">نام فروشگاه</label>
              <p class="text-lg font-semibold text-gray-900">{{ vendorData.profile.storeName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">مالک</label>
              <p class="text-lg font-semibold text-gray-900">{{ vendorData.user.fullName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">شماره تلفن</label>
              <p class="text-lg font-semibold text-gray-900">{{ vendorData.user.phone }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">شهر</label>
              <p class="text-lg font-semibold text-gray-900">{{ vendorData.profile.city || 'نامشخص' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">استان</label>
              <p class="text-lg font-semibold text-gray-900">{{ vendorData.profile.province || 'نامشخص' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">کد پستی</label>
              <p class="text-lg font-semibold text-gray-900">{{ vendorData.profile.postalCode || 'نامشخص' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">آدرس</label>
              <p class="text-lg font-semibold text-gray-900">{{ vendorData.profile.addressLine || 'نامشخص' }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">وضعیت</label>
              <span 
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  vendorData.profile.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ vendorData.profile.status === 'ACTIVE' ? 'فعال' : 'غیرفعال' }}
              </span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">وضعیت تعلیق</label>
              <span 
                v-if="vendorData.user.suspended"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
              >
                تعلیق شده
              </span>
              <span 
                v-else
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                فعال
              </span>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">تاریخ ایجاد</label>
              <p class="text-lg font-semibold text-gray-900">{{ formatDate(vendorData.profile.createdAt) }}</p>
            </div>
          </div>
        </AppCard>

        <!-- Key Statistics Card -->
        <AppCard>
          <template #header>
            <h2 class="text-xl font-semibold text-gray-900">آمار کلیدی</h2>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ vendorData.stats.totalTransactions }}</div>
              <div class="text-sm text-gray-500">کل تراکنش‌ها</div>
            </div>
            
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ formatCurrency(vendorData.stats.totalEligibleAmount) }}</div>
              <div class="text-sm text-gray-500">کل مبلغ واجد شرایط</div>
            </div>
            
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">{{ formatCurrency(vendorData.stats.totalCommission) }}</div>
              <div class="text-sm text-gray-500">کل کمیسیون</div>
            </div>
            
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600">{{ vendorData.stats.totalSettlements }}</div>
              <div class="text-sm text-gray-500">تسویه حساب‌ها</div>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600">{{ formatCurrency(vendorData.stats.mechanicCommission) }}</div>
              <div class="text-sm text-gray-500">کمیسیون مکانیک‌ها (3%)</div>
            </div>
            
            <div class="text-center">
              <div class="text-2xl font-bold text-pink-600">{{ formatCurrency(vendorData.stats.platformCommission) }}</div>
              <div class="text-sm text-gray-500">کمیسیون پلتفرم (2%)</div>
            </div>
          </div>
        </AppCard>

                   <!-- Recent Transactions Card -->
                   <AppCard>
                     <template #header>
                       <div class="flex justify-between items-center">
                         <h2 class="text-xl font-semibold text-gray-900">تراکنش‌های اخیر</h2>
                         <button
                           @click="goToAllTransactions"
                           class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                         >
                           مشاهده همه
                         </button>
                       </div>
                     </template>
                     
                     <div v-if="vendorData.recentTransactions && vendorData.recentTransactions.length > 0">
                       <AppTable
                         :headers="transactionHeaders"
                         :data="vendorData.recentTransactions"
                         :formatters="{
                           currency: formatCurrency,
                           date: formatDate
                         }"
                       />
                     </div>
                     <div v-else class="text-center py-8 text-gray-500">
                       <p>هیچ تراکنشی یافت نشد</p>
                     </div>
                   </AppCard>

                   <!-- Recent Settlements Card -->
                   <AppCard>
                     <template #header>
                       <div class="flex justify-between items-center">
                         <h2 class="text-xl font-semibold text-gray-900">تسویه‌های اخیر</h2>
                         <button
                           @click="goToAllSettlements"
                           class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                         >
                           مشاهده همه
                         </button>
                       </div>
                     </template>
                     
                     <div v-if="vendorData.recentSettlements && vendorData.recentSettlements.length > 0">
                       <AppTable
                         :headers="settlementHeaders"
                         :data="vendorData.recentSettlements"
                         :formatters="{
                           currency: formatCurrency,
                           date: formatDate
                         }"
                       />
                     </div>
                     <div v-else class="text-center py-8 text-gray-500">
                       <p>هیچ تسویه‌ای یافت نشد</p>
                     </div>
                   </AppCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: true,
  layout: 'authenticated'
})

const route = useRoute()

// State
const loading = ref(true)
const error = ref('')
const vendorData = ref<any>(null)

// Table headers
const transactionHeaders = [
  { key: 'id', label: 'شناسه' },
  { key: 'mechanic.name', label: 'مکانیک' },
  { key: 'customerPhone', label: 'تلفن مشتری' },
  { key: 'amountEligible', label: 'مبلغ واجد شرایط', format: 'currency' },
  { key: 'status', label: 'وضعیت' },
  { key: 'createdAt', label: 'تاریخ', format: 'date' }
]

const settlementHeaders = [
  { key: 'id', label: 'شناسه' },
  { key: 'periodFrom', label: 'از تاریخ', format: 'date' },
  { key: 'periodTo', label: 'تا تاریخ', format: 'date' },
  { key: 'totalAmountEligible', label: 'کل مبلغ', format: 'currency' },
  { key: 'status', label: 'وضعیت' },
  { key: 'createdAt', label: 'تاریخ ایجاد', format: 'date' }
]

// Fetch vendor details with stable key
const { data, pending, error: fetchError } = await useFetch(
  () => `/api/admin/vendors/${route.params.id}`,
  {
    key: `admin-vendor-${route.params.id}`,
    default: () => null,
    watch: false
  }
)

// Watch data changes
watch(data, (newData: any) => {
  if (newData) {
    vendorData.value = newData
  }
}, { immediate: true })

// Watch loading and error
watch(pending, (newPending) => {
  loading.value = newPending
})

watch(fetchError, (newError) => {
  error.value = newError?.data?.statusMessage || newError?.message || 'خطا در بارگذاری اطلاعات'
})

function goToAllTransactions() {
  // TODO: Navigate to transactions page filtered by this vendor
  console.log('Navigate to all transactions for vendor:', route.params.id)
}

function goToAllSettlements() {
  // TODO: Navigate to settlements page filtered by this vendor
  console.log('Navigate to all settlements for vendor:', route.params.id)
}

// Date utilities
import { formatJalali } from '~/utils/date'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR',
    minimumFractionDigits: 0
  }).format(amount)
}

</script>

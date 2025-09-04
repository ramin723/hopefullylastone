<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with Back Button -->
      <div class="mb-8">
        <Breadcrumbs :items="[
          { label: 'ادمین', to: '/admin' },
          { label: 'مکانیک‌ها', to: '/admin/mechanics' },
          { label: `#${route.params.id}` }
        ]" />
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">مدیریت QR مکانیک</h1>
            <p class="mt-2 text-gray-600">{{ mechanic?.fullName || 'در حال بارگذاری...' }}</p>
          </div>
          <div class="flex gap-2">
            <button
              v-if="mechanic?.code"
              @click="printQR"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              چاپ QR
            </button>
            <NuxtLink 
              to="/admin/mechanics"
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
      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">در حال بارگذاری...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="text-red-800 text-center">
          <p class="text-lg font-medium mb-2">خطا در بارگذاری</p>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Mechanic Details -->
      <div v-else-if="mechanic" class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">اطلاعات پایه</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">نام کامل</label>
              <div class="mt-1 text-sm text-gray-900">{{ mechanic.fullName }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">شماره تلفن</label>
              <div class="mt-1 text-sm text-gray-900">{{ mechanic.phone }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">شهر</label>
              <div class="mt-1 text-sm text-gray-900">{{ mechanic.city || 'نامشخص' }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">تاریخ ایجاد</label>
              <div class="mt-1 text-sm text-gray-900">{{ formatDate(mechanic.createdAt) }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">کل تراکنش‌ها</label>
              <div class="mt-1 text-sm text-gray-900">{{ mechanic.stats?.totalTransactions || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">کد QR</h2>
          
          <!-- Current Code -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-500 mb-2">کد فعلی</label>
            <div class="flex items-center gap-3">
              <div class="font-mono text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                {{ mechanic.code }}
              </div>
              <button
                @click="copyCode"
                class="text-gray-400 hover:text-gray-600"
                title="کپی کد"
              >
                📋
              </button>
            </div>
          </div>

          <!-- QR Display -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-500 mb-2">نمایش QR</label>
            <div class="flex justify-center">
              <ClientOnly>
                <div v-if="svgData" v-html="svgData" class="mx-auto w-[220px] h-[220px]" />
                <img v-if="pngData" :src="pngData" alt="QR PNG (fallback)" class="mx-auto w-[220px] h-[220px] hidden" />
                <div v-else class="text-gray-500">در حال تولید QR...</div>
              </ClientOnly>
            </div>
          </div>

          <!-- QR Actions -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              @click="downloadPng"
              :disabled="!pngData"
              class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              📥 دانلود PNG
            </button>
            
            <button
              @click="downloadSvg"
              :disabled="!svgData"
              class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              📥 دانلود SVG
            </button>
            
            <button
              @click="printQR"
              class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🖨️ پرینت
            </button>
            
            <button
              @click="regenerateQR"
              :disabled="!mechanic?.code"
              class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              🔄 تلاش مجدد
            </button>
          </div>
        </div>

        <!-- QR Management -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">مدیریت QR</h2>
          
          <div class="max-w-md">
            <AdminMechanicRowActions
              :mechanic-id="mechanic.id"
              :code="mechanic.code"
              :qr-active="mechanic.qrActive"
              @success="handleActionSuccess"
            />
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

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { show } = useToast()

// State
const loading = ref(false)
const error = ref('')
const mechanic = ref<any>(null)
const svgData = ref<string>('')
const pngData = ref<string>('')

// Fetch mechanic details
const { data, pending, error: fetchError, refresh } = await useFetch(
  () => `/api/admin/mechanics/${route.params.id}`,
  {
    key: `admin-mechanic-${route.params.id}`,
    default: () => ({ mechanic: null }),
    watch: false
  }
)

// Watch data changes
watch(data, (newData: any) => {
  if (newData?.mechanic) {
    mechanic.value = newData.mechanic
    // Generate QR after data is loaded
    nextTick(() => {
      if (mechanic.value?.code) {
        generateQRData()
      }
    })
  }
}, { immediate: true })

// Watch code changes for QR regeneration
watch(() => mechanic.value?.code, async (newCode) => {
  if (newCode) {
    await generateQRData()
  }
})

// Watch loading and error
watch(pending, (newPending) => {
  loading.value = newPending
})

watch(fetchError, (newError) => {
  error.value = newError?.data?.statusMessage || newError?.message || 'خطا در بارگذاری'
})

// Methods
function handleActionSuccess() {
  // Refresh mechanic data after successful action
  refresh()
}

function copyCode() {
  if (!mechanic.value?.code) return
  
  navigator.clipboard.writeText(mechanic.value.code)
    .then(() => show('کد کپی شد', 'success'))
    .catch(() => show('خطا در کپی کردن کد', 'error'))
}

async function generateQRData() {
  if (!mechanic.value?.code) return
  
  try {
    const QRCode = (await import('qrcode')).default
    
    // QR content for mechanic: MECH:<code>
    const qrContent = `MECH:${mechanic.value.code}`
    
    // Generate SVG
    svgData.value = await QRCode.toString(qrContent, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    })
    
    // Generate PNG
    pngData.value = await QRCode.toDataURL(qrContent, {
      margin: 2,
      errorCorrectionLevel: 'M',
      scale: 6,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    })
    
  } catch (error) {
    console.error('QR generation error:', error)
    show('خطا در تولید QR', 'error')
  }
}

function downloadPng() {
  if (!pngData.value) return
  
  try {
    const link = document.createElement('a')
    link.href = pngData.value
    link.download = `mechanic-qr-${mechanic.value?.code || 'qr'}.png`
    link.click()
    
    show('QR Code PNG دانلود شد', 'success')
  } catch (error) {
    console.error('PNG download error:', error)
    show('خطا در دانلود PNG', 'error')
  }
}

function downloadSvg() {
  if (!svgData.value) return
  
  try {
    const blob = new Blob([svgData.value], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `mechanic-qr-${mechanic.value?.code || 'qr'}.svg`
    link.click()
    
    URL.revokeObjectURL(url)
    show('QR Code SVG دانلود شد', 'success')
  } catch (error) {
    console.error('SVG download error:', error)
    show('خطا در دانلود SVG', 'error')
  }
}

function printQR() {
  console.log('Print button clicked')
  console.log('Mechanic value:', mechanic.value)
  
  if (!mechanic.value?.code) {
    show('کد QR موجود نیست', 'error')
    return
  }
  
  const id = route.params.id
  if (!id) return
  
  // Navigate to print page with auto-print query parameter
  const printUrl = `/admin/mechanics/print/${id}?auto=1`
  console.log('Navigating to:', printUrl)
  
  try {
    // Use navigateTo for same-tab navigation as requested
    navigateTo({ path: printUrl })
    console.log('Navigation successful')
  } catch (error) {
    console.error('Navigation error:', error)
    show('خطا در انتقال به صفحه چاپ', 'error')
  }
}

function regenerateQR() {
  if (!mechanic.value?.code) return
  
  generateQRData()
  show('QR مجدداً تولید شد', 'success')
}

// Client-side initialization
onMounted(async () => {
  if (mechanic.value?.code) {
    await generateQRData()
  }
})

// Date utilities
import { formatJalali } from '~/utils/date'

function formatDate(date: string | Date): string {
  return formatJalali(date)
}
</script>

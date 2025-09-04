<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="no-print">
          <Breadcrumbs :items="[
            { label: 'ادمین', to: '/admin' },
            { label: 'مکانیک‌ها', to: '/admin/mechanics' },
            { label: `#${route.params.id}`, to: `/admin/mechanics/${route.params.id}` },
            { label: 'چاپ QR' }
          ]" />
        </div>
        
        <div class="flex justify-between items-start mt-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">چاپ QR مکانیک</h1>
            <p class="mt-2 text-gray-600">{{ mechanic?.fullName || 'در حال بارگذاری...' }}</p>
          </div>
          <div class="flex gap-2 no-print">
            <button
              @click="printPage"
              :disabled="!mechanic?.code || !svgData"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              چاپ
            </button>
            <button
              @click="downloadSvg"
              :disabled="!svgData"
              class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors duration-200"
            >
              📥 دانلود SVG
            </button>
            <button
              @click="downloadPng"
              :disabled="!pngData"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200"
            >
              📥 دانلود PNG
            </button>
            <NuxtLink 
              :to="`/admin/mechanics/${route.params.id}`"
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              <svg class="mr-2 w-4 h-4 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              بازگشت
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

      <!-- No Code State -->
      <div v-else-if="!mechanic?.code" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div class="text-yellow-800 text-center">
          <p class="text-lg font-medium mb-2">کد QR موجود نیست</p>
          <p>ابتدا باید کد QR را تخصیص دهید</p>
          <NuxtLink 
            :to="`/admin/mechanics/${route.params.id}`"
            class="inline-block mt-4 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            بازگشت به صفحه مکانیک
          </NuxtLink>
        </div>
      </div>

      <!-- Print Content -->
      <div v-else class="print-content">
        <!-- Print Preview -->
        <div class="bg-white shadow-lg rounded-lg p-8 mb-8 print-preview">
          <div class="text-center">
            <!-- Brand/Platform Title -->
            <div class="mb-8">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">همکاری</h1>
              <p class="text-sm text-gray-600">سیستم مدیریت مکانیک‌ها</p>
            </div>

            <!-- Mechanic Info -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">QR کد مکانیک</h2>
              <div v-if="mechanic.fullName" class="mb-4">
                <p class="text-lg text-gray-700">
                  <span class="font-medium">نام مکانیک:</span> {{ mechanic.fullName }}
                </p>
              </div>
            </div>

            <!-- QR Code -->
            <div class="mb-8">
              <ClientOnly>
                <div v-if="svgData" v-html="svgData" class="mx-auto w-[300px] h-[300px] mb-4" />
                <img v-if="pngData" :src="pngData" alt="QR PNG (fallback)" class="mx-auto w-[300px] h-[300px] hidden" />
                <div v-else class="text-gray-500 mb-4">در حال تولید QR...</div>
              </ClientOnly>
              <div class="font-mono text-2xl font-bold text-blue-600 bg-blue-50 px-6 py-3 rounded-lg inline-block">
                {{ mechanic.code }}
              </div>
            </div>

            <!-- Instructions -->
            <div class="mb-8 text-right">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">راهنمای استفاده</h3>
              <div class="text-sm text-gray-700 space-y-2">
                <p>• این QR کد را در محل کار مکانیک نصب کنید</p>
                <p>• مشتریان با اسکن این کد می‌توانند مکانیک را شناسایی کنند</p>
                <p>• در صورت تغییر کد، QR جدید دریافت کنید</p>
              </div>
            </div>

            <!-- Generation Date -->
            <div class="text-xs text-gray-500">
              <p>تاریخ تولید: {{ formatDate(new Date()) }}</p>
            </div>
          </div>
        </div>

        <!-- Print Instructions -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-blue-900 mb-3">راهنمای چاپ</h3>
          <div class="text-sm text-blue-800 space-y-2">
            <p>• برای چاپ بهینه، از کاغذ A5 استفاده کنید</p>
            <p>• تنظیمات چاپ: Portrait، حاشیه‌ها: حداقل</p>
            <p>• کیفیت چاپ: بالا (برای خوانایی بهتر QR)</p>
            <p>• پس از چاپ، QR را در محل مناسب نصب کنید</p>
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
const { show } = useToast()

// State
const loading = ref(false)
const error = ref('')
const mechanic = ref<any>(null)
const svgData = ref<string>('')
const pngData = ref<string>('')

// Fetch mechanic details
const { data, pending, error: fetchError } = await useFetch(
  () => `/api/admin/mechanics/${route.params.id}`,
  {
    key: `admin-mechanic-print-${route.params.id}`,
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

// Watch loading and error
watch(pending, (newPending) => {
  loading.value = newPending
})

watch(fetchError, (newError) => {
  error.value = newError?.data?.statusMessage || newError?.message || 'خطا در بارگذاری'
})

// Methods
async function generateQRData() {
  if (!mechanic.value?.code) return
  
  try {
    const QRCode = (await import('qrcode')).default as any
    
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
      scale: 8, // Higher scale for print
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

function printPage() {
  if (!mechanic.value?.code) {
    show('کد QR موجود نیست', 'error')
    return
  }
  
  if (!svgData.value) {
    show('QR هنوز تولید نشده است', 'error')
    return
  }
  
  // Wait for QR to be fully rendered, then print
  nextTick(() => {
    setTimeout(() => {
      window.print()
    }, 300)
  })
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

// Auto-print logic
const autoPrintIfReady = async () => {
  console.log('autoPrintIfReady called, auto:', route.query.auto, 'svgData:', !!svgData.value)
  if (route.query.auto === '1' && svgData.value) {
    console.log('Auto print triggered')
    await nextTick()
    setTimeout(() => {
      console.log('Calling window.print()')
      window.print()
    }, 300)
  }
}

// Watch for QR data changes to trigger auto-print
watch(svgData, async (newSvgData) => {
  if (newSvgData && route.query.auto === '1') {
    await autoPrintIfReady()
  }
})

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

<style scoped>
/* Print Styles */
@media print {
  @page { 
    size: A5 portrait; 
    margin: 10mm; 
  }
  
  body {
    margin: 0;
    padding: 0;
  }
  
  .print-content {
    margin: 0;
    padding: 0;
  }
  
  .print-preview {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 20mm !important;
    width: 148mm !important; /* A5 width */
    height: 210mm !important; /* A5 height */
    page-break-after: always;
  }
  
  /* Hide non-printable elements */
  .no-print,
  .breadcrumbs,
  .flex.justify-between,
  .bg-blue-50,
  .bg-yellow-50,
  .bg-red-50 {
    display: none !important;
  }
  
  /* Ensure QR is visible and properly sized */
  svg { 
    width: 60mm !important; 
    height: 60mm !important; 
    max-width: 100% !important;
    height: auto !important;
  }
  
  /* Print-friendly colors */
  .text-gray-900,
  .text-gray-800,
  .text-gray-700,
  .text-blue-600 {
    color: #000 !important;
  }
  
  .bg-blue-50 {
    background-color: #f8f9fa !important;
  }
}

/* Screen-only styles */
@media screen {
  .print-preview {
    max-width: 500px;
    margin: 0 auto;
  }
}
</style>

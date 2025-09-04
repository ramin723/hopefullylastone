<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-md mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">سفارش شما آماده است</h1>
        <p class="text-gray-600">
          این QR را به فروشگاه نشان دهید تا سفارش شما پیش‌فرض در سیستم ثبت شود
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div class="text-gray-600">در حال بارگذاری...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 text-6xl mb-4">❌</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">خطا در بارگذاری سفارش</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <AppButton @click="retry" variant="secondary">
          تلاش مجدد
        </AppButton>
      </div>

      <!-- Order Not Found/Invalid -->
      <div v-else-if="orderStatus === 'not_found'" class="text-center py-12">
        <div class="text-yellow-600 text-6xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">سفارش یافت نشد</h2>
        <p class="text-gray-600">
          این سفارش وجود ندارد یا قبلاً استفاده شده است
        </p>
      </div>

      <!-- Order Expired/Cancelled -->
      <div v-else-if="orderStatus === 'invalid'" class="text-center py-12">
        <div class="text-red-600 text-6xl mb-4">🚫</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">سفارش نامعتبر</h2>
        <p class="text-gray-600">
          این سفارش منقضی شده یا لغو شده است
        </p>
      </div>

      <!-- Valid Order -->
      <div v-else-if="orderStatus === 'valid'" class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Order Info -->
        <div class="text-center mb-6">
          <div class="text-green-600 text-4xl mb-2">✅</div>
          <div class="text-sm text-gray-500 mb-2">کد سفارش</div>
          <div class="font-mono text-2xl font-bold text-gray-900">{{ orderCode }}</div>
        </div>

        <!-- QR Code -->
        <div class="text-center mb-6">
          <div class="text-sm text-gray-600 mb-3">QR Code سفارش:</div>
          <div v-if="!isClient" class="text-gray-500">در حال بارگذاری...</div>
          <div v-else ref="qrContainer" class="flex justify-center"></div>
        </div>

        <!-- Instructions -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-3">
            <div class="text-blue-600 text-lg">💡</div>
            <div>
              <div class="font-medium text-blue-900 mb-1">راهنمای استفاده:</div>
              <ol class="text-sm text-blue-800 space-y-1">
                <li>1. این QR را به فروشگاه نشان دهید</li>
                <li>2. فروشگاه آن را اسکن می‌کند</li>
                <li>3. اطلاعات سفارش شما در سیستم ثبت می‌شود</li>
                <li>4. فروشگاه قیمت‌گذاری و ثبت نهایی را انجام می‌دهد</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Share Options -->
        <div class="space-y-3">
          <AppButton
            @click="copyLink"
            variant="secondary"
            class="w-full"
          >
            📋 کپی لینک
          </AppButton>
          
          <AppButton
            @click="openLink"
            variant="outline"
            class="w-full"
          >
            🔗 باز کردن لینک
          </AppButton>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6 pt-6 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            این صفحه برای مشتریان طراحی شده است
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth: false })

// Route params
const route = useRoute()
const orderCode = computed(() => route.params.code as string)

// State
const loading = ref(true)
const error = ref('')
const orderStatus = ref<'loading' | 'valid' | 'not_found' | 'invalid'>('loading')
const isClient = ref(false)
const qrContainer = ref<HTMLElement>()

// Check order validity
onMounted(async () => {
  isClient.value = true
  
  if (!orderCode.value) {
    orderStatus.value = 'not_found'
    loading.value = false
    return
  }
  
  await checkOrderValidity()
})

async function checkOrderValidity() {
  try {
    // Use the new public endpoint for order validation
    const response = await $fetch(`/api/orders/${orderCode.value}/public`)
    
    if (response.ok) {
      orderStatus.value = 'valid'
      
      // Generate QR code after a short delay
      setTimeout(() => {
        if (isClient.value && qrContainer.value) {
          generateQRCode()
        }
      }, 100)
    } else {
      orderStatus.value = 'not_found'
    }
    
  } catch (error: any) {
    console.error('Order check error:', error)
    
    if (error.statusCode === 404) {
      orderStatus.value = 'not_found'
    } else if (error.statusCode === 400) {
      orderStatus.value = 'not_found'
    } else if (error.statusCode === 429) {
      error.value = 'تلاش زیادی انجام شده. لطفاً کمی صبر کنید.'
    } else {
      orderStatus.value = 'not_found'
      error.value = 'خطا در بررسی سفارش'
    }
  } finally {
    loading.value = false
  }
}

async function generateQRCode() {
  if (!orderCode.value || !qrContainer.value) return
  
  try {
    // Dynamic import for QR code library (client-only)
    const QRCode = (await import('qrcode')).default
    
    // Clear previous QR
    qrContainer.value.innerHTML = ''
    
    // Generate QR code with current URL
    const currentUrl = window.location.href
    const canvas = await QRCode.toCanvas(currentUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1f2937', // gray-800
        light: '#ffffff'
      }
    })
    
    qrContainer.value.appendChild(canvas)
    
  } catch (error) {
    console.error('QR generation error:', error)
    qrContainer.value.innerHTML = '<div class="text-red-500">خطا در تولید QR</div>'
  }
}

function copyLink() {
  const currentUrl = window.location.href
  
  navigator.clipboard.writeText(currentUrl)
    .then(() => {
      // Show success message
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = 'لینک کپی شد!'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 2000)
    })
    .catch(() => {
      // Show error message
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = 'خطا در کپی کردن لینک'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 2000)
    })
}

function openLink() {
  const currentUrl = window.location.href
  window.open(currentUrl, '_blank')
}

function retry() {
  loading.value = true
  orderStatus.value = 'loading'
  error.value = ''
  checkOrderValidity()
}

// Watch route changes
watch(() => route.params.code, (newCode) => {
  if (newCode && newCode !== orderCode.value) {
    orderCode.value = newCode
    checkOrderValidity()
  }
})
</script>

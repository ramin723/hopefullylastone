<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with Back Button -->
      <div class="mb-8">
        <!-- دکمه برگشت مینیمال -->
        <div class="mb-6">
          <button 
            @click="router.push('/mechanic')"
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
          <h1 class="text-3xl font-bold text-gray-900">سفارش جدید</h1>
          <p class="mt-2 text-gray-600">ایجاد سفارش جدید با QR آنلاین</p>
        </div>
      </div>

      <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">ساخت سفارش جدید</h2>
          <p class="text-gray-600">اطلاعات سفارش را وارد کنید</p>
        </div>
        <!-- فرم ساخت سفارش -->
        <form v-if="!orderCreated" @submit.prevent="createOrder" novalidate>
          <!-- شماره تلفن مشتری -->
          <div class="mb-4">
            <AppInput
              v-model="form.customerPhone"
              label="شماره تلفن مشتری"
              type="tel"
              placeholder="09120000000"
              :error="errors.customerPhone"
              required
            />
          </div>

          <!-- یادداشت -->
          <div class="mb-4">
            <AppInput
              v-model="form.note"
              label="یادداشت (اختیاری)"
              type="text"
              placeholder="توضیحات اضافی..."
            />
          </div>

          <!-- آیتم‌ها -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              آیتم‌های سفارش *
            </label>
            
            <div v-for="(item, index) in form.items" :key="index" class="border border-orange-200 rounded-xl p-6 mb-4 bg-gradient-to-br from-orange-50 to-red-50 shadow-sm hover:shadow-md transition-all duration-200">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <AppInput
                  v-model="item.title"
                  label="عنوان آیتم"
                  placeholder="نام قطعه یا سرویس"
                  :error="getItemError(index, 'title')"
                  required
                />
                
                <AppInput
                  v-model="item.quantity"
                  label="تعداد"
                  type="number"
                  min="1"
                  :error="getItemError(index, 'quantity')"
                  required
                />
                
                <AppInput
                  v-model="item.note"
                  label="یادداشت (اختیاری)"
                  placeholder="توضیحات آیتم"
                />
              </div>
              
              <div class="mt-4 flex justify-end">
                <button
                  v-if="form.items.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  حذف آیتم
                </button>
              </div>
            </div>

            <button
              type="button"
              @click="addItem"
              class="w-full py-3 px-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 hover:border-orange-400 hover:text-orange-800 hover:bg-orange-50 transition-all duration-200 font-medium"
            >
              <svg class="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              افزودن آیتم جدید
            </button>
          </div>

          <!-- خطاهای کلی -->
          <AppAlert v-if="generalError" :message="generalError" variant="error" class="mb-4" />

          <!-- دکمه ارسال -->
          <AppButton
            type="submit"
            :loading="loading"
            loading-text="در حال ایجاد سفارش..."
            class="w-full"
            :disabled="!isFormValid"
          >
            ایجاد سفارش
          </AppButton>
        </form>

        <!-- نمایش سفارش ایجاد شده -->
        <div v-else class="text-center">
          <div class="mb-8">
            <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-green-600 text-xl font-bold mb-2">
              سفارش با موفقیت ایجاد شد!
            </div>
            <div class="text-gray-600 text-lg">
              کد سفارش: <span class="font-mono text-xl font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{{ orderData.code }}</span>
            </div>
          </div>

          <!-- QR Code -->
          <div class="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div class="text-lg font-semibold text-blue-900 mb-4 text-center">QR Code سفارش</div>
            <div v-if="!isClient" class="text-blue-600 text-center">در حال بارگذاری...</div>
            <div v-else ref="qrContainer" class="flex justify-center overflow-hidden">
              <!-- QR code will be inserted here -->
            </div>
          </div>

          <!-- لینک اشتراک‌گذاری -->
          <div class="mb-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
            <div class="text-lg font-semibold text-gray-900 mb-4">لینک اشتراک‌گذاری</div>
            <div class="space-y-3">
              <input
                :value="orderData.shareUrl"
                readonly
                class="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="flex flex-col sm:flex-row gap-3">
                <AppButton
                  @click="copyLink"
                  size="sm"
                  variant="secondary"
                  class="flex-1 px-6 py-3"
                >
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  کپی لینک
                </AppButton>
                <AppButton
                  @click="openLink"
                  size="sm"
                  variant="secondary"
                  class="flex-1 px-6 py-3"
                >
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  باز کردن لینک
                </AppButton>
              </div>
            </div>
          </div>

          <!-- دکمه‌های عملیات -->
          <div class="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 sm:justify-center">
            <AppButton
              @click="sendSMS"
              :loading="smsLoading"
              loading-text="در حال ارسال..."
              variant="secondary"
              class="w-full sm:w-auto px-8 py-3"
            >
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              ارسال SMS
            </AppButton>
            
            <AppButton
              @click="createNewOrder"
              variant="outline"
              class="w-full sm:w-auto px-8 py-3"
            >
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              سفارش جدید
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth: true })

// State
const form = ref({
  customerPhone: '',
  note: '',
  items: [{ title: '', quantity: 1, note: '' }]
})

const errors = ref<Record<string, string>>({})
const generalError = ref('')
const loading = ref(false)
const orderCreated = ref(false)
const orderData = ref<{ code: string; shareUrl: string } | null>(null)
const smsLoading = ref(false)
const isClient = ref(false)
const qrContainer = ref<HTMLElement>()

// Composables
const router = useRouter()
const { post } = useApi()
const { show: showToast } = useToast()

// Validation
const isFormValid = computed(() => {
  return form.value.customerPhone.trim() && 
         form.value.items.every(item => item.title.trim() && Number(item.quantity) > 0)
})

function getItemError(index: number, field: string): string {
  const item = form.value.items[index]
  if (!item) return ''
  
  if (field === 'title' && !item.title.trim()) {
    return 'عنوان آیتم الزامی است'
  }
  if (field === 'quantity' && Number(item.quantity) < 1) {
    return 'تعداد باید حداقل 1 باشد'
  }
  return ''
}

// Methods
function addItem() {
  form.value.items.push({ title: '', quantity: 1, note: '' })
}

function removeItem(index: number) {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

async function createOrder() {
  // Clear previous errors
  errors.value = {}
  generalError.value = ''
  
  // Validate form
  if (!isFormValid.value) {
    generalError.value = 'لطفاً تمام فیلدهای الزامی را پر کنید'
    return
  }
  
  loading.value = true
  
  try {
    const response = await post('/api/orders', {
      customerPhone: form.value.customerPhone.trim(),
             note: form.value.note?.trim() || undefined,
      items: form.value.items.map(item => ({
        title: item.title.trim(),
        quantity: Number(item.quantity),
        note: item.note?.trim() || undefined
      }))
    })
    
    if (response.ok) {
      orderData.value = response.order
      orderCreated.value = true
      showToast('سفارش با موفقیت ایجاد شد!', 'success')
    } else {
      throw new Error(response.message || 'خطا در ایجاد سفارش')
    }
    
  } catch (error: any) {
    console.error('Order creation error:', error)
    
    if (error.statusCode === 429) {
      generalError.value = 'تلاش زیادی انجام شده. لطفاً کمی صبر کنید.'
    } else if (error.statusCode === 400) {
      generalError.value = error.data?.statusMessage || 'داده‌های وارد شده نامعتبر است'
    } else if (error.statusCode === 403) {
      generalError.value = 'شما مجاز به ایجاد سفارش نیستید'
    } else {
      generalError.value = 'خطا در ایجاد سفارش. لطفاً دوباره تلاش کنید.'
    }
  } finally {
    loading.value = false
  }
}

async function sendSMS() {
  if (!orderData.value) return
  
  smsLoading.value = true
  
  try {
    const response = await post('/api/notify/sms', {
      phone: form.value.customerPhone,
      text: `لینک سفارش شما: ${orderData.value.shareUrl}`
    })
    
    if (response.ok) {
      showToast('درخواست SMS ثبت شد', 'success')
    } else {
      throw new Error(response.message || 'خطا در ارسال SMS')
    }
    
  } catch (error: any) {
    console.error('SMS error:', error)
    showToast('خطا در ارسال SMS', 'error')
  } finally {
    smsLoading.value = false
  }
}

function copyLink() {
  if (!orderData.value) return
  
  navigator.clipboard.writeText(orderData.value.shareUrl)
    .then(() => showToast('لینک کپی شد', 'success'))
    .catch(() => showToast('خطا در کپی کردن لینک', 'error'))
}

function openLink() {
  if (!orderData.value) return
  window.open(orderData.value.shareUrl, '_blank')
}

function createNewOrder() {
  // Reset form
  form.value = {
    customerPhone: '',
    note: '',
    items: [{ title: '', quantity: 1, note: '' }]
  }
  errors.value = {}
  generalError.value = ''
  orderCreated.value = false
  orderData.value = null
}

// QR Code generation (client-only)
onMounted(() => {
  isClient.value = true
  
  // Generate QR code if order is created
  if (orderCreated.value && orderData.value && qrContainer.value) {
    generateQRCode()
  }
})

watch(orderCreated, (newValue) => {
  if (newValue && orderData.value && qrContainer.value && isClient.value) {
    nextTick(() => generateQRCode())
  }
})

async function generateQRCode() {
  if (!orderData.value || !qrContainer.value) return
  
  try {
    // Dynamic import for QR code library (client-only)
    const QRCode = (await import('qrcode')).default
    
    // Clear previous QR
    qrContainer.value.innerHTML = ''
    
    // Generate QR code
    const canvas = await QRCode.toCanvas(orderData.value.shareUrl, {
      width: 200,
      margin: 2
    })
    
    qrContainer.value.appendChild(canvas)
    
  } catch (error) {
    console.error('QR generation error:', error)
    qrContainer.value.innerHTML = '<div class="text-red-500">خطا در تولید QR</div>'
  }
}
</script>

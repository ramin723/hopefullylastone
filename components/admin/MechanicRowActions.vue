<template>
  <div class="space-y-2">
    <!-- Assign Button -->
    <button
      v-if="!code"
      @click="handleAssign"
      :disabled="loading"
      class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
    >
      <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      تخصیص کد
    </button>

    <!-- Rotate Button -->
    <button
      v-if="code"
      @click="handleRotate"
      :disabled="loading"
      class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
    >
      <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      چرخش کد
    </button>

    <!-- Activate/Deactivate Buttons -->
    <div v-if="code" class="flex gap-2">
      <button
        v-if="!qrActive"
        @click="handleActivate"
        :disabled="loading"
        class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        فعال
      </button>

      <button
        v-if="qrActive"
        @click="handleDeactivate"
        :disabled="loading"
        class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        غیرفعال
      </button>
    </div>

    <!-- Management Actions -->
    <div class="space-y-2 mt-2">
      <!-- Suspend/Unsuspend Button -->
      <button
        v-if="!suspended"
        @click="handleSuspend"
        :disabled="loading"
        class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
        </svg>
        تعلیق
      </button>

      <button
        v-if="suspended"
        @click="handleUnsuspend"
        :disabled="loading"
        class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        رفع تعلیق
      </button>

      <!-- Reset Password Button -->
      <button
        @click="handleResetPassword"
        :disabled="loading"
        class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
        </svg>
        ریست رمز
      </button>

      <!-- Reinvite Button -->
      <button
        @click="handleReinvite"
        :disabled="loading"
        class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
        ارسال دعوت
      </button>
    </div>
  </div>

  <!-- Confirm Dialog -->
  <AdminConfirmDialog
    v-if="showConfirmDialog"
    :title="confirmTitle"
    :message="confirmMessage"
    :confirm-text="confirmText"
    :cancel-text="'لغو'"
    @confirm="confirmAction"
    @cancel="cancelAction"
  />
</template>

<script setup lang="ts">
interface Props {
  mechanicId: number
  code: string | null
  qrActive: boolean
  suspended?: boolean
}

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const showConfirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmText = ref('')
const pendingAction = ref<string | null>(null)

// Composables
const { show: showToast } = useToast()
const { post } = useApi()

// Methods
async function handleAssign() {
  await executeAction('assign')
}

async function handleRotate() {
  confirmTitle.value = 'تأیید چرخش کد'
  confirmMessage.value = 'آیا مطمئن هستید که می‌خواهید کد QR را چرخش دهید؟ کد قبلی باطل خواهد شد.'
  confirmText.value = 'چرخش کد'
  pendingAction.value = 'rotate'
  showConfirmDialog.value = true
}

async function handleActivate() {
  await executeAction('activate')
}

async function handleDeactivate() {
  await executeAction('deactivate')
}

async function handleSuspend() {
  confirmTitle.value = 'تأیید تعلیق مکانیک'
  confirmMessage.value = 'آیا مطمئن هستید که می‌خواهید این مکانیک را تعلیق کنید؟'
  confirmText.value = 'تعلیق'
  pendingAction.value = 'suspend'
  showConfirmDialog.value = true
}

async function handleUnsuspend() {
  await executeAction('unsuspend')
}

async function handleResetPassword() {
  confirmTitle.value = 'تأیید ریست رمز'
  confirmMessage.value = 'آیا مطمئن هستید که می‌خواهید رمز عبور این مکانیک را ریست کنید؟ مکانیک باید رمز جدید تعیین کند.'
  confirmText.value = 'ریست رمز'
  pendingAction.value = 'reset-password'
  showConfirmDialog.value = true
}

async function handleReinvite() {
  await executeAction('reinvite')
}

async function confirmAction() {
  showConfirmDialog.value = false
  if (pendingAction.value) {
    await executeAction(pendingAction.value)
    pendingAction.value = null
  }
}

function cancelAction() {
  showConfirmDialog.value = false
  pendingAction.value = null
}

async function executeAction(action: string) {
  loading.value = true
  
  try {
    let response: any
    let message = ''

    if (['assign', 'rotate', 'activate', 'deactivate'].includes(action)) {
      // QR code actions
      const body: any = { action }
      if (action === 'rotate') {
        body.confirmRotate = true
      }
      response = await post(`/api/admin/mechanics/${props.mechanicId}/code`, body)
    } else {
      // Management actions
      switch (action) {
        case 'suspend':
          response = await post(`/api/admin/mechanics/${props.mechanicId}/suspend`, {})
          message = 'مکانیک با موفقیت تعلیق شد'
          break
        case 'unsuspend':
          response = await post(`/api/admin/mechanics/${props.mechanicId}/unsuspend`, {})
          message = 'تعلیق مکانیک با موفقیت لغو شد'
          break
        case 'reset-password':
          response = await post(`/api/admin/mechanics/${props.mechanicId}/reset-password`, {})
          message = 'رمز عبور با موفقیت ریست شد'
          break
        case 'reinvite':
          response = await post(`/api/admin/mechanics/${props.mechanicId}/reinvite`, {})
          message = 'دعوت با موفقیت ارسال شد'
          break
      }
    }

    if (response?.ok) {
      if (!message) {
        // QR code action messages
        switch (action) {
          case 'assign':
            message = 'کد QR با موفقیت تخصیص داده شد'
            break
          case 'rotate':
            message = 'کد QR با موفقیت چرخش یافت'
            break
          case 'activate':
            message = 'QR فعال شد'
            break
          case 'deactivate':
            message = 'QR غیرفعال شد'
            break
        }
      }
      
      showToast(message, 'success')
      emit('success')
    }
  } catch (error: any) {
    let message = error.data?.statusMessage || error.message || 'خطا در انجام عملیات'
    
    // Handle specific error cases with better messages
    if (error.statusCode === 409 && action === 'reset-password') {
      message = 'این مکانیک قبلاً باید رمز عبور خود را تغییر دهد'
    }
    
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

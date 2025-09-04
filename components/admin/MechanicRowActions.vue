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
    const body: any = { action }
    if (action === 'rotate') {
      body.confirmRotate = true
    }

    const response = await post(`/api/admin/mechanics/${props.mechanicId}/code`, body)

    if (response.ok) {
      let message = ''
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
      
      showToast(message, 'success')
      emit('success')
    }
  } catch (error: any) {
    const message = error.data?.statusMessage || error.message || 'خطا در انجام عملیات'
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

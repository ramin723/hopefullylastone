<template>
  <div v-if="message" :class="alertClasses" role="alert">
    <div class="flex">
      <div class="flex-shrink-0">
        <!-- Success Icon -->
        <svg v-if="variant === 'success'" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <!-- Error Icon -->
        <svg v-else-if="variant === 'error'" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <!-- Info Icon -->
        <svg v-else class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="mr-3">
        <p :class="textClasses">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  variant?: 'success' | 'error' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info'
})

const alertClasses = computed(() => {
  const baseClasses = 'rounded-md p-4'
  
  switch (props.variant) {
    case 'success':
      return `${baseClasses} bg-green-50 border border-green-200`
    case 'error':
      return `${baseClasses} bg-red-50 border border-red-200`
    default:
      return `${baseClasses} bg-blue-50 border border-blue-200`
  }
})

const textClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-sm text-green-800'
    case 'error':
      return 'text-sm text-red-800'
    default:
      return 'text-sm text-blue-800'
  }
})
</script>

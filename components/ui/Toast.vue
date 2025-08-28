<template>
  <transition name="fade">
    <div v-if="toast" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div :class="wrapperClass" class="px-4 py-3 rounded-md shadow-lg border text-sm min-w-[280px] text-center">
        {{ toast.message }}
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { toast } = useToast()

const wrapperClass = computed(() => {
  if (!toast.value) return 'bg-gray-800 text-white border-gray-700'
  switch (toast.value.type) {
    case 'success': return 'bg-green-600 text-white border-green-700'
    case 'error': return 'bg-red-600 text-white border-red-700'
    default: return 'bg-gray-800 text-white border-gray-700'
  }
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>



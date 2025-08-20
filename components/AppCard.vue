<template>
  <div class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-medium text-gray-900">{{ title }}</h3>
      </slot>
    </div>
    
    <!-- Content -->
    <div class="px-6 py-4">
      <slot />
    </div>
    
    <!-- Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

const props = defineProps<Props>()
</script>

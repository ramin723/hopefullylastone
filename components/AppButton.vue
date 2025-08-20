<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
    @click="$emit('click', $event)"
  >
    <span v-if="loading">{{ loadingText }}</span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  loadingText?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  loading: false,
  loadingText: 'در حال بارگذاری...',
  disabled: false
})

defineEmits<{
  'click': [event: MouseEvent]
}>()
</script>

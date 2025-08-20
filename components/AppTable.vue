<template>
  <div class="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
      <!-- Header -->
      <thead class="bg-gradient-to-r from-emerald-50 to-emerald-100">
        <slot name="header">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-4 text-right text-sm font-semibold text-emerald-800 uppercase tracking-wider border-b-2 border-emerald-200"
            >
              {{ column.label }}
            </th>
          </tr>
        </slot>
      </thead>
      
      <!-- Body -->
      <tbody class="bg-white divide-y divide-gray-100">
        <slot name="body" />
      </tbody>
      
      <!-- Footer -->
      <tfoot v-if="$slots.footer" class="bg-gray-50">
        <slot name="footer" />
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
}

interface Props {
  columns?: Column[]
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => []
})
</script>

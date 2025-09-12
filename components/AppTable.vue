<template>
  <div class="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
      <!-- Header -->
      <thead class="bg-gradient-to-r from-emerald-50 to-emerald-100">
        <slot name="header">
          <tr>
            <th 
              v-for="column in headers" 
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
        <slot name="body">
          <!-- Loading state -->
          <tr v-if="loading">
            <td :colspan="headers.length" class="px-6 py-12 text-center">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              <p class="mt-2 text-sm text-gray-600">در حال بارگذاری...</p>
            </td>
          </tr>
          
          <!-- Empty state -->
          <tr v-else-if="!data || data.length === 0">
            <td :colspan="headers.length" class="px-6 py-12 text-center">
              <div class="text-gray-400 mb-2">
                <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <p class="text-sm text-gray-500">{{ emptyMessage || 'هیچ داده‌ای یافت نشد' }}</p>
            </td>
          </tr>
          
          <!-- Data rows -->
          <template v-else>
            <slot name="row" v-for="(row, index) in data" :key="index" :row="row" :index="index" />
          </template>
        </slot>
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
  format?: string
}

interface Props {
  headers?: Column[]
  data?: any[]
  loading?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  headers: () => [],
  data: () => [],
  loading: false,
  emptyMessage: 'هیچ داده‌ای یافت نشد'
})
</script>

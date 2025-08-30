<template>
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
      <li v-for="(item, index) in items" :key="index" class="inline-flex items-center">
        <!-- Separator -->
        <div v-if="index > 0" class="flex items-center">
          <svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        
        <!-- Breadcrumb Item -->
        <NuxtLink 
          v-if="item.to"
          :to="item.to"
          class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
        >
          {{ item.label }}
        </NuxtLink>
        <span 
          v-else
          class="text-sm font-medium text-gray-500"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>

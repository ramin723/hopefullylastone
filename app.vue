<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast />
  </div>
</template>

<script setup>
// صفحه اصلی ساده - فقط NuxtPage را نمایش می‌دهد
import Toast from '~/components/ui/Toast.vue'
</script>

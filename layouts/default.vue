<script setup lang="ts">
const user = useState<any>('user', () => null)
const hydrated = useState<boolean>('hydrated', () => false)
const router = useRouter()

async function doLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } finally {
    user.value = null
    hydrated.value = false
    await router.replace('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900">
    <header class="border-b bg-gray-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="font-bold">همکاری</div>
        <div class="text-sm flex items-center gap-3">
          <span v-if="user">
            {{ user.fullName }} <span class="text-gray-500">({{ user.role }})</span>
          </span>
          <button v-if="user" class="px-3 py-1 border rounded" @click="doLogout">خروج</button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>

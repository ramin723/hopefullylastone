<script setup lang="ts">
const { user, hydrated, ensureAuth } = useAuth()

// اطمینان از اینکه user data load شده
onMounted(async () => {
  if (!user.value) {
    await ensureAuth()
  }
})

async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch (err) {
    console.warn('Logout error', err)
    // در صورت خطا، toast یا alert نمایش دهید
  } finally {
    // همیشه state را پاک کن
    user.value = null
    hydrated.value = false
    await navigateTo('/login', { replace: true })
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
          <button v-if="user" class="px-3 py-1 border rounded" @click="handleLogout">خروج</button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>

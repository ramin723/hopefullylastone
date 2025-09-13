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
    <header class="border-b bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <!-- لوگو و نام برند -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">هـ</span>
          </div>
          <span class="font-bold text-gray-800">همکاری</span>
        </div>
        
        <!-- اطلاعات کاربر -->
        <div class="text-sm flex items-center gap-3">
          <span v-if="user" class="text-gray-700">
            {{ user.fullName }} <span class="text-gray-500">({{ user.role }})</span>
          </span>
          <button v-if="user" class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors" @click="doLogout">خروج</button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>

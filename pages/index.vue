<script setup lang="ts">
definePageMeta({ auth: false })

const user = useState<any>('auth:user', () => null)
const hydrated = useState<boolean>('auth:hydrated', () => false)
const router = useRouter()

onMounted(() => {
  // کمی صبر کن تا hydration کامل شود
  setTimeout(() => {
    const u = user.value
    if (u?.role === 'ADMIN') return router.replace('/admin/settlements')
    if (u?.role === 'VENDOR') return router.replace('/vendor/pos')
    if (u?.role === 'MECHANIC') return router.replace('/mechanic')
    return router.replace('/login')
  }, 100)
})
</script>

<template>
  <div class="p-6 text-sm text-gray-600">در حال هدایت…</div>
</template>

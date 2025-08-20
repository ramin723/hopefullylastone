<template>
  <main class="p-6 space-y-6">
    <header class="space-y-2">
      <h1 class="text-xl font-bold">داشبورد مکانیک</h1>
      <p v-if="user">سلام، {{ user.fullName }}</p>
    </header>

    <section class="space-y-3">
      <!-- فیلترهای سریع تاریخ -->
      <div class="flex gap-2 items-center flex-wrap">
        <span class="text-sm font-medium text-gray-700">فیلترهای سریع:</span>
        <button 
          @click="setDateRange('today')" 
          class="px-3 py-1 text-xs border rounded hover:bg-gray-50"
        >
          امروز
        </button>
        <button 
          @click="setDateRange('last3days')" 
          class="px-3 py-1 text-xs border rounded hover:bg-gray-50"
        >
          ۳ روز گذشته
        </button>
        <button 
          @click="setDateRange('lastWeek')" 
          class="px-3 py-1 text-xs border rounded hover:bg-gray-50"
        >
          هفته گذشته
        </button>
        <button 
          @click="clearDateRange" 
          class="px-3 py-1 text-xs border rounded hover:bg-gray-50 text-red-600"
        >
          پاک کردن
        </button>
      </div>

      <!-- فیلترهای دستی -->
      <div class="flex gap-3 items-end flex-wrap">
        <div>
          <label class="block text-sm mb-1">از تاریخ</label>
          <input v-model="q.from" type="date" class="border px-2 py-1 rounded" />
        </div>
        <div>
          <label class="block text-sm mb-1">تا تاریخ</label>
          <input v-model="q.to" type="date" class="border px-2 py-1 rounded" />
        </div>
        <AppSelect
          v-model="q.status"
          label="وضعیت"
          placeholder="انتخاب کنید"
          :options="statusOptions"
        />
        <button @click="load" class="border px-3 py-1 rounded">اعمال فیلتر</button>
      </div>
    </section>

    <section v-if="loading">در حال بارگذاری…</section>
    <section v-else-if="errorMsg" class="text-red-600">{{ errorMsg }}</section>

    <section v-else-if="data" class="space-y-4">
      <div class="border rounded p-4">
        <p>تعداد تراکنش‌ها: <b>{{ data.count }}</b></p>
        <p>جمع سهم مکانیک: <b>{{ data.totalMechanic.toLocaleString() }}</b></p>
      </div>

      <AppTable :columns="tableColumns">
        <template #body>
          <tr v-for="(it, i) in data.items" :key="it.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ new Date(it.createdAt).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.vendor }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.status }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.amountTotal.toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ it.amountEligible.toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ it.mechanicAmount.toLocaleString() }}</td>
          </tr>
          <tr v-if="!data.items.length">
            <td class="px-6 py-4 text-center text-gray-500" colspan="7">موردی یافت نشد.</td>
          </tr>
        </template>
      </AppTable>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { token, user, authHeaders } = useAuth()

onMounted(() => {
  if (!token.value) return router.push('/login')
})

const q = reactive<{ from?: string; to?: string; status?: string }>({})
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const data = ref<{ totalMechanic: number; count: number; items: any[] } | null>(null)

// تعریف ستون‌های جدول
const tableColumns = [
  { key: 'id', label: '#' },
  { key: 'createdAt', label: 'تاریخ' },
  { key: 'vendor', label: 'فروشگاه' },
  { key: 'status', label: 'وضعیت' },
  { key: 'amountTotal', label: 'مبلغ کل' },
  { key: 'amountEligible', label: 'مبلغ مشمول' },
  { key: 'mechanicAmount', label: 'سهم مکانیک' }
]

// گزینه‌های وضعیت
const statusOptions = [
  { value: '', label: 'همه' },
  { value: 'PENDING', label: 'در انتظار' },
  { value: 'SETTLED', label: 'تسویه‌شده' },
  { value: 'CANCELLED', label: 'لغو' }
]

async function load() {
  try {
    loading.value = true
    errorMsg.value = null
    const params = new URLSearchParams()
    if (q.from) params.set('from', q.from)
    if (q.to) params.set('to', q.to)
    if (q.status) params.set('status', q.status)
    const url = '/api/mechanic/transactions' + (params.toString() ? `?${params.toString()}` : '')
    const headers = authHeaders()
    if (headers.Authorization) {
      data.value = await $fetch(url, { headers })
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || e?.message || 'خطا در بارگذاری'
  } finally {
    loading.value = false
  }
}

// توابع فیلترهای سریع تاریخ
function setDateRange(range: 'today' | 'last3days' | 'lastWeek') {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (range) {
    case 'today':
      q.from = today.toISOString().split('T')[0]
      q.to = today.toISOString().split('T')[0]
      break
    case 'last3days':
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(today.getDate() - 3)
      q.from = threeDaysAgo.toISOString().split('T')[0]
      q.to = today.toISOString().split('T')[0]
      break
    case 'lastWeek':
      const lastWeek = new Date(today)
      lastWeek.setDate(today.getDate() - 7)
      q.from = lastWeek.toISOString().split('T')[0]
      q.to = today.toISOString().split('T')[0]
      break
  }
  
  // بارگذاری خودکار پس از تنظیم تاریخ
  load()
}

function clearDateRange() {
  q.from = undefined
  q.to = undefined
  q.status = undefined
  // بارگذاری خودکار پس از پاک کردن فیلترها
  load()
}

watchEffect(() => {
  if (token.value) load()
})
</script>

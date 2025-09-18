<template>
  <div>
    <!-- Breadcrumbs -->
    <Breadcrumbs :items="[
      { label: 'ادمین', to: '/admin' },
      { label: 'تسویه‌ها', to: '/admin/settlements' },
      { label: 'ایجاد جدید' }
    ]" />

    <!-- عنوان صفحه -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">ساخت تسویه جدید</h1>
      <p class="text-gray-600 mt-2">ایجاد تسویه جدید برای vendor انتخاب شده</p>
    </div>

    <!-- فرم -->
    <div class="bg-white p-6 rounded-lg border max-w-2xl">
      <form @submit.prevent="onSubmit">
        <!-- انتخاب Vendor -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">انتخاب Vendor</label>
          <select
            v-model="form.vendorId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="pending"
          >
            <option value="">انتخاب کنید...</option>
            <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
              {{ vendor.name }}
            </option>
          </select>
        </div>

        <!-- انتخاب اختیاری Mechanic -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">مکانیک (اختیاری)</label>
          <input
            v-model="form.mechanicId"
            type="number"
            placeholder="ID مکانیک (اختیاری)"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="pending"
          />
          <p class="text-xs text-gray-500 mt-1">اختیاری - اگر انتخاب کنید فقط تراکنش‌های این مکانیک وارد تسویه می‌شود.</p>
        </div>

        <!-- انتخاب مکانیک -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">انتخاب مکانیک</label>
          <select
            v-model="form.mechanicId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="pending"
          >
            <option value="">انتخاب کنید...</option>
            <option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
              {{ mechanic.name }}
            </option>
          </select>
        </div>

        <!-- تاریخ از -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">تاریخ از</label>
          <SimpleDatePicker
            v-model="form.from"
            placeholder="تاریخ شروع را انتخاب کنید"
            :disabled="pending"
          />
          <p class="text-xs text-gray-500 mt-1">تاریخ شمسی به فرمت 1403-06-05</p>
        </div>

        <!-- تاریخ تا -->
        <div class="mb-6">
          <label class="text-sm font-medium text-gray-700 mb-2">تاریخ تا</label>
          <SimpleDatePicker
            v-model="form.to"
            placeholder="تاریخ پایان را انتخاب کنید"
            :disabled="pending"
          />
          <p class="text-xs text-gray-500 mt-1">تاریخ شمسی به فرمت 1403-06-05</p>
        </div>

        <!-- دکمه‌های سریع بازه تاریخ -->
        <div class="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            @click="quickRange(7)"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            :disabled="pending"
          >
            هفته گذشته
          </button>
          <button
            type="button"
            @click="quickRange(30)"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            :disabled="pending"
          >
            ماه گذشته
          </button>
          <button
            type="button"
            @click="clearDates"
            class="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            :disabled="pending"
          >
            پاک کردن تاریخ‌ها
          </button>
        </div>

        <!-- توضیح -->
        <div class="mb-6 p-4 bg-blue-50 rounded-md">
          <p class="text-sm text-blue-800">
            تمام تراکنش‌های PENDING این Vendor در این بازه جمع‌آوری می‌شود.
          </p>
        </div>

        <!-- دکمه‌ها -->
        <div class="flex flex-wrap gap-4 items-center">
          <button
            type="button"
            @click="onPreview"
            :disabled="preview.loading || pending || !isFormValid"
            class="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <svg v-if="preview.loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>{{ preview.loading ? 'در حال محاسبه…' : 'محاسبه پیش‌نمایش' }}</span>
          </button>

          <button
            type="submit"
            :disabled="pending || !isFormValid || !preview.ready || preview.count === 0"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <svg v-if="pending" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>{{ pending ? 'در حال ایجاد...' : 'ثبت نهایی تسویه' }}</span>
          </button>

          <NuxtLink
            to="/admin/settlements"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            انصراف
          </NuxtLink>
        </div>

        <!-- پیش‌نمایش -->
        <div v-if="preview.ready" class="mt-8">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900">پیش‌نمایش تراکنش‌های واجد شرایط</h3>
            <div class="text-sm text-gray-700">
              مجموع واجد شرایط: <span class="font-bold">{{ preview.totals.eligible.toLocaleString() }}</span>
              <span class="mx-2">|</span>
              سهم مکانیک: <span class="font-bold">{{ preview.totals.mechanic.toLocaleString() }}</span>
              <span class="mx-2">|</span>
              سهم پلتفرم: <span class="font-bold">{{ preview.totals.platform.toLocaleString() }}</span>
              <span class="mx-2">|</span>
              تعداد: <span class="font-bold">{{ preview.count }}</span>
            </div>
          </div>

          <div v-if="preview.count === 0" class="p-3 rounded-md border text-sm text-gray-600">هیچ تراکنش واجد شرایطی در این بازه یافت نشد.</div>

          <div v-else class="overflow-x-auto border rounded-md">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="px-3 py-2 text-right">تاریخ</th>
                  <th class="px-3 py-2 text-right">مشتری</th>
                  <th class="px-3 py-2 text-right">مکانیک</th>
                  <th class="px-3 py-2 text-right">واجد شرایط</th>
                  <th class="px-3 py-2 text-right">کل</th>
                  <th class="px-3 py-2 text-right">سهم مکانیک</th>
                  <th class="px-3 py-2 text-right">سهم پلتفرم</th>
                  <th class="px-3 py-2 text-right">یادداشت</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in preview.items" :key="row.id" class="border-t">
                  <td class="px-3 py-2 whitespace-nowrap">{{ formatJalaliWithTime(row.createdAt) }}</td>
                  <td class="px-3 py-2">{{ row.customerPhone }}</td>
                  <td class="px-3 py-2">{{ row.mechanic?.name }} ({{ row.mechanic?.code }})</td>
                  <td class="px-3 py-2">{{ row.amounts.eligible.toLocaleString() }}</td>
                  <td class="px-3 py-2">{{ row.amounts.total.toLocaleString() }}</td>
                  <td class="px-3 py-2">{{ row.amounts.mechanic.toLocaleString() }}</td>
                  <td class="px-3 py-2">{{ row.amounts.platform.toLocaleString() }}</td>
                  <td class="px-3 py-2">{{ row.note || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- صفحه‌بندی -->
          <div v-if="preview.count > 0" class="flex items-center justify-between mt-3 text-sm">
            <div>
              صفحه {{ preview.page }} از {{ totalPages }}
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-3 py-1 border rounded-md disabled:opacity-50"
                :disabled="preview.loading || preview.page <= 1"
                @click="changePage(preview.page - 1)"
              >قبلی</button>
              <button
                type="button"
                class="px-3 py-1 border rounded-md disabled:opacity-50"
                :disabled="preview.loading || preview.page >= totalPages"
                @click="changePage(preview.page + 1)"
              >بعدی</button>
            </div>
          </div>
        </div>

        <!-- پیام خطا -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { formatJalaliWithTime } from '~/utils/date'
import { normalizeDateInputToISO, normalizeDateInputToISOEndOfDay } from '~/utils/date-ui'
import SimpleDatePicker from '~/components/SimpleDatePicker.vue'
// import moment from 'moment-jalaali'

definePageMeta({ 
  auth: true,
  layout: 'authenticated' 
})

// تعریف interface برای Vendor
interface Vendor {
  id: number
  name: string
}

// تعریف interface برای پاسخ API vendors
interface VendorsResponse {
  items: Vendor[]
}

interface MechanicsResponse {
  items: { id: number; name: string }[]
}

// تعریف interface برای پاسخ API settlements
interface SettlementResponse {
  created: boolean
  settlementId?: number
  vendorId?: number
  vendorName: string
  periodFrom?: string
  periodTo?: string
  totals?: {
    eligible: number
    mechanic: number
    platform: number
  }
  count?: number
  message: string
}

interface PreviewItem {
  id: number
  createdAt: string
  customerPhone: string
  mechanic: { id: number; name: string; code: string }
  amounts: { total: number; eligible: number; mechanic: number; platform: number }
  note?: string | null
}

interface PreviewResponse {
  items: PreviewItem[]
  totals: { eligible: number; mechanic: number; platform: number }
  count: number
}

// فرم
const form = ref({
  vendorId: '',
  mechanicId: '',
  from: '',
  to: ''
})

// دریافت لیست vendors
const { data: vendorsData, pending: vendorsPending, error: vendorsError } = await useFetch<VendorsResponse>('/api/vendors')

// دریافت لیست مکانیک‌ها
const { data: mechanicsData, pending: mechanicsPending, error: mechanicsError } = await useFetch<MechanicsResponse>('/api/mechanics')

// computed برای vendors
const vendors = computed(() => vendorsData.value?.items || [])

// computed برای مکانیک‌ها
const mechanics = computed(() => mechanicsData.value?.items || [])

// وضعیت فرم
const pending = ref(false)
const error = ref('')

const preview = reactive({
  loading: false,
  ready: false,
  items: [] as PreviewItem[],
  totals: { eligible: 0, mechanic: 0, platform: 0 },
  count: 0,
  page: 1,
  pageSize: 10
})

const totalPages = computed(() => Math.max(1, Math.ceil(preview.count / preview.pageSize)))

// اعتبارسنجی فرم
const isFormValid = computed(() => {
  return form.value.vendorId && 
         form.value.from && 
         form.value.to && 
         form.value.from <= form.value.to
})

// ارسال فرم
async function submitForm() {
  if (!isFormValid.value) return
  if (!preview.ready || preview.count === 0) return
  
  try {
    pending.value = true
    error.value = ''
    
    const { post } = useApi()
    
    // تبدیل تاریخ‌های شمسی به ISO
    const fromISO = normalizeDateInputToISO(form.value.from)
    const toISO = normalizeDateInputToISOEndOfDay(form.value.to)
    
    if (!fromISO || !toISO) {
      error.value = 'تاریخ‌های وارد شده نامعتبر هستند'
      useToast().show(error.value, 'error')
      return
    }

    const response = await post<SettlementResponse>('/api/settlements', {
      vendorId: Number(form.value.vendorId),
      mechanicId: form.value.mechanicId ? Number(form.value.mechanicId) : undefined,
      from: fromISO,
      to: toISO
    })
    
    // موفقیت - انتقال به صفحه جزئیات
    if (response.created && response.settlementId) {
      useToast().show('تسویه با موفقیت ساخته شد', 'success')
      await navigateTo(`/admin/settlements/${response.settlementId}`)
    } else {
      error.value = 'خطا در ایجاد تسویه'
      useToast().show(error.value, 'error')
    }
    
  } catch (err: any) {
    console.warn('Error creating settlement:', err)
    error.value = err.data?.statusMessage || err.data?.message || 'خطا در ایجاد تسویه'
    useToast().show(error.value, 'error')
  } finally {
    pending.value = false
  }
}

function onSubmit(e: Event) {
  e.preventDefault()
  if (!pending.value) submitForm()
}

// تابع تبدیل میلادی به شمسی
function gregorianToJalali(gregorianDate: Date): string {
  const year = gregorianDate.getFullYear()
  const month = gregorianDate.getMonth() + 1
  const day = gregorianDate.getDate()
  
  // الگوریتم ساده و صحیح تبدیل میلادی به جلالی
  // محاسبه دقیق‌تر برای سال‌های اخیر
  let jalaliYear = year - 621
  let jalaliMonth = month + 2
  let jalaliDay = day
  
  if (jalaliMonth > 12) {
    jalaliMonth -= 12
    jalaliYear++
  }
  
  // تنظیم محدوده‌ها
  if (jalaliMonth > 12) {
    jalaliMonth = 12
  }
  if (jalaliDay > 31) {
    jalaliDay = 31
  }
  
  return `${jalaliYear}-${jalaliMonth.toString().padStart(2, '0')}-${jalaliDay.toString().padStart(2, '0')}`
}

function quickRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  
  // تبدیل به تاریخ شمسی با الگوریتم صحیح
  const startJalali = gregorianToJalali(start)
  const endJalali = gregorianToJalali(end)
  
  form.value.from = startJalali
  form.value.to = endJalali
}

function clearDates() {
  form.value.from = ''
  form.value.to = ''
}

async function onPreview() {
  if (!isFormValid.value) return
  try {
    preview.loading = true
    error.value = ''
    preview.ready = false

    const { get } = useApi()
    const fromISO = normalizeDateInputToISO(form.value.from)
    const toISO = normalizeDateInputToISOEndOfDay(form.value.to)
    if (!fromISO || !toISO) {
      error.value = 'تاریخ‌های وارد شده نامعتبر هستند'
      useToast().show(error.value, 'error')
      return
    }

    const params = new URLSearchParams({
      vendorId: String(form.value.vendorId),
      from: fromISO,
      to: toISO,
      page: String(preview.page),
      pageSize: String(preview.pageSize)
    })
    if (form.value.mechanicId) params.set('mechanicId', String(form.value.mechanicId))

    const res = await get<PreviewResponse>(`/api/settlements/preview?${params.toString()}`)
    preview.items = res.items
    preview.totals = res.totals
    preview.count = res.count
    preview.ready = true
  } catch (err: any) {
    console.warn('Error preview settlement:', err)
    error.value = err.data?.statusMessage || err.data?.message || 'خطا در محاسبه پیش‌نمایش'
    useToast().show(error.value, 'error')
  } finally {
    preview.loading = false
  }
}

async function changePage(newPage: number) {
  if (newPage === preview.page) return
  preview.page = Math.max(1, Math.min(totalPages.value, newPage))
  await onPreview()
}
</script>

<script setup lang="ts">
const { user } = useAuth()
const { show } = useToast()
const router = useRouter()

// State برای فرم
const form = ref({
  fullName: '',
  storeName: '', // فقط برای فروشندگان
  city: '',
  specialties: '', // فقط برای مکانیک‌ها
  addressLine: '', // فقط برای فروشندگان
  postalCode: '', // فقط برای فروشندگان
  province: '' // فقط برای فروشندگان
})

const loading = ref(false)
const saving = ref(false)

// بارگذاری اطلاعات پروفایل
const loadProfile = async () => {
  try {
    loading.value = true
    const { get } = useApi()
    const response = await get('/api/users/me/profile')
    
    form.value = {
      fullName: response.user.fullName || '',
      storeName: response.profile?.storeName || '',
      city: response.profile?.city || '',
      specialties: response.profile?.specialties || '',
      addressLine: response.profile?.addressLine || '',
      postalCode: response.profile?.postalCode || '',
      province: response.profile?.province || ''
    }
  } catch (error: any) {
    console.error('Error loading profile:', error)
    show('خطا در بارگذاری اطلاعات پروفایل', 'error')
  } finally {
    loading.value = false
  }
}

// ذخیره تغییرات
const saveProfile = async () => {
  try {
    saving.value = true
    
    // اعتبارسنجی
    if (!form.value.fullName.trim()) {
      show('نام کامل الزامی است', 'error')
      return
    }

    // آماده کردن داده‌ها برای ارسال
    const updateData: any = {
      fullName: form.value.fullName.trim()
    }

    // اضافه کردن فیلدهای اختصاصی نقش
    if (user.value?.role === 'VENDOR') {
      if (form.value.storeName.trim()) {
        updateData.storeName = form.value.storeName.trim()
      }
      updateData.city = form.value.city.trim()
      updateData.addressLine = form.value.addressLine.trim()
      updateData.postalCode = form.value.postalCode.trim()
      updateData.province = form.value.province.trim()
    } else if (user.value?.role === 'MECHANIC') {
      updateData.city = form.value.city.trim()
      updateData.specialties = form.value.specialties.trim()
    }

    const { patch } = useApi()
    await patch('/api/users/me/profile', updateData)

    show('پروفایل با موفقیت به‌روزرسانی شد', 'success')
    
    // به‌روزرسانی اطلاعات کاربر در state
    if (user.value) {
      user.value.fullName = form.value.fullName.trim()
    }
    
  } catch (error: any) {
    console.error('Error saving profile:', error)
    show(error.data?.message || 'خطا در ذخیره تغییرات', 'error')
  } finally {
    saving.value = false
  }
}

// بارگذاری اطلاعات در ابتدا
onMounted(() => {
  loadProfile()
})

// تنظیم layout
definePageMeta({
  layout: 'authenticated'
})
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">ویرایش پروفایل</h1>
      <p class="text-gray-600 mt-1">اطلاعات شخصی خود را ویرایش کنید</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- فرم ویرایش پروفایل -->
    <form v-else @submit.prevent="saveProfile" class="space-y-6">
      <AppCard>
        <template #header>
          <h2 class="text-lg font-medium text-gray-900">اطلاعات شخصی</h2>
        </template>
        
        <div class="space-y-4">
          <!-- نام کامل -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
              نام کامل <span class="text-red-500">*</span>
            </label>
            <AppInput
              id="fullName"
              v-model="form.fullName"
              type="text"
              placeholder="نام کامل خود را وارد کنید"
              required
              :disabled="saving"
            />
          </div>

          <!-- نام فروشگاه (فقط برای فروشندگان) -->
          <div v-if="user?.role === 'VENDOR'">
            <label for="storeName" class="block text-sm font-medium text-gray-700 mb-1">
              نام فروشگاه
            </label>
            <AppInput
              id="storeName"
              v-model="form.storeName"
              type="text"
              placeholder="نام فروشگاه خود را وارد کنید"
              :disabled="saving"
            />
          </div>

          <!-- شهر -->
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
              شهر
            </label>
            <AppInput
              id="city"
              v-model="form.city"
              type="text"
              placeholder="شهر خود را وارد کنید"
              :disabled="saving"
            />
          </div>

          <!-- تخصص‌ها (فقط برای مکانیک‌ها) -->
          <div v-if="user?.role === 'MECHANIC'">
            <label for="specialties" class="block text-sm font-medium text-gray-700 mb-1">
              تخصص‌ها
            </label>
            <AppInput
              id="specialties"
              v-model="form.specialties"
              type="text"
              placeholder="تخصص‌های خود را وارد کنید (مثال: موتور، گیربکس، برق)"
              :disabled="saving"
            />
          </div>
        </div>
      </AppCard>

      <!-- اطلاعات آدرس (فقط برای فروشندگان) -->
      <AppCard v-if="user?.role === 'VENDOR'">
        <template #header>
          <h2 class="text-lg font-medium text-gray-900">اطلاعات آدرس</h2>
        </template>
        
        <div class="space-y-4">
          <!-- آدرس -->
          <div>
            <label for="addressLine" class="block text-sm font-medium text-gray-700 mb-1">
              آدرس
            </label>
            <AppInput
              id="addressLine"
              v-model="form.addressLine"
              type="text"
              placeholder="آدرس کامل فروشگاه"
              :disabled="saving"
            />
          </div>

          <!-- کد پستی -->
          <div>
            <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">
              کد پستی
            </label>
            <AppInput
              id="postalCode"
              v-model="form.postalCode"
              type="text"
              placeholder="کد پستی"
              :disabled="saving"
            />
          </div>

          <!-- استان -->
          <div>
            <label for="province" class="block text-sm font-medium text-gray-700 mb-1">
              استان
            </label>
            <AppInput
              id="province"
              v-model="form.province"
              type="text"
              placeholder="استان"
              :disabled="saving"
            />
          </div>
        </div>
      </AppCard>

      <!-- دکمه‌های عملیات -->
      <div class="flex gap-3 justify-end">
        <AppButton
          type="button"
          variant="secondary"
          @click="router.back()"
          :disabled="saving"
        >
          انصراف
        </AppButton>
        
        <AppButton
          type="submit"
          :loading="saving"
          :disabled="saving"
        >
          {{ saving ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
        </AppButton>
      </div>
    </form>
  </div>
</template>

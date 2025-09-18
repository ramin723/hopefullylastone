<template>
  <div class="simple-date-picker">
    <div class="flex items-center gap-2">
      <!-- فیلدهای ورودی تاریخ -->
      <div class="flex items-center gap-1 bg-white border border-gray-300 rounded-lg overflow-hidden">
        <!-- سال -->
        <input
          v-model="year"
          type="text"
          placeholder="1403"
          maxlength="4"
          class="w-16 px-2 py-2 text-center text-sm border-none outline-none focus:bg-blue-50"
          @input="handleYearInput"
          @blur="validateAndEmit"
        />
        <span class="text-gray-400 text-sm">/</span>
        
        <!-- ماه -->
        <input
          v-model="month"
          type="text"
          placeholder="06"
          maxlength="2"
          class="w-12 px-2 py-2 text-center text-sm border-none outline-none focus:bg-blue-50"
          @input="handleMonthInput"
          @blur="validateAndEmit"
        />
        <span class="text-gray-400 text-sm">/</span>
        
        <!-- روز -->
        <input
          v-model="day"
          type="text"
          placeholder="05"
          maxlength="2"
          class="w-12 px-2 py-2 text-center text-sm border-none outline-none focus:bg-blue-50"
          @input="handleDayInput"
          @blur="validateAndEmit"
        />
      </div>
      
      <!-- آیکون تقویم -->
      <button
        type="button"
        @click="showCalendar = !showCalendar"
        class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        :disabled="disabled"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
    
    <!-- تقویم ساده -->
    <div v-if="showCalendar" class="absolute top-12 right-0 z-[9999] bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-64">
      <div class="text-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">انتخاب تاریخ</h3>
      </div>
      
      <!-- دکمه‌های سریع -->
      <div class="grid grid-cols-2 gap-2 mb-4">
        <button
          @click="selectToday"
          class="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
        >
          امروز
        </button>
        <button
          @click="clearDate"
          class="px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
        >
          پاک کردن
        </button>
      </div>
      
      <!-- انتخاب دستی -->
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">سال</label>
          <input
            v-model="tempYear"
            type="number"
            min="1300"
            max="1500"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-center"
            @input="updateTempDate"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ماه</label>
          <select
            v-model="tempMonth"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
            @change="updateTempDate"
          >
            <option value="1">فروردین</option>
            <option value="2">اردیبهشت</option>
            <option value="3">خرداد</option>
            <option value="4">تیر</option>
            <option value="5">مرداد</option>
            <option value="6">شهریور</option>
            <option value="7">مهر</option>
            <option value="8">آبان</option>
            <option value="9">آذر</option>
            <option value="10">دی</option>
            <option value="11">بهمن</option>
            <option value="12">اسفند</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">روز</label>
          <input
            v-model="tempDay"
            type="number"
            min="1"
            :max="getMaxDay()"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-center"
            @input="updateTempDate"
          />
        </div>
      </div>
      
      <!-- دکمه‌های عمل -->
      <div class="flex gap-2 mt-4">
        <button
          @click="applyTempDate"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          اعمال
        </button>
        <button
          @click="showCalendar = false"
          class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          لغو
        </button>
      </div>
    </div>
    
    <!-- پیام خطا -->
    <div v-if="errorMessage" class="mt-1 text-xs text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'تاریخ را انتخاب کنید',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

// State
const year = ref('')
const month = ref('')
const day = ref('')
const showCalendar = ref(false)
const errorMessage = ref('')

// Temp values for calendar
const tempYear = ref(1403)
const tempMonth = ref(1)
const tempDay = ref(1)

// Computed
const currentValue = computed(() => {
  if (year.value && month.value && day.value) {
    return `${year.value}-${month.value.padStart(2, '0')}-${day.value.padStart(2, '0')}`
  }
  return ''
})


// Methods
const handleYearInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '') // فقط اعداد
  
  // محدودیت سال (1300-1500)
  if (value.length > 0) {
    const yearNum = parseInt(value)
    if (yearNum > 1500) {
      value = '1500'
    } else if (yearNum < 1300 && value.length === 4) {
      value = '1300'
    }
  }
  
  year.value = value
  errorMessage.value = ''
}

const handleMonthInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '') // فقط اعداد
  
  // محدودیت ماه (01-12)
  if (value.length > 0) {
    const monthNum = parseInt(value)
    if (monthNum > 12) {
      value = '12'
    } else if (monthNum < 1 && value.length === 2) {
      value = '01'
    }
  }
  
  month.value = value
  errorMessage.value = ''
}

const handleDayInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '') // فقط اعداد
  
  // محدودیت روز (01-31)
  if (value.length > 0) {
    const dayNum = parseInt(value)
    if (dayNum > 31) {
      value = '31'
    } else if (dayNum < 1 && value.length === 2) {
      value = '01'
    }
  }
  
  day.value = value
  errorMessage.value = ''
}

const validateAndEmit = () => {
  if (year.value && month.value && day.value) {
    const yearNum = parseInt(year.value)
    const monthNum = parseInt(month.value)
    const dayNum = parseInt(day.value)
    
    // اعتبارسنجی تاریخ
    if (yearNum < 1300 || yearNum > 1500) {
      errorMessage.value = 'سال باید بین 1300 تا 1500 باشد'
      return
    }
    
    if (monthNum < 1 || monthNum > 12) {
      errorMessage.value = 'ماه باید بین 01 تا 12 باشد'
      return
    }
    
    if (dayNum < 1 || dayNum > 31) {
      errorMessage.value = 'روز باید بین 01 تا 31 باشد'
      return
    }
    
    // بررسی تعداد روزهای ماه
    const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30]
    const maxDay = monthDays[monthNum - 1]
    
    if (dayNum > maxDay) {
      errorMessage.value = `روز باید بین 01 تا ${maxDay} باشد`
      return
    }
    
    errorMessage.value = ''
    // فقط مقدار را به‌روزرسانی می‌کنیم، درخواست ارسال نمی‌شود
    emit('update:modelValue', currentValue.value)
  } else if (year.value || month.value || day.value) {
    errorMessage.value = 'لطفاً تمام فیلدهای تاریخ را پر کنید'
  } else {
    errorMessage.value = ''
    emit('update:modelValue', '')
  }
}

const selectToday = () => {
  const today = new Date()
  const jalali = gregorianToJalali(today)
  
  year.value = jalali.year.toString()
  month.value = jalali.month.toString().padStart(2, '0')
  day.value = jalali.day.toString().padStart(2, '0')
  
  errorMessage.value = ''
  emit('update:modelValue', currentValue.value)
  showCalendar.value = false
}

const clearDate = () => {
  year.value = ''
  month.value = ''
  day.value = ''
  errorMessage.value = ''
  emit('update:modelValue', '')
  showCalendar.value = false
}

const updateTempDate = () => {
  // Sync temp values with current values
  if (year.value) tempYear.value = parseInt(year.value)
  if (month.value) tempMonth.value = parseInt(month.value)
  if (day.value) tempDay.value = parseInt(day.value)
}

const applyTempDate = () => {
  year.value = tempYear.value.toString()
  month.value = tempMonth.value.toString().padStart(2, '0')
  day.value = tempDay.value.toString().padStart(2, '0')
  
  validateAndEmit()
  showCalendar.value = false
}


const getMaxDay = () => {
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30]
  return monthDays[tempMonth.value - 1] || 30
}

// تبدیل میلادی به جلالی (دقیق)
const gregorianToJalali = (gregorianDate: Date) => {
  const year = gregorianDate.getFullYear()
  const month = gregorianDate.getMonth() + 1
  const day = gregorianDate.getDate()
  
  // الگوریتم دقیق تبدیل میلادی به جلالی
  const gy = year
  const gm = month
  const gd = day
  
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy = gy <= 1600 ? 0 : 979
  gy -= gy <= 1600 ? 621 : 1600
  const gy2 = gm > 2 ? gy + 1 : gy
  const days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  let days2 = days % 12053
  jy += 4 * Math.floor(days2 / 1461)
  days2 %= 1461
  if (days2 >= 366) {
    jy += Math.floor((days2 - 1) / 365)
    days2 = (days2 - 1) % 365
  }
  let jm = 1
  let jd = 1
  if (days2 < 186) {
    jm = 1 + Math.floor(days2 / 31)
    jd = 1 + (days2 % 31)
  } else {
    jm = 7 + Math.floor((days2 - 186) / 30)
    jd = 1 + ((days2 - 186) % 30)
  }
  
  return { year: jy, month: jm, day: jd }
}

// Parse initial value
const parseInitialValue = (value: string) => {
  if (value && value.includes('-')) {
    const parts = value.split('-')
    if (parts.length === 3) {
      year.value = parts[0]
      month.value = parts[1]
      day.value = parts[2]
    }
  }
}

// Lifecycle
onMounted(() => {
  parseInitialValue(props.modelValue)
  updateTempDate()
})

// Watch props changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== currentValue.value) {
    parseInitialValue(newValue || '')
    updateTempDate()
  }
})

// Close calendar when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.simple-date-picker')) {
    showCalendar.value = false
  }
}


onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.simple-date-picker {
  position: relative;
  width: 100%;
}

/* استایل فیلدهای ورودی */
input[type="text"], input[type="number"] {
  font-family: 'Vazir', sans-serif;
}

input[type="text"]:focus, input[type="number"]:focus {
  background-color: #eff6ff;
}

/* استایل دکمه تقویم */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* استایل تقویم */
.simple-date-picker .absolute {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 9999;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>

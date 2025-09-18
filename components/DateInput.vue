<template>
  <div class="date-input-container">
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
        @click="showCalendar = true"
        class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        :disabled="disabled"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
    
    <!-- تقویم شمسی -->
    <div v-if="showCalendar" class="absolute z-50 mt-2">
      <ClientOnly>
        <PersianDatePicker
          v-model="calendarValue"
          format="YYYY-MM-DD"
          :clearable="true"
          @change="handleCalendarChange"
          @clear="handleCalendarClear"
        />
        <template #fallback>
          <div class="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
            <p class="text-sm text-gray-600">در حال بارگذاری تقویم...</p>
          </div>
        </template>
      </ClientOnly>
    </div>
    
    <!-- پیام خطا -->
    <div v-if="errorMessage" class="mt-1 text-xs text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import PersianDatePicker from './PersianDatePicker.vue'

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
const calendarValue = ref<string | null>(null)
const errorMessage = ref('')

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
    emit('update:modelValue', currentValue.value)
    emit('change', currentValue.value)
  } else if (year.value || month.value || day.value) {
    errorMessage.value = 'لطفاً تمام فیلدهای تاریخ را پر کنید'
  } else {
    errorMessage.value = ''
    emit('update:modelValue', '')
    emit('change', '')
  }
}

const handleCalendarChange = (value: string | Date | null) => {
  if (value) {
    const dateStr = value.toString()
    const parts = dateStr.split('-')
    
    if (parts.length === 3) {
      year.value = parts[0]
      month.value = parts[1]
      day.value = parts[2]
      errorMessage.value = ''
      emit('update:modelValue', dateStr)
      emit('change', dateStr)
    }
  }
  
  showCalendar.value = false
}

const handleCalendarClear = () => {
  year.value = ''
  month.value = ''
  day.value = ''
  errorMessage.value = ''
  emit('update:modelValue', '')
  emit('change', '')
  showCalendar.value = false
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
})

// Watch props changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== currentValue.value) {
    parseInitialValue(newValue || '')
  }
})

// Close calendar when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.date-input-container')) {
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
.date-input-container {
  position: relative;
  width: 100%;
}

/* استایل فیلدهای ورودی */
input[type="text"] {
  font-family: 'Vazir', sans-serif;
}

input[type="text"]:focus {
  background-color: #eff6ff;
}

/* استایل دکمه تقویم */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* استایل تقویم */
.persian-date-picker-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>

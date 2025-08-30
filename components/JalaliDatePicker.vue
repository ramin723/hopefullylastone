<template>
  <div class="relative">
    <input
      :value="displayValue"
      @input="handleInput"
      @focus="showCalendar = true"
      @blur="handleBlur"
      type="text"
      :placeholder="placeholder"
      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      :class="{ 'border-red-500': hasError }"
    />
    
    <!-- Calendar Dropdown -->
    <div v-if="showCalendar" class="absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
      <!-- Header -->
      <div class="flex items-center justify-between p-3 border-b border-gray-200">
        <button
          @click="previousMonth"
          class="p-1 hover:bg-gray-100 rounded"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <div class="text-lg font-semibold">
          {{ currentMonthName }} {{ currentYear }}
        </div>
        
        <button
          @click="nextMonth"
          class="p-1 hover:bg-gray-100 rounded"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <!-- Week Days -->
      <div class="grid grid-cols-7 gap-1 p-2">
        <div v-for="day in weekDays" :key="day" class="text-center text-sm font-medium text-gray-500 py-1">
          {{ day }}
        </div>
      </div>
      
      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-1 p-2">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          @click="selectDate(day)"
          class="text-center py-2 cursor-pointer hover:bg-indigo-50 rounded"
          :class="{
            'text-gray-400': !day.isCurrentMonth,
            'bg-indigo-600 text-white hover:bg-indigo-700': day.isSelected,
            'text-gray-900': day.isCurrentMonth && !day.isSelected
          }"
        >
          {{ day.day }}
        </div>
      </div>
      
      <!-- Today Button -->
      <div class="p-2 border-t border-gray-200">
        <button
          @click="selectToday"
          class="w-full text-center py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
        >
          امروز
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'تاریخ را انتخاب کنید'
})

const emit = defineEmits<Emits>()

// State
const showCalendar = ref(false)
const currentYear = ref(1403)
const currentMonth = ref(1)
const selectedDate = ref<{ year: number; month: number; day: number } | null>(null)
const hasError = ref(false)

// Constants
const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const monthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

// Computed
const currentMonthName = computed(() => monthNames[currentMonth.value - 1])

const displayValue = computed(() => {
  if (selectedDate.value) {
    return `${selectedDate.value.year}-${selectedDate.value.month.toString().padStart(2, '0')}-${selectedDate.value.day.toString().padStart(2, '0')}`
  }
  return props.modelValue || ''
})

const calendarDays = computed(() => {
  const days: Array<{
    key: string
    day: number
    isCurrentMonth: boolean
    isSelected: boolean
    year: number
    month: number
  }> = []
  
  // محاسبه روز اول هفته ماه جاری
  const firstDayOfMonth = getFirstDayOfMonth(currentYear.value, currentMonth.value)
  const daysInMonth = getDaysInMonth(currentYear.value, currentMonth.value)
  
  // روزهای ماه قبل
  const prevMonthDays = getDaysInMonth(currentYear.value, currentMonth.value - 1)
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      key: `prev-${i}`,
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isSelected: false,
      year: currentMonth.value === 1 ? currentYear.value - 1 : currentYear.value,
      month: currentMonth.value === 1 ? 12 : currentMonth.value - 1
    })
  }
  
  // روزهای ماه جاری
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDate.value && 
      selectedDate.value.year === currentYear.value &&
      selectedDate.value.month === currentMonth.value &&
      selectedDate.value.day === day
    
    days.push({
      key: `current-${day}`,
      day,
      isCurrentMonth: true,
      isSelected,
      year: currentYear.value,
      month: currentMonth.value
    })
  }
  
  // روزهای ماه بعد
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      key: `next-${day}`,
      day,
      isCurrentMonth: false,
      isSelected: false,
      year: currentMonth.value === 12 ? currentYear.value + 1 : currentYear.value,
      month: currentMonth.value === 12 ? 1 : currentMonth.value + 1
    })
  }
  
  return days
})

// Methods
function getFirstDayOfMonth(year: number, month: number): number {
  // محاسبه روز اول هفته ماه جلالی (تقریبی)
  const baseDate = new Date(year + 621, month - 2, 1)
  return baseDate.getDay()
}

function getDaysInMonth(year: number, month: number): number {
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30]
  return monthDays[month - 1] || 30
}

function previousMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectDate(day: { year: number; month: number; day: number }) {
  selectedDate.value = day
  emit('update:modelValue', `${day.year}-${day.month.toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`)
  showCalendar.value = false
  hasError.value = false
}

function selectToday() {
  const today = new Date()
  // تنظیم به ابتدای روز برای دقت بیشتر
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const jalali = gregorianToJalali(todayStart)
  selectedDate.value = jalali
  currentYear.value = jalali.year
  currentMonth.value = jalali.month
  emit('update:modelValue', `${jalali.year}-${jalali.month.toString().padStart(2, '0')}-${jalali.day.toString().padStart(2, '0')}`)
  showCalendar.value = false
  hasError.value = false
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // بررسی فرمت تاریخ شمسی
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    if (year >= 1300 && year <= 1500 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      selectedDate.value = { year, month, day }
      currentYear.value = year
      currentMonth.value = month
      hasError.value = false
      emit('update:modelValue', value)
      return
    }
  }
  
  hasError.value = true
  emit('update:modelValue', value)
}

function handleBlur() {
  // تاخیر برای کلیک روی تقویم
  setTimeout(() => {
    showCalendar.value = false
  }, 200)
}

// تبدیل میلادی به جلالی
function gregorianToJalali(gregorianDate: Date): { year: number; month: number; day: number } {
  const year = gregorianDate.getFullYear()
  const month = gregorianDate.getMonth() + 1
  const day = gregorianDate.getDate()
  
  let jalaliYear = year - 621
  let jalaliMonth = month + 2
  let jalaliDay = day
  
  if (jalaliMonth > 12) {
    jalaliMonth -= 12
    jalaliYear++
  }
  
  return { year: jalaliYear, month: jalaliMonth, day: jalaliDay }
}

// Lifecycle
onMounted(() => {
  // تنظیم تاریخ فعلی
  if (props.modelValue) {
    const parts = props.modelValue.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0])
      const month = parseInt(parts[1])
      const day = parseInt(parts[2])
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        selectedDate.value = { year, month, day }
        currentYear.value = year
        currentMonth.value = month
      }
    }
  } else {
    // تنظیم تاریخ امروز
    selectToday()
  }
})

// Watch
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== displayValue.value) {
    const parts = newValue.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0])
      const month = parseInt(parts[1])
      const day = parseInt(parts[2])
      
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        selectedDate.value = { year, month, day }
        currentYear.value = year
        currentMonth.value = month
        hasError.value = false
      }
    }
  }
})
</script>

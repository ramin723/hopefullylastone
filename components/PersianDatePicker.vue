<template>
  <div class="persian-date-picker-wrapper">
    <ClientOnly>
      <PersianDatePicker
        v-model="internalValue"
        :format="format"
        :placeholder="placeholder"
        :clearable="clearable"
        :range="range"
        :time-picker="timePicker"
        :auto-close="autoClose"
        :locale="locale"
        @change="handleChange"
        @clear="handleClear"
      />
      <template #fallback>
        <div class="pdp-input-fallback">
          <input
            :value="internalValue || ''"
            :placeholder="placeholder"
            readonly
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { PersianDatePicker } from 'vue-persian-datetime-picker'

interface Props {
  modelValue?: string | Date | null
  placeholder?: string
  format?: string
  clearable?: boolean
  range?: boolean
  timePicker?: boolean
  autoClose?: boolean
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'YYYY-MM-DD',
  clearable: true,
  range: false,
  timePicker: false,
  autoClose: true,
  locale: 'fa'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | Date | null]
  'change': [value: string | Date | null]
  'clear': []
}>()

const internalValue = ref(props.modelValue)

const handleChange = (value: string | Date | null) => {
  internalValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

const handleClear = () => {
  internalValue.value = null
  emit('update:modelValue', null)
  emit('clear')
}

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})
</script>

<style scoped>
.persian-date-picker-wrapper {
  width: 100%;
}

.pdp-input-fallback {
  width: 100%;
}

/* سفارشی‌سازی استایل‌های کتابخانه */
:deep(.pdp-input) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  background-color: white;
}

:deep(.pdp-input:focus) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.pdp-input::placeholder) {
  color: #9ca3af;
}

:deep(.pdp-clear) {
  color: #6b7280;
}

:deep(.pdp-clear:hover) {
  color: #374151;
}

/* استایل‌های تقویم */
:deep(.pdp-picker) {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-family: 'Vazir', sans-serif;
}

:deep(.pdp-header) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem;
}

:deep(.pdp-nav) {
  color: #374151;
}

:deep(.pdp-nav:hover) {
  background: #e5e7eb;
  border-radius: 0.25rem;
}

:deep(.pdp-month-year) {
  color: #111827;
  font-weight: 600;
}

:deep(.pdp-weekdays) {
  background: #f9fafb;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
}

:deep(.pdp-day) {
  color: #374151;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
}

:deep(.pdp-day:hover) {
  background: #dbeafe;
  color: #1d4ed8;
}

:deep(.pdp-day.pdp-selected) {
  background: #3b82f6;
  color: white;
}

:deep(.pdp-day.pdp-today) {
  background: #fef3c7;
  color: #92400e;
  font-weight: 600;
}

:deep(.pdp-day.pdp-other-month) {
  color: #9ca3af;
}

:deep(.pdp-footer) {
  border-top: 1px solid #e5e7eb;
  padding: 0.75rem;
  background: #f8fafc;
}

:deep(.pdp-today-btn) {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

:deep(.pdp-today-btn:hover) {
  background: #2563eb;
}

:deep(.pdp-clear-btn) {
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

:deep(.pdp-clear-btn:hover) {
  background: #4b5563;
}
</style>

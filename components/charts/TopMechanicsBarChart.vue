<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">مکانیک‌های برتر</h3>
      <div v-if="loading" class="flex items-center text-sm text-gray-500">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
        در حال بارگذاری...
      </div>
    </div>
    
    <div v-if="error" class="text-center py-8">
      <div class="text-red-500 mb-2">
        <svg class="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <p class="text-sm text-gray-600">{{ error }}</p>
    </div>
    
    <div v-else-if="!data || data.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      </div>
      <p class="text-sm text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
    </div>
    
    <div v-else class="relative">
      <canvas ref="chartCanvas" class="w-full h-64"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

// Dynamic import for Chart.js to avoid SSR issues
let ChartJS: any = null
let CategoryScale: any = null
let LinearScale: any = null
let BarElement: any = null
let Title: any = null
let Tooltip: any = null
let Legend: any = null

// Load Chart.js on client side only
const loadChartJS = async () => {
  if (process.client) {
    const chartModule = await import('chart.js')
    ChartJS = chartModule.Chart
    CategoryScale = chartModule.CategoryScale
    LinearScale = chartModule.LinearScale
    BarElement = chartModule.BarElement
    Title = chartModule.Title
    Tooltip = chartModule.Tooltip
    Legend = chartModule.Legend
    
    // Register components after loading
    if (ChartJS) {
      ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
      )
    }
  }
}

// Load Chart.js on mount
onMounted(async () => {
  await loadChartJS()
  if (props.data && props.data.length > 0) {
    nextTick(() => {
      createChart()
    })
  }
})

interface ChartData {
  name: string
  totalCommission: number
}

interface Props {
  data: ChartData[]
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  error: ''
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: ChartJS | null = null

// Format currency for display
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('fa-IR') + ' تومان'
}

// Create chart
const createChart = () => {
  if (!process.client || !ChartJS || !chartCanvas.value || !props.data || props.data.length === 0) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Prepare data
  const labels = props.data.map(item => item.name)
  const commissions = props.data.map(item => item.totalCommission)

  // Generate colors for bars
  const colors = [
    'rgba(34, 197, 94, 0.8)',   // Green
    'rgba(59, 130, 246, 0.8)',  // Blue
    'rgba(168, 85, 247, 0.8)',  // Purple
    'rgba(245, 158, 11, 0.8)',  // Yellow
    'rgba(239, 68, 68, 0.8)'    // Red
  ]

  const borderColors = [
    'rgb(34, 197, 94)',
    'rgb(59, 130, 246)',
    'rgb(168, 85, 247)',
    'rgb(245, 158, 11)',
    'rgb(239, 68, 68)'
  ]

  chartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'کمیسیون کل',
          data: commissions,
          backgroundColor: colors.slice(0, props.data.length),
          borderColor: borderColors.slice(0, props.data.length),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (context) => {
              return `مکانیک: ${context[0].label}`
            },
            label: (context) => {
              return `کمیسیون: ${formatCurrency(context.parsed.x)}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'مبلغ کمیسیون (تومان)',
            color: '#6B7280',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#6B7280',
            font: {
              size: 11
            },
            callback: function(value) {
              return formatCurrency(Number(value))
            }
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'مکانیک‌ها',
            color: '#6B7280',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          },
          ticks: {
            color: '#6B7280',
            font: {
              size: 11
            }
          }
        }
      },
      elements: {
        bar: {
          borderWidth: 2
        }
      }
    }
  })
}

// Watch for data changes
watch(() => props.data, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

// Watch for loading state
watch(() => props.loading, (newLoading) => {
  if (!newLoading && props.data && props.data.length > 0) {
    nextTick(() => {
      createChart()
    })
  }
})

// onMounted is now handled above

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

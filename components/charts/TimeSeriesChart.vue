<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">فروش در طول زمان</h3>
      <div v-if="loading" class="flex items-center text-sm text-gray-500">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
let PointElement: any = null
let LineElement: any = null
let Title: any = null
let Tooltip: any = null
let Legend: any = null
let Filler: any = null

// Load Chart.js on client side only
const loadChartJS = async () => {
  if (process.client) {
    const chartModule = await import('chart.js')
    ChartJS = chartModule.Chart
    CategoryScale = chartModule.CategoryScale
    LinearScale = chartModule.LinearScale
    PointElement = chartModule.PointElement
    LineElement = chartModule.LineElement
    Title = chartModule.Title
    Tooltip = chartModule.Tooltip
    Legend = chartModule.Legend
    Filler = chartModule.Filler
    
    // Register components after loading
    if (ChartJS) {
      ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler
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
  date: string
  amount: number
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
  const labels = props.data.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric'
    })
  })

  const amounts = props.data.map(item => item.amount)

  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'فروش روزانه',
          data: amounts,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (context) => {
              return `تاریخ: ${context[0].label}`
            },
            label: (context) => {
              return `مبلغ: ${formatCurrency(context.parsed.y)}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'تاریخ',
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
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'مبلغ (تومان)',
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
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: 'rgb(99, 102, 241)'
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

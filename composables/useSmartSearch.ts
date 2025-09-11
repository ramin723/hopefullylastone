import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { watchDebounced } from '@vueuse/core'

export interface SmartSearchOptions {
  fetcher: (params: {
    q: string
    filters: Record<string, any>
    page: number
    pageSize: number
    signal?: AbortSignal
  }) => Promise<any>
  minLen?: number
  debounceMs?: number
  distinct?: boolean
  cache?: boolean
  initialFetch?: boolean
  allowEmptyQuery?: boolean
  serializeKey?: (state: {
    q: string
    filters: Record<string, any>
    page: number
    pageSize: number
  }) => string
}

export interface SmartSearchState {
  q: string
  filters: Record<string, any>
  page: number
  pageSize: number
}

export interface SmartSearchReturn {
  q: Ref<string>
  loading: Ref<boolean>
  error: Ref<string | null>
  data: Ref<any>
  search: (overrides?: Partial<SmartSearchState>) => Promise<void>
  abort: () => void
  setFilters: (obj: Record<string, any>) => void
  setPage: (n: number) => void
  state: SmartSearchState
  mountedOnce: Ref<boolean>
}

// LRU Cache implementation
class LRUCache<T> {
  private cache = new Map<string, T>()
  private maxSize: number

  constructor(maxSize: number = 20) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
}

export function useSmartSearch(options: SmartSearchOptions): SmartSearchReturn {
  const {
    fetcher,
    minLen = 3,
    debounceMs = 400,
    distinct = true,
    cache = true,
    initialFetch = false,
    allowEmptyQuery = false,
    serializeKey = (state) => JSON.stringify({
      q: state.q.trim(),
      filters: state.filters,
      page: state.page,
      pageSize: state.pageSize
    })
  } = options

  // State
  const q = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any>(null)

  // Internal state
  const state = reactive<SmartSearchState>({
    q: '',
    filters: {},
    page: 1,
    pageSize: 20
  })

  // Cache
  const lruCache = cache ? new LRUCache<any>(20) : null

  // Abort controller for current request
  let currentAbortController: AbortController | null = null

  // Track if initial fetch has been performed
  const mountedOnce = ref(false)

  // Check if any filters are effective (not empty)
  const hasEffectiveFilters = computed(() => {
    return Object.values(state.filters).some((value: any) => 
      value !== null && value !== undefined && value !== ''
    )
  })

  // Check if search should be performed
  const shouldSearch = computed(() => {
    const len = state.q.trim().length
    const effectiveFilters = hasEffectiveFilters.value
    const isInitial = !mountedOnce.value && initialFetch === true


    // اجازه‌های fetch:
    // 1) بار اول اگر initialFetch=true → اجازه
    // 2) اگر allowEmptyQuery=true و len===0 → اجازه (حتی غیر از بار اول)
    // 3) اگر len >= minLen → اجازه
    // 4) اگر len < minLen ولی فیلترهای مؤثر فعال هستند → اجازه
    return isInitial || 
           (allowEmptyQuery && len === 0) || 
           len >= minLen || 
           (len < minLen && effectiveFilters)
  })

  // Check if we should block search (for short queries without filters)
  const shouldBlockSearch = computed(() => {
    const len = state.q.trim().length
    const effectiveFilters = hasEffectiveFilters.value
    const isInitial = !mountedOnce.value && initialFetch === true

    // Block if:
    // - Not initial fetch
    // - Query length > 0 but < minLen
    // - No effective filters
    return !isInitial && len > 0 && len < minLen && !effectiveFilters
  })

  // Serialize current state for cache key
  const currentCacheKey = computed(() => {
    return serializeKey({
      q: state.q,
      filters: state.filters,
      page: state.page,
      pageSize: state.pageSize
    })
  })

  // Abort current request
  const abort = () => {
    if (currentAbortController) {
      currentAbortController.abort()
      currentAbortController = null
    }
  }

  // Perform search
  const performSearch = async (overrides?: Partial<SmartSearchState>) => {
    // Apply overrides to state
    if (overrides) {
      Object.assign(state, overrides)
    }

    // Update q ref to match state
    q.value = state.q


    // Check cache first
    if (lruCache) {
      const cached = lruCache.get(currentCacheKey.value)
      if (cached) {
        data.value = cached
        loading.value = false
        error.value = null
        return
      }
    }

    // Check if we should block search (short query without filters)
    if (shouldBlockSearch.value) {
      data.value = null
      loading.value = false
      error.value = null
      return
    }

    // Check if search should be performed
    if (!shouldSearch.value) {
      data.value = null
      loading.value = false
      error.value = null
      return
    }

    // Abort previous request
    abort()

    // Create new abort controller
    currentAbortController = new AbortController()

    loading.value = true
    error.value = null

    try {
      const result = await fetcher({
        q: state.q.trim(),
        filters: state.filters,
        page: state.page,
        pageSize: state.pageSize,
        signal: currentAbortController.signal
      })

      // Check if request was aborted
      if (currentAbortController.signal.aborted) {
        return
      }

      data.value = result
      
      // Cache the result
      if (lruCache) {
        lruCache.set(currentCacheKey.value, result)
      }

    } catch (err: any) {
      // Check if request was aborted
      if (currentAbortController?.signal.aborted) {
        return
      }

      // Handle 429 specifically
      if (err.statusCode === 429) {
        error.value = 'درخواست‌های پیاپی زیاد بود — چند لحظه صبر کنید یا کندتر تایپ کنید.'
      } else {
        error.value = err.message || 'خطا در جستجو'
      }
      
      data.value = null
    } finally {
      loading.value = false
      currentAbortController = null
    }
  }

  // Debounced search
  const debouncedSearch = watchDebounced(
    () => state.q,
    async (newQ: string) => {
      state.q = newQ
      await performSearch()
    },
    { debounce: debounceMs }
  )

  // Watch for filter changes
  watch(
    () => state.filters,
    async () => {
      // Reset to first page when filters change
      state.page = 1
      await performSearch()
    },
    { deep: true }
  )

  // Watch for page changes
  watch(
    () => state.page,
    async () => {
      await performSearch()
    }
  )

  // Manual search function
  const search = async (overrides?: Partial<SmartSearchState>) => {
    await performSearch(overrides)
  }

  // Set filters
  const setFilters = (obj: Record<string, any>) => {
    Object.assign(state.filters, obj)
  }

  // Set page
  const setPage = (n: number) => {
    state.page = n
  }

  // Watch for search query changes with debounce
  watchDebounced(
    q,
    (newQ: string) => {
      state.q = newQ
      performSearch()
    },
    { debounce: debounceMs }
  )

  // Watch for filters and page changes
  watch(
    () => [state.filters, state.page],
    () => {
      performSearch()
    },
    { deep: true }
  )

  // Initial search on mount
  onMounted(() => {
    if (initialFetch) {
      mountedOnce.value = true
      performSearch()
    }
  })

  return {
    q,
    loading,
    error,
    data,
    search,
    abort,
    setFilters,
    setPage,
    state,
    mountedOnce
  }
}

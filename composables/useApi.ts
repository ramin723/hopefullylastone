export function useApi() {
  const csrf = useState<string | null>('csrf', () => null)
  const ssrHeaders = process.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : undefined

  function withHeaders(method: string, extra?: HeadersInit) {
    const base: Record<string, string> = { 
      ...(ssrHeaders || {}),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    // فقط روی متدهای حساس CSRF بفرست
    if (/^(POST|PUT|PATCH|DELETE)$/i.test(method) && csrf.value) {
      base['x-csrf-token'] = csrf.value
    }
    return { ...base, ...(extra as any) }
  }

  async function get<T = any>(url: string, opts: any = {}) {
    console.log('[API] GET request to:', url, 'with options:', opts)
    const result = await $fetch<T>(url, { 
      ...opts, 
      method: 'GET', 
      headers: withHeaders('GET', opts.headers) 
    })
    console.log('[API] GET response from:', url, 'result:', !!result)
    return result
  }
  
  async function post<T = any>(url: string, body?: any, opts: any = {}) {
    console.log('[API] POST request to:', url, 'with body:', !!body)
    const result = await $fetch<T>(url, { 
      ...opts, 
      method: 'POST', 
      body, 
      headers: withHeaders('POST', opts.headers) 
    })
    console.log('[API] POST response from:', url, 'result:', !!result)
    return result
  }
  
  async function put<T = any>(url: string, body?: any, opts: any = {}) {
    return await $fetch<T>(url, { ...opts, method: 'PUT', body, headers: withHeaders('PUT', opts.headers) })
  }
  
  async function del<T = any>(url: string, opts: any = {}) {
    return await $fetch<T>(url, { ...opts, method: 'DELETE', headers: withHeaders('DELETE', opts.headers) })
  }

  // تابع ساده و مطمئن برای درخواست‌های POST/PUT/PATCH/DELETE با CSRF token
  async function csrfFetch<T = any>(url: string, options: any = {}): Promise<T> {
    console.log('[CSRF] Starting csrfFetch for:', url)
    
    // اگر token موجود نیست، آن را دریافت کن
    if (!csrf.value) {
      console.log('[CSRF] No token found, fetching...')
      try {
        const res = await ($fetch as any)('/api/auth/csrf')
        csrf.value = (res as any).csrf
        console.log('[CSRF] Token fetched successfully:', csrf.value ? 'YES' : 'NO')
      } catch (error) {
        console.error('[CSRF] Failed to fetch token:', error)
        throw new Error('Failed to fetch CSRF token')
      }
    }
    
    if (!csrf.value) {
      throw new Error('CSRF token is still null after fetch attempt')
    }
    
    // اضافه کردن CSRF token به headers
    const headers = {
      ...options.headers,
      'x-csrf-token': csrf.value
    }
    
    console.log('[CSRF] Making request with token:', csrf.value ? 'YES' : 'NO')
    
    return ($fetch as any)(url, {
      ...options,
      headers
    })
  }

  return { get, post, put, del, csrfFetch }
}

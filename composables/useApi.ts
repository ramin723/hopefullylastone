export function useApi() {
  const csrf = useState<string | null>('csrf', () => null)
  const csrfFetching = useState<boolean>('csrf-fetching', () => false)
  const ssrHeaders = process.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : undefined

  // Memoized CSRF token fetching
  async function ensureCsrfToken(): Promise<string> {
    if (csrf.value) {
      return csrf.value
    }
    
    // Prevent multiple simultaneous CSRF requests
    if (csrfFetching.value) {
      // Wait for ongoing request to complete
      while (csrfFetching.value) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      if (csrf.value) {
        return csrf.value
      }
    }
    
    csrfFetching.value = true
    try {
      const res = await $fetch('/api/auth/csrf')
      csrf.value = (res as any).csrf
      if (!csrf.value) {
        throw new Error('CSRF token is null')
      }
      return csrf.value
    } catch (error) {
      console.error('[CSRF] Failed to fetch token:', error)
      throw new Error('Failed to fetch CSRF token')
    } finally {
      csrfFetching.value = false
    }
  }

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
    // PROD: Debug logs removed for production
    const result = await $fetch<T>(url, { 
      ...opts, 
      method: 'GET', 
      headers: withHeaders('GET', opts.headers),
      credentials: 'include' // Ensure cookies are sent
    })
    return result
  }
  
  async function post<T = any>(url: string, body?: any, opts: any = {}) {
    // Ensure CSRF token is available before making POST request
    await ensureCsrfToken()
    
    try {
      const result = await $fetch<T>(url, { 
        ...opts, 
        method: 'POST', 
        body, 
        headers: withHeaders('POST', opts.headers),
        credentials: 'include' // Ensure cookies are sent
      })
      return result
    } catch (error: any) {
      // Retry once if CSRF token is invalid
      if (error.statusCode === 403 && error.statusMessage === 'Invalid CSRF token') {
        console.log('[CSRF] Token invalid, refreshing and retrying...')
        csrf.value = null // Clear invalid token
        await ensureCsrfToken() // Get fresh token
        
        // Retry the request once
        return await $fetch<T>(url, { 
          ...opts, 
          method: 'POST', 
          body, 
          headers: withHeaders('POST', opts.headers),
          credentials: 'include'
        })
      }
      throw error
    }
  }
  
  async function put<T = any>(url: string, body?: any, opts: any = {}) {
    // Ensure CSRF token is available before making PUT request
    await ensureCsrfToken()
    
    try {
      return await $fetch<T>(url, { ...opts, method: 'PUT', body, headers: withHeaders('PUT', opts.headers), credentials: 'include' })
    } catch (error: any) {
      // Retry once if CSRF token is invalid
      if (error.statusCode === 403 && error.statusMessage === 'Invalid CSRF token') {
        console.log('[CSRF] Token invalid, refreshing and retrying...')
        csrf.value = null
        await ensureCsrfToken()
        return await $fetch<T>(url, { ...opts, method: 'PUT', body, headers: withHeaders('PUT', opts.headers), credentials: 'include' })
      }
      throw error
    }
  }
  
  async function del<T = any>(url: string, opts: any = {}) {
    // Ensure CSRF token is available before making DELETE request
    await ensureCsrfToken()
    
    try {
      return await $fetch<T>(url, { ...opts, method: 'DELETE', headers: withHeaders('DELETE', opts.headers), credentials: 'include' })
    } catch (error: any) {
      // Retry once if CSRF token is invalid
      if (error.statusCode === 403 && error.statusMessage === 'Invalid CSRF token') {
        console.log('[CSRF] Token invalid, refreshing and retrying...')
        csrf.value = null
        await ensureCsrfToken()
        return await $fetch<T>(url, { ...opts, method: 'DELETE', headers: withHeaders('DELETE', opts.headers), credentials: 'include' })
      }
      throw error
    }
  }

  return { get, post, put, del }
}

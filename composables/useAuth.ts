// composables/useAuth.ts

type AuthUser = {
  id: number
  role: 'ADMIN' | 'VENDOR' | 'MECHANIC'
  fullName: string
  phone: string
} | null

export const useAuth = () => {
  const isClient = typeof window !== 'undefined'

  // استفاده از useState از Nuxt
  const token = useState<string | null>(
    'auth_token',
    () => (isClient ? localStorage.getItem('auth_token') : null)
  )

  const user = useState<AuthUser>('auth_user', () => null)

  function setToken(t: string | null) {
    token.value = t
    if (isClient) {
      if (t) localStorage.setItem('auth_token', t)
      else localStorage.removeItem('auth_token')
    }
  }

  async function login(phone: string, password: string) {
    // استفاده از $fetch از Nuxt با type assertion ساده
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { phone, password }
    }) as any

    setToken(res.token)
    user.value = res.user
    return res
  }

  function logout() {
    setToken(null)
    user.value = null
  }

  function authHeaders() {
    if (!token.value) return {}
    return { Authorization: `Bearer ${token.value}` }
  }

  return { token, user, login, logout, authHeaders }
}

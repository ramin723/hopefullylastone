// composables/useAuth.ts
// @ts-ignore - Nuxt 4 auto-imports issue
import { $fetch } from 'ofetch' // اگر بعداً TS خودش شناخت، می‌تونی حذفش کنی

type AuthUser = {
  id: number
  role: 'ADMIN' | 'VENDOR' | 'MECHANIC'
  fullName: string
  phone: string
} | null

export const useAuth = () => {
  const isClient = typeof window !== 'undefined'

  // useState نیازی به import ندارد، با types: ["nuxt"] شناخته می‌شود
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
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { phone, password }
    }) as { token: string; user: NonNullable<AuthUser> }

    setToken(res.token)
    user.value = res.user
    return res
  }

  function logout() {
    setToken(null)
    user.value = null
  }

  function authHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { token, user, login, logout, authHeaders }
}

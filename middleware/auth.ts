export default defineNuxtRouteMiddleware((to) => {
  // اگر به صفحه لاگین می‌رود، اجازه بده
  if (to.path === '/login') {
    return
  }

  // بررسی وجود توکن
  if (process.client) {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return navigateTo('/login')
    }
  }
})

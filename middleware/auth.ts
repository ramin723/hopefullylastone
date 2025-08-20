export default defineNuxtRouteMiddleware((to) => {
  // اگر به صفحه لاگین می‌رود، اجازه بده
  if (to.path === '/login') {
    return
  }

  // بررسی وجود توکن
  const token = useCookie('auth_token').value || (process.client ? localStorage.getItem('auth_token') : null)
  
  if (!token) {
    return navigateTo('/login')
  }
})

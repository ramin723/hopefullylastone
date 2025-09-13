<script setup lang="ts">
const { user, hydrated, ensureAuth, logout } = useAuth()
const { show } = useToast()

// اطمینان از اینکه user data load شده
onMounted(async () => {
  if (!user.value) {
    await ensureAuth()
  }
  
  // Failsafe: اگر کاربر باید رمز تعیین کند و در صفحه درست نیست
  if (user.value?.mustChangePassword && !useRoute().path.includes('/onboarding/set-password')) {
    console.debug('[AUTH LAYOUT] Failsafe redirect to set password')
    await navigateTo('/onboarding/set-password')
  }
})

// Watch برای تغییرات user
watch(user, async (newUser) => {
  if (newUser?.mustChangePassword && !useRoute().path.includes('/onboarding/set-password')) {
    console.debug('[AUTH LAYOUT] Watch failsafe redirect to set password')
    await navigateTo('/onboarding/set-password')
  }
})

// State برای منوی کاربری
const isUserMenuOpen = ref(false)

// تابع برای بستن منو هنگام کلیک خارج از آن
function closeUserMenu() {
  isUserMenuOpen.value = false
}

// تابع برای نمایش پیام "به زودی"
function showComingSoon() {
  show('این قابلیت به زودی اضافه خواهد شد', 'info')
  closeUserMenu()
}

// تابع logout
async function handleLogout() {
  try {
    await logout()
    show('با موفقیت خارج شدید', 'success')
  } catch (err) {
    console.warn('Logout error', err)
    show('خطا در خروج از سیستم', 'error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900" @click="closeUserMenu">
    <header class="border-b bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <!-- لوگو و نام برند -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">هـ</span>
          </div>
          <span class="font-bold text-gray-800">همکاری</span>
        </div>
        
        <!-- منوی کاربری -->
        <div v-if="user" class="relative">
          <button 
            @click.stop="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center gap-2 px-3 py-2 text-sm bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <!-- آیکون همبرگری -->
            <div class="flex flex-col gap-1">
              <div class="w-4 h-0.5 bg-gray-600 transition-all duration-200" :class="{ 'rotate-45 translate-y-1.5': isUserMenuOpen }"></div>
              <div class="w-4 h-0.5 bg-gray-600 transition-all duration-200" :class="{ 'opacity-0': isUserMenuOpen }"></div>
              <div class="w-4 h-0.5 bg-gray-600 transition-all duration-200" :class="{ '-rotate-45 -translate-y-1.5': isUserMenuOpen }"></div>
            </div>
          </button>

          <!-- منوی آبشاری -->
          <div 
            v-if="isUserMenuOpen"
            @click.stop
            class="absolute right-0 mt-2 w-80 sm:w-72 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div class="py-2">
              <!-- اطلاعات کاربر -->
              <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {{ user.fullName?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-800">{{ user.fullName }}</div>
                    <div class="text-xs text-gray-600">{{ user.role === 'MECHANIC' ? 'مکانیک' : user.role === 'VENDOR' ? 'فروشنده' : 'مدیر' }}</div>
                  </div>
                </div>
              </div>

              <!-- ویرایش پروفایل -->
              <NuxtLink 
                to="/profile/edit"
                @click="closeUserMenu"
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                ویرایش پروفایل
              </NuxtLink>

              <!-- تغییر رمز عبور -->
              <NuxtLink 
                to="/profile/change-password"
                @click="closeUserMenu"
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
                تغییر رمز عبور
              </NuxtLink>

              <!-- تماس با ما -->
              <button 
                @click="showComingSoon"
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors w-full text-right"
              >
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                تماس با ما
              </button>

              <!-- خط جداکننده -->
              <div class="border-t border-gray-100 my-1"></div>

              <!-- خروج -->
              <button 
                @click="handleLogout"
                class="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>

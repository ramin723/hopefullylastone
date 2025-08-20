<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        سیستم همکاری
      </h1>
      <p class="mt-2 text-center text-sm text-gray-600">
        ورود به سیستم فروشگاه
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-4">
              برای شروع کار، وارد سیستم شوید
            </p>
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ورود به سیستم
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// صفحه اصلی - هدایت به لاگین
</script>

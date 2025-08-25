<script setup lang="ts">
const emit = defineEmits<{ (e:'read', code:string): void }>()
const video = ref<HTMLVideoElement|null>(null)
let stream: MediaStream|undefined

async function start() {
  if (stream) return
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio:false })
  if (video.value) video.value.srcObject = stream
}

async function stop() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = undefined
  }
}

// خواندن ساده: اگر QR شما URL است که شامل ?code=ABC123 یا fragment است:
function onScanTick() {
  // این نسخهٔ سبک، "بارکدخوان" پیاده نمی‌کند؛
  // سناریو: فروشگاه از اپ دوربین موبایل لینک QR را می‌گیرد و اینجا Paste می‌کند
  // اگر بعداً خواستی live-decode داشته باشی، کتابخانه مثل jsQR اضافه می‌کنیم.
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="space-y-3">
    <video ref="video" autoplay playsinline class="w-full aspect-video bg-black/5 rounded"></video>
    <div class="flex gap-2">
      <button class="px-3 py-1 rounded border" @click="start">شروع دوربین</button>
      <button class="px-3 py-1 rounded border" @click="stop">توقف</button>
    </div>
    <p class="text-sm text-gray-500">برای MVP: از اپ دوربین گوشی لینک QR را باز کنید و کد را در فیلد «کد مکانیک» Paste کنید. (مرحله بعدی: live decode)</p>
  </div>
</template>

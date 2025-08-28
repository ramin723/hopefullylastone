<script setup lang="ts">
const emit = defineEmits<{ (e:'read', code:string): void }>()
const video = ref<HTMLVideoElement|null>(null)
let stream: MediaStream|undefined
const starting = ref(false)
const errorMessage = ref<string>('')

async function start() {
  if (starting.value || stream) return
  errorMessage.value = ''
  if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
    errorMessage.value = 'این مرورگر از دسترسی به دوربین پشتیبانی نمی‌کند.'
    return
  }
  try {
    starting.value = true
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio:false })
    if (video.value) {
      video.value.srcObject = stream
      try {
        await video.value.play()
      } catch (e:any) {
        // برخی مرورگرها نیاز به play صریح دارند
      }
    }
  } catch (err:any) {
    errorMessage.value = err?.message || 'عدم دسترسی به دوربین. لطفاً مجوز را بررسی کنید.'
    stream = undefined
  } finally {
    starting.value = false
  }
}

async function stop() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = undefined
  }
  if (video.value) {
    try { video.value.pause() } catch {}
    // @ts-expect-error: srcObject assign to null
    video.value.srcObject = null
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
      <button class="px-3 py-1 rounded border" @click="start" :disabled="starting">{{ starting ? 'در حال شروع...' : 'شروع دوربین' }}</button>
      <button class="px-3 py-1 rounded border" @click="stop">توقف</button>
    </div>
    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    <p class="text-sm text-gray-500">برای MVP: از اپ دوربین گوشی لینک QR را باز کنید و کد را در فیلد «کد مکانیک» Paste کنید. (مرحله بعدی: live decode)</p>
  </div>
</template>

import type { Dayjs } from 'dayjs'

declare module '#app' {
  interface NuxtApp {
    $dayjs: typeof import('dayjs')
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dayjs: typeof import('dayjs')
  }
}

export {}

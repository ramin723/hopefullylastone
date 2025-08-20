// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'], // فعال شد
  app: {
    head: {
      // htmlAttrs: { lang: 'fa', dir: 'rtl' }, // هنوز غیرفعال
      link: [
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap' }
      ]
    }
  },
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },
  nitro: {
    experimental: {
      wasm: true
    },
    // تنظیمات مهم برای Prisma و جلوگیری از خطای ".prisma"
    moduleSideEffects: ['@prisma/client', '@prisma/client/runtime', '@prisma/engines', '@prisma/engines-version'],
    externals: {
      // مهم: external نگه‌دار تا Rollup به require('.prisma/...') دست نزند
      external: ['@prisma/client', '.prisma/client'],
      trace: false
    },
    alias: {
      '.prisma/client/default': './node_modules/.prisma/client/default.js',
      '.prisma/client/index': './node_modules/.prisma/client/index.js'
    }
  },
  // (اختیاری) برخی محیط‌ها نیاز به transpile دارند
  build: {
    transpile: ['@prisma/client']
  },
  imports: {
    autoImport: true
  }
})

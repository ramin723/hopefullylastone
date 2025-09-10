// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // PROD: Devtools disabled in production
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  modules: ['@nuxtjs/tailwindcss'], // فعال شد
  
  // PROD: Debug flag configuration - always false in production
  runtimeConfig: {
    // Private config (server-side only)
    smsProvider: process.env.SMS_PROVIDER || 'kavenegar',
    kavenegar: {
      apiKey: process.env.KAVENEGAR_API_KEY,
      templateOtp: process.env.KAVENEGAR_TEMPLATE_OTP || 'otp-login',
      templateInvite: process.env.KAVENEGAR_TEMPLATE_INVITE || 'invite-code',
      devBypass: process.env.KAVENEGAR_DEV_BYPASS === '1' || process.env.KAVENEGAR_DEV_BYPASS === 'true'
    },
    
    public: {
      debug: process.env.NODE_ENV === 'development', // Only true in development
      siteUrl: process.env.SITE_URL || 'http://127.0.0.1:3000', // Site URL for absolute links
    }
  },
  
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
    },
    // Security headers configuration
    routeRules: {
      '/**': {
        headers: getSecurityHeaders()
      }
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

// Security headers helper function
function getSecurityHeaders(): Record<string, string> {
  const isProd = process.env.NODE_ENV === 'production'
  
  if (isProd) {
    // Production: Strict CSP and full security headers
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'"
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  } else {
    // Development: Report-only CSP and relaxed security for HMR
    return {
      'Content-Security-Policy-Report-Only': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' ws: http://127.0.0.1:* http://localhost:*",
        "frame-ancestors 'none'"
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // اجازهٔ دوربین در محیط توسعه
      'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()'
    }
  }
}
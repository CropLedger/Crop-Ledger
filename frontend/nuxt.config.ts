// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'CropLedger Enterprise',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Enterprise agricultural supply chain management' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://crop-ledger.onrender.com' : 'http://localhost:5000'),
      stellarNetwork: process.env.NUXT_PUBLIC_STELLAR_NETWORK || 'TESTNET'
    }
  },

  nitro: {
    preset: 'vercel'
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'es', iso: 'es-ES', file: 'es.json', name: 'Español' }
    ],
    langDir: './locales',
    strategy: 'no_prefix',
    lazy: false
  }
})

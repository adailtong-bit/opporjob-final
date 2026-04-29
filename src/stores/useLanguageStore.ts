import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations, Language } from '@/lib/translations'
import { ptBR, enUS, es } from 'date-fns/locale'
import { format } from 'date-fns'

export type Currency = 'USD' | 'BRL' | 'EUR'

interface LanguageState {
  currentLanguage: Language
  currentCurrency: Currency
  setLanguage: (lang: Language) => void
  setCurrency: (currency: Currency) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatCurrency: (value: number) => string
  formatDate: (date: Date, formatStr: string) => string
  getDateLocale: () => any
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      currentCurrency: 'USD',
      setLanguage: (lang) =>
        set({
          currentLanguage: lang,
        }),
      setCurrency: (currency) => set({ currentCurrency: currency }),
      t: (key, params) => {
        const lang = get().currentLanguage
        let text = translations[lang]?.[key] || translations['en'][key] || key

        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v))
          })
        }

        return text
      },
      formatCurrency: (value) => {
        // Enforce USD globally to maintain system standards as requested
        const currency = 'USD'
        const locale = 'en-US'

        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(value)
      },
      formatDate: (date, formatStr) => {
        const locale = get().getDateLocale()
        return format(date, formatStr, { locale })
      },
      getDateLocale: () => {
        const lang = get().currentLanguage
        if (lang === 'pt') return ptBR
        if (lang === 'es') return es
        return enUS
      },
    }),
    {
      name: 'language-storage',
    },
  ),
)

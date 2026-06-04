import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations, Language } from '@/lib/translations'
import { ptBR, enUS, es } from 'date-fns/locale'
import { format, isValid } from 'date-fns'

export type Currency = 'USD' | 'BRL' | 'EUR'

interface LanguageState {
  currentLanguage: Language
  currentCurrency: Currency
  setLanguage: (lang: Language) => void
  setCurrency: (currency: Currency) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatCurrency: (value: number) => string
  formatDate: (
    date: Date | string | number | null | undefined,
    formatStr: string,
  ) => string
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
          currentCurrency:
            lang === 'pt' ? 'BRL' : lang === 'es' ? 'EUR' : 'USD',
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
        const currency = get().currentCurrency || 'USD'

        let locale = 'en-US'
        if (currency === 'BRL') locale = 'pt-BR'
        else if (currency === 'EUR') locale = 'es-ES'

        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(value)
      },
      formatDate: (date, formatStr) => {
        if (!date) return ''
        const d = new Date(date)
        if (!isValid(d)) return ''
        const locale = get().getDateLocale()
        return format(d, formatStr, { locale })
      },
      getDateLocale: () => {
        const currency = get().currentCurrency
        if (currency === 'BRL') return ptBR
        if (currency === 'EUR') return es
        return enUS
      },
    }),
    {
      name: 'language-storage',
    },
  ),
)

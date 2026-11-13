import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { T } from './translations'

export type Lang = 'pt' | 'en' | 'es'
export type Key = keyof typeof T
type Params = Record<string, string | number>

const INDEX: Record<Lang, 0 | 1 | 2> = { pt: 0, en: 1, es: 2 }
const LOCALES: Record<Lang, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }

// idioma atual para formatar datas e valores fora dos componentes
let currentLocale = 'pt-BR'
export const getLocale = () => currentLocale

type Theme = 'light' | 'dark'
type I18n = {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  toggleTheme: () => void
  t: (key: Key, params?: Params) => string
  tl: (label: string) => string // traduz nomes guardados como "@chave"
}

const I18nContext = createContext<I18n | null>(null)

function load(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}
function save(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* sem armazenamento, segue a vida */ }
}

function initialLang(): Lang {
  const stored = load('hairday-lang')
  if (stored === 'pt' || stored === 'en' || stored === 'es') return stored
  const nav = navigator.language.toLowerCase()
  return nav.startsWith('es') ? 'es' : nav.startsWith('en') ? 'en' : 'pt'
}
function initialTheme(): Theme {
  const stored = load('hairday-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  currentLocale = LOCALES[lang]

  useEffect(() => {
    document.documentElement.lang = LOCALES[lang]
    save('hairday-lang', lang)
  }, [lang])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    save('hairday-theme', theme)
  }, [theme])

  const t = (key: Key, params?: Params) => {
    let text: string = T[key][INDEX[lang]]
    for (const [name, value] of Object.entries(params ?? {})) text = text.split(`{${name}}`).join(String(value))
    return text
  }
  const tl = (label: string) => (label.startsWith('@') ? t(label.slice(1) as Key) : label)

  const value: I18n = { lang, setLang, theme, toggleTheme: () => setTheme((x) => (x === 'light' ? 'dark' : 'light')), t, tl }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n deve ser usado dentro de I18nProvider')
  return context
}

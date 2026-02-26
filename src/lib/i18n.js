import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import es from '../locales/es.json'

const STORAGE_KEY = 'dw-lang'
const SUPPORTED = ['en', 'es']

const savedLang = localStorage.getItem(STORAGE_KEY)
const browserLang = navigator.language.split('-')[0]
const defaultLang = savedLang ?? (SUPPORTED.includes(browserLang) ? browserLang : 'en')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n

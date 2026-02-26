import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext.jsx'
import { PaperPlaneIcon } from '@/icons'
import styles from './Header.module.css'

const THEME_CYCLE = { system: 'light', light: 'dark', dark: 'system' }
const LANG_CYCLE = { en: 'es', es: 'en' }
const LANG_STORAGE_KEY = 'dw-lang'

function SystemIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

const THEME_ICONS = { system: SystemIcon, light: SunIcon, dark: MoonIcon }

export function Header() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()

  const ThemeIcon = THEME_ICONS[theme]

  const cycleTheme = () => setTheme(THEME_CYCLE[theme])

  const toggleLang = () => {
    const next = LANG_CYCLE[i18n.language] ?? 'en'
    i18n.changeLanguage(next)
    localStorage.setItem(LANG_STORAGE_KEY, next)
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          <motion.div
            className={styles.logo}
            whileHover={{ rotate: -8, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <PaperPlaneIcon size={28} />
          </motion.div>
          <span className={styles.brandName}>DealWing</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            {t('nav.search')}
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {t('nav.saved')}
          </NavLink>

          <div className={styles.controls}>
            <button
              className={styles.iconBtn}
              onClick={cycleTheme}
              title={t(`theme.${theme}`)}
              aria-label={t(`theme.${theme}`)}
            >
              <ThemeIcon />
            </button>

            <button
              className={styles.langBtn}
              onClick={toggleLang}
              title={t('language.label')}
              aria-label={t('language.label')}
            >
              {t(`language.${i18n.language}`)}
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

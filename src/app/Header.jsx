import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext.jsx'
import { PaperPlaneIcon, HeartIcon, SunIcon, MoonIcon } from '@/icons'
import styles from './Header.module.css'

const LANG_CYCLE = { en: 'es', es: 'en' }
const LANG_STORAGE_KEY = 'dw-lang'

export function Header() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()

  const ThemeIcon = theme === 'dark' ? SunIcon : MoonIcon
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // Second nav link: on home → "Viajes guardados" (to /saved); on saved → "Buscar vuelos" (to /)
  const isSavedPage = pathname === '/saved'
  const otherPageTo = isSavedPage ? '/' : '/saved'
  const otherPageLabel = isSavedPage ? t('search.searchFlights') : t('nav.savedTrips')
  const OtherPageIcon = isSavedPage ? PaperPlaneIcon : HeartIcon

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
            to={otherPageTo}
            end={otherPageTo === '/'}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          >
            <OtherPageIcon size={16} />
            {otherPageLabel}
          </NavLink>

          <div className={styles.controls}>
            <button
              className={styles.iconBtn}
              onClick={toggleTheme}
              title={t(theme === 'dark' ? 'theme.switchLight' : 'theme.switchDark')}
              aria-label={t(theme === 'dark' ? 'theme.switchLight' : 'theme.switchDark')}
            >
              <ThemeIcon size={16} />
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

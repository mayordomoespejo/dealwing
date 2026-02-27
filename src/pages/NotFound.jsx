import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button.jsx'
import { PaperPlaneIcon } from '@/icons'
import styles from './NotFound.module.css'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.code}>{t('notFound.code')}</div>
        <PaperPlaneIcon size={48} className={styles.plane} />
        <h1 className={styles.title}>{t('notFound.title')}</h1>
        <p className={styles.text}>{t('notFound.message')}</p>
        <Link to="/">
          <Button size="lg">{t('notFound.backToSearch')}</Button>
        </Link>
      </motion.div>
    </div>
  )
}

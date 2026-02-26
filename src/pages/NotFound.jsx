import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button.jsx'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.code}>404</div>
        <div className={styles.plane}>✈️</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.text}>
          Looks like this flight got cancelled. Let&apos;s get you back on track.
        </p>
        <Link to="/">
          <Button size="lg">Back to search</Button>
        </Link>
      </motion.div>
    </div>
  )
}

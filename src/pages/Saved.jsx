import { SavedList } from '@/features/saved/SavedList.jsx'
import styles from './Saved.module.css'

export function Saved() {
  return (
    <div className={styles.page}>
      <SavedList />
    </div>
  )
}

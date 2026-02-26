import { Outlet } from 'react-router-dom'
import { Header } from './Header.jsx'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './Header.module.css'

interface RouteTitle {
  readonly path: string
  readonly title: string
}

const ROUTE_TITLES: readonly RouteTitle[] = [
  { path: '/patients', title: '患者管理' },
  { path: '/calculator', title: '栄養計算' },
  { path: '/menu-builder', title: 'メニュー作成' },
  { path: '/menus', title: '保存メニュー' },
] as const

const DEFAULT_TITLE = 'ダッシュボード'

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

function getPageTitle(pathname: string): string {
  const matched = ROUTE_TITLES.find((route) =>
    pathname.startsWith(route.path)
  )
  return matched ? matched.title : DEFAULT_TITLE
}

function Header() {
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(() => new Date())

  const updateTime = useCallback(() => {
    setCurrentTime(new Date())
  }, [])

  useEffect(() => {
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [updateTime])

  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{pageTitle}</h1>
      <time className={styles.clock} dateTime={currentTime.toISOString()}>
        {formatDateTime(currentTime)}
      </time>
    </header>
  )
}

export default Header

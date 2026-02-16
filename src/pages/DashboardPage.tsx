import { Link } from 'react-router-dom'
import { Users, ClipboardList, Plus, TrendingUp } from 'lucide-react'
import { usePatients } from '../hooks/usePatients'
import { useNutritionMenus } from '../hooks/useNutritionMenus'
import { Card, Badge, Button, EmptyState } from '../components/ui'
import type { NutritionMenuData } from '../hooks/useNutritionMenus'
import styles from './DashboardPage.module.css'

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getNutritionTypeBadge(type: string) {
  const isEnteral = type === 'enteral'
  return (
    <Badge variant={isEnteral ? 'success' : 'warning'}>
      {isEnteral ? '経腸栄養' : '静脈栄養'}
    </Badge>
  )
}

function getRecentMenus(menus: readonly NutritionMenuData[]): NutritionMenuData[] {
  return [...menus]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
}

function SummaryCards({
  patientCount,
  menuCount,
}: {
  readonly patientCount: number
  readonly menuCount: number
}) {
  return (
    <div className={styles.summaryGrid}>
      <Card className={styles.summaryCard}>
        <div className={`${styles.summaryIcon} ${styles.summaryIconPatients}`}>
          <Users size={24} />
        </div>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>登録患者数</span>
          <span className={styles.summaryValue}>{patientCount}</span>
        </div>
      </Card>
      <Card className={styles.summaryCard}>
        <div className={`${styles.summaryIcon} ${styles.summaryIconMenus}`}>
          <ClipboardList size={24} />
        </div>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>作成メニュー数</span>
          <span className={styles.summaryValue}>{menuCount}</span>
        </div>
      </Card>
    </div>
  )
}

function RecentMenuList({
  menus,
}: {
  readonly menus: readonly NutritionMenuData[]
}) {
  const recentMenus = getRecentMenus(menus)

  if (recentMenus.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={40} />}
        title="メニューがありません"
        description="メニュー作成ページから栄養メニューを作成してください。"
        action={
          <Link to="/menu-builder" className={styles.actionLink}>
            <Button variant="primary" icon={<Plus size={16} />}>
              メニュー作成
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className={styles.menuList}>
      {recentMenus.map((menu) => (
        <Card key={menu.id} className={styles.menuItem}>
          <div className={styles.menuInfo}>
            <span className={styles.menuName}>{menu.menuName}</span>
            <div className={styles.menuMeta}>
              <span>{menu.patientName}</span>
              {getNutritionTypeBadge(menu.nutritionType)}
              <span>{formatDate(menu.createdAt)}</span>
            </div>
          </div>
          <span className={styles.menuEnergy}>
            {Math.round(menu.totalEnergy)} kcal
          </span>
        </Card>
      ))}
    </div>
  )
}

function QuickActions() {
  return (
    <div className={styles.quickActions}>
      <Link to="/patients" className={styles.actionLink}>
        <Button variant="secondary" icon={<Plus size={16} />}>
          新規患者登録
        </Button>
      </Link>
      <Link to="/menu-builder" className={styles.actionLink}>
        <Button variant="primary" icon={<TrendingUp size={16} />}>
          メニュー作成
        </Button>
      </Link>
    </div>
  )
}

export function DashboardPage() {
  const { patients } = usePatients()
  const { menus } = useNutritionMenus()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>ダッシュボード</h1>
        <p className={styles.subtitle}>ICU栄養管理の概要</p>
      </header>

      <SummaryCards
        patientCount={patients.length}
        menuCount={menus.length}
      />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>最近のメニュー</h2>
        </div>
        <RecentMenuList menus={menus} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>クイックアクション</h2>
        </div>
        <QuickActions />
      </section>
    </div>
  )
}

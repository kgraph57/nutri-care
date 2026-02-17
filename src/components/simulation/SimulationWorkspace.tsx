import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Search, Plus, Minus, Lightbulb, Clock, ClipboardList } from 'lucide-react'
import { Card } from '../ui'
import { useNutritionDatabase } from '../../hooks/useNutritionDatabase'
import type { SimulationCase } from '../../types/simulation'
import type { NutritionMenuData } from '../../hooks/useNutritionMenus'
import styles from './SimulationWorkspace.module.css'

interface MenuItemEntry {
  readonly id: string
  readonly product: Record<string, string | number>
  readonly volume: number
}

interface SimulationWorkspaceProps {
  readonly caseData: SimulationCase
  readonly onSubmit: (menuData: NutritionMenuData) => void
}

function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function calcNutrientTotal(
  items: readonly MenuItemEntry[],
  nutrientKey: string,
  perUnit: number,
): number {
  return items.reduce((sum, item) => {
    const value = Number(item.product[nutrientKey]) || 0
    return sum + (value * item.volume) / perUnit
  }, 0)
}

export function SimulationWorkspace({ caseData, onSubmit }: SimulationWorkspaceProps) {
  const { products, isLoading } = useNutritionDatabase(
    caseData.idealAnswer.nutritionType,
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [menuItems, setMenuItems] = useState<readonly MenuItemEntry[]>([])
  const [shownHintCount, setShownHintCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter((p: Record<string, string | number>) => {
      const name = String(p['製剤名'] ?? '').toLowerCase()
      const maker = String(p['メーカー'] ?? '').toLowerCase()
      const category = String(p['カテゴリ'] ?? '').toLowerCase()
      return name.includes(query) || maker.includes(query) || category.includes(query)
    })
  }, [products, searchQuery])

  const handleAddProduct = useCallback(
    (product: Record<string, string | number>) => {
      const newItem: MenuItemEntry = {
        id: generateItemId(),
        product,
        volume: 100,
      }
      setMenuItems((prev) => [...prev, newItem])
    },
    [],
  )

  const handleRemoveItem = useCallback((itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const handleVolumeChange = useCallback((itemId: string, volume: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, volume: Math.max(0, volume) } : item,
      ),
    )
  }, [])

  const handleShowHint = useCallback(() => {
    const requestHints = caseData.hints.filter((h) => h.trigger === 'request')
    const timeHints = caseData.hints.filter((h) => h.trigger === 'time')
    const allAvailableHints = [...requestHints, ...timeHints]
    if (shownHintCount < allAvailableHints.length) {
      setShownHintCount((prev) => prev + 1)
    }
  }, [caseData.hints, shownHintCount])

  const shownHints = useMemo(() => {
    const requestHints = caseData.hints.filter((h) => h.trigger === 'request')
    const timeHints = caseData.hints.filter((h) => h.trigger === 'time')
    const allAvailableHints = [...requestHints, ...timeHints]
    return allAvailableHints.slice(0, shownHintCount)
  }, [caseData.hints, shownHintCount])

  const totalEnergy = useMemo(
    () => calcNutrientTotal(menuItems, 'エネルギー[kcal/ml]', 1) || calcNutrientTotal(menuItems, 'エネルギー(kcal/100ml)', 100),
    [menuItems],
  )
  const totalProtein = useMemo(
    () => calcNutrientTotal(menuItems, 'タンパク質[g/100ml]', 100) || calcNutrientTotal(menuItems, 'タンパク質(g/100ml)', 100),
    [menuItems],
  )
  const totalFat = useMemo(
    () => calcNutrientTotal(menuItems, '脂質[g/100ml]', 100) || calcNutrientTotal(menuItems, '脂質(g/100ml)', 100),
    [menuItems],
  )
  const totalCarbs = useMemo(
    () => calcNutrientTotal(menuItems, '炭水化物[g/100ml]', 100) || calcNutrientTotal(menuItems, '炭水化物(g/100ml)', 100),
    [menuItems],
  )
  const totalVolume = useMemo(
    () => menuItems.reduce((sum, item) => sum + item.volume, 0),
    [menuItems],
  )

  const hasTimeLimit = caseData.timeLimit !== undefined && caseData.timeLimit > 0
  const remainingTime = hasTimeLimit
    ? Math.max(0, (caseData.timeLimit ?? 0) - elapsedSeconds)
    : null
  const isTimeWarning = remainingTime !== null && remainingTime < 120

  const handleSubmit = useCallback(() => {
    const currentIntake: Record<string, number> = {
      energy: totalEnergy,
      protein: totalProtein,
      fat: totalFat,
      carbs: totalCarbs,
    }

    const menuData: NutritionMenuData = {
      id: `sim-menu-${Date.now()}`,
      patientId: caseData.patient.id,
      patientName: caseData.patient.name,
      nutritionType: caseData.idealAnswer.nutritionType,
      menuName: `演習: ${caseData.title}`,
      items: menuItems.map((item) => ({
        id: item.id,
        productName: String(item.product['製剤名'] ?? ''),
        manufacturer: String(item.product['メーカー'] ?? ''),
        volume: item.volume,
        frequency: 1,
      })),
      totalEnergy,
      totalVolume,
      requirements: caseData.idealAnswer.requirements,
      currentIntake,
      notes: '',
      activityLevel: '',
      stressLevel: '',
      medicalCondition: caseData.patient.diagnosis,
      createdAt: new Date().toISOString(),
    }

    onSubmit(menuData)
  }, [menuItems, caseData, totalEnergy, totalProtein, totalFat, totalCarbs, totalVolume, onSubmit])

  const maxHints = useMemo(() => {
    const requestHints = caseData.hints.filter((h) => h.trigger === 'request')
    const timeHints = caseData.hints.filter((h) => h.trigger === 'time')
    return requestHints.length + timeHints.length
  }, [caseData.hints])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>{caseData.title}</h2>
        <div className={styles.headerMeta}>
          {remainingTime !== null && (
            <div className={`${styles.timer} ${isTimeWarning ? styles.timerWarning : ''}`}>
              <Clock size={16} />
              <span>{formatTime(remainingTime)}</span>
            </div>
          )}
          {remainingTime === null && (
            <div className={styles.timer}>
              <Clock size={16} />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>
            <Search size={16} />
            製品選択
          </h3>

          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="製品名・メーカーで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className={styles.loadingText}>製品データを読み込み中...</p>
          ) : (
            <div className={styles.productList}>
              {filteredProducts.slice(0, 50).map((product: Record<string, string | number>, index: number) => {
                const name = String(product['製剤名'] ?? '')
                const maker = String(product['メーカー'] ?? '')
                const energyDensity =
                  Number(product['エネルギー[kcal/ml]']) ||
                  (Number(product['エネルギー(kcal/100ml)']) / 100) ||
                  0

                return (
                  <div key={`${name}-${index}`} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{name}</span>
                      <span className={styles.productMeta}>
                        {maker} | {energyDensity.toFixed(2)} kcal/ml
                      </span>
                    </div>
                    <button
                      className={styles.addButton}
                      onClick={() => handleAddProduct(product)}
                      type="button"
                    >
                      <Plus size={14} />
                      追加
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={`${styles.panel} ${styles.menuPanel}`}>
          <h3 className={styles.panelTitle}>
            <ClipboardList size={16} />
            現在のメニュー
          </h3>

          {menuItems.length === 0 ? (
            <div className={styles.emptyMenu}>
              <div className={styles.emptyMenuIcon}>
                <ClipboardList size={32} />
              </div>
              <p className={styles.emptyMenuText}>
                左パネルから製品を追加してください
              </p>
            </div>
          ) : (
            <div className={styles.menuList}>
              {menuItems.map((item) => (
                <div key={item.id} className={styles.menuItem}>
                  <div className={styles.menuItemInfo}>
                    <span className={styles.menuItemName}>
                      {String(item.product['製剤名'] ?? '')}
                    </span>
                    <span className={styles.menuItemMeta}>
                      {String(item.product['メーカー'] ?? '')}
                    </span>
                  </div>
                  <div className={styles.volumeControl}>
                    <input
                      type="number"
                      className={styles.volumeInput}
                      value={item.volume}
                      onChange={(e) =>
                        handleVolumeChange(item.id, Number(e.target.value))
                      }
                      min={0}
                      step={50}
                    />
                    <span className={styles.volumeUnit}>ml</span>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveItem(item.id)}
                    type="button"
                    aria-label="削除"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.totals}>
            <div className={styles.totalItem}>
              <span className={styles.totalValue}>
                {Math.round(totalEnergy)}
              </span>
              <span className={styles.totalLabel}>kcal</span>
            </div>
            <div className={styles.totalItem}>
              <span className={styles.totalValue}>
                {totalProtein.toFixed(1)}
              </span>
              <span className={styles.totalLabel}>蛋白(g)</span>
            </div>
            <div className={styles.totalItem}>
              <span className={styles.totalValue}>
                {totalFat.toFixed(1)}
              </span>
              <span className={styles.totalLabel}>脂質(g)</span>
            </div>
            <div className={styles.totalItem}>
              <span className={styles.totalValue}>
                {totalCarbs.toFixed(1)}
              </span>
              <span className={styles.totalLabel}>炭水化物(g)</span>
            </div>
            <div className={styles.totalItem}>
              <span className={styles.totalValue}>{totalVolume}</span>
              <span className={styles.totalLabel}>容量(ml)</span>
            </div>
          </div>

          {shownHints.length > 0 && (
            <Card className={styles.hintCard}>
              <h4 className={styles.hintTitle}>
                <Lightbulb size={14} />
                ヒント
              </h4>
              {shownHints.map((hint, idx) => (
                <p key={idx} className={styles.hintText}>
                  {hint.content}
                </p>
              ))}
            </Card>
          )}

          <div className={styles.menuActions}>
            <button
              className={styles.hintButton}
              onClick={handleShowHint}
              disabled={shownHintCount >= maxHints}
              type="button"
            >
              <Lightbulb size={16} />
              ヒントを見る ({shownHintCount}/{maxHints})
            </button>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={menuItems.length === 0}
              type="button"
            >
              提出する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

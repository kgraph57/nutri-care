import { useState, useMemo } from 'react'
import { ExternalLink, BookOpen } from 'lucide-react'
import { Modal } from './ui'
import { NUTRIENT_SECTIONS } from '../data/nutrientFieldDefinitions'
import type { NutrientSection } from '../data/nutrientFieldDefinitions'
import styles from './DrugInfoModal.module.css'

interface DrugInfoModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly product: Record<string, string | number> | null
}

function hasValue(val: unknown): boolean {
  return val !== undefined && val !== null && val !== '' && val !== 0
}

function formatValue(value: string | number): string {
  if (typeof value !== 'number') return String(value)
  if (value === 0) return '0'
  return value % 1 === 0 ? String(value) : value.toFixed(2)
}

function buildPmdaUrl(productName: string): string {
  return `https://www.pmda.go.jp/PmdaSearch/iyakuSearch/#key=${encodeURIComponent(productName)}`
}

function SectionGrid({
  section,
  product,
}: {
  readonly section: NutrientSection
  readonly product: Record<string, string | number>
}) {
  const visibleFields = section.fields.filter(({ key }) => hasValue(product[key]))

  if (visibleFields.length === 0) {
    return <p className={styles.noData}>データなし</p>
  }

  return (
    <div className={styles.nutrientGrid}>
      {visibleFields.map(({ key, label, unit }) => (
        <div key={key} className={styles.nutrientRow}>
          <span className={styles.nutrientLabel}>{label}</span>
          <span className={styles.nutrientValue}>
            {formatValue(product[key])}
            {unit && <span className={styles.nutrientUnit}> {unit}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DrugInfoModal({ isOpen, onClose, product }: DrugInfoModalProps) {
  const [activeTab, setActiveTab] = useState('macro')

  const availableSections = useMemo(() => {
    if (!product) return []
    return NUTRIENT_SECTIONS.filter((section) =>
      section.fields.some(({ key }) => hasValue(product[key])),
    )
  }, [product])

  if (!product) return null

  const name = String(product['製剤名'] ?? '')
  const maker = String(product['メーカー'] ?? '')
  const category = String(product['カテゴリ'] ?? '')
  const subCategory = String(product['サブカテゴリ'] ?? '')
  const dataSource = String(product['データソース'] ?? '')
  const pmdaUrl = buildPmdaUrl(name)

  const currentSection = availableSections.find((s) => s.id === activeTab) ?? availableSections[0]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={name}>
      <div className={styles.content}>
        <div className={styles.metaRow}>
          {maker && <span className={styles.maker}>{maker}</span>}
          {category && <span className={styles.badge}>{category}</span>}
          {subCategory && subCategory !== category && (
            <span className={styles.badgeSub}>{subCategory}</span>
          )}
          {dataSource && (
            <span className={styles.badgeSub}>{dataSource}</span>
          )}
        </div>

        <div className={styles.tabBar}>
          {availableSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.tab} ${section.id === (currentSection?.id ?? '') ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        {currentSection && (
          <SectionGrid section={currentSection} product={product} />
        )}

        <h3 className={styles.sectionTitle}>添付文書・情報</h3>
        <div className={styles.linksSection}>
          <a
            href={pmdaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkButton}
          >
            <BookOpen size={15} />
            PMDA 添付文書検索
            <ExternalLink size={12} className={styles.externalIcon} />
          </a>
        </div>
      </div>
    </Modal>
  )
}

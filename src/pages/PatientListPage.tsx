import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Users } from 'lucide-react'
import type { Patient } from '../types'
import { usePatients } from '../hooks'
import { Button, SearchInput, Modal, EmptyState } from '../components/ui'
import { PatientForm } from './PatientForm'
import styles from './PatientListPage.module.css'

type SortField = 'name' | 'age' | 'ward' | 'admissionDate'
type SortDirection = 'asc' | 'desc'

interface SortColumnProps {
  readonly field: SortField
  readonly label: string
  readonly currentField: SortField
  readonly currentDirection: SortDirection
  readonly onSort: (field: SortField) => void
}

function SortColumnHeader({
  field,
  label,
  currentField,
  currentDirection,
  onSort,
}: SortColumnProps) {
  return (
    <th>
      <button
        className={styles.sortButton}
        onClick={() => onSort(field)}
        type="button"
      >
        {label}
        {currentField === field &&
          (currentDirection === 'asc' ? (
            <ArrowUp size={14} />
          ) : (
            <ArrowDown size={14} />
          ))}
      </button>
    </th>
  )
}

function filterPatients(
  patients: readonly Patient[],
  term: string
): Patient[] {
  const lowerTerm = term.toLowerCase()
  return patients.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerTerm) ||
      p.ward.toLowerCase().includes(lowerTerm) ||
      p.diagnosis.toLowerCase().includes(lowerTerm)
  )
}

function sortPatients(
  patients: readonly Patient[],
  field: SortField,
  direction: SortDirection
): Patient[] {
  return [...patients].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })
}

export function PatientListPage() {
  const { patients, addPatient, updatePatient, deletePatient } = usePatients()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const displayedPatients = useMemo(() => {
    const filtered = filterPatients(patients, searchTerm)
    return sortPatients(filtered, sortField, sortDirection)
  }, [patients, searchTerm, sortField, sortDirection])

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField]
  )

  const handleOpenNew = useCallback(() => {
    setEditingPatient(null)
    setIsFormOpen(true)
  }, [])

  const handleOpenEdit = useCallback((patient: Patient) => {
    setEditingPatient(patient)
    setIsFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingPatient(null)
  }, [])

  const handleSave = useCallback(
    (patient: Patient) => {
      if (editingPatient) {
        updatePatient(patient)
      } else {
        addPatient(patient)
      }
      handleCloseForm()
    },
    [editingPatient, updatePatient, addPatient, handleCloseForm]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('この患者を削除しますか？')) {
        deletePatient(id)
      }
    },
    [deletePatient]
  )

  const handleEnteral = useCallback(
    (patientId: string) => {
      navigate(`/menu-builder/${patientId}?type=enteral`)
    },
    [navigate]
  )

  const handleParenteral = useCallback(
    (patientId: string) => {
      navigate(`/menu-builder/${patientId}?type=parenteral`)
    },
    [navigate]
  )

  const modalTitle = editingPatient ? '患者情報編集' : '新規患者登録'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>患者管理</h1>
          <p className={styles.subtitle}>
            患者情報の登録・管理・検索
          </p>
        </div>
        <Button icon={<Plus size={18} />} onClick={handleOpenNew}>
          新規患者登録
        </Button>
      </div>

      <div className={styles.searchWrapper}>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="患者名、病棟、診断名で検索..."
        />
      </div>

      {displayedPatients.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={<Users size={48} />}
            title="患者が見つかりません"
            description={
              searchTerm
                ? '検索条件を変更してお試しください'
                : '「新規患者登録」から患者を追加してください'
            }
            action={
              !searchTerm ? (
                <Button icon={<Plus size={16} />} onClick={handleOpenNew}>
                  新規患者登録
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <PatientTable
            patients={displayedPatients}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onEdit={handleOpenEdit}
            onEnteral={handleEnteral}
            onParenteral={handleParenteral}
            onDelete={handleDelete}
          />
          <PatientMobileCards
            patients={displayedPatients}
            onEdit={handleOpenEdit}
            onEnteral={handleEnteral}
            onParenteral={handleParenteral}
            onDelete={handleDelete}
          />
        </>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={modalTitle}
      >
        <PatientForm
          patient={editingPatient}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  )
}

/* ========================================
   Table Sub-component
   ======================================== */
interface PatientTableProps {
  readonly patients: readonly Patient[]
  readonly sortField: SortField
  readonly sortDirection: SortDirection
  readonly onSort: (field: SortField) => void
  readonly onEdit: (patient: Patient) => void
  readonly onEnteral: (id: string) => void
  readonly onParenteral: (id: string) => void
  readonly onDelete: (id: string) => void
}

function PatientTable({
  patients,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onEnteral,
  onParenteral,
  onDelete,
}: PatientTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortColumnHeader
              field="name"
              label="患者名"
              currentField={sortField}
              currentDirection={sortDirection}
              onSort={onSort}
            />
            <SortColumnHeader
              field="age"
              label="年齢"
              currentField={sortField}
              currentDirection={sortDirection}
              onSort={onSort}
            />
            <SortColumnHeader
              field="ward"
              label="病棟"
              currentField={sortField}
              currentDirection={sortDirection}
              onSort={onSort}
            />
            <SortColumnHeader
              field="admissionDate"
              label="入院日"
              currentField={sortField}
              currentDirection={sortDirection}
              onSort={onSort}
            />
            <th className={styles.thActions}>操作</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <PatientRow
              key={patient.id}
              patient={patient}
              onEdit={onEdit}
              onEnteral={onEnteral}
              onParenteral={onParenteral}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ========================================
   Row Sub-component
   ======================================== */
interface PatientRowProps {
  readonly patient: Patient
  readonly onEdit: (patient: Patient) => void
  readonly onEnteral: (id: string) => void
  readonly onParenteral: (id: string) => void
  readonly onDelete: (id: string) => void
}

function PatientRow({
  patient,
  onEdit,
  onEnteral,
  onParenteral,
  onDelete,
}: PatientRowProps) {
  return (
    <tr>
      <td className={styles.cellName}>{patient.name}</td>
      <td className={styles.cell}>{patient.age}歳</td>
      <td className={styles.cell}>{patient.ward}</td>
      <td className={styles.cell}>{patient.admissionDate}</td>
      <td className={styles.cellActions}>
        <ActionButtons
          patient={patient}
          onEdit={onEdit}
          onEnteral={onEnteral}
          onParenteral={onParenteral}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

/* ========================================
   Action Buttons
   ======================================== */
interface ActionButtonsProps {
  readonly patient: Patient
  readonly onEdit: (patient: Patient) => void
  readonly onEnteral: (id: string) => void
  readonly onParenteral: (id: string) => void
  readonly onDelete: (id: string) => void
}

function ActionButtons({
  patient,
  onEdit,
  onEnteral,
  onParenteral,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div className={styles.actionGroup}>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionEdit}`}
        onClick={() => onEdit(patient)}
      >
        <Edit size={12} />
        編集
      </button>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionEnteral}`}
        onClick={() => onEnteral(patient.id)}
      >
        経腸栄養
      </button>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionParenteral}`}
        onClick={() => onParenteral(patient.id)}
      >
        中心静脈
      </button>
      <button
        type="button"
        className={`${styles.actionButton} ${styles.actionDelete}`}
        onClick={() => onDelete(patient.id)}
      >
        <Trash2 size={12} />
        削除
      </button>
    </div>
  )
}

/* ========================================
   Mobile Cards
   ======================================== */
interface PatientMobileCardsProps {
  readonly patients: readonly Patient[]
  readonly onEdit: (patient: Patient) => void
  readonly onEnteral: (id: string) => void
  readonly onParenteral: (id: string) => void
  readonly onDelete: (id: string) => void
}

function PatientMobileCards({
  patients,
  onEdit,
  onEnteral,
  onParenteral,
  onDelete,
}: PatientMobileCardsProps) {
  return (
    <div className={styles.mobileCards}>
      {patients.map((patient) => (
        <MobilePatientCard
          key={patient.id}
          patient={patient}
          onEdit={onEdit}
          onEnteral={onEnteral}
          onParenteral={onParenteral}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface MobilePatientCardProps {
  readonly patient: Patient
  readonly onEdit: (patient: Patient) => void
  readonly onEnteral: (id: string) => void
  readonly onParenteral: (id: string) => void
  readonly onDelete: (id: string) => void
}

function MobilePatientCard({
  patient,
  onEdit,
  onEnteral,
  onParenteral,
  onDelete,
}: MobilePatientCardProps) {
  return (
    <div className={styles.mobileCard}>
      <div className={styles.mobileCardHeader}>
        <span className={styles.mobileCardName}>{patient.name}</span>
      </div>
      <div className={styles.mobileCardDetails}>
        <span className={styles.mobileCardDetail}>
          <span className={styles.mobileCardLabel}>年齢:</span>
          {patient.age}歳
        </span>
        <span className={styles.mobileCardDetail}>
          <span className={styles.mobileCardLabel}>病棟:</span>
          {patient.ward}
        </span>
        <span className={styles.mobileCardDetail}>
          <span className={styles.mobileCardLabel}>入院日:</span>
          {patient.admissionDate}
        </span>
      </div>
      <div className={styles.mobileCardActions}>
        <ActionButtons
          patient={patient}
          onEdit={onEdit}
          onEnteral={onEnteral}
          onParenteral={onParenteral}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

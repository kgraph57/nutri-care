import { useState, useCallback, useEffect } from 'react'
import type { Patient } from '../types'
import { samplePatients } from '../data/sampleData'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './useAuth'

const STORAGE_KEY = 'nutri-care-patients'

const loadPatientsFromStorage = (): Patient[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed as Patient[]
      }
    }
  } catch {
    // Storage read/parse failed; fall through to defaults
  }
  return [...samplePatients]
}

const savePatientsToStorage = (patients: Patient[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
  } catch {
    // Storage write failed silently
  }
}

function toSnakeCase(patient: Patient, userId: string) {
  return {
    id: patient.id,
    user_id: userId,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    ward: patient.ward,
    admission_date: patient.admissionDate,
    discharge_date: patient.dischargeDate,
    patient_type: patient.patientType,
    weight: patient.weight,
    height: patient.height,
    diagnosis: patient.diagnosis,
    allergies: patient.allergies,
    medications: patient.medications,
    notes: patient.notes,
  }
}

function toCamelCase(row: Record<string, unknown>): Patient {
  return {
    id: String(row.id),
    name: String(row.name),
    age: Number(row.age),
    gender: String(row.gender),
    ward: String(row.ward),
    admissionDate: String(row.admission_date ?? ''),
    dischargeDate: String(row.discharge_date ?? ''),
    patientType: String(row.patient_type ?? ''),
    weight: Number(row.weight),
    height: Number(row.height),
    diagnosis: String(row.diagnosis ?? ''),
    allergies: (row.allergies as string[]) ?? [],
    medications: (row.medications as string[]) ?? [],
    notes: String(row.notes ?? ''),
  }
}

export function usePatients() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>(
    isSupabaseConfigured ? [] : loadPatientsFromStorage
  )
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  // Load from Supabase on mount
  useEffect(() => {
    if (!supabase || !user) return

    const fetchPatients = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPatients(data.map(toCamelCase))
      }
      setIsLoading(false)
    }

    fetchPatients()
  }, [user])

  const addPatient = useCallback(
    async (patient: Patient): Promise<void> => {
      if (supabase && user) {
        const { data, error } = await supabase
          .from('patients')
          .insert(toSnakeCase(patient, user.id))
          .select()
          .single()

        if (!error && data) {
          setPatients((prev) => [toCamelCase(data), ...prev])
        }
      } else {
        setPatients((prev) => {
          const next = [...prev, patient]
          savePatientsToStorage(next)
          return next
        })
      }
    },
    [user]
  )

  const updatePatient = useCallback(
    async (patient: Patient): Promise<void> => {
      if (supabase && user) {
        const { id, ...updates } = toSnakeCase(patient, user.id)
        await supabase.from('patients').update(updates).eq('id', id)
        setPatients((prev) =>
          prev.map((p) => (p.id === patient.id ? { ...patient } : p))
        )
      } else {
        setPatients((prev) => {
          const next = prev.map((p) =>
            p.id === patient.id ? { ...patient } : p
          )
          savePatientsToStorage(next)
          return next
        })
      }
    },
    [user]
  )

  const deletePatient = useCallback(
    async (id: string): Promise<void> => {
      if (supabase) {
        await supabase.from('patients').delete().eq('id', id)
      }
      setPatients((prev) => {
        const next = prev.filter((p) => p.id !== id)
        if (!isSupabaseConfigured) {
          savePatientsToStorage(next)
        }
        return next
      })
    },
    []
  )

  const getPatient = useCallback(
    (id: string): Patient | undefined => {
      return patients.find((p) => p.id === id)
    },
    [patients]
  )

  return {
    patients,
    isLoading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
  } as const
}

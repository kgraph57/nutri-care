import { useState, useCallback } from 'react'
import type { Patient } from '../types'
import { samplePatients } from '../data/sampleData'

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

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(loadPatientsFromStorage)

  const addPatient = useCallback((patient: Patient): void => {
    setPatients((prev) => {
      const next = [...prev, patient]
      savePatientsToStorage(next)
      return next
    })
  }, [])

  const updatePatient = useCallback((patient: Patient): void => {
    setPatients((prev) => {
      const next = prev.map((p) =>
        p.id === patient.id ? { ...patient } : p
      )
      savePatientsToStorage(next)
      return next
    })
  }, [])

  const deletePatient = useCallback((id: string): void => {
    setPatients((prev) => {
      const next = prev.filter((p) => p.id !== id)
      savePatientsToStorage(next)
      return next
    })
  }, [])

  const getPatient = useCallback(
    (id: string): Patient | undefined => {
      return patients.find((p) => p.id === id)
    },
    [patients]
  )

  return {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
  } as const
}

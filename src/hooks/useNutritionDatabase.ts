import { useState, useEffect } from 'react'
import type { NutritionType } from '../types'
import {
  loadNutritionData,
  getEnteralProducts,
  getParenteralProducts,
} from '../utils/nutritionDataLoader'

interface UseNutritionDatabaseResult {
  products: any[]
  categories: string[]
  isLoading: boolean
  error: string | null
}

export function useNutritionDatabase(
  nutritionType: NutritionType
): UseNutritionDatabaseResult {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await loadNutritionData()

        if (!cancelled) {
          setAllProducts(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to load nutrition database'
          setError(message)
          setAllProducts([])
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  const products =
    nutritionType === 'enteral'
      ? getEnteralProducts(allProducts)
      : getParenteralProducts(allProducts)

  const categories = Array.from(
    new Set(
      products
        .map((product: any) => product.カテゴリ as string | undefined)
        .filter((category): category is string => typeof category === 'string' && category.length > 0)
    )
  ).sort()

  return {
    products,
    categories,
    isLoading,
    error,
  }
}

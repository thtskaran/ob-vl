import { useState, useCallback } from 'react'
import { api, PageCreateData, PageCreateResponse } from '../lib/api'

interface UseCreatePageResult {
  isCreating: boolean
  result: PageCreateResponse | null
  error: string | null
  createPage: (data: PageCreateData) => Promise<PageCreateResponse | null>
  reset: () => void
}

export function useCreatePage(): UseCreatePageResult {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<PageCreateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createPage = useCallback(async (data: PageCreateData) => {
    setIsCreating(true)
    setError(null)

    try {
      const response = await api.createPage(data)
      setResult(response)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create page'
      setError(message)
      return null
    } finally {
      setIsCreating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsCreating(false)
  }, [])

  return { isCreating, result, error, createPage, reset }
}

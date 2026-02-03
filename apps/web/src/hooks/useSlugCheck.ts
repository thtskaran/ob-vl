import { useState, useEffect, useCallback, useRef } from 'react'
import { api, SlugCheckResponse } from '../lib/api'

interface UseSlugCheckResult {
  isChecking: boolean
  result: SlugCheckResponse | null
  error: string | null
  checkSlug: (slug: string) => void
}

export function useSlugCheck(debounceMs = 300): UseSlugCheckResult {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<SlugCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const checkSlug = useCallback((slug: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Clear state for empty or short slugs
    if (!slug || slug.length < 3) {
      setResult(null)
      setError(null)
      setIsChecking(false)
      return
    }

    setIsChecking(true)

    // Debounce the API call
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.checkSlug(slug)
        setResult(response)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check slug')
        setResult(null)
      } finally {
        setIsChecking(false)
      }
    }, debounceMs)
  }, [debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { isChecking, result, error, checkSlug }
}

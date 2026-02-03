import { useEffect } from 'react'
import { Input } from '../ui/Input'
import { useSlugCheck } from '../../hooks/useSlugCheck'

interface SlugCheckerProps {
  value: string
  onChange: (value: string) => void
  onAvailabilityChange: (available: boolean) => void
}

export function SlugChecker({
  value,
  onChange,
  onAvailabilityChange,
}: SlugCheckerProps) {
  const { isChecking, result, error, checkSlug } = useSlugCheck(400)

  // Check slug when value changes
  useEffect(() => {
    checkSlug(value)
  }, [value, checkSlug])

  // Notify parent of availability changes
  useEffect(() => {
    onAvailabilityChange(result?.available ?? false)
  }, [result?.available, onAvailabilityChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid slug characters
    const sanitized = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-/, '')

    onChange(sanitized)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
  }

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <div className="animate-spin text-pink-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )
    }

    if (result?.available) {
      return <span className="text-green-500 text-xl">✓</span>
    }

    if (result && !result.available) {
      return <span className="text-red-400 text-xl">✗</span>
    }

    return null
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-pink-700 mb-1">
          Choose your custom URL
        </label>
        <div className="flex items-center gap-2">
          <span className="text-pink-400 text-sm whitespace-nowrap">
            special.obvix.io/
          </span>
          <div className="relative flex-1">
            <Input
              value={value}
              onChange={handleChange}
              placeholder="your-custom-slug"
              maxLength={50}
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </div>

      {/* Status message */}
      {!isChecking && result && (
        <p
          className={`text-sm ${
            result.available ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {result.available
            ? '💕 This URL is available!'
            : `💔 ${result.reason || 'This URL is not available'}`}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          💔 {error}
        </p>
      )}

      {/* Suggestions */}
      {result && !result.available && result.suggestions.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-pink-600 mb-2">Try these instead:</p>
          <div className="flex flex-wrap gap-2">
            {result.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-pink-400 to-rose-400 text-white
                         rounded-full hover:from-pink-500 hover:to-rose-500 hover:scale-105
                         active:scale-98 transition-all duration-200
                         shadow-[0_2px_10px_rgba(244,114,182,0.3)]
                         hover:shadow-[0_4px_14px_rgba(244,114,182,0.4)]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format hints */}
      <p className="text-xs text-pink-400">
        3-50 characters, letters, numbers, and hyphens only
      </p>
    </div>
  )
}

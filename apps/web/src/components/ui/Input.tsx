import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-pink-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-2xl border-2 bg-white/80 backdrop-blur-sm
              px-4 py-3 text-gray-700 placeholder-pink-300
              transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-pink-400/15 focus:border-pink-400
              hover:border-pink-300
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : 'border-pink-200'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <span>💔</span> {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-pink-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full rounded-2xl border-2 bg-white/80 backdrop-blur-sm
            px-4 py-3 text-gray-700 placeholder-pink-300
            transition-all duration-200 resize-none
            focus:outline-none focus:ring-4 focus:ring-pink-400/15 focus:border-pink-400
            hover:border-pink-300
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/15' : 'border-pink-200'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <span>💔</span> {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

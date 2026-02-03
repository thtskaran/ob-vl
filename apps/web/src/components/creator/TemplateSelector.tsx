import { useEffect, useState } from 'react'
import { api, Template } from '../../lib/api'
import { Card } from '../ui/Card'

interface TemplateSelectorProps {
  selected: string
  onSelect: (templateId: string) => void
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await api.getTemplates()
        setTemplates(response.templates)
      } catch (error) {
        console.error('Failed to load templates:', error)
        // Fallback templates
        setTemplates([
          {
            id: 'classic',
            name: 'Classic Love',
            description: 'Timeless romantic design with elegant typography',
            primary_color: '#e91e63',
            secondary_color: '#fce4ec',
            font: 'Pacifico',
          },
          {
            id: 'modern',
            name: 'Modern Romance',
            description: 'Clean and contemporary with subtle gradients',
            primary_color: '#9c27b0',
            secondary_color: '#f3e5f5',
            font: 'Nunito',
          },
          {
            id: 'playful',
            name: 'Playful Hearts',
            description: 'Fun and vibrant with animated elements',
            primary_color: '#f44336',
            secondary_color: '#ffebee',
            font: 'Caveat',
          },
          {
            id: 'elegant',
            name: 'Elegant Script',
            description: 'Sophisticated design with script typography',
            primary_color: '#880e4f',
            secondary_color: '#fce4ec',
            font: 'Pacifico',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-pink-100 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          variant={selected === template.id ? 'elevated' : 'bordered'}
          className={`
            cursor-pointer transition-all duration-200
            ${selected === template.id
              ? 'ring-2 ring-pink-500 ring-offset-2'
              : 'hover:border-pink-300'
            }
          `}
          onClick={() => onSelect(template.id)}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl shadow-md"
              style={{ backgroundColor: template.primary_color }}
            >
              ♥
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className="font-semibold text-lg"
                style={{
                  fontFamily: template.font === 'Pacifico' ? 'Pacifico, cursive' :
                              template.font === 'Caveat' ? 'Caveat, cursive' :
                              'Nunito, sans-serif',
                  color: template.primary_color,
                }}
              >
                {template.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {template.description}
              </p>
            </div>
          </div>
          {selected === template.id && (
            <div className="absolute top-2 right-2 text-pink-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

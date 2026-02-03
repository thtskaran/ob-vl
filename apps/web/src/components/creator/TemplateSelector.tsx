import { useEffect, useState } from 'react'
import { api, Template } from '../../lib/api'
import { Card } from '../ui/Card'

interface TemplateSelectorProps {
  selected: string
  onSelect: (templateId: string) => void
}

const templateIcons: Record<string, string> = {
  classic: '♥',
  modern: '💜',
  playful: '💕',
  elegant: '🌹',
  proposal: '💍',
  envelope: '💌',
  scratch: '✨',
  countdown: '⏰',
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
        // Fallback templates with interactive ones
        setTemplates([
          {
            id: 'classic',
            name: 'Classic Love',
            description: 'Timeless romantic design with elegant typography',
            primary_color: '#e91e63',
            secondary_color: '#fce4ec',
            font: 'Pacifico',
            interactive: false,
          },
          {
            id: 'proposal',
            name: 'Will You Be Mine?',
            description: 'Interactive proposal with playful Yes/No buttons - No runs away!',
            primary_color: '#ec4899',
            secondary_color: '#fdf2f8',
            font: 'Pacifico',
            interactive: true,
          },
          {
            id: 'envelope',
            name: 'Love Letter',
            description: 'Beautiful 3D envelope that opens to reveal your message',
            primary_color: '#be185d',
            secondary_color: '#fff1f2',
            font: 'Caveat',
            interactive: true,
          },
          {
            id: 'scratch',
            name: 'Scratch Card',
            description: 'Scratch away hearts to reveal a hidden surprise message',
            primary_color: '#db2777',
            secondary_color: '#fce7f3',
            font: 'Nunito',
            interactive: true,
          },
          {
            id: 'countdown',
            name: 'Countdown Reveal',
            description: 'Animated countdown timer that reveals your message dramatically',
            primary_color: '#e11d48',
            secondary_color: '#ffe4e6',
            font: 'Pacifico',
            interactive: true,
          },
          {
            id: 'modern',
            name: 'Modern Romance',
            description: 'Clean and contemporary with subtle gradients',
            primary_color: '#9c27b0',
            secondary_color: '#f3e5f5',
            font: 'Nunito',
            interactive: false,
          },
          {
            id: 'playful',
            name: 'Playful Hearts',
            description: 'Fun and vibrant with animated elements',
            primary_color: '#f44336',
            secondary_color: '#ffebee',
            font: 'Caveat',
            interactive: false,
          },
          {
            id: 'elegant',
            name: 'Elegant Script',
            description: 'Sophisticated design with script typography',
            primary_color: '#880e4f',
            secondary_color: '#fce4ec',
            font: 'Pacifico',
            interactive: false,
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
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-pink-100 animate-pulse"
          />
        ))}
      </div>
    )
  }

  // Sort templates: interactive first, then regular
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.interactive && !b.interactive) return -1
    if (!a.interactive && b.interactive) return 1
    return 0
  })

  return (
    <div className="space-y-4">
      {/* Interactive templates section */}
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-pink-600 mb-3 flex items-center gap-2">
          <span className="animate-pulse">✨</span>
          Interactive Templates
          <span className="text-xs bg-pink-100 text-pink-600 px-1.5 sm:px-2 py-0.5 rounded-full">
            New!
          </span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {sortedTemplates.filter(t => t.interactive).map((template) => (
            <Card
              key={template.id}
              variant={selected === template.id ? 'elevated' : 'bordered'}
              className={`
                cursor-pointer transition-all duration-200 relative overflow-hidden
                ${selected === template.id
                  ? 'ring-2 ring-pink-500 ring-offset-2'
                  : 'hover:border-pink-300 hover:shadow-md hover:scale-105'
                }
              `}
              onClick={() => onSelect(template.id)}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md flex-shrink-0"
                  style={{ backgroundColor: template.primary_color }}
                >
                  {templateIcons[template.id] || '♥'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold text-base sm:text-lg"
                    style={{
                      fontFamily: template.font === 'Pacifico' ? 'Pacifico, cursive' :
                                  template.font === 'Caveat' ? 'Caveat, cursive' :
                                  'Nunito, sans-serif',
                      color: template.primary_color,
                    }}
                  >
                    {template.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                    {template.description}
                  </p>
                </div>
              </div>
              {selected === template.id && (
                <div className="absolute top-2 right-2 text-pink-500">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Classic templates section */}
      <div>
        <h3 className="text-sm font-medium text-pink-500 mb-3">
          Classic Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedTemplates.filter(t => !t.interactive).map((template) => (
            <Card
              key={template.id}
              variant={selected === template.id ? 'elevated' : 'bordered'}
              className={`
                cursor-pointer transition-all duration-200
                ${selected === template.id
                  ? 'ring-2 ring-pink-500 ring-offset-2'
                  : 'hover:border-pink-300 hover:scale-105'
                }
              `}
              onClick={() => onSelect(template.id)}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md flex-shrink-0"
                  style={{ backgroundColor: template.primary_color }}
                >
                  {templateIcons[template.id] || '♥'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold text-base sm:text-lg"
                    style={{
                      fontFamily: template.font === 'Pacifico' ? 'Pacifico, cursive' :
                                  template.font === 'Caveat' ? 'Caveat, cursive' :
                                  'Nunito, sans-serif',
                      color: template.primary_color,
                    }}
                  >
                    {template.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                    {template.description}
                  </p>
                </div>
              </div>
              {selected === template.id && (
                <div className="absolute top-2 right-2 text-pink-500">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

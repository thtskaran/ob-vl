import { Page } from '../../lib/api'
import { Card } from '../ui/Card'

interface PageCardProps {
  page: Page
}

const templateStyles: Record<string, {
  primaryColor: string
  secondaryColor: string
  font: string
}> = {
  classic: {
    primaryColor: '#e91e63',
    secondaryColor: '#fce4ec',
    font: 'Pacifico, cursive',
  },
  modern: {
    primaryColor: '#9c27b0',
    secondaryColor: '#f3e5f5',
    font: 'Nunito, sans-serif',
  },
  playful: {
    primaryColor: '#f44336',
    secondaryColor: '#ffebee',
    font: 'Caveat, cursive',
  },
  elegant: {
    primaryColor: '#880e4f',
    secondaryColor: '#fce4ec',
    font: 'Pacifico, cursive',
  },
}

export function PageCard({ page }: PageCardProps) {
  const styles = templateStyles[page.template_id] || templateStyles.classic

  return (
    <Card
      variant="elevated"
      className="max-w-2xl w-full mx-auto overflow-hidden animate-fadeIn"
      style={{ backgroundColor: styles.secondaryColor }}
    >
      <div className="text-center space-y-6 py-4">
        {/* Decorative header */}
        <div className="flex justify-center gap-3 text-3xl">
          <span
            style={{ color: styles.primaryColor }}
            className="animate-float"
          >
            ♥
          </span>
          <span
            style={{ color: styles.primaryColor }}
            className="animate-float-delayed"
          >
            ♥
          </span>
          <span
            style={{ color: styles.primaryColor }}
            className="animate-float"
          >
            ♥
          </span>
        </div>

        {/* Recipient */}
        {page.recipient_name && (
          <p className="text-xl text-pink-600">
            Dear <span className="font-semibold">{page.recipient_name}</span>,
          </p>
        )}

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl px-4"
          style={{
            fontFamily: styles.font,
            color: styles.primaryColor,
          }}
        >
          {page.title}
        </h1>

        {/* Decorative divider */}
        <div className="flex justify-center items-center gap-4">
          <div
            className="h-px w-16"
            style={{ backgroundColor: styles.primaryColor, opacity: 0.3 }}
          />
          <span style={{ color: styles.primaryColor }}>♥</span>
          <div
            className="h-px w-16"
            style={{ backgroundColor: styles.primaryColor, opacity: 0.3 }}
          />
        </div>

        {/* Message */}
        <div
          className="py-6 px-6 text-lg text-gray-700 whitespace-pre-wrap break-words leading-relaxed"
          style={{ fontFamily: page.template_id === 'playful' ? 'Caveat, cursive' : 'Nunito, sans-serif' }}
        >
          {page.message}
        </div>

        {/* Sender */}
        {page.sender_name && (
          <p
            className="text-2xl"
            style={{
              fontFamily: styles.font,
              color: styles.primaryColor,
            }}
          >
            With love, {page.sender_name}
          </p>
        )}

        {/* Footer decoration */}
        <div className="pt-4">
          <div
            className="text-5xl animate-heart-pulse"
            style={{ color: styles.primaryColor }}
          >
            ♥
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </Card>
  )
}

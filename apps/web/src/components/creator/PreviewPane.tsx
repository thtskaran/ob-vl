import { Card } from '../ui/Card'

interface PreviewPaneProps {
  title: string
  message: string
  senderName: string
  recipientName: string
  templateId: string
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

export function PreviewPane({
  title,
  message,
  senderName,
  recipientName,
  templateId,
}: PreviewPaneProps) {
  const styles = templateStyles[templateId] || templateStyles.classic

  return (
    <div className="sticky top-4">
      <p className="text-sm font-medium text-pink-600 mb-2 text-center">
        Preview
      </p>
      <Card
        variant="elevated"
        className="overflow-hidden"
        style={{ backgroundColor: styles.secondaryColor }}
      >
        <div className="text-center space-y-4">
          {/* Decorative hearts */}
          <div className="flex justify-center gap-2 text-2xl opacity-60">
            <span style={{ color: styles.primaryColor }}>♥</span>
            <span style={{ color: styles.primaryColor }} className="animate-pulse-soft">♥</span>
            <span style={{ color: styles.primaryColor }}>♥</span>
          </div>

          {/* Recipient */}
          {recipientName && (
            <p className="text-lg text-pink-600">
              Dear <span className="font-semibold">{recipientName}</span>,
            </p>
          )}

          {/* Title */}
          <h2
            className="text-2xl sm:text-3xl"
            style={{
              fontFamily: styles.font,
              color: styles.primaryColor,
            }}
          >
            {title || 'Your Title Here'}
          </h2>

          {/* Message */}
          <div
            className="py-4 px-2 text-gray-700 whitespace-pre-wrap break-words"
            style={{ minHeight: '100px' }}
          >
            {message || 'Your heartfelt message will appear here...'}
          </div>

          {/* Sender */}
          {senderName && (
            <p
              className="text-lg"
              style={{
                fontFamily: styles.font,
                color: styles.primaryColor,
              }}
            >
              With love, {senderName}
            </p>
          )}

          {/* Bottom decoration */}
          <div
            className="text-4xl"
            style={{ color: styles.primaryColor }}
          >
            ♥
          </div>
        </div>
      </Card>
    </div>
  )
}

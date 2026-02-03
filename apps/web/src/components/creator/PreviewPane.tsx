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
  proposal: {
    primaryColor: '#ec4899',
    secondaryColor: '#fdf2f8',
    font: 'Pacifico, cursive',
  },
  envelope: {
    primaryColor: '#be185d',
    secondaryColor: '#fff1f2',
    font: 'Caveat, cursive',
  },
  scratch: {
    primaryColor: '#db2777',
    secondaryColor: '#fce7f3',
    font: 'Nunito, sans-serif',
  },
  countdown: {
    primaryColor: '#e11d48',
    secondaryColor: '#ffe4e6',
    font: 'Pacifico, cursive',
  },
}

const interactiveTemplates = ['proposal', 'envelope', 'scratch', 'countdown']

function InteractivePreview({ templateId, title, recipientName, senderName }: {
  templateId: string
  title: string
  recipientName: string
  senderName: string
}) {
  const styles = templateStyles[templateId] || templateStyles.classic

  if (templateId === 'proposal') {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center gap-2 text-xl text-pink-400">
          <span className="animate-float">♥</span>
          <span className="animate-float-delayed">♥</span>
          <span className="animate-float">♥</span>
        </div>
        {recipientName && (
          <p className="text-pink-600">Dear {recipientName},</p>
        )}
        <h3 className="text-xl" style={{ fontFamily: styles.font, color: styles.primaryColor }}>
          {title || "Will you be my Valentine?"}
        </h3>
        <div className="flex justify-center gap-4 pt-2">
          <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-medium shadow">
            Yes! 💕
          </button>
          <button className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-full text-sm">
            No
          </button>
        </div>
        <p className="text-xs text-pink-400 italic">
          The "No" button runs away when they try to click it!
        </p>
        {senderName && (
          <p className="text-sm text-pink-500">~ {senderName}</p>
        )}
      </div>
    )
  }

  if (templateId === 'envelope') {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-pink-500 text-sm">Click to open the love letter</p>
        <div className="relative mx-auto w-48 h-32">
          {/* Envelope body */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-300 rounded-lg shadow-lg" />
          {/* Envelope flap */}
          <div
            className="absolute top-0 left-0 right-0 bg-gradient-to-br from-rose-300 to-pink-400"
            style={{
              height: '50px',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
            }}
          />
          {/* Heart seal */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow animate-pulse">
            <span className="text-white">♥</span>
          </div>
        </div>
        {senderName && (
          <p className="text-xs text-pink-400">A letter from {senderName}</p>
        )}
      </div>
    )
  }

  if (templateId === 'scratch') {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-pink-500 text-sm">Scratch to reveal the message!</p>
        <div className="relative mx-auto w-48 h-32 rounded-lg overflow-hidden shadow-lg">
          {/* Hidden content preview */}
          <div className="absolute inset-0 bg-white flex items-center justify-center text-gray-300 text-xs p-4">
            Your message hidden underneath...
          </div>
          {/* Scratch layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="font-medium">Scratch Me!</p>
              <p className="text-2xl">💕</p>
            </div>
          </div>
          {/* Scratch marks preview */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-white/80 rounded-full blur-sm" />
          <div className="absolute bottom-6 right-8 w-6 h-6 bg-white/60 rounded-full blur-sm" />
        </div>
      </div>
    )
  }

  if (templateId === 'countdown') {
    return (
      <div className="text-center space-y-4 py-4">
        {recipientName && (
          <p className="text-pink-600 text-sm">For {recipientName}</p>
        )}
        <p className="text-pink-500">A special message awaits...</p>
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">10</span>
          </div>
        </div>
        <div className="flex justify-center gap-2 text-xl">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>💕</span>
          <span className="animate-bounce" style={{ animationDelay: '100ms' }}>💖</span>
          <span className="animate-bounce" style={{ animationDelay: '200ms' }}>💕</span>
        </div>
        <p className="text-xs text-pink-400 italic">
          Message reveals after countdown!
        </p>
      </div>
    )
  }

  return null
}

export function PreviewPane({
  title,
  message,
  senderName,
  recipientName,
  templateId,
}: PreviewPaneProps) {
  const styles = templateStyles[templateId] || templateStyles.classic
  const isInteractive = interactiveTemplates.includes(templateId)

  return (
    <div className="sticky top-4">
      <p className="text-sm font-medium text-pink-600 mb-2 text-center">
        Preview
        {isInteractive && (
          <span className="ml-2 text-xs bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
            Interactive
          </span>
        )}
      </p>
      <Card
        variant="elevated"
        className="overflow-hidden"
        style={{ backgroundColor: styles.secondaryColor }}
      >
        {isInteractive ? (
          <InteractivePreview
            templateId={templateId}
            title={title}
            recipientName={recipientName}
            senderName={senderName}
          />
        ) : (
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
        )}
      </Card>

      {/* Interactive template note */}
      {isInteractive && (
        <p className="text-xs text-center text-pink-400 mt-2">
          Full interactive experience when viewing the page
        </p>
      )}
    </div>
  )
}

import { Page } from '../../lib/api'

interface PageCardProps {
  page: Page
}

const templateStyles: Record<string, {
  primaryColor: string
  secondaryColor: string
  gradient: string
  font: string
  pattern?: string
  accentColor?: string
}> = {
  classic: {
    primaryColor: '#e91e63',
    secondaryColor: '#fce4ec',
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
    font: 'Pacifico, cursive',
    accentColor: '#db2777',
  },
  modern: {
    primaryColor: '#9c27b0',
    secondaryColor: '#f3e5f5',
    gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
    font: 'Nunito, sans-serif',
    accentColor: '#a855f7',
  },
  playful: {
    primaryColor: '#f44336',
    secondaryColor: '#ffebee',
    gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
    font: 'Caveat, cursive',
    accentColor: '#fb923c',
  },
  elegant: {
    primaryColor: '#880e4f',
    secondaryColor: '#fce4ec',
    gradient: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)',
    font: 'Pacifico, cursive',
    accentColor: '#c026d3',
  },
}

export function PageCard({ page }: PageCardProps) {
  const styles = templateStyles[page.template_id] || templateStyles.classic
  const isPlayful = page.template_id === 'playful'
  const isModern = page.template_id === 'modern'
  const isElegant = page.template_id === 'elegant'

  return (
    <div className="w-full max-w-lg sm:max-w-2xl mx-auto px-4 sm:px-0">
      {/* Floating decorative elements */}
      <div className="relative">
        {isPlayful && (
          <>
            <div className="absolute -top-8 -left-8 text-4xl animate-wiggle opacity-80">🎈</div>
            <div className="absolute -top-12 -right-12 text-5xl animate-wiggle-delayed opacity-80">✨</div>
          </>
        )}
        {isElegant && (
          <>
            <div className="absolute -top-10 left-8 text-3xl animate-float opacity-60">🌹</div>
            <div className="absolute -top-10 right-8 text-3xl animate-float-delayed opacity-60">🌹</div>
          </>
        )}

        <div
          className="rounded-3xl shadow-2xl overflow-hidden animate-fadeIn relative"
          style={{
            background: styles.gradient,
            boxShadow: `0 25px 60px -15px ${styles.primaryColor}40`,
          }}
        >
          {/* Background pattern overlay */}
          {isModern && (
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, ${styles.accentColor} 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
          )}

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 opacity-10"
            style={{
              background: `radial-gradient(circle at top left, ${styles.accentColor} 0%, transparent 70%)`,
            }}
          />
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: `radial-gradient(circle at bottom right, ${styles.accentColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative p-6 sm:p-8 md:p-10">
            <div className="text-center space-y-5 sm:space-y-6">
              {/* Decorative header - unique per template */}
              {isPlayful ? (
                <div className="flex justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl">
                  <span className="animate-bounce" style={{ color: styles.primaryColor, animationDelay: '0ms' }}>💕</span>
                  <span className="animate-bounce" style={{ color: styles.accentColor, animationDelay: '100ms' }}>💖</span>
                  <span className="animate-bounce" style={{ color: styles.primaryColor, animationDelay: '200ms' }}>💕</span>
                  <span className="animate-bounce" style={{ color: styles.accentColor, animationDelay: '300ms' }}>💖</span>
                </div>
              ) : isModern ? (
                <div className="flex justify-center gap-4 sm:gap-5 text-2xl sm:text-3xl">
                  <span style={{ color: styles.primaryColor }} className="animate-pulse">◆</span>
                  <span style={{ color: styles.accentColor }} className="animate-spin-slow text-3xl">✦</span>
                  <span style={{ color: styles.primaryColor }} className="animate-pulse">◆</span>
                </div>
              ) : isElegant ? (
                <div className="flex justify-center items-center gap-3 sm:gap-4">
                  <div className="w-12 sm:w-16 h-px opacity-30" style={{ background: `linear-gradient(to right, transparent, ${styles.accentColor}, transparent)` }} />
                  <span style={{ color: styles.primaryColor }} className="text-2xl sm:text-3xl animate-heart-pulse">♛</span>
                  <div className="w-12 sm:w-16 h-px opacity-30" style={{ background: `linear-gradient(to right, transparent, ${styles.accentColor}, transparent)` }} />
                </div>
              ) : (
                <div className="flex justify-center gap-3 sm:gap-4 text-3xl sm:text-4xl">
                  <span style={{ color: styles.primaryColor }} className="animate-float opacity-80">♥</span>
                  <span style={{ color: styles.accentColor }} className="animate-float-delayed">♥</span>
                  <span style={{ color: styles.primaryColor }} className="animate-float opacity-80">♥</span>
                </div>
              )}

              {/* Recipient */}
              {page.recipient_name && (
                <div className="space-y-1">
                  <p className="text-sm sm:text-base uppercase tracking-wider" style={{ color: styles.accentColor, opacity: 0.7 }}>
                    To
                  </p>
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: styles.primaryColor }}
                  >
                    {page.recipient_name}
                  </p>
                </div>
              )}

              {/* Title with decorative border */}
              <div className="relative py-4">
                {isElegant && (
                  <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-px" style={{ backgroundColor: styles.accentColor, opacity: 0.3 }} />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-px" style={{ backgroundColor: styles.accentColor, opacity: 0.3 }} />
                  </>
                )}
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl px-2 leading-tight"
                  style={{
                    fontFamily: styles.font,
                    color: styles.primaryColor,
                  }}
                >
                  {page.title}
                </h1>
              </div>

              {/* Decorative divider - unique styles */}
              <div className="flex justify-center items-center gap-3 sm:gap-4 py-2">
                {isModern ? (
                  <>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: styles.accentColor, opacity: 0.5 }} />
                      ))}
                    </div>
                    <span className="text-xl" style={{ color: styles.accentColor }}>⬥</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: styles.accentColor, opacity: 0.5 }} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-px w-12 sm:w-16 md:w-20" style={{ backgroundColor: styles.accentColor, opacity: 0.3 }} />
                    <span className="text-xl sm:text-2xl" style={{ color: styles.accentColor, opacity: 0.7 }}>
                      {isPlayful ? '❤' : isElegant ? '◈' : '✦'}
                    </span>
                    <div className="h-px w-12 sm:w-16 md:w-20" style={{ backgroundColor: styles.accentColor, opacity: 0.3 }} />
                  </>
                )}
              </div>

              {/* Message with subtle background */}
              <div
                className="relative py-6 sm:py-8 px-4 sm:px-6 rounded-2xl"
                style={{
                  backgroundColor: `${styles.secondaryColor}40`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  className="text-base sm:text-lg text-gray-700 whitespace-pre-wrap break-words leading-relaxed"
                  style={{ fontFamily: page.template_id === 'playful' ? 'Caveat, cursive' : 'Nunito, sans-serif', fontSize: page.template_id === 'playful' ? '1.25rem' : undefined }}
                >
                  {page.message}
                </div>
              </div>

              {/* Sender */}
              {page.sender_name && (
                <div className="space-y-2 pt-4">
                  <p className="text-sm sm:text-base uppercase tracking-wider" style={{ color: styles.accentColor, opacity: 0.7 }}>
                    With Love
                  </p>
                  <p
                    className="text-2xl sm:text-3xl"
                    style={{
                      fontFamily: styles.font,
                      color: styles.primaryColor,
                    }}
                  >
                    {page.sender_name}
                  </p>
                </div>
              )}

              {/* Footer decoration - unique per template */}
              <div className="pt-4 sm:pt-6">
                {isPlayful ? (
                  <div className="flex justify-center gap-2 text-3xl sm:text-4xl">
                    <span className="animate-wiggle" style={{ color: styles.primaryColor }}>💝</span>
                    <span className="animate-heart-pulse" style={{ color: styles.accentColor }}>♥</span>
                    <span className="animate-wiggle-delayed" style={{ color: styles.primaryColor }}>💝</span>
                  </div>
                ) : isModern ? (
                  <div className="text-5xl sm:text-6xl animate-pulse" style={{ color: styles.accentColor, opacity: 0.8 }}>
                    ◇
                  </div>
                ) : isElegant ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl sm:text-5xl animate-float" style={{ color: styles.primaryColor }}>
                      ❦
                    </div>
                    <div className="flex gap-2 text-sm" style={{ color: styles.accentColor, opacity: 0.5 }}>
                      <span>✦</span>
                      <span>✦</span>
                      <span>✦</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl sm:text-6xl animate-heart-pulse" style={{ color: styles.primaryColor }}>
                    ♥
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-12px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        @keyframes heart-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-heart-pulse {
          animation: heart-pulse 1.5s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          25% { transform: rotate(5deg) scale(1.05); }
          75% { transform: rotate(-3deg) scale(1.05); }
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        .animate-wiggle-delayed {
          animation: wiggle 2.5s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}

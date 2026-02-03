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
    primaryColor: '#ec4899',
    secondaryColor: '#fce7f3',
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
    font: 'Pacifico, cursive',
    accentColor: '#f43f5e',
  },
  modern: {
    primaryColor: '#c084fc',
    secondaryColor: '#f3e8ff',
    gradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
    font: 'Nunito, sans-serif',
    accentColor: '#a855f7',
  },
  playful: {
    primaryColor: '#fb7185',
    secondaryColor: '#ffe4e6',
    gradient: 'linear-gradient(135deg, #fef2f2 0%, #ffe4e6 50%, #fecdd3 100%)',
    font: 'Caveat, cursive',
    accentColor: '#f43f5e',
  },
  elegant: {
    primaryColor: '#db2777',
    secondaryColor: '#fae8ff',
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
  const isClassic = page.template_id === 'classic' || !page.template_id

  return (
    <div className="w-full max-w-lg sm:max-w-2xl mx-auto px-4">
      {/* Floating decorative elements */}
      <div className="relative">
        {/* Classic template - floating hearts */}
        {isClassic && (
          <>
            <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 text-3xl sm:text-4xl animate-float opacity-70 hidden sm:block" style={{ color: styles.primaryColor }}>💕</div>
            <div className="absolute -top-8 sm:-top-12 -right-8 sm:-right-12 text-4xl sm:text-5xl animate-float-delayed opacity-70 hidden sm:block" style={{ color: styles.accentColor }}>💖</div>
          </>
        )}
        {isPlayful && (
          <>
            <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 text-3xl sm:text-4xl animate-wiggle opacity-80 hidden sm:block">🎈</div>
            <div className="absolute -top-8 sm:-top-12 -right-8 sm:-right-12 text-4xl sm:text-5xl animate-wiggle-delayed opacity-80 hidden sm:block">✨</div>
          </>
        )}
        {isElegant && (
          <>
            <div className="absolute -top-8 sm:-top-10 left-6 sm:left-8 text-2xl sm:text-3xl animate-float opacity-60 hidden sm:block">🌹</div>
            <div className="absolute -top-8 sm:-top-10 right-6 sm:right-8 text-2xl sm:text-3xl animate-float-delayed opacity-60 hidden sm:block">🌹</div>
          </>
        )}

        {/* Decorative GIFs for classic templates */}
        {isClassic && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Top left GIF */}
            <img
              src="/7102e1771b31ce3665a3f15522a603b6.gif"
              alt=""
              className="hidden lg:block absolute w-28 opacity-40 animate-float"
              style={{
                left: '-5%',
                top: '10%',
                animationDuration: '4s',
              }}
            />
            {/* Top right GIF */}
            <img
              src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif"
              alt=""
              className="hidden lg:block absolute w-28 opacity-40 animate-float-delayed"
              style={{
                right: '-5%',
                top: '15%',
                animationDuration: '4.5s',
              }}
            />
            {/* Bottom left GIF */}
            <img
              src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif"
              alt=""
              className="hidden md:block absolute w-24 opacity-35 animate-wiggle"
              style={{
                left: '-3%',
                bottom: '15%',
                animationDuration: '3s',
              }}
            />
            {/* Bottom right GIF */}
            <img
              src="/7102e1771b31ce3665a3f15522a603b6.gif"
              alt=""
              className="hidden md:block absolute w-24 opacity-35 animate-wiggle-delayed"
              style={{
                right: '-3%',
                bottom: '20%',
                animationDuration: '3.5s',
              }}
            />
          </div>
        )}

        <div
          className="rounded-3xl shadow-2xl overflow-hidden animate-fadeIn relative"
          style={{
            background: styles.gradient,
            boxShadow: `0 25px 60px -15px ${styles.primaryColor}40, 0 10px 30px -10px ${styles.accentColor}30`,
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

          {/* Floating sparkles for classic and modern templates */}
          {(isClassic || isModern) && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-xl opacity-20 animate-float"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${10 + (i % 3) * 30}%`,
                    animationDelay: `${i * 0.6}s`,
                    animationDuration: `${3 + (i % 2)}s`,
                    color: i % 2 === 0 ? styles.primaryColor : styles.accentColor,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          )}

          <div className="relative p-5 sm:p-6 md:p-8 lg:p-10">
            <div className="text-center space-y-4 sm:space-y-5 md:space-y-6">
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
                  <span style={{ color: styles.primaryColor }} className="animate-float opacity-80">💕</span>
                  <span style={{ color: styles.accentColor }} className="animate-heart-pulse">♥</span>
                  <span style={{ color: styles.primaryColor }} className="animate-float-delayed opacity-80">💕</span>
                </div>
              )}

              {/* Recipient */}
              {page.recipient_name && (
                <div className="space-y-1 px-4">
                  <p
                    className="text-xs sm:text-sm uppercase tracking-wider font-semibold"
                    style={{
                      color: styles.accentColor,
                      opacity: 0.8,
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    To
                  </p>
                  <p
                    className="text-lg sm:text-xl md:text-2xl font-bold"
                    style={{
                      color: styles.primaryColor,
                      fontFamily: 'Nunito, sans-serif',
                    }}
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
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl px-4 leading-tight"
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
                className="relative py-4 sm:py-6 md:py-8 px-4 sm:px-5 md:px-6 rounded-2xl sm:rounded-3xl"
                style={{
                  backgroundColor: `${styles.secondaryColor}60`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  className="text-sm sm:text-base md:text-lg whitespace-pre-wrap break-words leading-relaxed"
                  style={{
                    fontFamily: page.template_id === 'playful' ? 'Caveat, cursive' : 'Nunito, sans-serif',
                    fontSize: page.template_id === 'playful' ? '1.125rem' : undefined,
                    color: '#4a3728',
                  }}
                >
                  {page.message}
                </div>
              </div>

              {/* Sender */}
              {page.sender_name && (
                <div className="space-y-2 pt-4 px-4">
                  <p
                    className="text-xs sm:text-sm uppercase tracking-wider font-semibold"
                    style={{
                      color: styles.accentColor,
                      opacity: 0.8,
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    With Love
                  </p>
                  <p
                    className="text-xl sm:text-2xl md:text-3xl"
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
          0%, 100% {
            transform: translateY(0) rotate(-5deg) scale(1);
          }
          50% {
            transform: translateY(-15px) rotate(5deg) scale(1.05);
          }
        }
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(5deg) scale(1);
          }
          50% {
            transform: translateY(-18px) rotate(-5deg) scale(1.05);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        @keyframes heart-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .animate-heart-pulse {
          animation: heart-pulse 1.5s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-10deg) scale(1);
          }
          50% {
            transform: rotate(10deg) scale(1.05);
          }
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        .animate-wiggle-delayed {
          animation: wiggle 2.5s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-delayed,
          .animate-heart-pulse,
          .animate-wiggle,
          .animate-wiggle-delayed,
          .animate-spin-slow,
          .animate-fadeIn {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

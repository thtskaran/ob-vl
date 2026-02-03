import { useState, useCallback, useRef } from 'react'
import { Page } from '../../lib/api'
import { Confetti } from '../decorations/Confetti'

interface ProposalTemplateProps {
  page: Page
}

const funnyMessages = [
  "That button has commitment issues!",
  "Oops! Try again!",
  "Nice try! But love always wins!",
  "The button is playing hard to get!",
  "Almost got it! Just kidding!",
  "That button is shy!",
  "Love is patient... but that button isn't!",
  "Catch me if you can!",
  "Are you sure about No? 😏",
  "The button disagrees!",
]

export function ProposalTemplate({ page }: ProposalTemplateProps) {
  const [accepted, setAccepted] = useState(false)
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 })
  const [noAttempts, setNoAttempts] = useState(0)
  const [yesScale, setYesScale] = useState(1)
  const [message, setMessage] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const moveNoButton = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current.getBoundingClientRect()
    const isMobile = window.innerWidth < 640

    // Calculate safe zones - avoid the Yes button area (center-left)
    const safeZones = [
      { minX: 0.6, maxX: 0.9, minY: 0, maxY: 0.4 },   // top-right
      { minX: 0.6, maxX: 0.9, minY: 0.6, maxY: 1 },   // bottom-right
      { minX: 0, maxX: 0.3, minY: 0, maxY: 0.4 },     // top-left
      { minX: 0, maxX: 0.3, minY: 0.6, maxY: 1 },     // bottom-left
    ]

    const zone = safeZones[Math.floor(Math.random() * safeZones.length)]
    const areaWidth = container.width - (isMobile ? 80 : 100)
    const areaHeight = isMobile ? 150 : 200

    const newX = (zone.minX + Math.random() * (zone.maxX - zone.minX)) * areaWidth - areaWidth / 2
    const newY = (zone.minY + Math.random() * (zone.maxY - zone.minY)) * areaHeight

    setNoPosition({ x: newX, y: newY })
    setNoAttempts(prev => prev + 1)
    setYesScale(prev => Math.min(prev + 0.12, 1.8))
    setMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)])

    // Clear message after delay
    setTimeout(() => setMessage(''), 2500)
  }, [])

  const handleYesClick = () => {
    setAccepted(true)
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <Confetti trigger={true} />
        <div className="w-full max-w-lg mx-auto">
          <div
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
              boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.25)'
            }}
          >
            <div className="space-y-6">
              <div className="text-5xl sm:text-6xl animate-bounce">
                🎉
              </div>

              {page.recipient_name && (
                <p className="text-lg sm:text-xl text-pink-600">
                  Dear <span className="font-semibold">{page.recipient_name}</span>,
                </p>
              )}

              <h1
                className="text-3xl sm:text-4xl md:text-5xl text-pink-600 leading-tight"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                Yay! You said YES!
              </h1>

              <div className="flex justify-center gap-2 text-3xl sm:text-4xl">
                <span className="animate-pulse">💖</span>
                <span className="animate-pulse" style={{ animationDelay: '150ms' }}>💕</span>
                <span className="animate-pulse" style={{ animationDelay: '300ms' }}>💖</span>
              </div>

              <div
                className="py-4 sm:py-6 px-2 text-base sm:text-lg text-gray-700 whitespace-pre-wrap leading-relaxed"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {page.message}
              </div>

              {page.sender_name && (
                <p
                  className="text-xl sm:text-2xl text-pink-600"
                  style={{ fontFamily: 'Pacifico, cursive' }}
                >
                  Forever yours, {page.sender_name}
                </p>
              )}

              <div className="text-4xl sm:text-5xl animate-pulse text-pink-500">
                ♥
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-rose-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-red-200/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-lg mx-auto relative z-10">
        {/* Decorative floating elements */}
        <div className="absolute -top-12 -left-8 text-5xl animate-float opacity-60">💝</div>
        <div className="absolute -top-16 -right-12 text-4xl animate-float-delayed opacity-60">✨</div>

        <div
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(253, 242, 248, 0.95) 0%, rgba(252, 231, 243, 0.95) 50%, rgba(251, 207, 232, 0.95) 100%)',
            boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.5)'
          }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-20 h-20 opacity-10">
            <div className="absolute top-2 left-2 w-16 h-16 border-t-4 border-l-4 border-pink-300 rounded-tl-3xl" />
          </div>
          <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
            <div className="absolute bottom-2 right-2 w-16 h-16 border-b-4 border-r-4 border-pink-300 rounded-br-3xl" />
          </div>

          <div ref={containerRef} className="space-y-6 sm:space-y-8 relative">
            {/* Floating hearts */}
            <div className="flex justify-center gap-4 text-3xl sm:text-4xl">
              <span className="text-pink-400 animate-float drop-shadow-lg">♥</span>
              <span className="text-rose-500 animate-float" style={{ animationDelay: '0.5s' }}>💕</span>
              <span className="text-pink-400 animate-float drop-shadow-lg" style={{ animationDelay: '1s' }}>♥</span>
            </div>

            {page.recipient_name && (
              <div className="text-center">
                <p className="text-sm sm:text-base uppercase tracking-wider text-rose-400 mb-1">To</p>
                <p className="text-xl sm:text-2xl text-pink-600 font-bold">
                  {page.recipient_name}
                </p>
              </div>
            )}

            <div className="relative py-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
              <h1
                className="text-center text-2xl sm:text-3xl md:text-4xl text-pink-600 leading-tight px-2 py-4"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                {page.title || "Will you be my Valentine?"}
              </h1>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
            </div>

            {/* Fun message bubble */}
            <div className="h-12 sm:h-14 flex items-center justify-center">
              {message && (
                <div className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm sm:text-base font-medium animate-bounce shadow-md">
                  {message}
                </div>
              )}
            </div>

            {/* Button area - relative container */}
            <div className="relative h-48 sm:h-56">
              {/* Yes Button - fixed position left side */}
              <div className="absolute left-1/2 top-1/2 -translate-x-[130%] sm:-translate-x-[140%] -translate-y-1/2 z-10">
                <button
                  onClick={handleYesClick}
                  className="px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500
                           text-white rounded-full font-bold shadow-xl
                           hover:shadow-2xl transition-all duration-300 active:scale-95
                           text-base sm:text-lg whitespace-nowrap"
                  style={{
                    transform: `scale(${yesScale})`,
                    boxShadow: `0 ${10 * yesScale}px ${30 * yesScale}px -5px rgba(236, 72, 153, 0.5)`,
                  }}
                >
                  Yes! 💕
                </button>
              </div>

              {/* No Button - moves around in safe zones */}
              <button
                onMouseEnter={moveNoButton}
                onTouchStart={(e) => {
                  e.preventDefault()
                  moveNoButton()
                }}
                className="absolute left-1/2 top-1/2 translate-x-[30%] sm:translate-x-[40%] -translate-y-1/2 px-4 sm:px-5 py-2 sm:py-2.5
                         bg-gray-100 text-gray-400 rounded-full font-medium
                         transition-all duration-300 ease-out text-sm sm:text-base
                         hover:bg-gray-200 border border-gray-200 z-20"
                style={{
                  transform: `translate(calc(30% + ${noPosition.x}px), calc(-50% + ${noPosition.y}px))
                             scale(${Math.max(0.6, 1 - noAttempts * 0.08)})`,
                  opacity: Math.max(0.4, 1 - noAttempts * 0.08),
                }}
              >
                No
              </button>
            </div>

            {/* Progress hint */}
            {noAttempts > 0 && (
              <p className="text-center text-xs sm:text-sm text-pink-400">
                {noAttempts < 3 && "That button doesn't want to be clicked! 😄"}
                {noAttempts >= 3 && noAttempts < 6 && "You're persistent! But so is love! 💪"}
                {noAttempts >= 6 && noAttempts < 10 && "Just click Yes already! 😂"}
                {noAttempts >= 10 && "Okay okay, you really tried! Click Yes? 🥺"}
              </p>
            )}

            {page.sender_name && (
              <div className="text-center">
                <p className="text-sm uppercase tracking-wider text-rose-400 mb-1">From</p>
                <p
                  className="text-xl sm:text-2xl text-pink-600"
                  style={{ fontFamily: 'Pacifico, cursive' }}
                >
                  {page.sender_name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="absolute -bottom-8 left-8 text-4xl animate-wiggle opacity-60">🌹</div>
        <div className="absolute -bottom-10 right-12 text-3xl animate-wiggle-delayed opacity-60">💐</div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-wiggle {
          animation: wiggle 3s ease-in-out infinite;
        }
        .animate-wiggle-delayed {
          animation: wiggle 3.5s ease-in-out infinite;
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  )
}

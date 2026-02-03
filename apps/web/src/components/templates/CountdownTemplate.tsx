import { useState, useEffect, useMemo } from 'react'
import { Page } from '../../lib/api'
import { Confetti } from '../decorations/Confetti'

interface CountdownTemplateProps {
  page: Page
}

export function CountdownTemplate({ page }: CountdownTemplateProps) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Generate falling hearts once
  const fallingHearts = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      size: 16 + Math.random() * 16,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 6,
    })),
    []
  )

  useEffect(() => {
    if (timeLeft <= 0 || isRevealed) {
      if (!isRevealed) {
        setIsRevealed(true)
        setShowConfetti(true)
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isRevealed])

  const handleSkip = () => {
    setTimeLeft(0)
    setIsRevealed(true)
    setShowConfetti(true)
  }

  const getMessage = () => {
    if (timeLeft > 7) return "Something beautiful is coming..."
    if (timeLeft > 4) return "Get ready for a surprise!"
    if (timeLeft > 1) return "Almost there..."
    if (timeLeft === 1) return "Here it comes!"
    return ""
  }

  if (isRevealed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <Confetti trigger={showConfetti} />

        <div className="w-full max-w-lg mx-auto">
          <div
            className="rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
              boxShadow: '0 25px 60px -15px rgba(236, 72, 153, 0.35)',
            }}
          >
            <div className="text-center space-y-5 sm:space-y-6">
              {/* Celebration header */}
              <div className="flex justify-center gap-2 sm:gap-3 text-3xl sm:text-4xl">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
                <span className="animate-bounce" style={{ animationDelay: '100ms' }}>💕</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🎉</span>
              </div>

              {page.recipient_name && (
                <p className="text-lg sm:text-xl text-pink-600">
                  Dear <span className="font-semibold">{page.recipient_name}</span>,
                </p>
              )}

              <h1
                className="text-3xl sm:text-4xl md:text-5xl text-pink-600 leading-tight px-2"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                {page.title}
              </h1>

              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="h-px w-12 sm:w-20 bg-pink-300" />
                <span className="text-pink-500 text-xl sm:text-2xl">♥</span>
                <div className="h-px w-12 sm:w-20 bg-pink-300" />
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
                  With all my love, {page.sender_name}
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden relative bg-gradient-to-br from-rose-100 via-pink-100 to-red-100">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-rose-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Falling hearts background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {fallingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-pink-400/50 animate-fall drop-shadow-lg"
            style={{
              left: heart.left,
              top: '-50px',
              fontSize: `${heart.size}px`,
              animationDuration: `${heart.duration}s`,
              animationDelay: `${heart.delay}s`,
            }}
          >
            ♥
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Decorative floating elements */}
        <div className="absolute -top-10 -left-10 text-5xl animate-float opacity-70">🎁</div>
        <div className="absolute -top-12 -right-12 text-4xl animate-float-delayed opacity-70">✨</div>

        <div
          className="rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 25px 60px -15px rgba(236, 72, 153, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <div className="absolute top-2 right-2 w-20 h-20 border-t-4 border-r-4 border-pink-300 rounded-tr-3xl" />
          </div>
          <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
            <div className="absolute bottom-2 left-2 w-20 h-20 border-b-4 border-l-4 border-pink-300 rounded-bl-3xl" />
          </div>

          <div className="text-center space-y-6 sm:space-y-8 relative">
            {/* Header */}
            <div className="space-y-3">
              {page.recipient_name && (
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-rose-400 mb-1">For</p>
                  <div className="inline-block bg-gradient-to-r from-pink-100 to-rose-100 rounded-full px-5 py-2 shadow-md">
                    <p className="text-pink-600 font-bold text-lg sm:text-xl">
                      {page.recipient_name}
                    </p>
                  </div>
                </div>
              )}
              <h1
                className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 py-1"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                A Special Message Awaits
              </h1>
            </div>

            {/* Countdown timer */}
            <div className="relative py-4">
              {/* Outer glow rings */}
              <div
                className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full animate-ping opacity-20"
                style={{
                  background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
                  animationDuration: '1.5s',
                }}
              />
              <div
                className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full animate-ping opacity-15"
                style={{
                  background: 'radial-gradient(circle, #f43f5e 0%, transparent 70%)',
                  animationDuration: '2s',
                  animationDelay: '0.5s',
                }}
              />

              {/* Timer container */}
              <div className="relative">
                <div
                  className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #e11d48 100%)',
                    boxShadow: '0 20px 50px -10px rgba(236, 72, 153, 0.6), inset 0 -4px 12px rgba(0, 0, 0, 0.2), inset 0 4px 12px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {/* Animated shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

                  {/* Inner glow layers */}
                  <div className="absolute inset-4 rounded-full bg-white/10 blur-sm" />
                  <div className="absolute inset-6 rounded-full bg-white/10" />

                  {/* Number */}
                  <span
                    className="relative text-6xl sm:text-7xl font-bold text-white drop-shadow-2xl animate-pulse-scale"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {timeLeft}
                  </span>
                </div>

                {/* Rotating hearts around timer */}
                <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 mx-auto animate-spin-slow">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">💕</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-2xl">💖</div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">💕</div>
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 text-2xl">💖</div>
                </div>
              </div>
            </div>

            {/* Animated hearts */}
            <div className="flex justify-center gap-4 sm:gap-5 text-3xl sm:text-4xl">
              <span className="animate-bounce text-pink-400 drop-shadow-md" style={{ animationDelay: '0ms' }}>💕</span>
              <span className="animate-bounce text-rose-500 drop-shadow-md" style={{ animationDelay: '150ms' }}>💖</span>
              <span className="animate-bounce text-pink-400 drop-shadow-md" style={{ animationDelay: '300ms' }}>💕</span>
            </div>

            {/* Teaser text */}
            <div className="space-y-3">
              <div className="min-h-[32px] flex items-center justify-center">
                <div className="inline-block bg-gradient-to-r from-pink-100 to-rose-100 rounded-full px-5 py-2 shadow-md">
                  <p className="text-pink-600 text-base sm:text-lg font-semibold">
                    {getMessage()}
                  </p>
                </div>
              </div>

              {page.sender_name && (
                <div className="inline-block bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
                  <p className="text-pink-500 text-sm">
                    From someone special 💕
                  </p>
                </div>
              )}
            </div>

            {/* Skip button */}
            <div className="pt-2">
              <button
                onClick={handleSkip}
                className="text-pink-500 text-sm hover:text-pink-600 transition-all underline underline-offset-2 hover:underline-offset-4 font-medium"
              >
                Can't wait? Reveal now →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="absolute -bottom-8 left-12 text-3xl animate-wiggle opacity-70">💝</div>
        <div className="absolute -bottom-10 right-16 text-4xl animate-wiggle-delayed opacity-70">🎀</div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-wiggle {
          animation: wiggle 2.5s ease-in-out infinite;
        }
        .animate-wiggle-delayed {
          animation: wiggle 3s ease-in-out infinite;
          animation-delay: 0.7s;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-scale {
          animation: pulse-scale 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

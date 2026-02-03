import { useRef, useEffect, useState, useCallback } from 'react'
import { Page } from '../../lib/api'
import { Confetti } from '../decorations/Confetti'

interface ScratchTemplateProps {
  page: Page
}

export function ScratchTemplate({ page }: ScratchTemplateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScratching, setIsScratching] = useState(false)
  const [percentScratched, setPercentScratched] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  const drawHeartPattern = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create beautiful gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#ec4899')
    gradient.addColorStop(0.5, '#db2777')
    gradient.addColorStop(1, '#be185d')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw scattered hearts
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    const heartCount = Math.floor((width * height) / 2000)

    for (let i = 0; i < heartCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = 10 + Math.random() * 20
      drawHeart(ctx, x, y, size)
    }

    // Add sparkle dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = 1 + Math.random() * 3
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add "Scratch Me!" text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.font = `bold ${Math.min(width / 12, 28)}px Nunito, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 4
    ctx.fillText('Scratch to reveal!', width / 2, height / 2 - 15)
    ctx.font = `${Math.min(width / 15, 24)}px sans-serif`
    ctx.fillText('💕 💕 💕', width / 2, height / 2 + 20)
    ctx.shadowBlur = 0
  }, [])

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.save()
    ctx.beginPath()
    const topCurveHeight = size * 0.3
    ctx.moveTo(x, y + topCurveHeight)
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight)
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.5, x, y + size)
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.5, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight)
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight)
    ctx.fill()
    ctx.restore()
  }

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    drawHeartPattern(ctx, rect.width, rect.height)
  }, [drawHeartPattern])

  useEffect(() => {
    initCanvas()
    window.addEventListener('resize', initCanvas)
    return () => window.removeEventListener('resize', initCanvas)
  }, [initCanvas])

  const scratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'

    // Draw line from last position for smoother scratching
    if (lastPosRef.current) {
      ctx.beginPath()
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(x, y)
      ctx.lineWidth = 40
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // Draw circle at current position
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()

    lastPosRef.current = { x, y }

    // Calculate percentage (sample fewer pixels for performance)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let transparent = 0
    const step = 4 // Sample every 4th pixel
    for (let i = 3; i < imageData.data.length; i += 4 * step) {
      if (imageData.data[i] === 0) transparent++
    }
    const totalSampled = imageData.data.length / (4 * step)
    const percent = (transparent / totalSampled) * 100
    setPercentScratched(Math.round(percent))

    if (percent > 55 && !isRevealed) {
      setIsRevealed(true)
      setShowConfetti(true)
    }
  }, [isRevealed])

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsScratching(true)
    lastPosRef.current = null
    scratch(clientX, clientY)
  }, [scratch])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (isScratching) {
      scratch(clientX, clientY)
    }
  }, [isScratching, scratch])

  const handleEnd = useCallback(() => {
    setIsScratching(false)
    lastPosRef.current = null
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 relative overflow-hidden">
      {showConfetti && <Confetti trigger={true} />}

      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-20 animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 3)}s`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <div className="w-full max-w-md sm:max-w-lg mx-auto space-y-4 sm:space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          {page.recipient_name && (
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-5 py-2 shadow-lg border border-pink-200">
              <p className="text-pink-600 text-sm sm:text-base">
                A special surprise for <span className="font-bold">{page.recipient_name}</span> 💝
              </p>
            </div>
          )}
          <div className="inline-block">
            <h2 className="text-pink-600 text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
              {isRevealed ? (
                <>
                  <span className="animate-bounce">🎉</span>
                  <span>Surprise!</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</span>
                </>
              ) : (
                <>
                  <span className="animate-pulse">✨</span>
                  <span>Scratch to reveal!</span>
                  <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>✨</span>
                </>
              )}
            </h2>
          </div>
        </div>

        {/* Progress bar */}
        {!isRevealed && (
          <div className="px-4">
            <div className="relative">
              <div className="w-full bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 rounded-full h-3 sm:h-3.5 overflow-hidden shadow-inner border border-pink-200">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{
                    width: `${percentScratched}%`,
                    background: 'linear-gradient(90deg, #ec4899 0%, #f43f5e 50%, #ec4899 100%)',
                    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.4)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                </div>
              </div>
              {percentScratched > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-pink-600 bg-white/90 px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                  {percentScratched}% 💪
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-pink-500 mt-3 text-center font-medium">
              {percentScratched === 0 && 'Use your finger or mouse to scratch away!'}
              {percentScratched > 0 && percentScratched < 30 && 'Great start! Keep scratching! 🎯'}
              {percentScratched >= 30 && percentScratched < 55 && "You're doing amazing! Almost there! 🌟"}
              {percentScratched >= 55 && 'Woohoo! 🎉'}
            </p>
          </div>
        )}

        {/* Scratch card container */}
        <div
          ref={containerRef}
          className={`relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mx-auto transition-all duration-700 ${
            isRevealed ? 'scale-105' : 'scale-100'
          }`}
          style={{
            width: '100%',
            maxWidth: '420px',
            aspectRatio: '4/5',
            boxShadow: isRevealed
              ? '0 30px 70px -15px rgba(236, 72, 153, 0.5), 0 0 0 4px rgba(236, 72, 153, 0.2)'
              : '0 25px 50px -12px rgba(236, 72, 153, 0.4)',
          }}
        >
          {/* Glow effect when revealed */}
          {isRevealed && (
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 rounded-2xl sm:rounded-3xl blur-xl opacity-50 animate-pulse" />
          )}

          {/* Hidden content */}
          <div
            className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
            }}
          >
            {/* Decorative background pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #ec4899 1px, transparent 0)',
                backgroundSize: '30px 30px',
              }}
            />
            <div className="text-center space-y-4 sm:space-y-5">
              {/* Decorative top */}
              <div className="flex justify-center gap-2 text-xl sm:text-2xl text-pink-400">
                <span>♥</span>
                <span>♥</span>
                <span>♥</span>
              </div>

              {page.recipient_name && (
                <p className="text-base sm:text-lg text-pink-600">
                  For {page.recipient_name}
                </p>
              )}

              <h1
                className="text-2xl sm:text-3xl text-pink-600 leading-tight"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                {page.title}
              </h1>

              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-pink-300" />
                <span className="text-pink-400">✦</span>
                <div className="h-px w-12 bg-pink-300" />
              </div>

              <div className="py-2 sm:py-4 text-gray-700 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {page.message}
              </div>

              {page.sender_name && (
                <p
                  className="text-lg sm:text-xl text-pink-500"
                  style={{ fontFamily: 'Pacifico, cursive' }}
                >
                  With love, {page.sender_name}
                </p>
              )}

              <div className="text-3xl sm:text-4xl">💕</div>
            </div>
          </div>

          {/* Scratch layer */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full touch-none transition-opacity duration-700 ${
              isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'
            }`}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              handleStart(touch.clientX, touch.clientY)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              handleMove(touch.clientX, touch.clientY)
            }}
            onTouchEnd={handleEnd}
          />
        </div>

        {/* Hint for mobile */}
        {!isRevealed && (
          <div className="text-center">
            <div className="inline-block bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-pink-200">
              <p className="text-xs sm:text-sm text-pink-500 flex items-center gap-2">
                <span className="animate-wiggle">👆</span>
                <span>Use your finger or mouse to scratch</span>
                <span className="animate-wiggle-delayed">👆</span>
              </p>
            </div>
          </div>
        )}

        {/* Sender attribution */}
        {page.sender_name && !isRevealed && (
          <div className="text-center">
            <div className="inline-block bg-white/60 backdrop-blur-sm rounded-full px-5 py-2 shadow-md border border-pink-200">
              <p className="text-pink-500 text-sm font-medium">
                From: <span className="font-bold text-pink-600">{page.sender_name}</span> 💕
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        .animate-wiggle-delayed {
          animation: wiggle 1s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

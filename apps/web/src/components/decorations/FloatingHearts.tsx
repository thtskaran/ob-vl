import { useEffect, useState, useMemo } from 'react'

interface Heart {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

export function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      // Show static hearts for reduced motion
      setHearts(
        Array.from({ length: 5 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 16 + Math.random() * 12,
          opacity: 0.2 + Math.random() * 0.2,
          duration: 0,
          delay: 0,
        }))
      )
      return
    }

    // Generate hearts based on screen size (fewer on mobile)
    const isMobile = window.innerWidth < 768
    const heartCount = isMobile ? 8 : 15

    const newHearts: Heart[] = Array.from({ length: heartCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 12 + Math.random() * 16,
      opacity: 0.1 + Math.random() * 0.3,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
    }))

    setHearts(newHearts)
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    // Static hearts for reduced motion
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-pink-300"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: heart.size,
              opacity: heart.opacity,
            }}
          >
            ♥
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-pink-300 animate-float"
          style={{
            left: `${heart.x}%`,
            fontSize: heart.size,
            opacity: heart.opacity,
            animation: `float ${heart.duration}s ease-in-out infinite`,
            animationDelay: `${heart.delay}s`,
            top: `${heart.y}%`,
          }}
        >
          ♥
        </div>
      ))}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) rotate(5deg);
          }
          50% {
            transform: translateY(-15px) rotate(-3deg);
          }
          75% {
            transform: translateY(-25px) rotate(3deg);
          }
        }
      `}</style>
    </div>
  )
}

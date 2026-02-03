import { useCallback, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const hasTriggered = useRef(false)

  const fireConfetti = useCallback(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete?.()
      return
    }

    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 }

    const colors = ['#ec4899', '#f472b6', '#f9a8d4', '#fda4af', '#fb7185', '#f43f5e']

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        onComplete?.()
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Confetti from the left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors,
      })

      // Confetti from the right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors,
      })
    }, 250)

    // Heart-shaped burst in the center
    const heartShape = confetti.shapeFromPath({
      path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    })

    confetti({
      particleCount: 30,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      shapes: [heartShape],
      colors,
      scalar: 2,
    })
  }, [onComplete])

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true
      fireConfetti()
    }
  }, [trigger, fireConfetti])

  return null
}

// Hook for programmatic confetti
export function useConfetti() {
  const fire = useCallback(() => {
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const colors = ['#ec4899', '#f472b6', '#f9a8d4', '#fda4af', '#fb7185', '#f43f5e']

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    })
  }, [])

  return { fire }
}

import { useState } from 'react'
import { Page } from '../../lib/api'
import { Confetti } from '../decorations/Confetti'

interface EnvelopeTemplateProps {
  page: Page
}

export function EnvelopeTemplate({ page }: EnvelopeTemplateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleOpen = () => {
    if (isOpen) return
    setIsOpen(true)
    setTimeout(() => {
      setShowLetter(true)
      setShowConfetti(true)
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 relative overflow-hidden">
      {showConfetti && <Confetti trigger={true} />}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 text-6xl opacity-20 animate-float">💌</div>
        <div className="absolute bottom-32 left-16 text-5xl opacity-20 animate-float-delayed">💕</div>
        <div className="absolute top-1/3 left-1/4 text-4xl opacity-15 animate-wiggle">✉️</div>

        {/* Decorative GIFs */}
        <img
          src="/7102e1771b31ce3665a3f15522a603b6.gif"
          alt=""
          className="hidden md:block absolute top-12 left-12 w-24 h-24 opacity-60 animate-float"
          style={{ mixBlendMode: 'multiply' }}
        />
        <img
          src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif"
          alt=""
          className="hidden md:block absolute top-16 right-16 w-28 h-28 opacity-70 animate-float-delayed"
          style={{ mixBlendMode: 'multiply' }}
        />
        <img
          src="/7102e1771b31ce3665a3f15522a603b6.gif"
          alt=""
          className="hidden lg:block absolute bottom-20 left-20 w-20 h-20 opacity-50 animate-wiggle"
          style={{ mixBlendMode: 'multiply' }}
        />
        <img
          src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif"
          alt=""
          className="hidden lg:block absolute bottom-24 right-24 w-32 h-32 opacity-65 animate-wiggle-delayed"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      <div className="w-full max-w-md sm:max-w-lg mx-auto relative z-10">
        {/* Instruction */}
        {!isOpen && (
          <div className="text-center mb-4 sm:mb-6 md:mb-8 space-y-2 sm:space-y-3 px-4">
            <div className="inline-block">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-pink-200">
                <p className="text-pink-600 text-base sm:text-lg md:text-xl font-medium animate-pulse">
                  You have a love letter! 💌
                </p>
              </div>
            </div>
            <p className="text-pink-400 text-xs sm:text-sm md:text-base flex items-center justify-center gap-2">
              <span className="inline-block animate-bounce">👇</span>
              <span>Tap the envelope to open</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>👇</span>
            </p>
          </div>
        )}

        {/* Envelope Container */}
        <div
          className={`relative cursor-pointer transition-all duration-500 ${
            isOpen ? 'scale-100' : 'hover:scale-[1.03] hover:rotate-1 active:scale-[0.98]'
          }`}
          onClick={handleOpen}
          style={{ perspective: '1500px' }}
        >
          {/* Glow effect when not opened */}
          {!isOpen && (
            <div className="absolute inset-0 bg-pink-400/20 rounded-2xl blur-xl animate-pulse" />
          )}

          {/* Envelope */}
          <div
            className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl transition-all duration-700"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: isOpen ? 'auto' : '220px',
              minHeight: isOpen ? '400px' : '220px',
              background: 'linear-gradient(145deg, #fecdd3 0%, #fda4af 50%, #fb7185 100%)',
              boxShadow: isOpen
                ? '0 25px 60px -15px rgba(244, 63, 94, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                : '0 20px 40px -10px rgba(244, 63, 94, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Envelope back pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 15 L30 12 L25 15 Z' fill='%23fff'/%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px',
              }}
            />

            {/* Envelope flap */}
            <div
              className="absolute top-0 left-0 right-0 z-20 origin-top"
              style={{
                transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Front of flap */}
              <div
                className="w-full"
                style={{
                  height: '110px',
                  background: 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)',
                  clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                  backfaceVisibility: 'hidden',
                  boxShadow: '0 5px 20px -5px rgba(0,0,0,0.2)',
                }}
              />
              {/* Back of flap */}
              <div
                className="absolute top-0 left-0 w-full"
                style={{
                  height: '110px',
                  background: 'linear-gradient(180deg, #fda4af 0%, #fecdd3 100%)',
                  clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                  transform: 'rotateX(180deg)',
                  backfaceVisibility: 'hidden',
                }}
              />
            </div>

            {/* Wax seal */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${
                isOpen ? 'opacity-0 scale-0 top-0 rotate-180' : 'opacity-100 scale-100 top-[70px] sm:top-[85px] rotate-0'
              }`}
            >
              <div className="relative">
                {/* Outer glow */}
                <div
                  className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full blur-md animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, transparent 70%)',
                  }}
                />
                {/* Wax seal */}
                <div
                  className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                    boxShadow: '0 8px 25px -5px rgba(185, 28, 28, 0.6), inset 0 -2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {/* Embossed texture */}
                  <div className="absolute inset-0 rounded-full opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-black opacity-30" />
                  </div>
                  <span className="relative text-white text-xl sm:text-2xl md:text-3xl drop-shadow-md">♥</span>
                </div>
              </div>
            </div>

            {/* Letter content */}
            <div
              className={`relative bg-white mx-3 sm:mx-4 rounded-3xl shadow-inner transition-all duration-700 overflow-hidden ${
                showLetter ? 'opacity-100 mt-4 mb-4' : 'opacity-0 mt-32'
              }`}
              style={{
                transitionDelay: showLetter ? '0.2s' : '0s',
                background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              {/* Paper texture lines */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 28px)',
                }}
              />

              <div className="relative p-4 sm:p-5 md:p-6">
                <div className="text-center space-y-3 sm:space-y-4 md:space-y-5">
                  {/* Decorative top */}
                  <div className="flex justify-center gap-2 text-lg sm:text-xl md:text-2xl text-pink-400">
                    <span>♥</span>
                    <span>♥</span>
                    <span>♥</span>
                  </div>

                  {/* Recipient */}
                  {page.recipient_name && (
                    <p
                      className="text-sm sm:text-base md:text-lg text-pink-600 px-2"
                      style={{ fontFamily: 'Caveat, cursive' }}
                    >
                      My Dearest {page.recipient_name},
                    </p>
                  )}

                  {/* Title */}
                  <h1
                    className="text-xl sm:text-2xl md:text-3xl text-pink-600 py-1 px-2"
                    style={{ fontFamily: 'Caveat, cursive' }}
                  >
                    {page.title}
                  </h1>

                  {/* Divider */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-10 sm:w-16 bg-pink-300" />
                    <span className="text-pink-400 text-lg">✦</span>
                    <div className="h-px w-10 sm:w-16 bg-pink-300" />
                  </div>

                  {/* Message */}
                  <div
                    className="py-2 sm:py-3 md:py-4 px-2 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base md:text-lg"
                    style={{ fontFamily: 'Caveat, cursive' }}
                  >
                    {page.message}
                  </div>

                  {/* Sender */}
                  {page.sender_name && (
                    <div className="pt-2 px-2">
                      <p
                        className="text-base sm:text-lg md:text-xl text-pink-600"
                        style={{ fontFamily: 'Caveat, cursive' }}
                      >
                        Forever Yours,
                      </p>
                      <p
                        className="text-lg sm:text-xl md:text-2xl text-pink-700 mt-1"
                        style={{ fontFamily: 'Caveat, cursive' }}
                      >
                        {page.sender_name}
                      </p>
                    </div>
                  )}

                  {/* Bottom heart */}
                  <div className="text-xl sm:text-2xl md:text-3xl text-pink-500 pt-2">💕</div>
                </div>
              </div>
            </div>

            {/* Bottom folds decoration */}
            <div
              className="absolute bottom-0 left-0 w-1/2"
              style={{
                height: '80px',
                background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)',
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-1/2"
              style={{
                height: '80px',
                background: 'linear-gradient(-135deg, transparent 50%, rgba(0,0,0,0.05) 50%)',
              }}
            />
          </div>
        </div>

        {/* Sender hint */}
        {!isOpen && page.sender_name && (
          <div className="text-center mt-4 sm:mt-6 px-4">
            <div className="inline-block bg-white/60 backdrop-blur-sm rounded-full px-4 sm:px-5 py-1.5 sm:py-2 shadow-md border border-pink-200">
              <p className="text-pink-500 text-xs sm:text-sm md:text-base">
                From: <span className="font-semibold text-pink-600">{page.sender_name}</span> 💕
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 3s ease-in-out infinite;
        }
        .animate-wiggle-delayed {
          animation: wiggle 3.5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  )
}

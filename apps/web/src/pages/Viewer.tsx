import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, Page } from '../lib/api'
import { PageCard } from '../components/viewer/PageCard'
import { TemplateRenderer, isInteractiveTemplate } from '../components/templates'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Seo } from '../components/Seo'

export function Viewer() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const publicOrigin = (import.meta.env.VITE_PUBLIC_URL || '').replace(/\/$/, '')

  useEffect(() => {
    async function loadPage() {
      if (!slug) {
        setError('No page specified')
        setIsLoading(false)
        return
      }

      try {
        const data = await api.getPage(slug)
        setPage(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Page not found')
      } finally {
        setIsLoading(false)
      }
    }

    loadPage()
  }, [slug])

  const absoluteUrl = (path?: string) => {
    if (!path) return undefined
    if (/^https?:\/\//i.test(path)) return path
    const origin = publicOrigin || (typeof window !== 'undefined' ? window.location.origin : '')
    if (!origin) return path
    return path.startsWith('/') ? `${origin}${path}` : `${origin}/${path}`
  }

  const seoProps = (() => {
    if (page) {
      const sender = page.sender_name || 'Someone special'
      const recipient = page.recipient_name || 'you'
      return {
        title: `${page.title} | A love note from ${sender}`,
        description: `A heartfelt Valentine for ${recipient}, created on Obvix.io.`,
        url: absoluteUrl(`/${page.slug}`),
        image: '/og-card.png',
        imageAlt: `Valentine message for ${recipient}`,
        keywords: [
          'personalized valentine',
          page.slug,
          sender,
          recipient,
          'obvix valentine viewer',
        ],
        type: 'article',
      }
    }

    if (error) {
      return {
        title: 'Valentine page not found | Obvix.io',
        description: error,
        url: absoluteUrl(slug ? `/${slug}` : undefined),
      }
    }

    return {
      title: 'Loading Valentine surprise | Obvix.io',
      description: 'Unwrapping a heartfelt surprise for you.',
      url: absoluteUrl(slug ? `/${slug}` : undefined),
    }
  })()

  if (isLoading) {
    return (
      <>
        <Seo {...seoProps} />
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-float opacity-60 hidden sm:block">
          <img src="/7102e1771b31ce3665a3f15522a603b6.gif" alt="loading" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
        </div>
        <div className="absolute top-1/4 right-1/4 animate-float-delayed opacity-60 hidden sm:block">
          <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="loading" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
        </div>
        <div className="text-center relative z-10">
          <div className="text-3xl sm:text-4xl mb-4">
            <span className="loading-heart">💕</span>
            <span className="loading-heart">💕</span>
            <span className="loading-heart">💕</span>
          </div>
          <p className="text-sm sm:text-base text-pink-600">Loading your surprise...</p>
        </div>
        </div>
      </>
    )
  }

  if (error || !page) {
    return (
      <>
        <Seo {...seoProps} />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-md w-full text-center">
            <CardContent className="space-y-4">
            <div className="text-5xl sm:text-6xl mb-4">💔</div>
            <h1 className="text-xl sm:text-2xl font-display text-pink-600">
              Page Not Found
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {error || "This love note doesn't exist or has been removed."}
            </p>
            <Link to="/">
              <Button>Create Your Own</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </>
    )
  }

  // Use interactive template renderer for special templates
  if (isInteractiveTemplate(page.template_id)) {
    return (
      <>
        <Seo {...seoProps} />
        <TemplateRenderer page={page} />
        {/* Footer for interactive templates */}
        <div className="fixed bottom-4 left-0 right-0 text-center z-50 px-4">
          <Link to="/">
            <button className="text-sm sm:text-base text-pink-600 font-semibold hover:text-pink-700 transition-all duration-200 bg-white/80 backdrop-blur-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-98 border-2 border-pink-200 hover:border-pink-300 min-h-[44px]">
              Create your own 💕
            </button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Seo {...seoProps} />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Decorative GIFs for classic templates - hide on mobile */}
      <div className="absolute top-20 left-10 hidden lg:block animate-float opacity-50 z-0">
        <img src="/7102e1771b31ce3665a3f15522a603b6.gif" alt="decoration" className="w-20 h-20 object-contain" />
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:block animate-wiggle opacity-50 z-0">
        <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="decoration" className="w-20 h-20 object-contain" />
      </div>

      <div className="relative z-10">
        <PageCard page={page} />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-pink-400 mb-3">
            Create your own Valentine's page
          </p>
          <Link to="/">
            <Button variant="secondary" size="md" className="min-h-[44px]">
              Make Your Own
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </>
  )
}

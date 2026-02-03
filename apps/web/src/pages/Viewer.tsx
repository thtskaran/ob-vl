import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, Page } from '../lib/api'
import { PageCard } from '../components/viewer/PageCard'
import { TemplateRenderer, isInteractiveTemplate } from '../components/templates'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function Viewer() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-float opacity-60">
          <img src="/7102e1771b31ce3665a3f15522a603b6.gif" alt="loading" className="w-16 h-16 object-contain" />
        </div>
        <div className="absolute top-1/4 right-1/4 animate-float-delayed opacity-60">
          <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="loading" className="w-16 h-16 object-contain" />
        </div>
        <div className="text-center relative z-10">
          <div className="text-4xl mb-4">
            <span className="loading-heart">💕</span>
            <span className="loading-heart">💕</span>
            <span className="loading-heart">💕</span>
          </div>
          <p className="text-pink-600">Loading your surprise...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full text-center">
          <CardContent className="space-y-4">
            <div className="text-6xl mb-4">💔</div>
            <h1 className="text-2xl font-display text-pink-600">
              Page Not Found
            </h1>
            <p className="text-gray-600">
              {error || "This love note doesn't exist or has been removed."}
            </p>
            <Link to="/">
              <Button>Create Your Own</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use interactive template renderer for special templates
  if (isInteractiveTemplate(page.template_id)) {
    return (
      <>
        <TemplateRenderer page={page} />
        {/* Footer for interactive templates */}
        <div className="fixed bottom-4 left-0 right-0 text-center z-50">
          <Link to="/">
            <button className="text-pink-400 text-sm hover:text-pink-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              Create your own 💕
            </button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Decorative GIFs for classic templates */}
      <div className="absolute top-20 left-10 hidden md:block animate-float opacity-50 z-0">
        <img src="/7102e1771b31ce3665a3f15522a603b6.gif" alt="decoration" className="w-20 h-20 object-contain" />
      </div>
      <div className="absolute bottom-20 right-10 hidden md:block animate-wiggle opacity-50 z-0">
        <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="decoration" className="w-20 h-20 object-contain" />
      </div>

      <div className="relative z-10">
        <PageCard page={page} />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-pink-400 mb-3">
            Create your own Valentine's page
          </p>
          <Link to="/">
            <Button variant="secondary" size="sm">
              Make Your Own
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

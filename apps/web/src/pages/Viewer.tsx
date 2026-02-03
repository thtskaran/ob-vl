import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, Page } from '../lib/api'
import { PageCard } from '../components/viewer/PageCard'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
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
  )
}

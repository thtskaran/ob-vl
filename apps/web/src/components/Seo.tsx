import { useEffect } from 'react'

export interface SeoProps {
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  url?: string
  type?: string
  keywords?: string[]
}

const DEFAULTS = {
  title: 'Obvix.io | Create Personalized Valentine\'s Pages',
  description:
    "Generate beautiful, shareable Valentine's landing pages with interactive templates, Redis-backed reliability, and Obvix.io performance.",
  image: '/og-card.png',
  imageAlt: "Preview of a personalized Valentine's page created with Obvix.io",
  type: 'website',
  keywords: [
    "valentines page generator",
    "valentines microsite",
    "obvix",
    "love letter landing page",
    "interactive valentines template",
  ],
}

const envPublicUrl = (import.meta.env.VITE_PUBLIC_URL || '').replace(/\/$/, '')

const resolveOrigin = () => {
  if (envPublicUrl) return envPublicUrl
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }
  return ''
}

const toAbsolute = (value?: string) => {
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  const origin = resolveOrigin()
  if (!origin) return value
  return value.startsWith('/') ? `${origin}${value}` : `${origin}/${value}`
}

const setTagAttribute = (selector: string, attribute: string, value?: string) => {
  if (typeof document === 'undefined' || !value) return
  const element = document.querySelector(selector)
  if (element) {
    element.setAttribute(attribute, value)
  }
}

const setMetaContent = (selector: string, value?: string) => {
  setTagAttribute(selector, 'content', value)
}

export function Seo({
  title,
  description,
  image,
  imageAlt,
  url,
  type,
  keywords,
}: SeoProps) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const finalTitle = title ?? DEFAULTS.title
    const finalDescription = description ?? DEFAULTS.description
    const finalUrl = url ?? (typeof window !== 'undefined' ? window.location.href : undefined)
    const finalImage = toAbsolute(image ?? DEFAULTS.image)
    const finalAlt = imageAlt ?? DEFAULTS.imageAlt
    const finalType = type ?? DEFAULTS.type
    const finalKeywords = keywords?.length ? keywords : DEFAULTS.keywords

    document.title = finalTitle

    setMetaContent('meta[name="description"]', finalDescription)
    setMetaContent('meta[name="twitter:description"]', finalDescription)
    setMetaContent('meta[property="og:description"]', finalDescription)

    const keywordText = finalKeywords?.join(', ')
    setMetaContent('meta[name="keywords"]', keywordText)
    setMetaContent('meta[name="apple-mobile-web-app-title"]', 'Obvix Love')
    setMetaContent('meta[name="application-name"]', 'Obvix Valentine\'s Pages')

    setMetaContent('meta[property="og:title"]', finalTitle)
    setMetaContent('meta[property="og:type"]', finalType)
    setMetaContent('meta[property="og:url"]', finalUrl)
    setMetaContent('meta[property="og:image"]', finalImage)
    setMetaContent('meta[property="og:image:alt"]', finalAlt)
    setMetaContent('meta[name="twitter:title"]', finalTitle)
    setMetaContent('meta[name="twitter:image"]', finalImage)
    setMetaContent('meta[name="twitter:image:alt"]', finalAlt)
    setMetaContent('meta[name="twitter:card"]', 'summary_large_image')

    setTagAttribute('link[rel="canonical"]', 'href', finalUrl)
  }, [title, description, image, imageAlt, url, type, keywords])

  return null
}

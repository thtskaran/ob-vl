import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { TemplateSelector } from '../components/creator/TemplateSelector'
import { ContentForm } from '../components/creator/ContentForm'
import { SlugChecker } from '../components/creator/SlugChecker'
import { PreviewPane } from '../components/creator/PreviewPane'
import { Confetti } from '../components/decorations/Confetti'
import { useCreatePage } from '../hooks/useCreatePage'

type Step = 'template' | 'content' | 'slug' | 'success'

export function Creator() {
  const [step, setStep] = useState<Step>('template')
  const [templateId, setTemplateId] = useState('proposal')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugAvailable, setIsSlugAvailable] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { isCreating, result, error: createError, createPage } = useCreatePage()

  const validateContent = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Please enter a title'
    }

    if (!message.trim()) {
      newErrors.message = 'Please write a message'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 'template') {
      setStep('content')
    } else if (step === 'content') {
      if (validateContent()) {
        setStep('slug')
      }
    }
  }

  const handleBack = () => {
    if (step === 'content') {
      setStep('template')
    } else if (step === 'slug') {
      setStep('content')
    }
  }

  const handleSlugAvailabilityChange = useCallback((available: boolean) => {
    setIsSlugAvailable(available)
  }, [])

  const handleCreate = async () => {
    if (!isSlugAvailable || slug.length < 3) return

    const response = await createPage({
      slug,
      title,
      message,
      sender_name: senderName || undefined,
      recipient_name: recipientName || undefined,
      template_id: templateId,
    })

    if (response) {
      setStep('success')
    }
  }

  const handleCopyUrl = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url)
    }
  }

  const handleCreateAnother = () => {
    setStep('template')
    setTemplateId('classic')
    setTitle('')
    setMessage('')
    setSenderName('')
    setRecipientName('')
    setSlug('')
    setIsSlugAvailable(false)
    setErrors({})
  }

  if (step === 'success' && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <Confetti trigger={true} />
        {/* Success page GIF decorations - responsive sizing */}
        <div className="absolute top-4 sm:top-10 left-4 sm:left-10 animate-bounce opacity-80">
          <img src="/7102e1771b31ce3665a3f15522a603b6.gif" alt="celebration" className="w-16 h-16 sm:w-28 sm:h-28 object-contain" />
        </div>
        <div className="absolute top-4 sm:top-10 right-4 sm:right-10 animate-bounce opacity-80" style={{ animationDelay: '0.2s' }}>
          <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="celebration" className="w-16 h-16 sm:w-28 sm:h-28 object-contain" />
        </div>
        <div className="absolute bottom-10 left-1/4 animate-wiggle opacity-70 hidden sm:block">
          <img src="/7102e1771b31ce3665a3f15522a603b6.gif" alt="celebration" className="w-24 h-24 object-contain" />
        </div>
        <div className="absolute bottom-10 right-1/4 animate-wiggle-delayed opacity-70 hidden sm:block">
          <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="celebration" className="w-24 h-24 object-contain" />
        </div>

        <Card variant="elevated" className="max-w-md w-full text-center relative z-10">
          <CardHeader>
            <div className="text-4xl sm:text-6xl mb-4 animate-bounce-gentle">💕</div>
            <CardTitle className="text-xl sm:text-2xl">Your page is ready!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm sm:text-base text-gray-600">
              Share this link with your special someone:
            </p>
            <div className="bg-pink-50 rounded-2xl p-3 sm:p-4 break-all">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base text-pink-600 hover:text-pink-700 font-medium"
              >
                {result.url}
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleCopyUrl} className="flex-1">
                Copy Link
              </Button>
              <Button
                variant="secondary"
                onClick={handleCreateAnother}
                className="flex-1"
              >
                Create Another
              </Button>
            </div>
            <p className="text-xs text-pink-400 mt-4">
              Save your edit token if you want to modify this page later:
              <br />
              <code className="text-xs bg-pink-100 px-2 py-1 rounded mt-1 inline-block">
                {result.edit_token}
              </code>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Floating GIF decorations */}
      <div className="absolute top-20 left-8 hidden md:block animate-float opacity-80 z-0">
        <img src="/7102e1771b31ce3665a3f15522a603b6.gif" alt="cute decoration" className="w-24 h-24 object-contain" />
      </div>
      <div className="absolute top-40 right-12 hidden md:block animate-float-delayed opacity-80 z-0">
        <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="cute decoration" className="w-24 h-24 object-contain" />
      </div>
      <div className="absolute bottom-32 left-16 hidden lg:block animate-wiggle opacity-70 z-0">
        <img src="/79ea6ffa1ca3345b59042a9ce9638dfc.gif" alt="cute decoration" className="w-20 h-20 object-contain" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-gradient-valentine mb-2 px-4">
            Create Your Valentine
          </h1>
          <p className="text-sm sm:text-base text-pink-600 px-4">
            Make someone's day special with a personalized love note
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {['template', 'content', 'slug'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-colors
                    ${step === s || ['template', 'content', 'slug'].indexOf(step) > i
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-100 text-pink-400'
                    }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-1 transition-colors
                      ${['template', 'content', 'slug'].indexOf(step) > i
                        ? 'bg-pink-500'
                        : 'bg-pink-100'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>
                {step === 'template' && 'Choose a Style'}
                {step === 'content' && 'Write Your Message'}
                {step === 'slug' && 'Pick Your URL'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 'template' && (
                <TemplateSelector
                  selected={templateId}
                  onSelect={setTemplateId}
                />
              )}

              {step === 'content' && (
                <ContentForm
                  title={title}
                  message={message}
                  senderName={senderName}
                  recipientName={recipientName}
                  onTitleChange={setTitle}
                  onMessageChange={setMessage}
                  onSenderNameChange={setSenderName}
                  onRecipientNameChange={setRecipientName}
                  errors={errors}
                />
              )}

              {step === 'slug' && (
                <SlugChecker
                  value={slug}
                  onChange={setSlug}
                  onAvailabilityChange={handleSlugAvailabilityChange}
                />
              )}

              {createError && (
                <p className="text-red-500 text-sm">💔 {createError}</p>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {step !== 'template' && (
                  <Button variant="secondary" onClick={handleBack} className="sm:w-auto">
                    Back
                  </Button>
                )}
                {step !== 'slug' ? (
                  <Button onClick={handleNext} className="flex-1">
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreate}
                    disabled={!isSlugAvailable || slug.length < 3}
                    isLoading={isCreating}
                    className="flex-1"
                  >
                    Create Page
                  </Button>
                )}
              </div>

              {/* Obvix Labs Promo */}
              <div className="mt-6 pt-4 border-t border-pink-200/50 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  If you are a business owner, entrepreneur or founder check out:{' '}
                  <a
                    href="https://obvix.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 font-semibold underline decoration-pink-300 hover:decoration-pink-500 transition-colors"
                  >
                    obvix.io
                  </a>
                  {' '}— we can help automate solutions for you
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="hidden lg:block">
            <PreviewPane
              title={title}
              message={message}
              senderName={senderName}
              recipientName={recipientName}
              templateId={templateId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

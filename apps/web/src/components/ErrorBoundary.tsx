import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-pink-50">
          <Card variant="elevated" className="max-w-md">
            <CardHeader>
              <div className="text-5xl mb-4 text-center">💔</div>
              <CardTitle className="text-center">Oops! Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                We encountered an unexpected error. Don't worry, your data is safe!
              </p>
              {this.state.error && import.meta.env.DEV && (
                <div className="p-3 bg-red-50 rounded-lg text-xs text-red-800 font-mono overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
              <Button onClick={this.handleReset} className="w-full">
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}

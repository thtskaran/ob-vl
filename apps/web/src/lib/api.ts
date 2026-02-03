const API_BASE = '/api'

export interface Template {
  id: string
  name: string
  description: string
  primary_color: string
  secondary_color: string
  font: string
  interactive: boolean
}

export interface Page {
  id: number
  slug: string
  title: string
  message: string
  sender_name: string | null
  recipient_name: string | null
  template_id: string
  created_at: string
  view_count: number
}

export interface PageCreateData {
  slug: string
  title: string
  message: string
  sender_name?: string
  recipient_name?: string
  template_id: string
}

export interface PageCreateResponse {
  page: Page
  edit_token: string
  url: string
}

export interface PageJobResponse {
  job_id: string
  status: string
  message: string
}

export interface PageJobStatusResponse {
  job_id: string
  status: string
  result?: PageCreateResponse
  error?: string
}

export interface SlugCheckResponse {
  slug: string
  available: boolean
  reason: string | null
  suggestions: string[]
}

export interface ApiError {
  detail: string
}

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: 'An unexpected error occurred',
      }))
      throw new Error(error.detail)
    }

    return response.json()
  }

  // Templates
  async getTemplates(): Promise<{ templates: Template[] }> {
    return this.fetch('/templates')
  }

  async getTemplate(id: string): Promise<Template> {
    return this.fetch(`/templates/${id}`)
  }

  // Slugs
  async checkSlug(slug: string): Promise<SlugCheckResponse> {
    return this.fetch(`/slugs/check/${encodeURIComponent(slug)}`)
  }

  async getSuggestions(base: string, count = 5): Promise<{ suggestions: string[] }> {
    return this.fetch(`/slugs/suggest?base=${encodeURIComponent(base)}&count=${count}`)
  }

  // Pages
  async createPage(data: PageCreateData): Promise<PageCreateResponse | PageJobResponse> {
    return this.fetch('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getJobStatus(jobId: string): Promise<PageJobStatusResponse> {
    return this.fetch(`/pages/job/${encodeURIComponent(jobId)}`)
  }

  async pollJobUntilComplete(jobId: string, maxAttempts = 30): Promise<PageCreateResponse> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getJobStatus(jobId)

      if (status.status === 'finished' && status.result) {
        return status.result
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Job failed')
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error('Job timed out')
  }

  async getPage(slug: string): Promise<Page> {
    return this.fetch(`/pages/${encodeURIComponent(slug)}`)
  }

  async updatePage(
    slug: string,
    data: Partial<PageCreateData>,
    editToken: string
  ): Promise<Page> {
    return this.fetch(`/pages/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      headers: {
        'X-Edit-Token': editToken,
      },
      body: JSON.stringify(data),
    })
  }

  async deletePage(slug: string, editToken: string): Promise<{ message: string }> {
    return this.fetch(`/pages/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      headers: {
        'X-Edit-Token': editToken,
      },
    })
  }
}

export const api = new ApiClient()

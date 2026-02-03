import { Page } from '../../lib/api'
import { ProposalTemplate } from './ProposalTemplate'
import { EnvelopeTemplate } from './EnvelopeTemplate'
import { ScratchTemplate } from './ScratchTemplate'
import { CountdownTemplate } from './CountdownTemplate'

interface TemplateRendererProps {
  page: Page
}

export function TemplateRenderer({ page }: TemplateRendererProps) {
  switch (page.template_id) {
    case 'proposal':
      return <ProposalTemplate page={page} />
    case 'envelope':
      return <EnvelopeTemplate page={page} />
    case 'scratch':
      return <ScratchTemplate page={page} />
    case 'countdown':
      return <CountdownTemplate page={page} />
    default:
      // Return null for non-interactive templates (handled by PageCard)
      return null
  }
}

export const interactiveTemplates = ['proposal', 'envelope', 'scratch', 'countdown']

export function isInteractiveTemplate(templateId: string): boolean {
  return interactiveTemplates.includes(templateId)
}

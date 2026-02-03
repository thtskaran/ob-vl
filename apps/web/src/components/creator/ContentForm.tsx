import { Input, Textarea } from '../ui/Input'

interface ContentFormProps {
  title: string
  message: string
  senderName: string
  recipientName: string
  onTitleChange: (value: string) => void
  onMessageChange: (value: string) => void
  onSenderNameChange: (value: string) => void
  onRecipientNameChange: (value: string) => void
  errors?: {
    title?: string
    message?: string
  }
}

export function ContentForm({
  title,
  message,
  senderName,
  recipientName,
  onTitleChange,
  onMessageChange,
  onSenderNameChange,
  onRecipientNameChange,
  errors = {},
}: ContentFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="To (optional)"
          placeholder="Their name"
          value={recipientName}
          onChange={(e) => onRecipientNameChange(e.target.value)}
          maxLength={50}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <Input
          label="From (optional)"
          placeholder="Your name"
          value={senderName}
          onChange={(e) => onSenderNameChange(e.target.value)}
          maxLength={50}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
      </div>

      <Input
        label="Title"
        placeholder="Happy Valentine's Day!"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        error={errors.title}
        maxLength={100}
        required
      />

      <Textarea
        label="Your Message"
        placeholder="Write your heartfelt message here..."
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        error={errors.message}
        rows={5}
        maxLength={2000}
        required
      />

      <p className="text-sm text-pink-400 text-right">
        {message.length}/2000 characters
      </p>
    </div>
  )
}

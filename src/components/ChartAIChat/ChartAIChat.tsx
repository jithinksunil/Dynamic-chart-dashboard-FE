import { Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/interfaces'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const chatTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
})

interface ChartAIChatProps {
  chartName: string
  messages: ChatMessage[]
  onClose: () => void
  onSend: ({ content }: { content: string }) => void
  isPending?: boolean
}

function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span
            className="bg-muted-foreground/50 inline-block size-2 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="bg-muted-foreground/50 inline-block size-2 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="bg-muted-foreground/50 inline-block size-2 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}

export function ChartAIChat({
  chartName,
  messages,
  onClose,
  onSend,
  isPending = false,
}: ChartAIChatProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = ({ key }: KeyboardEvent): void => {
      if (key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleInput = (): void => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  const handleSend = (): void => {
    const trimmed = inputValue.trim()
    if (!trimmed || isPending) return
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    onSend({ content: trimmed })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`AI chat for ${chartName}`}
        className="flex h-full w-full max-w-md flex-col border-l border-border/70 bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 border-primary/20 flex size-8 shrink-0 items-center justify-center rounded-lg border">
              <Sparkles className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Assistant</p>
              <p className="text-muted-foreground max-w-50 truncate text-xs">{chartName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Close AI chat" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {messages.length === 0 && !isPending ? (
            <div className="flex h-full items-center justify-center">
              <div className="space-y-1 text-center">
                <Sparkles className="text-muted-foreground/50 mx-auto h-8 w-8" />
                <p className="text-muted-foreground text-sm">Ask anything about this chart</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isUser = message.role === 'USER'
                return (
                  <div
                    key={index}
                    className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        isUser
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted text-foreground rounded-tl-sm'
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="text-muted-foreground px-1 text-xs">
                      {chatTimeFormatter.format(new Date(message.createdAt))}
                    </span>
                  </div>
                )
              })}
              {isPending ? <TypingIndicator /> : null}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border/70 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this chart..."
              rows={1}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 max-h-32 flex-1 resize-none overflow-y-auto rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            />
            <Button
              size="icon"
              disabled={!inputValue.trim() || isPending}
              onClick={handleSend}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

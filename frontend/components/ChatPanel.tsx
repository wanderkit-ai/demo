'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, MapPin } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  itineraryId: string | null
  currentItinerary: any
  onItineraryUpdate: (data: any) => void
  onOperatorSuggestion?: (operators: any[]) => void
}

const demoPrompts = [
  'Plan a 7-day luxury adventure trek in Nepal for a travel influencer with 250K followers. We want strong content moments, local culture, and operator support.',
  'I want boutique 4-star hotels if possible, but be honest if the mountains can only support 3.5-star or premium teahouses.',
]

export default function ChatPanel({
  itineraryId,
  currentItinerary,
  onItineraryUpdate,
  onOperatorSuggestion
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [toolActivity, setToolActivity] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      setMessages([{
        role: 'assistant',
        content: "Hey! I'm your WanderKit AI assistant. Tell me where in the world you want to go and what kind of experience you're after. I'll build the itinerary, flag real operator constraints, and prepare it for negotiation."
      }])
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, toolActivity])

  const send = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreamingText('')
    setToolActivity(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary_id: itineraryId,
          messages: newMessages,
          current_itinerary: currentItinerary
        })
      })

      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue

          try {
            const event = JSON.parse(raw)

            if (event.type === 'text_delta') {
              accumulated += event.text
              setStreamingText(accumulated)
            } else if (event.type === 'tool_use') {
              const toolLabels: Record<string, string> = {
                update_itinerary: 'Building your itinerary...',
                find_matching_operator: 'Searching for operators...',
              }
              setToolActivity(toolLabels[event.name] || `Using ${event.name}...`)
            } else if (event.type === 'tool_result') {
              setToolActivity(null)
              if (event.name === 'update_itinerary' && event.result?.itinerary) {
                onItineraryUpdate(event.result.itinerary)
              } else if (event.name === 'find_matching_operator' && event.result?.operators) {
                onOperatorSuggestion?.(event.result.operators)
              }
            } else if (event.type === 'done') {
              // persist full messages from backend
            }
          } catch {}
        }
      }

      if (accumulated) {
        setMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
      }
      setStreamingText('')
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
      setToolActivity(null)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-notion-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-notion-border flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-notion-text">AI Travel Assistant</div>
          <div className="text-xs text-notion-muted">Scripted demo flow ready</div>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 1 && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 space-y-2">
            <div className="text-xs font-semibold text-brand-700">Demo brief</div>
            {demoPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt)
                  inputRef.current?.focus()
                }}
                className="w-full text-left text-xs leading-relaxed rounded-lg bg-white border border-brand-100 px-3 py-2 text-notion-secondary hover:border-brand-300 hover:text-notion-text transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 message-bubble ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === 'user' ? 'bg-notion-tag' : 'bg-brand-100'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-notion-secondary" />
                : <Bot className="w-3.5 h-3.5 text-brand-600" />
              }
            </div>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white rounded-tr-sm'
                : 'bg-notion-hover text-notion-text rounded-tl-sm'
            }`}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {/* Tool activity indicator */}
        {toolActivity && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-100">
            <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin shrink-0" />
            <span className="text-xs text-brand-700 font-medium">{toolActivity}</span>
          </div>
        )}

        {/* Streaming text */}
        {streamingText && (
          <div className="flex gap-2.5 message-bubble">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <div className="max-w-[85%] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed bg-notion-hover text-notion-text">
              {streamingText.split('\n').map((line, j) => (
                <span key={j}>{line}{j < streamingText.split('\n').length - 1 && <br />}</span>
              ))}
              <span className="inline-block w-0.5 h-4 bg-brand-600 ml-0.5 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {/* Loading dots */}
        {loading && !streamingText && !toolActivity && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <div className="flex items-center gap-1 px-3.5 py-3 rounded-xl rounded-tl-sm bg-notion-hover">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-notion-secondary animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-notion-border">
        <div className="flex items-end gap-2 bg-notion-hover rounded-xl px-3 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tell me about your dream trip..."
            className="flex-1 bg-transparent resize-none text-sm text-notion-text placeholder:text-notion-muted outline-none max-h-32 min-h-[20px]"
            rows={1}
            style={{ height: 'auto' }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = t.scrollHeight + 'px'
            }}
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center disabled:opacity-40 hover:bg-brand-700 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <div className="text-[11px] text-notion-muted text-center mt-1.5">Press Enter to send · Shift+Enter for newline</div>
      </div>
    </div>
  )
}

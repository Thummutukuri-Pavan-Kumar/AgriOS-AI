import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Leaf } from 'lucide-react'
import api from '../api/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestions = [
  "What crops should I grow this Kharif season in Karnataka?",
  "My tomato leaves are turning yellow, what's wrong?",
  "How much water does rice need per acre?",
  "Best fertilizer schedule for wheat crop?",
]

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I'm your AgriOS AI Copilot 🌾 I'm here to help you with crop recommendations, disease diagnosis, irrigation planning, and all your farming decisions. How can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/copilot/chat', {
        message: content,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      })
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Agriculture Copilot</h1>
        <p className="text-gray-400 text-sm mt-1">Your personal AI farm advisor — ask anything about farming</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-green-600' : 'bg-blue-600'
            }`}>
              {msg.role === 'assistant' ? <Leaf className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'assistant'
                ? 'bg-gray-800 text-gray-200 rounded-tl-none'
                : 'bg-blue-600 text-white rounded-tr-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1.5 ${msg.role === 'assistant' ? 'text-gray-500' : 'text-blue-200'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-full px-3 py-1.5 transition-colors text-left">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask your AI farm advisor anything..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition-colors placeholder-gray-500"
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white p-3 rounded-xl transition-colors">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
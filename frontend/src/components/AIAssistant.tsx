import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Sparkles, Bot, User, RefreshCw } from 'lucide-react'
import api from '../services/api'

interface Message {
  role: 'user' | 'model'
  content: string
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<Message[]>([
    {
      role: 'model',
      content: "👋 **Hello! Welcome to the Nova Cart Smart Living Space!**\n\nI am your personal AI Assistant. I can recommend our premium products, give you pricing, and help you find the best gadgets for your luxurious home office. \n\nHow can I help you today? ✨"
    }
  ])
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever history updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history, isOpen])

  // Stop pulsing once opened
  useEffect(() => {
    if (isOpen) {
      setPulse(false)
    }
  }, [isOpen])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || message).trim()
    if (!text) return

    // Clear input
    if (!textToSend) {
      setMessage('')
    }

    // Add user message to history
    const userMsg: Message = { role: 'user', content: text }
    const updatedHistory = [...history, userMsg]
    setHistory(updatedHistory)
    setLoading(true)

    try {
      // Map history to standard ChatMessage format expected by backend
      const formattedHistory = updatedHistory.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await api.post('/ai/chat', {
        message: text,
        history: formattedHistory
      })

      const botReply = response.data.response
      setHistory(prev => [...prev, { role: 'model', content: botReply }])
    } catch (error: any) {
      console.error('Failed to communicate with AI Assistant:', error)
      setHistory(prev => [
        ...prev,
        {
          role: 'model',
          content: "⚠️ **System connection error.** I'm having trouble reaching our smart server right now. Please try again in a few moments!"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (suggestedText: string) => {
    handleSend(suggestedText)
  }

  const handleClear = () => {
    if (window.confirm('Do you want to reset the conversation?')) {
      setHistory([
        {
          role: 'model',
          content: "👋 Chat reset! I am ready to assist you. Ask me about our headphones, watches, wallets, jackets, or desk chairs!"
        }
      ])
    }
  }

  // Helper to render basic markdown bolding & formatting in lines
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, idx) => {
      // Basic bold formatting regex (**bold**)
      let processed = line
      const boldRegex = /\*\*(.*?)\*\*/g
      let match
      const parts = []
      let lastIndex = 0

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processed.substring(lastIndex, match.index))
        }
        parts.push(
          <strong key={match.index} className="text-amber-300 font-extrabold">
            {match[1]}
          </strong>
        )
        lastIndex = boldRegex.lastIndex
      }

      if (lastIndex < processed.length) {
        parts.push(processed.substring(lastIndex))
      }

      return (
        <p key={idx} className="min-h-[1.25rem] leading-relaxed mb-1.5 last:mb-0 text-[13px]">
          {parts.length > 0 ? parts : line}
        </p>
      )
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* 💬 FLOATING CHAT BALLOON WIDGET */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`relative p-4 rounded-full bg-gradient-to-tr from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-xl shadow-amber-600/10 hover:shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-white/10 ${
            pulse ? 'animate-bounce-soft' : ''
          }`}
        >
          {pulse && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
          <MessageSquare size={24} />
        </button>
      )}

      {/* 🚀 EXPANDED GLASSMORPHIC CHAT PANEL */}
      {isOpen && (
        <div
          className="w-[360px] sm:w-[400px] h-[550px] rounded-3xl border border-white/10 glass-premium shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-bottom shadow-amber-glow"
        >
          {/* Header */}
          <div className="bg-slate-900/80 px-5 py-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                  Nova Cart AI Guide
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 inline-block animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Smart Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Timeline */}
          <div className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-thin bg-slate-950/20">
            {history.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={i}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
                >
                  {/* Left avatar for bot */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-amber-400 flex-shrink-0">
                      <Bot size={15} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-tr-none'
                        : 'glass border border-white/5 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>

                  {/* Right avatar for user */}
                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-purple-400 flex-shrink-0">
                      <User size={15} />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Bot size={15} />
                </div>
                <div className="glass border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-300"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="px-5 py-2.5 border-t border-white/5 bg-slate-900/30 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => handleSuggestion('What headphones do you sell?')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-all"
            >
              🎧 Sound Pro info
            </button>
            <button
              onClick={() => handleSuggestion('Recommend the best products for fitness')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-all"
            >
              ⌚ Smart Watch specs
            </button>
            <button
              onClick={() => handleSuggestion('Suggest products to buy for my office setup')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-all"
            >
              🪑 Workspace comfort
            </button>
            <button
              onClick={() => handleSuggestion('What is in stock?')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-[10px] font-bold text-slate-300 hover:text-white transition-all"
            >
              📦 Current Inventory
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/5 bg-slate-900/60 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={loading}
                className="flex-grow px-4 py-2.5 bg-slate-950 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

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
      content: "👋 **Hello! Welcome to the Sarathi Store Smart Living Space!**\n\nI am your personal AI Assistant. I can recommend our premium products, give you pricing, and help you find the best gadgets for your luxurious home office. \n\nHow can I help you today? ✨"
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
          <strong key={match.index} className="text-blue-600 font-extrabold">
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-45 flex flex-col items-end">
      
      {/* 💬 FLOATING CHAT BALLOON WIDGET */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-testid="ai-assistant-toggle-btn"
          aria-label="Open AI Assistant"
          className={`relative p-4 rounded-full bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-white/10 ${
            pulse ? 'animate-bounce-soft' : ''
          }`}
        >
          {pulse && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#14B8A6]"></span>
            </span>
          )}
          <MessageSquare size={24} />
        </button>
      )}

      {/* 🚀 EXPANDED PREMIUM LIGHT CHAT PANEL */}
      {isOpen && (
        <div
          data-testid="ai-assistant-panel"
          className="w-[calc(100vw-32px)] sm:w-[400px] h-[550px] max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-180px)] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-bottom shadow-blue-500/10"
        >
          {/* Header */}
          <div className="bg-[#0F6FFF] px-5 py-4 border-b border-blue-600/15 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                  Sarathi AI Guide
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider">Smart Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                data-testid="ai-assistant-reset-btn"
                title="Reset conversation"
                className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                data-testid="ai-assistant-close-btn"
                aria-label="Close AI Assistant"
                className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Timeline */}
          <div className="flex-1 min-h-0 p-5 overflow-y-auto space-y-4 scrollbar-thin bg-[#F8F9FA]">
            {history.map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={i}
                  data-testid={`ai-message-${msg.role}`}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
                >
                  {/* Left avatar for bot */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#0F6FFF]/10 border border-[#0F6FFF]/20 flex items-center justify-center text-[#0F6FFF] flex-shrink-0">
                      <Bot size={14} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    data-testid={`ai-msg-bubble-${i}`}
                    className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm break-words ${
                      isUser
                        ? 'bg-[#0F6FFF] text-white rounded-tr-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>

                  {/* Right avatar for user */}
                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <User size={14} />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Typing Indicator */}
            {loading && (
              <div data-testid="ai-assistant-typing-indicator" className="flex gap-2.5 justify-start animate-pulse">
                <div className="w-7 h-7 rounded-full bg-[#0F6FFF]/10 border border-[#0F6FFF]/20 flex items-center justify-center text-[#0F6FFF] flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F6FFF] animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F6FFF] animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F6FFF] animate-bounce delay-300"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => handleSuggestion('What headphones do you sell?')}
              data-testid="ai-suggestion-headphones"
              className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[10px] font-semibold text-slate-600 hover:text-[#0F6FFF] transition-all shadow-xs"
            >
              🎧 Sound Pro info
            </button>
            <button
              onClick={() => handleSuggestion('Recommend the best products for fitness')}
              data-testid="ai-suggestion-fitness"
              className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[10px] font-semibold text-slate-600 hover:text-[#0F6FFF] transition-all shadow-xs"
            >
              ⌚ Smart Watch specs
            </button>
            <button
              onClick={() => handleSuggestion('Suggest products to buy for my office setup')}
              data-testid="ai-suggestion-office"
              className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[10px] font-semibold text-slate-600 hover:text-[#0F6FFF] transition-all shadow-xs"
            >
              🪑 Workspace comfort
            </button>
            <button
              onClick={() => handleSuggestion('What is in stock?')}
              data-testid="ai-suggestion-inventory"
              className="px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[10px] font-semibold text-slate-600 hover:text-[#0F6FFF] transition-all shadow-xs"
            >
              📦 Current Inventory
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                id="ai-assistant-input"
                data-testid="ai-assistant-input"
                aria-label="AI assistant chat message input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={loading}
                className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F6FFF] transition-all"
              />
              <button
                type="submit"
                data-testid="ai-assistant-send-btn"
                aria-label="Send message"
                disabled={!message.trim() || loading}
                className="p-2.5 rounded-full bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center flex-shrink-0 shadow-xs hover:scale-105 active:scale-95"
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

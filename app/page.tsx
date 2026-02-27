'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './home.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [messageCount, setMessageCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const MAX_MESSAGES = 5

  useEffect(() => {
    // Load from session storage
    const stored = sessionStorage.getItem('trialMessages')
    const storedCount = sessionStorage.getItem('trialMessageCount')
    if (stored) {
      setMessages(JSON.parse(stored))
    }
    if (storedCount) {
      setMessageCount(parseInt(storedCount))
    }
  }, [])

  useEffect(() => {
    // Save to session storage
    sessionStorage.setItem('trialMessages', JSON.stringify(messages))
    sessionStorage.setItem('trialMessageCount', messageCount.toString())
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, messageCount])

  const sendMessage = async () => {
    if (!input.trim() || messageCount >= MAX_MESSAGES) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setMessageCount(prev => prev + 1)

    try {
      const response = await fetch('/api/trial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, count: messageCount + 1 }),
      })

      const data = await response.json()
      
      if (data.limitReached) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: '🎉 You\'ve used all 5 free messages! Sign up to get your own unlimited Clawdet instance with your personal subdomain.'
        }
        setMessages(prev => [...prev, assistantMessage])
      } else if (data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header with Logo + Sign Up */}
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <span className={styles.logoIcon}>🐾</span>
            <span className={styles.logoText}>Clawdet</span>
          </div>
          
          <div className={styles.headerButtons}>
            <Link href="/login" className={styles.headerLoginButton}>
              Log In
            </Link>
            <Link href="/signup" className={styles.headerSignUpButton}>
              Sign Up Free
            </Link>
          </div>
        </div>
        
        {/* Chat Input — always at top, always visible */}
        {messageCount >= MAX_MESSAGES ? (
          <div className={styles.upgradePrompt}>
            <p className={styles.upgradeText}>
              🎉 <strong>You've tried Clawdet!</strong> Ready for unlimited access?
            </p>
            <div className={styles.upgradeButtons}>
              <Link href="/signup" className={styles.primaryButton}>
                🚀 Sign Up Free
              </Link>
              <Link href="/login" className={styles.secondaryButton}>
                Already have an account? Log in
              </Link>
            </div>
            <p className={styles.upgradeSubtext}>
              Get your own instance: <strong>yourname.clawdet.com</strong>
            </p>
          </div>
        ) : (
          <div className={styles.inputContainer}>
            <textarea
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... (try: 'What can you help me with?')"
              rows={1}
              disabled={isLoading}
              autoFocus
            />
            <button
              className={styles.sendButton}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? '...' : '→'}
            </button>
          </div>
        )}

        {/* Trial Counter */}
        <div className={styles.trialCounter}>
          {messageCount}/{MAX_MESSAGES} free messages used
        </div>

        {/* Chat Messages */}
        <div className={styles.chatContainer}>
          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <p className={styles.welcomeText}>
                  👋 <strong>Try Clawdet now!</strong> Ask me anything — you have {MAX_MESSAGES} free messages.
                </p>
                <p className={styles.welcomeHint}>
                  After testing, sign up to get your own unlimited instance at <strong>yourname.clawdet.com</strong>
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.messageContent}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.typing}>Thinking...</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Features (show before limit) */}
        {messageCount < MAX_MESSAGES && (
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔍</div>
              <h3>Deep Research</h3>
              <p>Multi-source investigation</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💬</div>
              <h3>Unlimited Chat</h3>
              <p>Never run out of messages</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🚀</div>
              <h3>Your Own Instance</h3>
              <p>yourname.clawdet.com</p>
            </div>
          </div>
        )}
        
        <div className={styles.badge}>
          <span className={styles.badgeDot}></span>
          Powered by OpenClaw
        </div>
      </div>
    </div>
  )
}

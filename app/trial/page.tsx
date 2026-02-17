'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './trial.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function TrialPage() {
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
          content: data.message
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
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
      <div className={styles.header}>
        <h1 className={styles.logo}>🐾 Clawdet</h1>
        <div className={styles.counter}>
          {messageCount}/{MAX_MESSAGES} free messages
        </div>
      </div>

      <div className={styles.chatContainer}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <h2>Welcome to Clawdet</h2>
            <p>Try out your personal AI assistant. You have {MAX_MESSAGES} free messages.</p>
            <p className={styles.hint}>Ask me anything!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageContent}>
              <div className={styles.typing}>Thinking...</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messageCount >= MAX_MESSAGES ? (
        <div className={styles.upgradePrompt}>
          <p>🎉 You've used all your free messages!</p>
          <button className={styles.upgradeButton} onClick={() => window.location.href = '/signup'}>
            Upgrade to Continue
          </button>
        </div>
      ) : (
        <div className={styles.inputContainer}>
          <textarea
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Clawdet..."
            rows={1}
            disabled={messageCount >= MAX_MESSAGES}
          />
          <button
            className={styles.sendButton}
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || messageCount >= MAX_MESSAGES}
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}

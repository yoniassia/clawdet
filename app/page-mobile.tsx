'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './home.module.css'

export default function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [count, setCount] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || count >= 5) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/trial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, count: count + 1 }),
      })

      const data = await res.json()
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        setCount(count + 1)
      }
      
      if (data.limitReached) {
        setMessages(prev => [...prev, { role: 'assistant', content: '🎉 You\'ve used all 5 free messages! Ready for unlimited access?' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.mobileContainer}>
      <div className={styles.mobileHeader}>
        <h1 className={styles.mobileTitle}>
          🐾 <span className={styles.gradient}>Clawdet</span>
        </h1>
        <p className={styles.mobileCounter}>{count}/5 free messages</p>
      </div>

      <div className={styles.mobileChatContainer}>
        <div className={styles.mobileMessages}>
          {messages.length === 0 && (
            <div className={styles.mobileWelcome}>
              👋 Try Clawdet AI with 5 free messages!
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.mobileMessage} ${styles[msg.role]}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.mobileMessage} ${styles.assistant}`}>
              <div className={styles.typing}>...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.mobileForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={count >= 5 ? 'Limit reached' : 'Ask me anything...'}
            className={styles.mobileInput}
            disabled={isLoading || count >= 5}
          />
          <button 
            type="submit" 
            className={styles.mobileButton}
            disabled={isLoading || !input.trim() || count >= 5}
          >
            {isLoading ? '...' : count >= 5 ? '✓' : '→'}
          </button>
        </form>
      </div>

      {count >= 5 ? (
        <div className={styles.mobileCTA}>
          <Link href="/signup" className={styles.mobileCTAButton}>
            🚀 Get Your Own Clawdet
          </Link>
        </div>
      ) : (
        <div className={styles.mobileFeatures}>
          <div className={styles.mobileFeature}>💬 Unlimited Chat</div>
          <div className={styles.mobileFeature}>🚀 Your Own Instance</div>
          <div className={styles.mobileFeature}>🔧 Full Tools</div>
        </div>
      )}
    </div>
  )
}

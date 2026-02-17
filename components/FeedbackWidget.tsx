'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const CATEGORIES = [
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'feature', label: '✨ Feature Request' },
  { value: 'ux', label: '🎨 UX Issue' },
  { value: 'praise', label: '💙 Love it!' },
  { value: 'other', label: '💬 Other' },
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState('other')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const pathname = usePathname()

  const reset = useCallback(() => {
    setRating(0)
    setHoverRating(0)
    setCategory('other')
    setMessage('')
  }, [])

  const handleSubmit = async () => {
    if (!rating) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pathname, rating, category, message }),
      })
      if (res.ok) {
        setToast('Thanks for your feedback! 💙')
        reset()
        setTimeout(() => setOpen(false), 1200)
        setTimeout(() => setToast(''), 2500)
      } else {
        setToast('Failed to submit. Try again.')
        setTimeout(() => setToast(''), 3000)
      }
    } catch {
      setToast('Network error. Try again.')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const displayRating = hoverRating || rating

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '5.5rem',
            zIndex: 10001,
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: 'rgba(29, 161, 242, 0.15)',
            border: '1px solid rgba(29, 161, 242, 0.3)',
            color: '#1DA1F2',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toast}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) reset()
        }}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 10000,
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          background: 'rgba(29, 161, 242, 0.12)',
          border: '1px solid rgba(29, 161, 242, 0.25)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(29, 161, 242, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(29, 161, 242, 0.2)'
          e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.4)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(29, 161, 242, 0.12)'
          e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.25)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        aria-label="Send feedback"
      >
        💬
      </button>

      {/* Modal Backdrop + Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: '1.25rem',
            paddingBottom: '7rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            style={{
              width: '20rem',
              maxWidth: 'calc(100vw - 2.5rem)',
              borderRadius: '1rem',
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(29, 161, 242, 0.15)',
              boxShadow:
                '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(29, 161, 242, 0.05)',
              animation: 'slideUp 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                Send Feedback
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{
                  color: '#8899A6',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#8899A6'
                }}
              >
                ✕
              </button>
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    fontSize: '1.75rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                >
                  {star <= displayRating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(29, 161, 242, 0.12)',
                color: 'white',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.4)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.12)'
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} style={{ background: '#000' }}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={3}
              style={{
                width: '100%',
                marginBottom: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                resize: 'none',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(29, 161, 242, 0.12)',
                color: 'white',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.4)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(29, 161, 242, 0.12)'
              }}
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!rating || submitting}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                opacity: !rating || submitting ? 0.3 : 1,
                cursor: !rating || submitting ? 'not-allowed' : 'pointer',
                background: 'rgba(29, 161, 242, 0.15)',
                border: '1px solid rgba(29, 161, 242, 0.3)',
                color: '#1DA1F2',
              }}
              onMouseEnter={(e) => {
                if (!rating || submitting) return
                e.currentTarget.style.background = 'rgba(29, 161, 242, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 161, 242, 0.15)'
              }}
              onMouseDown={(e) => {
                if (!rating || submitting) return
                e.currentTarget.style.transform = 'scale(0.98)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {submitting ? 'Sending...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

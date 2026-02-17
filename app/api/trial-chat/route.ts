import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, sanitizeInput, SECURITY_HEADERS } from '@/lib/security'

const MAX_MESSAGES = 5
const GROK_API_KEY = process.env.GROK_API_KEY || process.env.XAI_API_KEY
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_MODEL = 'grok-4-1-fast-non-reasoning' // Fast model for trial chat

const SYSTEM_PROMPT = `You are Clawdet, an AI assistant helping users understand our platform.

We offer:
- Personal AI instances powered by OpenClaw
- Your own subdomain and dedicated environment  
- Full control over your AI assistant
- Integration with tools like X/Twitter, Telegram, and more

In this trial, users get 5 free messages to experience the AI before signing up.
Be helpful, concise, and natural. If they ask about pricing or features, explain that for $20/month they get their own dedicated AI instance at their own subdomain (username.clawdet.com) with unlimited messages and full capabilities.

Keep responses under 150 words unless they ask for more detail.`

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 requests per minute per IP
    const clientIP = getClientIP(request.headers)
    const rateLimit = checkRateLimit(`trial-chat:${clientIP}`, { maxRequests: 20, windowMs: 60000 })
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const body = await request.json()
    const { message, count } = body

    // Validate and sanitize input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const sanitizedMessage = sanitizeInput(message, 5000)
    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Check if limit reached (count is 1-indexed, so 6th message has count=6)
    if (count > MAX_MESSAGES) {
      return NextResponse.json({
        limitReached: true,
        message: "🎉 You've reached your free message limit! Upgrade to continue chatting and unlock unlimited messages, advanced skills, and your own private AI instance."
      }, { headers: SECURITY_HEADERS })
    }

    // Call real Grok API
    if (!GROK_API_KEY) {
      throw new Error('Grok API key not configured')
    }

    const grokResponse = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: sanitizedMessage }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text()
      console.error('Grok API Error:', grokResponse.status, errorText)
      throw new Error(`Grok API returned ${grokResponse.status}`)
    }

    const grokData = await grokResponse.json()
    const aiResponse = grokData.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again."

    return NextResponse.json({
      response: aiResponse,
      limitReached: false,
      messagesRemaining: MAX_MESSAGES - count
    }, { headers: SECURITY_HEADERS })

  } catch (error) {
    console.error('API Error:', error)
    
    // Fallback response on error
    const body = await request.json().catch(() => ({ count: 0 }))
    return NextResponse.json({
      response: "I'm having trouble connecting right now. But I'd love to help! Clawdet gives you your own personal AI instance with unlimited conversations. Try asking me about features, pricing, or what makes Clawdet special!",
      limitReached: false,
      messagesRemaining: MAX_MESSAGES - (body?.count || 0)
    }, { headers: SECURITY_HEADERS })
  }
}

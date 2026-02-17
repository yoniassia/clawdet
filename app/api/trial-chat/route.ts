import { NextRequest, NextResponse } from 'next/server'

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
    const body = await request.json()
    const { message, count } = body

    // Check if limit reached
    if (count >= MAX_MESSAGES) {
      return NextResponse.json({
        limitReached: true,
        message: "🎉 You've reached your free message limit! Upgrade to continue chatting and unlock unlimited messages, advanced skills, and your own private AI instance."
      })
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
          { role: 'user', content: message }
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
    })

  } catch (error) {
    console.error('API Error:', error)
    
    // Fallback response on error
    const body = await request.json().catch(() => ({ count: 0 }))
    return NextResponse.json({
      response: "I'm having trouble connecting right now. But I'd love to help! Clawdet gives you your own personal AI instance with unlimited conversations. Try asking me about features, pricing, or what makes Clawdet special!",
      limitReached: false,
      messagesRemaining: MAX_MESSAGES - (body?.count || 0)
    })
  }
}

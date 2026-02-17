import { NextRequest, NextResponse } from 'next/server'

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
const TWITTER_AUTHORIZE_URL = 'https://twitter.com/i/oauth2/authorize'
const REDIRECT_URI = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/x/callback`
  : 'http://localhost:3000/api/auth/x/callback'

// Helper function to build OAuth URL
function buildOAuthUrl(baseUrl: string): { url: string; state: string } {
  // If no OAuth credentials, use mock mode
  if (!TWITTER_CLIENT_ID) {
    const mockCallbackUrl = new URL('/api/auth/x/callback', baseUrl)
    mockCallbackUrl.searchParams.set('mock', 'true')
    mockCallbackUrl.searchParams.set('code', 'mock_auth_code_' + Date.now())
    mockCallbackUrl.searchParams.set('state', 'mock_state')
    
    return { url: mockCallbackUrl.toString(), state: 'mock_state' }
  }

  // Real OAuth flow
  const state = Math.random().toString(36).substring(7)
  
  const authUrl = new URL(TWITTER_AUTHORIZE_URL)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', TWITTER_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('scope', 'tweet.read users.read offline.access')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', 'challenge')
  authUrl.searchParams.set('code_challenge_method', 'plain')

  return { url: authUrl.toString(), state }
}

// POST endpoint for API-based flows (returns JSON)
export async function POST(request: NextRequest) {
  try {
    const { url, state } = buildOAuthUrl(request.url)
    
    return NextResponse.json({
      url,
      state,
      mock: !TWITTER_CLIENT_ID
    })
  } catch (error) {
    console.error('OAuth login error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}

// GET endpoint for browser-based flows (redirects)
export async function GET(request: NextRequest) {
  try {
    const { url, state } = buildOAuthUrl(request.url)
    
    // Store state in session/cookie for verification (unless mock mode)
    const response = NextResponse.redirect(url)
    if (TWITTER_CLIENT_ID) {
      response.cookies.set('oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 minutes
        sameSite: 'lax'
      })
    }

    return response
  } catch (error) {
    console.error('OAuth login error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}

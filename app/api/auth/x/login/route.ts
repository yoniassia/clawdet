import { NextRequest, NextResponse } from 'next/server'

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
const TWITTER_AUTHORIZE_URL = 'https://twitter.com/i/oauth2/authorize'
const REDIRECT_URI = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/x/callback`
  : 'http://localhost:3000/api/auth/x/callback'

export async function GET(request: NextRequest) {
  // If no OAuth credentials, use mock mode
  if (!TWITTER_CLIENT_ID) {
    console.log('X OAuth: No credentials, using mock mode')
    
    // Redirect directly to callback with mock data
    const mockCallbackUrl = new URL('/api/auth/x/callback', request.url)
    mockCallbackUrl.searchParams.set('mock', 'true')
    mockCallbackUrl.searchParams.set('code', 'mock_auth_code_' + Date.now())
    mockCallbackUrl.searchParams.set('state', 'mock_state')
    
    return NextResponse.redirect(mockCallbackUrl)
  }

  // Real OAuth flow
  try {
    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7)
    
    // Build authorization URL
    const authUrl = new URL(TWITTER_AUTHORIZE_URL)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', TWITTER_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('scope', 'tweet.read users.read offline.access')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('code_challenge', 'challenge')
    authUrl.searchParams.set('code_challenge_method', 'plain')

    // Store state in session/cookie for verification
    const response = NextResponse.redirect(authUrl)
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      sameSite: 'lax'
    })

    return response
  } catch (error) {
    console.error('OAuth login error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}

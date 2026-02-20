import { NextRequest, NextResponse } from 'next/server'
import { upsertUser, updateUser } from '@/lib/db'
import { generateSessionToken } from '@/lib/security'
import { logOAuthCallback } from '@/lib/onboarding-logger'

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
const TWITTER_USER_URL = 'https://api.twitter.com/2/users/me'

interface MockUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const isMock = searchParams.get('mock') === 'true'

  // Use public URL for redirects (fixes localhost:3002 redirect bug)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://clawdet.com' 
                    : 'http://localhost:3000')

  if (!code) {
    return NextResponse.redirect(new URL('/signup?error=no_code', baseUrl))
  }

  try {
    console.log('[OAuth Callback] Received callback')
    console.log('[OAuth Callback] Code:', code ? 'present' : 'missing')
    console.log('[OAuth Callback] State:', state ? 'present' : 'missing')
    console.log('[OAuth Callback] Mock mode:', isMock)
    
    let userData: MockUser

    if (isMock || !TWITTER_CLIENT_ID) {
      // Mock mode: Create a test user
      console.log('[OAuth Callback] Using mock mode')
      userData = {
        id: 'mock_' + Date.now(),
        username: 'testuser',
        name: 'Test User',
        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
      }
    } else {
      console.log('[OAuth Callback] Real OAuth flow')
      
      // Verify state
      const storedState = request.cookies.get('oauth_state')?.value
      console.log('[OAuth Callback] Stored state:', storedState ? 'present' : 'missing')
      console.log('[OAuth Callback] Received state:', state)
      
      if (state !== storedState) {
        console.error('[OAuth Callback] State mismatch!')
        return NextResponse.redirect(new URL('/signup?error=invalid_state', baseUrl))
      }

      // Exchange code for token
      console.log('[OAuth Callback] Exchanging code for token...')
      const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.NEXT_PUBLIC_API_URL 
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/x/callback`
            : 'http://localhost:3000/api/auth/x/callback',
          code_verifier: 'challenge'
        })
      })

      console.log('[OAuth Callback] Token response status:', tokenResponse.status)
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('[OAuth Callback] Token exchange failed:', errorText)
        throw new Error(`Failed to exchange code for token: ${errorText}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('[OAuth Callback] Got access token:', tokenData.access_token ? 'yes' : 'no')

      // Fetch user info
      console.log('[OAuth Callback] Fetching user info...')
      const userResponse = await fetch(TWITTER_USER_URL, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })

      console.log('[OAuth Callback] User info response status:', userResponse.status)
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('[OAuth Callback] User fetch failed:', errorText)
        throw new Error(`Failed to fetch user info: ${errorText}`)
      }

      const userJson = await userResponse.json()
      console.log('[OAuth Callback] User data:', userJson)
      userData = userJson.data
    }

    // Create or update user in database
    console.log('[OAuth Callback] Creating/updating user in database...')
    console.log('[OAuth Callback] User data:', {
      id: userData.id,
      username: userData.username,
      name: userData.name
    })
    
    const user = upsertUser({
      xId: userData.id,
      xUsername: userData.username,
      xName: userData.name,
      xProfileImage: userData.profile_image_url
    })
    
    console.log('[OAuth Callback] User created/updated:', user.id)

    // Generate secure session token
    const sessionToken = generateSessionToken()
    console.log('[OAuth Callback] Generated session token')
    
    updateUser(user.id, {
      sessionToken,
      sessionCreatedAt: Date.now()
    })
    
    console.log('[OAuth Callback] Session token saved to user')

    // Log successful OAuth callback
    logOAuthCallback(true, user.id, user.xUsername)
    
    // Check if user already has email/terms accepted (returning user)
    const redirectPath = user.email && user.termsAccepted
      ? (user.paid ? '/dashboard' : '/checkout')
      : '/signup/details'
    
    console.log('[OAuth Callback] Redirect path:', redirectPath)
    console.log('[OAuth Callback] User state:', {
      email: user.email ? 'present' : 'missing',
      termsAccepted: user.termsAccepted,
      paid: user.paid
    })
    
    const response = NextResponse.redirect(new URL(redirectPath, baseUrl))
    
    // Set secure session cookie
    response.cookies.set('user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict', // CSRF protection
      path: '/'
    })
    
    console.log('[OAuth Callback] Session cookie set')

    // Clear OAuth state
    response.cookies.delete('oauth_state')

    console.log('[OAuth Callback] Success! Redirecting to:', redirectPath)
    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    
    // Log failed OAuth callback
    logOAuthCallback(false, undefined, undefined, error instanceof Error ? error.message : 'Unknown error')
    
    // Use public URL for error redirect
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                    (process.env.NODE_ENV === 'production' 
                      ? 'https://clawdet.com' 
                      : 'http://localhost:3000')
    
    return NextResponse.redirect(
      new URL('/signup?error=oauth_failed', baseUrl)
    )
  }
}

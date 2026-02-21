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
  console.log('[X OAuth Callback] Request received')
  
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const isMock = searchParams.get('mock') === 'true'
  const error = searchParams.get('error')

  console.log('[X OAuth Callback] Code:', code ? 'present' : 'missing')
  console.log('[X OAuth Callback] State:', state)
  console.log('[X OAuth Callback] Mock:', isMock)
  console.log('[X OAuth Callback] Error:', error)
  console.log('[X OAuth Callback] Client ID configured:', !!TWITTER_CLIENT_ID)

  // Use public URL for redirects (fixes localhost:3002 redirect bug)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://clawdet.com' 
                    : 'http://localhost:3000')
  
  console.log('[X OAuth Callback] Base URL:', baseUrl)

  // Handle OAuth errors from Twitter
  if (error) {
    console.error('[X OAuth Callback] OAuth error from Twitter:', error)
    return NextResponse.redirect(new URL(`/signup?error=${error}`, baseUrl))
  }

  if (!code) {
    console.error('[X OAuth Callback] No code provided')
    return NextResponse.redirect(new URL('/signup?error=no_code', baseUrl))
  }

  try {
    console.log('[OAuth Callback] Received callback')
    console.log('[OAuth Callback] Code:', code ? 'present' : 'missing')
    console.log('[OAuth Callback] State:', state ? 'present' : 'missing')
    console.log('[OAuth Callback] Mock mode:', isMock)
    
    let userData: MockUser

    if (isMock || !TWITTER_CLIENT_ID) {
      console.log('[X OAuth Callback] Using mock mode')
      // Mock mode: Create a test user with auto-completed profile
      console.log('X OAuth Callback: Mock mode active - auto-completing signup')
      const timestamp = Date.now()
      userData = {
        id: 'mock_' + timestamp,
        username: 'testuser' + Math.floor(timestamp / 1000),
        name: 'Test User',
        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
      }
    } else {
      // Real OAuth flow
      console.log('[X OAuth Callback] Starting real OAuth flow')
      
      // Verify state (use x_state cookie for SHA256 PKCE flow)
      const storedState = request.cookies.get('x_state')?.value || request.cookies.get('oauth_state')?.value
      const codeVerifier = request.cookies.get('x_code_verifier')?.value
      
      console.log('[X OAuth Callback] Stored state:', storedState)
      console.log('[X OAuth Callback] Received state:', state)
      console.log('[X OAuth Callback] Code verifier:', codeVerifier ? 'present' : 'missing')
      
      if (state !== storedState) {
        console.error('[X OAuth Callback] State mismatch!')
        return NextResponse.redirect(new URL('/signup?error=invalid_state', baseUrl))
      }

      if (!codeVerifier) {
        console.error('[X OAuth Callback] No code verifier found - session may have expired')
        return NextResponse.redirect(new URL('/signup?error=session_expired', baseUrl))
      }

      console.log('[X OAuth Callback] State verified, exchanging code for token')

      // Exchange code for token using proper PKCE verifier
      const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL 
            ? `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL}/api/auth/x/callback`
            : 'http://localhost:3000/api/auth/x/callback',
          code_verifier: codeVerifier
        })
      })

      console.log('[OAuth Callback] Token response status:', tokenResponse.status)
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('[X OAuth Callback] Token exchange failed:', tokenResponse.status, errorText)
        throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`)
      }

      const tokenData = await tokenResponse.json()
      console.log('[X OAuth Callback] Token received, access_token:', tokenData.access_token ? 'present' : 'missing')
      const { access_token } = tokenData

      // Fetch user info
      console.log('[X OAuth Callback] Fetching user info from Twitter API')
      const userResponse = await fetch(TWITTER_USER_URL, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })

      console.log('[OAuth Callback] User info response status:', userResponse.status)
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('[X OAuth Callback] User info fetch failed:', userResponse.status, errorText)
        throw new Error(`Failed to fetch user info: ${userResponse.status}`)
      }

      const userData_response = await userResponse.json()
      console.log('[X OAuth Callback] User data received:', JSON.stringify(userData_response, null, 2))
      const { data } = userData_response
      userData = data
    }

    console.log('[X OAuth Callback] User data:', JSON.stringify(userData, null, 2))

    // Create or update user in database
    console.log('[X OAuth Callback] Creating/updating user in database')
    
    // In mock mode, auto-complete profile to skip /signup/details
    const isMockUser = userData.id.startsWith('mock_')
    console.log('[X OAuth Callback] Is mock user:', isMockUser)
    
    const user = upsertUser({
      xId: userData.id,
      xUsername: userData.username,
      xName: userData.name,
      xProfileImage: userData.profile_image_url,
      // Auto-complete for mock users
      ...(isMockUser && {
        email: `${userData.username}@test.clawdet.com`,
        termsAccepted: true
      })
    })
    
    console.log('[OAuth Callback] User created/updated:', user.id)

    console.log('[X OAuth Callback] User upserted:', user.id)

    // Generate secure session token
    const sessionToken = generateSessionToken()
    console.log('[X OAuth Callback] Session token generated')
    
    updateUser(user.id, {
      sessionToken,
      sessionCreatedAt: Date.now()
    })
    
    console.log('[OAuth Callback] Session token saved to user')

    console.log('[X OAuth Callback] User session updated')

    // Check if user already has email/terms accepted (returning user)
    const redirectPath = user.email && user.termsAccepted
      ? (user.paid ? '/dashboard' : '/checkout')
      : '/signup/details'
    
    console.log('[X OAuth Callback] Redirecting to:', redirectPath)
    console.log('[X OAuth Callback] User email:', user.email)
    console.log('[X OAuth Callback] User terms accepted:', user.termsAccepted)
    console.log('[X OAuth Callback] User paid:', user.paid)
    
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

    console.log('[X OAuth Callback] Session cookie set')

    // Clear OAuth state and PKCE verifier cookies
    response.cookies.delete('oauth_state')
    response.cookies.delete('x_state')
    response.cookies.delete('x_code_verifier')

    console.log('[X OAuth Callback] OAuth flow complete, returning redirect')
    return response
  } catch (error) {
    console.error('[X OAuth Callback] Caught error:', error)
    console.error('[X OAuth Callback] Error stack:', error instanceof Error ? error.stack : 'N/A')
    
    // Log failed OAuth callback
    logOAuthCallback(false, undefined, undefined, error instanceof Error ? error.message : 'Unknown error')
    
    // Use public URL for error redirect
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                    (process.env.NODE_ENV === 'production' 
                      ? 'https://clawdet.com' 
                      : 'http://localhost:3000')
    
    console.error('[X OAuth Callback] Redirecting to error page')
    
    return NextResponse.redirect(
      new URL('/signup?error=oauth_failed', baseUrl)
    )
  }
}

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
    let userData: MockUser

    if (isMock || !TWITTER_CLIENT_ID) {
      // Mock mode: Create a test user
      console.log('X OAuth Callback: Mock mode active')
      userData = {
        id: 'mock_' + Date.now(),
        username: 'testuser',
        name: 'Test User',
        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
      }
    } else {
      // Real OAuth flow
      // Verify state
      const storedState = request.cookies.get('oauth_state')?.value
      if (state !== storedState) {
        return NextResponse.redirect(new URL('/signup?error=invalid_state', baseUrl))
      }

      // Exchange code for token
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

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const { access_token } = await tokenResponse.json()

      // Fetch user info
      const userResponse = await fetch(TWITTER_USER_URL, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info')
      }

      const { data } = await userResponse.json()
      userData = data
    }

    // Create or update user in database
    const user = upsertUser({
      xId: userData.id,
      xUsername: userData.username,
      xName: userData.name,
      xProfileImage: userData.profile_image_url
    })

    // Generate secure session token
    const sessionToken = generateSessionToken()
    updateUser(user.id, {
      sessionToken,
      sessionCreatedAt: Date.now()
    })

    // Log successful OAuth callback
    logOAuthCallback(true, user.id, user.xUsername)
    
    // Check if user already has email/terms accepted (returning user)
    const redirectPath = user.email && user.termsAccepted
      ? (user.paid ? '/dashboard' : '/checkout')
      : '/signup/details'
    
    const response = NextResponse.redirect(new URL(redirectPath, baseUrl))
    
    // Set secure session cookie
    response.cookies.set('user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict', // CSRF protection
      path: '/'
    })

    // Clear OAuth state
    response.cookies.delete('oauth_state')

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

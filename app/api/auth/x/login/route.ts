import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, SECURITY_HEADERS } from '@/lib/security'
import crypto from 'crypto'

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET
const TWITTER_AUTHORIZE_URL = 'https://twitter.com/i/oauth2/authorize'
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://clawdet.com'
const REDIRECT_URI = `${PUBLIC_BASE_URL}/api/auth/x/callback`

// Helper function to build OAuth URL with proper PKCE SHA256
function buildOAuthUrl(): { url: string; state: string; codeVerifier: string } {
  // If no OAuth credentials, use mock mode
  if (!TWITTER_CLIENT_ID) {
    const mockCallbackUrl = new URL('/api/auth/x/callback', PUBLIC_BASE_URL)
    mockCallbackUrl.searchParams.set('mock', 'true')
    mockCallbackUrl.searchParams.set('code', 'mock_auth_code_' + Date.now())
    mockCallbackUrl.searchParams.set('state', 'mock_state')
    
    return { url: mockCallbackUrl.toString(), state: 'mock_state', codeVerifier: 'mock' }
  }

  // Generate PKCE with SHA256 (proper security, matches ClawX implementation)
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const state = crypto.randomBytes(16).toString('hex')

  // Build OAuth URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })

  const authUrl = `${TWITTER_AUTHORIZE_URL}?${params}`
  return { url: authUrl, state, codeVerifier }
}

// POST endpoint for API-based flows (returns JSON)
export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per minute per IP
  const clientIP = getClientIP(request.headers)
  const rateLimit = checkRateLimit(`auth-login:${clientIP}`, { maxRequests: 5, windowMs: 60000 })
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { 
        status: 429,
        headers: {
          ...SECURITY_HEADERS,
          'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
        }
      }
    )
  }

  try {
    const { url, state } = buildOAuthUrl()
    
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
  console.log('[X OAuth] === AUTHORIZE START ===')
  console.log('[X OAuth] Client ID:', TWITTER_CLIENT_ID ? `${TWITTER_CLIENT_ID.substring(0, 10)}...` : 'NOT SET')
  console.log('[X OAuth] Client Secret configured:', TWITTER_CLIENT_SECRET ? 'YES' : 'NO')
  console.log('[X OAuth] App URL:', PUBLIC_BASE_URL)
  console.log('[X OAuth] Redirect URI:', REDIRECT_URI)
  
  // Rate limiting: 5 requests per minute per IP
  const clientIP = getClientIP(request.headers)
  const rateLimit = checkRateLimit(`auth-login:${clientIP}`, { maxRequests: 5, windowMs: 60000 })
  
  if (!rateLimit.allowed) {
    console.log('[X OAuth] Rate limited:', clientIP)
    return new NextResponse('Too many login attempts. Please try again later.', {
      status: 429,
      headers: {
        ...SECURITY_HEADERS,
        'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
      }
    })
  }

  try {
    const { url, state, codeVerifier } = buildOAuthUrl()
    console.log('[X OAuth] Generated state:', state)
    console.log('[X OAuth] PKCE code_challenge generated (SHA256)')
    console.log('[X OAuth] Redirecting to X authorization URL')
    
    const response = NextResponse.redirect(url)
    
    // Store PKCE verifier and state in cookies (unless mock mode)
    if (TWITTER_CLIENT_ID) {
      response.cookies.set('x_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600 // 10 minutes
      })
      response.cookies.set('x_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600
      })
      console.log('[X OAuth] Cookies set: x_code_verifier, x_state')
    } else {
      console.log('[X OAuth] Mock mode - no cookies set')
    }

    return response
  } catch (error) {
    console.error('[X OAuth] Error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}

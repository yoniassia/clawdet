import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CLIENT_ID = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID || ''
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET || ''
const REDIRECT_URI = 'https://clawdet.com/api/x-auth/callback'

// Import the verifier from the parent module — we need a shared store
// Using a file-based approach for reliability across serverless invocations
const VERIFIER_PATH = path.join(process.cwd(), 'data', 'x-pkce-verifier.txt')

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')
  
  if (error) {
    return new NextResponse(`<html><body><h1>X Authorization Failed</h1><p>${error}</p></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    })
  }
  
  if (!code) {
    return new NextResponse('Missing authorization code', { status: 400 })
  }
  
  // Read PKCE verifier
  let codeVerifier = ''
  try {
    codeVerifier = fs.readFileSync(VERIFIER_PATH, 'utf8').trim()
  } catch {
    return new NextResponse('PKCE verifier not found. Try again from /api/x-auth', { status: 400 })
  }
  
  // Exchange code for tokens
  try {
    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }).toString(),
    })
    
    const tokens = await tokenResponse.json()
    
    if (tokens.error) {
      return new NextResponse(`<html><body><h1>Token Exchange Failed</h1><pre>${JSON.stringify(tokens, null, 2)}</pre></body></html>`, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
    
    // Save tokens
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_in: tokens.expires_in,
      saved_at: new Date().toISOString(),
    }
    
    const tokenDir = path.join(process.cwd(), 'data')
    fs.mkdirSync(tokenDir, { recursive: true })
    fs.writeFileSync(
      path.join(tokenDir, 'x-oauth-tokens.json'),
      JSON.stringify(tokenData, null, 2)
    )
    
    // Clean up verifier
    try { fs.unlinkSync(VERIFIER_PATH) } catch {}
    
    return new NextResponse(`
      <html><body style="font-family:system-ui;text-align:center;padding:60px">
        <h1>✅ X Posting Authorized!</h1>
        <p>Clawdet can now post to X on your behalf.</p>
        <p style="color:#666">You can close this tab.</p>
        <a href="/dashboard" style="color:#1d9bf0">Go to Dashboard</a>
      </body></html>
    `, { headers: { 'Content-Type': 'text/html' } })
  } catch (err: any) {
    return new NextResponse(`<html><body><h1>Error</h1><pre>${err.message}</pre></body></html>`, {
      headers: { 'Content-Type': 'text/html' },
    })
  }
}

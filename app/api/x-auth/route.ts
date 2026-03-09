import { NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const CLIENT_ID = process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID || ''
const REDIRECT_URI = 'https://clawdet.com/api/x-auth/callback'
const SCOPES = 'users.read tweet.read tweet.write offline.access'
const VERIFIER_PATH = path.join(process.cwd(), 'data', 'x-pkce-verifier.txt')

export const dynamic = 'force-dynamic'

export async function GET() {
  // Generate PKCE
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const state = crypto.randomBytes(16).toString('hex')
  
  // Save verifier for the callback
  const tokenDir = path.join(process.cwd(), 'data')
  fs.mkdirSync(tokenDir, { recursive: true })
  fs.writeFileSync(VERIFIER_PATH, codeVerifier)
  
  const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('scope', SCOPES)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  
  return NextResponse.redirect(authUrl.toString())
}

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tokenPath = path.join(process.cwd(), 'data', 'x-oauth-tokens.json')
    const exists = fs.existsSync(tokenPath)
    if (exists) {
      const data = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
      return NextResponse.json({ 
        hasTokens: true, 
        savedAt: data.saved_at,
        scope: data.scope 
      })
    }
    return NextResponse.json({ hasTokens: false })
  } catch {
    return NextResponse.json({ hasTokens: false })
  }
}

export const dynamic = "force-dynamic"
/**
 * POST /api/agents/telegram — Connect Telegram bot to user's agent
 * 
 * Takes a bot token from @BotFather, rebuilds the container with
 * the telegram-enabled image (nanoclaw-telegram), and restarts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { findUserById } from '@/lib/sqlite'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const FLEET_DIR = process.env.FLEET_DIR || '/root/nanoclaw-fleet'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { botToken } = await req.json()

    if (!botToken || !botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      return NextResponse.json({ error: 'Invalid bot token format. Get one from @BotFather on Telegram.' }, { status: 400 })
    }

    // Validate token with Telegram API
    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const meData = await meRes.json() as any
    if (!meData.ok) {
      return NextResponse.json({ error: 'Invalid bot token — Telegram rejected it.' }, { status: 400 })
    }
    const botUsername = meData.result.username
    const botName = meData.result.first_name

    // Find user's agent
    const user = findUserById(authResult.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const username = user.x_username || user.email?.split('@')[0] || user.id
    const subdomain = username.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const containerName = `nano-${subdomain}`
    const agentDir = path.join(FLEET_DIR, 'agents', subdomain)

    if (!fs.existsSync(agentDir)) {
      return NextResponse.json({ error: 'Agent not found. Deploy your agent first.' }, { status: 404 })
    }

    // Read existing meta
    const metaPath = path.join(agentDir, '.agent-meta.json')
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    const gatewayToken = fs.readFileSync(path.join(agentDir, '.gateway-token'), 'utf8').trim()

    // Check if nanoclaw-telegram image exists, if not build it
    try {
      execSync('docker image inspect nanoclaw-telegram >/dev/null 2>&1')
    } catch {
      return NextResponse.json({ error: 'Telegram image not available. Contact admin.' }, { status: 500 })
    }

    // Stop and remove current container
    try {
      execSync(`docker stop ${containerName} 2>/dev/null; docker rm ${containerName} 2>/dev/null`)
    } catch {}

    // Start with telegram-enabled image
    const port = meta.port
    const cmd = [
      'docker run -d',
      `--name ${containerName}`,
      `-p ${port}:18789`,
      `--memory=128m --cpus=0.25`,
      `--restart=unless-stopped`,
      `-e ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}`,
      `-e GATEWAY_TOKEN=${gatewayToken}`,
      `-e AI_MODEL=${meta.model || 'claude-sonnet-4-5'}`,
      `-e TELEGRAM_BOT_TOKEN=${botToken}`,
      `-v ${agentDir}:/app/workspace`,
      `--label clawdet.fleet=true`,
      `--label clawdet.user=${subdomain}`,
      `nanoclaw-telegram`
    ].join(' ')

    execSync(cmd)

    // Update meta
    meta.telegram = true
    meta.telegramBot = `@${botUsername}`
    meta.telegramBotName = botName
    meta.image = 'nanoclaw-telegram'
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), { mode: 0o600 })

    return NextResponse.json({
      success: true,
      bot: {
        username: `@${botUsername}`,
        name: botName,
        link: `https://t.me/${botUsername}`
      },
      message: `Telegram bot @${botUsername} connected! Send it a message.`
    })

  } catch (error: any) {
    console.error('[TELEGRAM] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

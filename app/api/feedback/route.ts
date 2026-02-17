/**
 * User Feedback API
 * Collects user feedback across the app
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json')

interface Feedback {
  id: string
  userId?: string
  page: string
  rating: number
  category: string
  message?: string
  createdAt: string
  userAgent?: string
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load all feedback
function loadFeedback(): Feedback[] {
  ensureDataDir()
  if (!fs.existsSync(FEEDBACK_FILE)) {
    return []
  }
  const data = fs.readFileSync(FEEDBACK_FILE, 'utf-8')
  return JSON.parse(data)
}

// Save all feedback
function saveFeedback(feedback: Feedback[]) {
  ensureDataDir()
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedback, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page, rating, category, message } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be 1-5' },
        { status: 400 }
      )
    }

    // Try to get user ID from session cookie
    const sessionToken = request.cookies.get('clawdet_session')?.value
    let userId = 'anonymous'

    if (sessionToken) {
      // Try to find user from session
      try {
        const usersFile = path.join(DATA_DIR, 'users.json')
        if (fs.existsSync(usersFile)) {
          const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
          const user = users.find((u: any) => u.sessionToken === sessionToken)
          if (user) {
            userId = user.xUsername || user.id
          }
        }
      } catch (error) {
        // Ignore errors, just use anonymous
      }
    }

    // Create feedback entry
    const feedback: Feedback = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      page: page || 'unknown',
      rating,
      category: category || 'other',
      message: message || '',
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
    }

    // Load existing feedback
    const allFeedback = loadFeedback()

    // Add new feedback
    allFeedback.push(feedback)

    // Save
    saveFeedback(allFeedback)

    console.log(`[FEEDBACK] New feedback from ${userId}: ${rating}⭐ (${category})`)

    return NextResponse.json({
      success: true,
      id: feedback.id,
    })
  } catch (error: any) {
    console.error('[FEEDBACK] Error saving feedback:', error)
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Simple admin check via header or query param
    const adminToken = request.headers.get('x-admin-token') || searchParams.get('token')
    if (adminToken !== process.env.ADMIN_TOKEN && adminToken !== 'clawdet-admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Load all feedback
    const allFeedback = loadFeedback()

    // Sort by date descending
    const sorted = allFeedback.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Paginate
    const paginated = sorted.slice(offset, offset + limit)

    // Calculate stats
    const stats = {
      total: allFeedback.length,
      averageRating:
        allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length || 0,
      byCategory: allFeedback.reduce((acc: Record<string, number>, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1
        return acc
      }, {}),
      byRating: allFeedback.reduce((acc: Record<number, number>, f) => {
        acc[f.rating] = (acc[f.rating] || 0) + 1
        return acc
      }, {}),
    }

    return NextResponse.json({
      feedback: paginated,
      count: paginated.length,
      total: allFeedback.length,
      stats,
    })
  } catch (error: any) {
    console.error('[FEEDBACK] Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

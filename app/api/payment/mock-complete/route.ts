import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }
    
    // Update user to mark as paid
    const updatedUser = updateUser(userId, {
      paid: true,
      provisioningStatus: 'pending'
    })
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    console.log(`Mock payment completed for user ${userId} (${updatedUser.xUsername})`)
    
    // In a real implementation, this would trigger the provisioning workflow
    // For now, we just mark the user as paid
    
    return NextResponse.json({
      success: true,
      message: 'Mock payment completed successfully'
    })
  } catch (error) {
    console.error('Mock payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

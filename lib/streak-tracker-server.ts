// Server-side streak tracking utility functions (Admin SDK)
import { adminDb } from './firebase.admin'
import { FieldValue } from 'firebase-admin/firestore'

export interface UserActivity {
  userId: string
  date: string // YYYY-MM-DD format
  activities: string[] // e.g., ['quiz_completed', 'task_completed', 'login']
  createdAt: FirebaseFirestore.Timestamp
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
}

/**
 * Log user activity for streak tracking (server-side only)
 */
export async function logUserActivity(
  userId: string, 
  activityType: string
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const activityRef = adminDb
      .collection('userActivities')
      .doc(`${userId}_${today}`)
    
    const existingActivity = await activityRef.get()
    
    if (existingActivity.exists) {
      // Add to existing activities for today
      const data = existingActivity.data() as UserActivity
      const activities = data.activities || []
      
      if (!activities.includes(activityType)) {
        await activityRef.update({
          activities: FieldValue.arrayUnion(activityType),
          updatedAt: FieldValue.serverTimestamp()
        })
      }
    } else {
      // Create new activity record for today
      await activityRef.set({
        userId,
        date: today,
        activities: [activityType],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Failed to log user activity:', error)
    // Don't throw - activity logging shouldn't break the main flow
  }
}

/**
 * Calculate current streak based on daily activities (server-side only)
 */
export async function calculateStreakFromActivities(userId: string): Promise<StreakData> {
  try {
    const today = new Date()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastActivityDate: string | null = null
    
    // Look back up to 30 days
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const activityDoc = await adminDb
        .collection('userActivities')
        .doc(`${userId}_${dateStr}`)
        .get()
      
      if (activityDoc.exists) {
        const data = activityDoc.data() as UserActivity
        if (data.activities && data.activities.length > 0) {
          tempStreak++
          if (!lastActivityDate) {
            lastActivityDate = dateStr
          }
          
          // Update current streak only for consecutive days from today
          if (i === 0 || currentStreak === i) {
            currentStreak = tempStreak
          }
        } else {
          // No activity this day
          if (currentStreak === tempStreak) {
            // End of current streak
            break
          }
          tempStreak = 0
        }
      } else {
        // No activity record for this day
        if (currentStreak === tempStreak) {
          // End of current streak
          break
        }
        tempStreak = 0
      }
      
      // Update longest streak
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    }
    
    return {
      currentStreak,
      longestStreak,
      lastActivityDate
    }
  } catch (error) {
    console.error('Failed to calculate streak from activities:', error)
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null
    }
  }
}

/**
 * Activity types for streak tracking
 */
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  QUIZ_COMPLETED: 'quiz_completed',
  TASK_COMPLETED: 'task_completed',
  TASK_STARTED: 'task_started',
  CAREER_EXPLORED: 'career_explored',
  COACH_INTERACTION: 'coach_interaction'
} as const

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES]

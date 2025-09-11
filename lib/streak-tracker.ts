// Client-safe streak calculation utility functions
// (No Firebase Admin SDK imports - safe for browser/client-side code)

/**
 * Calculate streak based on user creation date and activity
 * This is a client-safe function that doesn't require Firebase Admin SDK
 */
export function calculateUserStreak(
  createdAt: Date, 
  hasCompletedQuiz: boolean = false, 
  completedTasks: number = 0,
  lastActivityDate?: string
): number {
  try {
    // Validate inputs
    if (!createdAt || isNaN(createdAt.getTime())) {
      console.error('Invalid createdAt date:', createdAt)
      return 0
    }
    
    const today = new Date()
    const createdDate = new Date(createdAt)
    const daysSinceCreation = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Validate calculation
    if (isNaN(daysSinceCreation)) {
      console.error('Invalid daysSinceCreation calculation')
      return 0
    }
  
  // For brand new users (created today)
  if (daysSinceCreation === 0) {
    // Show 1 day streak if they've done something meaningful, 0 otherwise
    return (hasCompletedQuiz || completedTasks > 0) ? 1 : 0
  }
  
  // For users without proper activity tracking yet, use a simple heuristic
  if (!lastActivityDate) {
    // Show streak based on engagement and recency
    const hasEngaged = hasCompletedQuiz || completedTasks > 0
    if (!hasEngaged) return 0
    
    // For engaged users, show a reasonable streak up to 7 days
    return Math.min(daysSinceCreation + 1, 7)
  }
  
  // Calculate based on last activity date
  const lastActivity = new Date(lastActivityDate)
  const daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
  
  // If last activity was today or yesterday, maintain some streak
  if (daysSinceLastActivity <= 1) {
    return Math.min(daysSinceCreation + 1, 30) // Cap at 30 days
  }
  
  // If it's been more than 1 day since last activity, streak is broken
  return 0
  } catch (error) {
    console.error('Error in calculateUserStreak:', error)
    return 0
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

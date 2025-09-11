// Firestore document type definitions

export interface UserDoc {
  id: string
  uid: string // Firebase Auth UID, required by security rules
  name: string
  email: string
  createdAt: Date
  onboardingCompleted?: boolean
  quiz?: QuizData
  careerMatches?: CareerMatch[]
  learningProgress?: LearningProgress[]
  jobApplications?: JobApplication[]
  interactionHistory?: InteractionHistory
  notificationSettings?: NotificationSettings
}

export interface QuizData {
  answers: Record<string, string> // questionId -> answer value
  completedAt: Date
  careerCluster?: string // computed cluster based on answers
}

export interface QuizResponse {
  userId: string
  answers: Record<string, string>
  completedAt: Date
}

export interface CareerMatch {
  careerId: string
  score: number // percentage match
  matchedAt: Date
}

export interface LearningProgress {
  taskId: string
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: Date
  completedAt?: Date
  lastUpdatedAt: Date
}

export interface JobApplication {
  jobTitle: string
  company: string
  location: string
  applicationLink: string
  dateApplied: Date
}

export interface InteractionHistory {
  coachMessageCount: number
  jobSearchCount: number
  lastActiveAt: Date
}

export interface NotificationSettings {
  weeklyReminders: boolean
  emailNotifications: boolean
  reminderDayOfWeek?: number // 0-6, Sunday-Saturday
}

// Career collection
export interface CareerDoc {
  id: string
  name: string
  description: string
  requiredSkills: string[]
  learningResources: LearningResource[]
  jobSearchPrompts: string[]
  careerCluster: string
}

export interface LearningResource {
  title: string
  url: string
  type: 'course' | 'article' | 'video' | 'certificate'
  provider: string // e.g., Coursera, YouTube, Google
  isFree: boolean
}

// Learning task collection
export interface LearningTaskDoc {
  id: string
  careerId: string
  title: string
  description: string
  resourceLink: string
  estimatedHours?: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  order: number // for sequencing tasks
}

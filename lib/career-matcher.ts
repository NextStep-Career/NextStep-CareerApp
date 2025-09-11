// Career matching algorithm based on quiz responses
import { CareerMatch } from './types/firestore'

// Quiz answer mapping to career clusters
const ANSWER_WEIGHTS = {
  // Q1: Work environment
  'collaborative': { business: 2, creative: 1, technical: 0, analytical: 0 },
  'independent': { technical: 2, analytical: 2, creative: 1, business: 0 },
  'structured': { analytical: 2, business: 1, technical: 1, creative: 0 },
  'dynamic': { business: 2, creative: 2, technical: 0, analytical: 0 },
  
  // Q2: Activities
  'problem-solving': { technical: 3, analytical: 2, business: 1, creative: 0 },
  'creative': { creative: 3, business: 1, technical: 0, analytical: 0 },
  'helping': { business: 2, creative: 1, technical: 0, analytical: 0 },
  'analyzing': { analytical: 3, technical: 1, business: 1, creative: 0 },
  
  // Q3: Motivation
  'impact': { business: 2, creative: 2, technical: 1, analytical: 1 },
  'growth': { technical: 2, analytical: 1, creative: 1, business: 1 },
  'recognition': { business: 2, creative: 1, technical: 1, analytical: 1 },
  'stability': { analytical: 2, technical: 1, business: 1, creative: 0 },
  
  // Q4: Communication
  'visual': { creative: 3, business: 1, technical: 0, analytical: 0 },
  'written': { analytical: 2, technical: 1, business: 1, creative: 0 },
  'verbal': { business: 3, creative: 1, technical: 0, analytical: 0 },
  'digital': { technical: 2, creative: 1, business: 1, analytical: 1 },
  
  // Q5: Challenges
  'technical': { technical: 3, analytical: 2, business: 0, creative: 0 },
  'interpersonal': { business: 3, creative: 1, technical: 0, analytical: 0 },
  'strategic': { business: 3, analytical: 2, technical: 0, creative: 0 },
  'creative': { creative: 3, business: 1, technical: 0, analytical: 0 },
}

// Map career clusters to career IDs
const CLUSTER_TO_CAREERS = {
  technical: 'software-developer',
  creative: 'ux-designer',
  analytical: 'data-analyst',
  business: 'product-manager',
}

export function calculateCareerMatches(quizAnswers: Record<string, string>): CareerMatch[] {
  // Calculate cluster scores
  const clusterScores = {
    technical: 0,
    creative: 0,
    analytical: 0,
    business: 0,
  }

  // Sum up weights from each answer
  Object.values(quizAnswers).forEach(answer => {
    const weights = ANSWER_WEIGHTS[answer as keyof typeof ANSWER_WEIGHTS]
    if (weights) {
      Object.entries(weights).forEach(([cluster, weight]) => {
        clusterScores[cluster as keyof typeof clusterScores] += weight
      })
    }
  })

  // Convert to career matches with percentages
  const maxScore = Math.max(...Object.values(clusterScores))
  const matches: CareerMatch[] = []

  Object.entries(clusterScores).forEach(([cluster, score]) => {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    
    // Only include careers with at least 60% match
    if (percentage >= 60) {
      matches.push({
        careerId: CLUSTER_TO_CAREERS[cluster as keyof typeof CLUSTER_TO_CAREERS],
        score: percentage,
        matchedAt: new Date(),
      })
    }
  })

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score)

  // Ensure we have at least one match (fallback to highest score)
  if (matches.length === 0) {
    const topCluster = Object.entries(clusterScores)
      .sort(([,a], [,b]) => b - a)[0][0]
    
    matches.push({
      careerId: CLUSTER_TO_CAREERS[topCluster as keyof typeof CLUSTER_TO_CAREERS],
      score: 75, // Default score for fallback
      matchedAt: new Date(),
    })
  }

  return matches
}

export function getCareerCluster(quizAnswers: Record<string, string>): string {
  const matches = calculateCareerMatches(quizAnswers)
  if (matches.length === 0) return 'technical' // fallback
  
  // Get cluster from top match
  const topCareerId = matches[0].careerId
  const cluster = Object.entries(CLUSTER_TO_CAREERS)
    .find(([_, careerId]) => careerId === topCareerId)?.[0]
  
  return cluster || 'technical'
}

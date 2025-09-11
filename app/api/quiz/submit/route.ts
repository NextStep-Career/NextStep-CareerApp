import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase.admin'
import { calculateCareerMatches } from '@/lib/career-matcher'
import { QuizResponse } from '@/lib/types/firestore'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    // Get the ID token from the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    
    // Verify the ID token with Firebase Admin
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid

    // Get quiz answers from request body
    const body = await request.json()
    const { answers } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid quiz answers' }, { status: 400 })
    }

    // Create quiz response document
    const quizResponse: Omit<QuizResponse, 'completedAt'> = {
      userId,
      answers,
    }

    const quizRef = await adminDb.collection('quizResponses').add({
      ...quizResponse,
      completedAt: FieldValue.serverTimestamp(),
    })

    // Calculate career matches
    const careerMatches = calculateCareerMatches(answers)

    // Delete existing career matches for this user
    const existingMatchesSnapshot = await adminDb
      .collection('careerMatches')
      .where('userId', '==', userId)
      .get()
    
    // Save career matches
    const batch = adminDb.batch()
    
    // Delete old matches
    existingMatchesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    for (const match of careerMatches) {
      const careerMatchDoc = {
        userId,
        careerId: match.careerId,
        score: match.score,
        quizResponseId: quizRef.id,
        matchedAt: FieldValue.serverTimestamp(),
      }
      
      const matchRef = adminDb.collection('careerMatches').doc()
      batch.set(matchRef, careerMatchDoc)
    }

    // Update user profile to mark onboarding as completed and add quiz data
    const userRef = adminDb.collection('users').doc(userId)
    batch.update(userRef, {
      onboardingCompleted: true,
      updatedAt: FieldValue.serverTimestamp(),
      lastQuizResponseId: quizRef.id,
      quiz: {
        answers: answers,
        completedAt: FieldValue.serverTimestamp(),
        careerCluster: careerMatches[0]?.careerId || 'technical'
      }
    })

    // Commit all changes
    await batch.commit()

    // Return the career matches
    return NextResponse.json({
      success: true,
      quizResponseId: quizRef.id,
      careerMatches: careerMatches.map(match => ({
        careerId: match.careerId,
        score: match.score,
      })),
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}

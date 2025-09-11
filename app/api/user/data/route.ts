import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase.admin'

export async function GET(request: NextRequest) {
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

    // Fetch user profile
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()

    // Fetch career matches
    const careerMatchesSnapshot = await adminDb
      .collection('careerMatches')
      .where('userId', '==', userId)
      .orderBy('score', 'desc')
      .limit(5)
      .get()

    // Default career data
    const defaultCareers = {
      'software-developer': {
        name: 'Software Developer',
        title: 'Software Developer', // Keep title for backwards compatibility
        description: 'Build applications and systems using various programming languages',
        requiredSkills: ['Problem Solving', 'Logical Thinking', 'Technical Skills']
      },
      'ux-designer': {
        name: 'UX Designer',
        title: 'UX Designer', // Keep title for backwards compatibility
        description: 'Design user-friendly interfaces and improve user experiences',
        requiredSkills: ['Creativity', 'Empathy', 'Visual Design']
      },
      'data-analyst': {
        name: 'Data Analyst',
        title: 'Data Analyst', // Keep title for backwards compatibility
        description: 'Analyze data to help organizations make informed decisions',
        requiredSkills: ['Analytical Thinking', 'Statistics', 'Data Visualization']
      },
      'product-manager': {
        name: 'Product Manager',
        title: 'Product Manager', // Keep title for backwards compatibility
        description: 'Guide product development from conception to launch',
        requiredSkills: ['Strategic Thinking', 'Communication', 'Leadership']
      }
    }

    const careerMatches = await Promise.all(
      careerMatchesSnapshot.docs.map(async (doc) => {
        const matchData = doc.data()
        // Try to fetch career details from collection, fallback to defaults
        let careerData = null
        try {
          const careerDoc = await adminDb
            .collection('careers')
            .doc(matchData.careerId)
            .get()
          
          careerData = careerDoc.exists ? careerDoc.data() : null
        } catch (error) {
          console.log('Career collection not found, using defaults')
        }
        
        // Use default career data if not found in collection
        const career = careerData || defaultCareers[matchData.careerId as keyof typeof defaultCareers] || {
          name: 'Unknown Career',
          title: 'Unknown Career', // Keep title for backwards compatibility
          description: 'Career information not available',
          requiredSkills: []
        }
        
        // Ensure both name and title fields exist for compatibility
        if (career && career.name && !career.title) {
          career.title = career.name
        } else if (career && career.title && !career.name) {
          career.name = career.title
        }
        
        return {
          id: doc.id,
          ...matchData,
          career,
        }
      })
    )

    // Fetch learning progress
    const progressSnapshot = await adminDb
      .collection('userProgress')
      .where('userId', '==', userId)
      .get()

    const progress = progressSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch recent quiz response
    const quizResponseSnapshot = await adminDb
      .collection('quizResponses')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(1)
      .get()

    const latestQuizResponse = !quizResponseSnapshot.empty
      ? {
          id: quizResponseSnapshot.docs[0].id,
          ...quizResponseSnapshot.docs[0].data(),
        }
      : null

    // Calculate overall progress
    const totalTasks = await adminDb.collection('learningTasks').count().get()
    const completedTasks = progress.filter(p => p.completed).length
    const overallProgress = totalTasks.data().count > 0
      ? Math.round((completedTasks / totalTasks.data().count) * 100)
      : 0

    return NextResponse.json({
      user: {
        id: userId,
        ...userData,
      },
      careerMatches,
      progress,
      latestQuizResponse,
      stats: {
        totalTasks: totalTasks.data().count,
        completedTasks,
        overallProgress,
      },
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

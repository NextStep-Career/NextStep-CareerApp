import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase.admin'
import { FieldValue } from 'firebase-admin/firestore'

// GET: Fetch user's learning progress
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid

    // Get careerId from query params (optional filter)
    const { searchParams } = new URL(request.url)
    const careerId = searchParams.get('careerId')

    // Fetch all learning tasks
    let tasksQuery = adminDb.collection('learningTasks')
    if (careerId) {
      tasksQuery = tasksQuery.where('careerId', '==', careerId)
    }
    const tasksSnapshot = await tasksQuery.get()

    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch user's progress
    const progressSnapshot = await adminDb
      .collection('userProgress')
      .where('userId', '==', userId)
      .get()

    const progressMap = new Map()
    progressSnapshot.docs.forEach(doc => {
      const data = doc.data()
      progressMap.set(data.taskId, {
        id: doc.id,
        ...data,
      })
    })

    // Combine tasks with progress
    const tasksWithProgress = tasks.map(task => ({
      ...task,
      progress: progressMap.get(task.id) || {
        completed: false,
        progress: 0,
      },
    }))

    // Calculate stats
    const totalTasks = tasks.length
    const completedTasks = Array.from(progressMap.values()).filter(p => p.completed).length
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return NextResponse.json({
      tasks: tasksWithProgress,
      stats: {
        totalTasks,
        completedTasks,
        overallProgress,
      },
    })
  } catch (error) {
    console.error('Error fetching learning progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning progress' },
      { status: 500 }
    )
  }
}

// POST: Update learning progress for a specific task
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    
    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decodedToken.uid

    // Get task update data
    const { taskId, progress, completed, notes } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 })
    }

    // Verify task exists
    const taskDoc = await adminDb.collection('learningTasks').doc(taskId).get()
    if (!taskDoc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if progress record exists
    const progressQuery = await adminDb
      .collection('userProgress')
      .where('userId', '==', userId)
      .where('taskId', '==', taskId)
      .limit(1)
      .get()

    const progressData = {
      userId,
      taskId,
      progress,
      completed: completed || progress === 100,
      notes: notes || '',
      updatedAt: FieldValue.serverTimestamp(),
    }

    let progressId: string

    if (!progressQuery.empty) {
      // Update existing progress
      progressId = progressQuery.docs[0].id
      await adminDb.collection('userProgress').doc(progressId).update({
        ...progressData,
        ...(completed && { completedAt: FieldValue.serverTimestamp() }),
      })
    } else {
      // Create new progress record
      const newProgress = await adminDb.collection('userProgress').add({
        ...progressData,
        createdAt: FieldValue.serverTimestamp(),
        ...(completed && { completedAt: FieldValue.serverTimestamp() }),
      })
      progressId = newProgress.id
    }

    // If task is completed, check for achievements
    let achievement = null
    if (completed) {
      // Check if this is the first completed task
      const allProgress = await adminDb
        .collection('userProgress')
        .where('userId', '==', userId)
        .where('completed', '==', true)
        .get()

      if (allProgress.size === 1) {
        achievement = {
          type: 'first_task_completed',
          title: 'First Step!',
          description: 'You completed your first learning task',
        }
      } else if (allProgress.size === 5) {
        achievement = {
          type: 'five_tasks_completed',
          title: 'Making Progress!',
          description: 'You completed 5 learning tasks',
        }
      } else if (allProgress.size === 10) {
        achievement = {
          type: 'ten_tasks_completed',
          title: 'On Fire!',
          description: 'You completed 10 learning tasks',
        }
      }
    }

    return NextResponse.json({
      success: true,
      progressId,
      progress: {
        id: progressId,
        ...progressData,
        updatedAt: new Date(),
      },
      achievement,
    })
  } catch (error) {
    console.error('Error updating learning progress:', error)
    return NextResponse.json(
      { error: 'Failed to update learning progress' },
      { status: 500 }
    )
  }
}

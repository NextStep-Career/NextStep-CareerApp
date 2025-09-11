import * as admin from 'firebase-admin'
import { seedCareers, seedLearningTasks } from '../lib/data/seed-data'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Initialize Firebase Admin
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin SDK credentials in environment variables')
  }
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  })
}

const db = admin.firestore()

async function seedAllCareers() {
  console.log('🌱 Seeding careers...')
  const careersCollection = db.collection('careers')
  
  for (const career of seedCareers) {
    // Generate ID from career name
    const careerId = career.name.toLowerCase().replace(/\s+/g, '-')
    
    try {
      await careersCollection.doc(careerId).set({
        ...career,
        id: careerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log(`✅ Added career: ${career.name}`)
    } catch (error) {
      console.error(`❌ Error adding career ${career.name}:`, error)
    }
  }
}

async function _seedLearningTasksCollection() {
  console.log('🌱 Seeding learning tasks...')
  const tasksCollection = db.collection('learningTasks')
  
  for (const task of seedLearningTasks) {
    // Generate ID from task title
    const taskId = task.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')
    
    try {
      await tasksCollection.doc(taskId).set({
        ...task,
        id: taskId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log(`✅ Added task: ${task.title}`)
    } catch (error) {
      console.error(`❌ Error adding task ${task.title}:`, error)
    }
  }
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting Firestore seed...')
    
    // Seed careers
    await seedAllCareers()
    
    // Seed learning tasks
    await _seedLearningTasksCollection()
    
    console.log('✨ Seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seed
seedDatabase()

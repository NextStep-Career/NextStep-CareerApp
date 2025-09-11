import * as admin from 'firebase-admin'
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

async function cleanupDuplicateCareerMatches() {
  console.log('🧹 Starting cleanup of duplicate career matches...')
  
  try {
    // Get all career matches grouped by user
    const careerMatchesSnapshot = await db.collection('careerMatches').get()
    
    const userMatches: Record<string, any[]> = {}
    
    // Group matches by userId
    careerMatchesSnapshot.docs.forEach(doc => {
      const data = doc.data()
      const userId = data.userId
      
      if (!userMatches[userId]) {
        userMatches[userId] = []
      }
      
      userMatches[userId].push({
        id: doc.id,
        ...data,
        matchedAt: data.matchedAt?.toDate() || new Date()
      })
    })
    
    const batch = db.batch()
    let deleteCount = 0
    
    // For each user, keep only the most recent set of matches
    Object.entries(userMatches).forEach(([userId, matches]) => {
      // Sort by matchedAt descending (most recent first)
      matches.sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime())
      
      // Group by quiz response ID (if available) or just keep the latest unique careers
      const seenCareers = new Set<string>()
      const toDelete: string[] = []
      
      matches.forEach(match => {
        if (seenCareers.has(match.careerId)) {
          // This is a duplicate, mark for deletion
          toDelete.push(match.id)
        } else {
          seenCareers.add(match.careerId)
        }
      })
      
      // Delete duplicates
      toDelete.forEach(docId => {
        batch.delete(db.collection('careerMatches').doc(docId))
        deleteCount++
      })
      
      if (toDelete.length > 0) {
        console.log(`User ${userId}: Keeping ${seenCareers.size} unique matches, deleting ${toDelete.length} duplicates`)
      }
    })
    
    if (deleteCount > 0) {
      await batch.commit()
      console.log(`✅ Deleted ${deleteCount} duplicate career matches`)
    } else {
      console.log('✅ No duplicate career matches found')
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the cleanup
cleanupDuplicateCareerMatches()
  .then(() => {
    console.log('✨ Cleanup complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Cleanup failed:', error)
    process.exit(1)
  })

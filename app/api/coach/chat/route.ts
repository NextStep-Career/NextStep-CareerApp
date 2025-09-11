import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase.admin'
import { FieldValue } from 'firebase-admin/firestore'

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

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

    // Get user's career context
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()

    // Get user's career matches
    const careerMatchesSnapshot = await adminDb
      .collection('careerMatches')
      .where('userId', '==', userId)
      .orderBy('score', 'desc')
      .limit(3)
      .get()

    const careerMatches = await Promise.all(
      careerMatchesSnapshot.docs.map(async (doc) => {
        const matchData = doc.data()
        const careerDoc = await adminDb
          .collection('careers')
          .doc(matchData.careerId)
          .get()
        return {
          careerId: matchData.careerId,
          score: matchData.score,
          career: careerDoc.exists ? careerDoc.data() : null,
        }
      })
    )

    // Get the user's message
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Sanitize message
    const sanitizedMessage = message.trim().slice(0, 500)

    // Build context for AI
    const systemPrompt = `You are an AI Career Coach for NextStep, helping users navigate their career journey. 
The user has completed a personality quiz and their top career matches are:
${careerMatches.map(m => `- ${m.career?.title || m.careerId} (${m.score}% match)`).join('\n')}

Provide personalized, encouraging, and practical career guidance. Focus on:
1. Career exploration and skill development
2. Learning paths and resources
3. Interview preparation and job search strategies
4. Work-life balance and career growth
5. Industry trends and opportunities

Keep responses concise (under 300 words) and actionable. Be supportive and motivating.`

    // Get or create conversation history
    const conversationSnapshot = await adminDb
      .collection('coachConversations')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get()

    let conversationId: string
    let messages: Message[] = []

    if (!conversationSnapshot.empty) {
      conversationId = conversationSnapshot.docs[0].id
      const conversationData = conversationSnapshot.docs[0].data()
      messages = conversationData.messages || []
    } else {
      // Create new conversation
      const newConversation = await adminDb.collection('coachConversations').add({
        userId,
        messages: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      conversationId = newConversation.id
    }

    // Add user message to history
    messages.push({ role: 'user', content: sanitizedMessage })

    // Keep only last 10 messages for context
    const recentMessages = messages.slice(-10)

    // Call Perplexity API
    const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PPLX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages,
        ],
        max_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
      }),
    })

    if (!perplexityResponse.ok) {
      console.error('Perplexity API error:', await perplexityResponse.text())
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      )
    }

    const perplexityData = await perplexityResponse.json()
    const aiResponse = perplexityData.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.'

    // Add AI response to messages
    messages.push({ role: 'assistant', content: aiResponse })

    // Update conversation in Firestore
    await adminDb.collection('coachConversations').doc(conversationId).update({
      messages: messages,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      response: aiResponse,
      conversationId,
    })
  } catch (error) {
    console.error('Error in coach chat:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

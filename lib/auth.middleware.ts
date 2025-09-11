// Middleware to verify Firebase ID tokens in API routes
import { NextRequest } from 'next/server'
import { adminAuth } from './firebase.admin'
import { DecodedIdToken } from 'firebase-admin/auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedIdToken
}

export async function verifyIdToken(req: NextRequest): Promise<DecodedIdToken | null> {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const idToken = authHeader.split('Bearer ')[1]
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error('Error verifying ID token:', error)
    return null
  }
}

export function requireAuth(handler: (req: NextRequest, user: DecodedIdToken, params?: any) => Promise<Response>) {
  return async (req: NextRequest, params?: any) => {
    const user = await verifyIdToken(req)
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return handler(req, user, params)
  }
}

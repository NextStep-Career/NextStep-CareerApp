import { auth } from './firebase.client'

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

async function getAuthHeaders() {
  const user = auth.currentUser
  if (!user) {
    throw new ApiError(401, 'User not authenticated')
  }
  
  const token = await user.getIdToken()
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const headers = await getAuthHeaders()
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'API request failed', data)
    }
    
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error', error)
  }
}

// API endpoints
export const api = {
  quiz: {
    submit: async (answers: Record<string, string>) => 
      apiRequest('/api/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
  },
  
  user: {
    getData: async () => 
      apiRequest('/api/user/data'),
  },
  
  coach: {
    sendMessage: async (message: string) => 
      apiRequest('/api/coach/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },
  
  learning: {
    getProgress: async (careerId?: string) => {
      const url = careerId 
        ? `/api/learning/progress?careerId=${careerId}`
        : '/api/learning/progress'
      return apiRequest(url)
    },
    
    updateProgress: async (data: {
      taskId: string
      progress: number
      completed?: boolean
      notes?: string
    }) => 
      apiRequest('/api/learning/progress', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  
  jobs: {
    search: async (query: string) => 
      apiRequest('/api/jobs/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
    
    resolveApplyUrl: async (data: {
      title: string
      company: string
      sourceUrl: string
    }) => 
      apiRequest('/api/jobs/resolve-apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
}

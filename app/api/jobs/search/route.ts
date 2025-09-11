import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase.admin'

const PERPLEXITY_API_KEY = process.env.PPLX_API_KEY

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

    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    if (!PERPLEXITY_API_KEY) {
      console.error('Perplexity API key not configured')
      return NextResponse.json(
        { error: 'Job search service not configured' },
        { status: 500 }
      )
    }

    // Create a search prompt optimized for job listings
    const searchPrompt = `Find current job listings for: "${query}". 
    Return ONLY the job listings in this exact JSON format without any additional text:
    {
      "jobs": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "location": "Location or Remote",
          "description": "Brief job description",
          "type": "Full-time/Part-time/Contract/Internship",
          "experience": "Experience level required",
          "salary": "Salary range if available",
          "url": "Application URL"
        }
      ]
    }
    Include 5-10 relevant job listings. Focus on entry-level, junior, or internship positions if the query mentions those terms.`

    console.log('Calling Perplexity API with query:', query)
    
    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a job search assistant. Return only valid JSON with job listings.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        stream: false
      }),
    })

    if (!response.ok) {
      let errorMsg = `${response.status} ${response.statusText}`
      try {
        const errJson = await response.json()
        errorMsg = errJson?.error?.message || errJson?.message || JSON.stringify(errJson)
      } catch (_) {
        const errorText = await response.text()
        errorMsg = errorText
      }
      console.error('Perplexity API error:', errorMsg)
      // Return a non-failing response so UI can show the message
      return NextResponse.json({
        jobs: [],
        error: `Perplexity API error: ${errorMsg}`,
      }, { status: 200 })
    }

    const data = await response.json()
    
    // Extract the response content
    const content = data.choices?.[0]?.message?.content || ''
    
    // Try to parse the JSON response
    let jobs = []
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        jobs = parsed.jobs || []
      }
    } catch (parseError) {
      console.error('Failed to parse job listings:', parseError)
      // Fallback: return empty results rather than error
      jobs = []
    }

    // Ensure all jobs have required fields
    jobs = jobs.map((job: any) => ({
      title: job.title || 'Unknown Position',
      company: job.company || 'Company Not Listed',
      location: job.location || 'Location Not Specified',
      description: job.description || '',
      type: job.type || 'Not Specified',
      experience: job.experience || '',
      salary: job.salary || 'Not Disclosed',
      url: job.url || '#'
    }))

    return NextResponse.json({ 
      jobs,
      source: 'Perplexity AI'
    })

  } catch (error) {
    console.error('Job search error:', error)
    
    // Provide a helpful fallback response
    return NextResponse.json({
      jobs: [],
      error: 'Job search is temporarily unavailable. Please try searching on job boards like Indeed, LinkedIn, or AngelList.',
      fallbackSuggestions: [
        { name: 'Indeed', url: 'https://indeed.com' },
        { name: 'LinkedIn Jobs', url: 'https://linkedin.com/jobs' },
        { name: 'AngelList', url: 'https://angel.co/jobs' },
        { name: 'Glassdoor', url: 'https://glassdoor.com' }
      ]
    }, { status: 200 }) // Return 200 with error message to avoid breaking the UI
  }
}

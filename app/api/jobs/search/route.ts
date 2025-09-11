import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase.admin'
import { generateJobSearchLinks } from '@/lib/job-portals'

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

    // Create a search prompt optimized for Indian job listings
    const searchPrompt = `Find current job listings in India for: "${query}". 
    Return ONLY the job listings in this exact JSON format without any additional text:
    {
      "jobs": [
        {
          "title": "Job Title",
          "company": "Company Name",
          "location": "City, India or Remote",
          "description": "Brief job description",
          "type": "Full-time/Part-time/Contract/Internship",
          "experience": "Experience level required",
          "salary": "Salary range in INR if available",
          "url": "Direct application URL (not a search results page)",
          "source": "Job portal name (e.g., Naukri, LinkedIn, Indeed India)"
        }
      ]
    }
    Important:
    - Include 5-10 relevant job listings from Indian job portals like Naukri, LinkedIn, Indeed India, Shine, Monster India, etc.
    - Focus on entry-level, junior, or internship positions if the query mentions those terms.
    - Ensure the URLs are direct job listing pages, not search result pages.
    - All locations should be in India unless "remote" is specified.
    - Include actual company names, not generic placeholders.`

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

    // Validate and ensure all jobs have required fields
    jobs = jobs
      .filter((job: any) => {
        // Filter out jobs with invalid URLs
        if (!job.url || job.url === '#' || job.url.includes('/search?') || job.url.includes('/jobs?')) {
          console.log('Filtering out job with invalid URL:', job.title, job.url)
          return false
        }
        return true
      })
      .map((job: any) => ({
        title: job.title || 'Unknown Position',
        company: job.company || 'Company Not Listed',
        location: job.location || 'Location Not Specified',
        description: job.description || '',
        type: job.type || 'Not Specified',
        experience: job.experience || '',
        salary: job.salary || 'Not Disclosed',
        url: job.url || '#',
        source: job.source || 'Unknown',
        sourceUrl: job.url // Store original URL for resolver
      }))

    // If we have few or no valid jobs, include portal links
    const portalLinks = generateJobSearchLinks(query)
    
    return NextResponse.json({ 
      jobs,
      source: 'Perplexity AI',
      portalLinks,
      query
    })

  } catch (error) {
    console.error('Job search error:', error)
    
    // Provide a helpful fallback response
    return NextResponse.json({
      jobs: [],
      error: 'Job search is temporarily unavailable. Please try searching on Indian job portals directly.',
      fallbackSuggestions: [
        { name: 'Naukri', url: 'https://www.naukri.com' },
        { name: 'LinkedIn Jobs India', url: 'https://www.linkedin.com/jobs/search/?location=India' },
        { name: 'Indeed India', url: 'https://in.indeed.com' },
        { name: 'Shine', url: 'https://www.shine.com' },
        { name: 'Monster India', url: 'https://www.monsterindia.com' },
        { name: 'TimesJobs', url: 'https://www.timesjobs.com' },
        { name: 'Freshersworld', url: 'https://www.freshersworld.com' },
        { name: 'Glassdoor India', url: 'https://www.glassdoor.co.in' }
      ]
    }, { status: 200 }) // Return 200 with error message to avoid breaking the UI
  }
}

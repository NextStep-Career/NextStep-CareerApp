import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { career, location } = await request.json();

    if (!career) {
      return NextResponse.json(
        { error: 'Career field is required' },
        { status: 400 }
      );
    }

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY is not set');
      return NextResponse.json(
        { 
          jobs: [],
          fallback: true,
          message: 'Job search service is not configured. Please try external job boards.'
        },
        { status: 200 }
      );
    }

    console.log('Searching jobs for:', { career, location });

    // Construct a detailed prompt for better results
    const locationQuery = location ? ` in ${location}` : '';
    const prompt = `Find current entry-level and new grad job openings for ${career}${locationQuery}. 
    
    For each job, provide:
    - Job title
    - Company name
    - Location
    - Direct application URL (not aggregator sites)
    - Brief description
    
    Format as JSON array with fields: title, company, location, url, description, sourceUrl (if from an aggregator).
    
    Focus on recent postings from the last 30 days. Include jobs from SimplifyJobs/New-Grad-Positions if available.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful job search assistant. Return valid JSON arrays of job listings with accurate apply URLs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      return NextResponse.json(
        { 
          jobs: [],
          fallback: true,
          message: 'Job search temporarily unavailable. Please try external job boards.'
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Perplexity response received');

    // Extract job listings from the response
    const content = data.choices?.[0]?.message?.content || '';
    
    let jobs = [];
    try {
      // Try to parse JSON from the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jobs = JSON.parse(jsonMatch[0]);
        console.log(`Parsed ${jobs.length} jobs from response`);
      }
    } catch (parseError) {
      console.error('Error parsing job listings:', parseError);
      // Fall back to returning empty array with suggestions
    }

    // Ensure jobs have required fields and add sourceUrl for SimplifyJobs
    jobs = jobs.map((job: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: job.title || 'Unknown Position',
      company: job.company || 'Unknown Company',
      location: job.location || 'Remote',
      url: job.url || job.sourceUrl || '#',
      sourceUrl: job.sourceUrl || job.url || '#',
      description: job.description || 'No description available'
    }));

    return NextResponse.json({ 
      jobs,
      fallback: jobs.length === 0,
      message: jobs.length === 0 ? 'No jobs found. Try searching on external job boards.' : undefined
    });

  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { 
        jobs: [],
        fallback: true,
        message: 'An error occurred while searching for jobs. Please try external job boards.'
      },
      { status: 200 }
    );
  }
}

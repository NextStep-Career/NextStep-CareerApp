import { NextResponse } from 'next/server';

// Common job board domains to validate against
const VALID_JOB_DOMAINS = [
  'greenhouse.io',
  'lever.co',
  'workday.com',
  'myworkdayjobs.com',
  'ashbyhq.com',
  'boards.greenhouse.io',
  'jobs.lever.co',
  'jobs.ashbyhq.com',
  'bamboohr.com',
  'icims.com',
  'taleo.net',
  'ultipro.com',
  'jobvite.com',
  'smartrecruiters.com',
  'applytojob.com',
  'workable.com',
  'jazz.co',
  'recruitee.com',
  'indeed.com',
  'linkedin.com',
  'angel.co',
  'wellfound.com',
  'dice.com',
  'ziprecruiter.com'
];

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

export async function POST(request: Request) {
  try {
    const { title, company, sourceUrl } = await request.json();

    if (!title || !company || !sourceUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Resolving apply URL for:', { title, company, sourceUrl });

    // Check if this is a SimplifyJobs GitHub repo
    const githubMatch = sourceUrl.match(/github\.com\/SimplifyJobs\/([^\/]+)/);
    if (!githubMatch) {
      console.log('Not a SimplifyJobs URL, returning null');
      return NextResponse.json({ applyUrl: null });
    }

    const repoName = githubMatch[1];
    console.log('Detected SimplifyJobs repo:', repoName);

    // Search for issues in the repo that match the job
    const searchQuery = `${company} ${title}`.replace(/[^\w\s]/g, ' ').trim();
    const searchUrl = `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(searchQuery)}+repo:SimplifyJobs/${repoName}+is:issue`;
    
    console.log('Searching GitHub issues:', searchUrl);

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'NextStep-Career-App'
    };

    // Add GitHub token if available in environment
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const searchResponse = await fetch(searchUrl, { headers });

    if (!searchResponse.ok) {
      console.error('GitHub API error:', searchResponse.status, searchResponse.statusText);
      return NextResponse.json({ applyUrl: null });
    }

    const searchData = await searchResponse.json();
    console.log('Found', searchData.total_count, 'matching issues');

    if (searchData.items && searchData.items.length > 0) {
      // Check each issue for a valid apply URL
      for (const issue of searchData.items) {
        console.log('Checking issue:', issue.title);
        
        // Fetch the full issue body
        const issueResponse = await fetch(issue.url, { headers });
        if (!issueResponse.ok) continue;
        
        const issueData = await issueResponse.json();
        const body = issueData.body || '';
        
        // Look for URLs in the issue body
        const urlMatches = body.match(/https?:\/\/[^\s\)]+/g) || [];
        
        for (const url of urlMatches) {
          // Clean up the URL
          const cleanUrl = url.replace(/[,\)\]]+$/, '');
          
          // Check if it's a valid job board domain
          const isValidJobUrl = VALID_JOB_DOMAINS.some(domain => 
            cleanUrl.includes(domain)
          );
          
          if (isValidJobUrl) {
            console.log('Found valid apply URL:', cleanUrl);
            
            // Handle simplify.jobs redirect links
            if (cleanUrl.includes('simplify.jobs')) {
              const resolvedUrl = await resolveRedirect(cleanUrl);
              if (resolvedUrl) {
                console.log('Resolved redirect to:', resolvedUrl);
                return NextResponse.json({ applyUrl: resolvedUrl });
              }
            }
            
            return NextResponse.json({ applyUrl: cleanUrl });
          }
        }
      }
    }

    console.log('No apply URL found in GitHub issues');
    return NextResponse.json({ applyUrl: null });
  } catch (error) {
    console.error('Error resolving apply URL:', error);
    return NextResponse.json(
      { error: 'Failed to resolve apply URL' },
      { status: 500 }
    );
  }
}

// Helper function to resolve redirects (like simplify.jobs links)
async function resolveRedirect(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual'
    });
    
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        return location;
      }
    }
    
    return url;
  } catch (error) {
    console.error('Error resolving redirect:', error);
    return null;
  }
}

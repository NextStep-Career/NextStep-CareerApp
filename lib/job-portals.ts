export interface JobPortal {
  name: string
  baseUrl: string
  searchUrl: (query: string) => string
  logo?: string
}

export const indianJobPortals: JobPortal[] = [
  {
    name: 'Naukri',
    baseUrl: 'https://www.naukri.com',
    searchUrl: (query: string) => `https://www.naukri.com/jobs-in-india?k=${encodeURIComponent(query)}`,
  },
  {
    name: 'LinkedIn Jobs',
    baseUrl: 'https://www.linkedin.com',
    searchUrl: (query: string) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=India`,
  },
  {
    name: 'Indeed India',
    baseUrl: 'https://in.indeed.com',
    searchUrl: (query: string) => `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}&l=India`,
  },
  {
    name: 'Shine',
    baseUrl: 'https://www.shine.com',
    searchUrl: (query: string) => `https://www.shine.com/job-search/${encodeURIComponent(query.replace(/\s+/g, '-'))}-jobs`,
  },
  {
    name: 'Monster India',
    baseUrl: 'https://www.monsterindia.com',
    searchUrl: (query: string) => `https://www.monsterindia.com/srp/results?query=${encodeURIComponent(query)}`,
  },
  {
    name: 'TimesJobs',
    baseUrl: 'https://www.timesjobs.com',
    searchUrl: (query: string) => `https://www.timesjobs.com/candidate/job-search.html?searchType=personalizedSearch&txtKeywords=${encodeURIComponent(query)}`,
  },
  {
    name: 'Freshersworld',
    baseUrl: 'https://www.freshersworld.com',
    searchUrl: (query: string) => `https://www.freshersworld.com/jobs/search?key=${encodeURIComponent(query)}`,
  },
  {
    name: 'Glassdoor India',
    baseUrl: 'https://www.glassdoor.co.in',
    searchUrl: (query: string) => `https://www.glassdoor.co.in/Job/india-${encodeURIComponent(query.replace(/\s+/g, '-'))}-jobs-SRCH_IL.0,5_IN115_KO6,${6 + query.length}.htm`,
  },
  {
    name: 'AngelList India',
    baseUrl: 'https://angel.co',
    searchUrl: (query: string) => `https://angel.co/jobs?location=india&keywords=${encodeURIComponent(query)}`,
  },
  {
    name: 'Instahyre',
    baseUrl: 'https://www.instahyre.com',
    searchUrl: (query: string) => `https://www.instahyre.com/search-jobs/${encodeURIComponent(query.replace(/\s+/g, '-'))}/`,
  },
]

export function generateJobSearchLinks(query: string) {
  return indianJobPortals.map(portal => ({
    name: portal.name,
    url: portal.searchUrl(query),
    baseUrl: portal.baseUrl
  }))
}

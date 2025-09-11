"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Sparkles, 
  ArrowLeft, 
  Search,
  ExternalLink,
  MapPin,
  Building,
  Loader2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/contexts/auth-context"

export default function JobsPage() {
  return (
    <ProtectedRoute requireOnboarding>
      <JobsContent />
    </ProtectedRoute>
  )
}

function JobsContent() {
  const searchParams = useSearchParams()
  const careerId = searchParams.get('career')
  const { userProfile } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [jobListings, setJobListings] = useState<any[]>([])
  const [careerData, setCareerData] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [fallbackSuggestions, setFallbackSuggestions] = useState<any[]>([])
  const [portalLinks, setPortalLinks] = useState<any[]>([])

  // Fetch career data to get job search prompts
  useEffect(() => {
    if (careerId) {
      fetchCareerData()
    }
  }, [careerId])

  const fetchCareerData = async () => {
    try {
      const userData = await api.user.getData()
      if (userData.careerMatches) {
        const match = userData.careerMatches.find((m: any) => m.careerId === careerId)
        if (match && match.career) {
          setCareerData(match.career)
          // Set initial search query from job search prompts
          if (match.career.jobSearchPrompts && match.career.jobSearchPrompts.length > 0) {
            setSearchQuery(match.career.jobSearchPrompts[0])
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch career data:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    console.log('Starting job search for:', searchQuery)
    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await api.jobs.search(searchQuery)
      console.log('Job search response:', response)
      
      if (response.error && response.fallbackSuggestions) {
        console.log('Search returned with error and fallback suggestions')
        setError(response.error)
        setFallbackSuggestions(response.fallbackSuggestions)
        setJobListings([])
      } else {
        console.log(`Search returned ${response.jobs?.length || 0} jobs`)
        setJobListings(response.jobs || [])
        setError(null)
        setFallbackSuggestions([])
      }
      
      // Always set portal links if available
      if (response.portalLinks) {
        setPortalLinks(response.portalLinks)
      }
    } catch (error: any) {
      console.error('Job search failed:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      })
      setError(error.message || 'Failed to search for jobs')
      setJobListings([])
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    setSearchQuery(prompt)
    // Automatically search when a prompt is clicked
    setTimeout(() => {
      handleSearch()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">NextStep</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Job Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] mb-2">
            Find Your Next Opportunity
          </h1>
          <p className="text-muted-foreground mb-6">
            {careerData ? 
              `Search for ${careerData.name || careerData.title} positions tailored to your skills` : 
              'Search for job opportunities that match your career goals'
            }
          </p>

          {/* Search Bar */}
          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="e.g., junior software developer remote"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Jobs
                </>
              )}
            </Button>
          </div>

          {/* Suggested Search Prompts */}
          {careerData && careerData.jobSearchPrompts && (
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-3">Suggested searches:</p>
              <div className="flex flex-wrap gap-2">
                {careerData.jobSearchPrompts.map((prompt: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Searching for jobs...</p>
          </div>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
              <p className="text-center text-lg font-medium mb-2">Search Notice</p>
              <p className="text-center text-muted-foreground mb-4">{error}</p>
              {fallbackSuggestions.length > 0 && (
                <div>
                  <p className="text-center text-sm text-muted-foreground mb-3">Try these job boards:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {fallbackSuggestions.map((site: any, index: number) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a href={site.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {site.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && hasSearched && jobListings.length === 0 && !error && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No jobs found. Try a different search query.</p>
            </CardContent>
          </Card>
        )}

        {!loading && jobListings.length > 0 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Found {jobListings.length} job opportunities
              </p>
              <div className="space-y-4">
                {jobListings.map((job, index) => (
              <Card key={index} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        {job.company && (
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {job.company}
                          </div>
                        )}
                        {job.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        {job.type && <Badge variant="secondary">{job.type}</Badge>}
                        {job.experience && <Badge variant="outline">{job.experience}</Badge>}
                        {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          // Try to resolve the apply URL
                          const response = await api.jobs.resolveApplyUrl({
                            title: job.title,
                            company: job.company || '',
                            sourceUrl: job.url || job.link || job.sourceUrl || ''
                          })
                          
                          if (response.resolvedUrl) {
                            window.open(response.resolvedUrl, '_blank', 'noopener,noreferrer')
                          } else {
                            // Fallback to original URL
                            window.open(job.url || job.link, '_blank', 'noopener,noreferrer')
                          }
                        } catch (error) {
                          console.error('Failed to resolve job URL:', error)
                          // Fallback to original URL on error
                          window.open(job.url || job.link, '_blank', 'noopener,noreferrer')
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </div>
            
            {/* Portal Links Section */}
            {portalLinks.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Explore More Opportunities</CardTitle>
                  <CardDescription>
                    Check out these popular job portals for more {searchQuery} positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {portalLinks.map((portal: any, index: number) => (
                      <Button key={index} variant="outline" size="sm" asChild>
                        <a href={portal.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {portal.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Initial State */}
        {!loading && !hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                Ready to Start Your Job Search?
              </CardTitle>
              <CardDescription>
                Use the search bar above or click on one of the suggested searches to find relevant job opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">Tips for effective job searching:</p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Include your experience level (junior, entry-level, intern)</li>
                  <li>Specify location preferences or "remote" for remote work</li>
                  <li>Use relevant keywords from your skills</li>
                  <li>Try different variations of job titles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

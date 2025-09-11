"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Code,
  Palette,
  BarChart3,
  MessageCircle,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { api } from "@/lib/api-client"

// We'll generate recent activity based on actual user data in the component

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { userProfile } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [learningData, setLearningData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Use mock data for now
  const displayName = userProfile?.name || 'there'
  const hasCompletedQuiz = userProfile?.quiz !== undefined

  // Fetch user data including career matches if quiz is completed
  useEffect(() => {
    async function fetchUserData() {
      if (hasCompletedQuiz) {
        try {
          const [userData, learningProgress] = await Promise.all([
            api.user.getData(),
            api.learning.getProgress()
          ])
          setUserData(userData)
          setLearningData(learningProgress)
        } catch (error) {
          console.error('Failed to fetch user data:', error)
        }
      }
      setLoading(false)
    }
    
    fetchUserData()
  }, [hasCompletedQuiz])
  
  // Generate recent activity based on user data
  const recentActivity = []
  if (hasCompletedQuiz) {
    recentActivity.push(
      { action: "Completed personality quiz", time: userProfile?.quiz?.completedAt ? "Recently" : "Just now", type: "quiz" },
      { action: "Career matches generated", time: "Just now", type: "matching" }
    )
  } else {
    recentActivity.push(
      { action: "Signed up for NextStep", time: "Just now", type: "signup" }
    )
  }
  
  // Use real career matches if available, otherwise use mock data
  const careerMatches = hasCompletedQuiz ? (userData?.careerMatches || [
    {
      id: '1',
      careerId: 'software-developer',
      score: 92,
      career: {
        title: 'Software Developer',
        description: 'Build applications and systems using various programming languages',
        requiredSkills: ['Problem Solving', 'Logical Thinking', 'Technical Skills']
      }
    },
    {
      id: '2', 
      careerId: 'ux-designer',
      score: 87,
      career: {
        title: 'UX Designer',
        description: 'Design user-friendly interfaces and improve user experiences',
        requiredSkills: ['Creativity', 'Empathy', 'Visual Design']
      }
    },
  ]) : []
  // Get the top career match for learning path
  const topCareerMatch = careerMatches.length > 0 ? careerMatches[0] : null
  const topCareerId = topCareerMatch?.careerId || 'software-developer'
  const topCareerName = topCareerMatch?.career?.title || topCareerMatch?.career?.name || 'Software Developer'
  
  // Use real learning data or fallback to empty arrays
  const learningTasks = learningData?.tasks?.slice(0, 4) || []
  const stats = learningData?.stats || {
    totalTasks: 0,
    completedTasks: 0,
    overallProgress: 0,
  }

  // Map career data to display format
  const careerIcons = {
    'software-developer': Code,
    'ux-designer': Palette,
    'data-analyst': BarChart3,
    'product-manager': Target,
  }

  const careerColors = {
    'software-developer': 'bg-blue-500',
    'ux-designer': 'bg-purple-500',
    'data-analyst': 'bg-green-500',
    'product-manager': 'bg-orange-500',
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">NextStep</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/coach">
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Coach
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
          </div>
          <MobileNav isLoggedIn={true} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] mb-2">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground">Continue your career journey and explore new opportunities</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="careers">Career Matches</TabsTrigger>
            <TabsTrigger value="learning">Learning Paths</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Career Matches</p>
                      <p className="text-2xl font-bold">{careerMatches.length}</p>
                    </div>
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Learning Progress</p>
                      <p className="text-2xl font-bold">{stats.overallProgress}%</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                      <p className="text-2xl font-bold">{stats.completedTasks}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Streak</p>
                      <p className="text-2xl font-bold">7 days</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz prompt for new users */}
            {!hasCompletedQuiz && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)] flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Discover Your Career Path</span>
                  </CardTitle>
                  <CardDescription>
                    Take our personality quiz to get personalized career recommendations and unlock all features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/quiz">
                      <Target className="w-4 h-4 mr-2" />
                      Start Personality Quiz
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Top Career Matches */}
            {hasCompletedQuiz && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Your Top Career Matches</CardTitle>
                  <CardDescription>Based on your personality quiz results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {careerMatches.slice(0, 2).map((match) => {
                    const career = match.career
                    if (!career) return null
                    
                    const Icon = careerIcons[match.careerId as keyof typeof careerIcons] || Target
                    const color = careerColors[match.careerId as keyof typeof careerColors] || 'bg-gray-500'
                    
                    return (
                      <div
                        key={match.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{career.title}</h3>
                            <Badge variant="secondary">{match.score}% match</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{career.description}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/learning?career=${match.careerId}`}>
                            Explore
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="careers" className="space-y-6">
            <div className="grid gap-6">
              {careerMatches.map((match) => {
                const career = match.career
                if (!career) return null
                
                const Icon = careerIcons[match.careerId as keyof typeof careerIcons] || Target
                const color = careerColors[match.careerId as keyof typeof careerColors] || 'bg-gray-500'
                
                return (
                  <Card key={match.id} className="border-2 hover:border-primary/20 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 ${color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                              {career.title}
                            </CardTitle>
                            <CardDescription>{career.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {match.score}% match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Key Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {career.requiredSkills?.map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button asChild>
                            <Link href={`/learning?career=${match.careerId}`}>
                              View Learning Path
                            </Link>
                          </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/jobs?career=${match.careerId}`}>
                      Find Jobs
                    </Link>
                  </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                      {topCareerName} Learning Path
                    </CardTitle>
                    <CardDescription>Complete these tasks to build your skills</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/learning?career=${topCareerId}`}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      View All Tasks
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningTasks.map((task, index) => {
                    const isCompleted = task.progress?.completed || false
                    const progressValue = task.progress?.progress || 0
                    
                    return (
                      <div key={task.id || index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-green-500" : "bg-muted"
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <div className="flex items-center space-x-2 mt-2">
                            <Progress value={progressValue} className="flex-1 h-2" />
                            <span className="text-sm text-muted-foreground">{progressValue}%</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/learning?career=${topCareerId}`}>
                            {isCompleted ? "Review" : "Continue"}
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{stats.overallProgress}%</span>
                      </div>
                      <Progress value={stats.overallProgress} className="h-3" />
                    </div>
                    {learningTasks.slice(0, 3).map((task, index) => {
                      const progressValue = task.progress?.progress || 0
                      return (
                        <div key={task.id || index}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{task.title}</span>
                            <span className="text-sm text-muted-foreground">{progressValue}%</span>
                          </div>
                          <Progress value={progressValue} className="h-3" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Weekly Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const goals = []
                      const completedTasksCount = stats.completedTasks
                      const totalTasksCount = stats.totalTasks
                      
                      // Goal 1: Complete at least 1 learning task
                      const hasCompletedTask = completedTasksCount >= 1
                      goals.push({
                        completed: hasCompletedTask,
                        text: 'Complete your first learning task'
                      })
                      
                      // Goal 2: Take personality quiz (if not done)
                      const hasQuiz = hasCompletedQuiz
                      goals.push({
                        completed: hasQuiz,
                        text: 'Complete personality assessment'
                      })
                      
                      // Goal 3: Explore career matches
                      const hasCareerMatches = careerMatches.length > 0
                      goals.push({
                        completed: hasCareerMatches,
                        text: 'Discover your career matches'
                      })
                      
                      // Goal 4: Make progress on learning path
                      const hasProgress = stats.overallProgress > 0
                      goals.push({
                        completed: hasProgress,
                        text: 'Start your learning journey'
                      })
                      
                      return goals.map((goal, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          {goal.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted rounded-full" />
                          )}
                          <span className={goal.completed ? 'line-through text-muted-foreground' : ''}>
                            {goal.text}
                          </span>
                        </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

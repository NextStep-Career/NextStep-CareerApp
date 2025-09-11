"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  BookOpen,
  Trophy,
  Loader2,
  AlertCircle,
  ExternalLink,
  Video,
  FileText,
  Award
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { api } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  estimatedHours: number
  category: string
  difficulty: string
  resourceLink?: string
  progress?: {
    completed: boolean
    progress: number
  }
}

export default function LearningPage() {
  return (
    <ProtectedRoute requireOnboarding>
      <LearningContent />
    </ProtectedRoute>
  )
}

function LearningContent() {
  const searchParams = useSearchParams()
  const careerId = searchParams.get('career')
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overallProgress: 0,
  })
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)
  const [careerData, setCareerData] = useState<any>(null)

  useEffect(() => {
    fetchLearningTasks()
    if (careerId) {
      fetchCareerData()
    }
  }, [careerId])

  const fetchLearningTasks = async () => {
    try {
      setLoading(true)
      const data = await api.learning.getProgress(careerId || undefined)
      setTasks(data.tasks)
      setStats(data.stats)
    } catch (error: any) {
      console.error('Failed to fetch learning tasks:', error)
      setError(error.message || 'Failed to load learning tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchCareerData = async () => {
    try {
      // Fetch user data which includes career information
      const userData = await api.user.getData()
      if (userData.careerMatches) {
        const match = userData.careerMatches.find((m: any) => m.careerId === careerId)
        if (match && match.career) {
          setCareerData(match.career)
        }
      }
    } catch (error) {
      console.error('Failed to fetch career data:', error)
    }
  }

  const handleTaskProgress = async (taskId: string, progress: number, completed?: boolean) => {
    try {
      setUpdatingTask(taskId)
      
      const result = await api.learning.updateProgress({
        taskId,
        progress,
        completed: completed || progress === 100
      })

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, progress: result.progress }
          : task
      ))

      // Refresh stats
      await fetchLearningTasks()

      // Show achievement toast if earned
      if (result.achievement) {
        toast({
          title: result.achievement.title,
          description: result.achievement.description,
          action: <Trophy className="h-5 w-5 text-yellow-500" />,
        })
      }
    } catch (error: any) {
      console.error('Failed to update progress:', error)
      toast({
        title: "Failed to update progress",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setUpdatingTask(null)
    }
  }

  const handleTaskComplete = async (taskId: string) => {
    await handleTaskProgress(taskId, 100, true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-center text-lg font-medium mb-2">Failed to load learning paths</p>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchLearningTasks} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const beginnerTasks = tasks.filter(t => t.difficulty === 'beginner')
  const intermediateTasks = tasks.filter(t => t.difficulty === 'intermediate')
  const advancedTasks = tasks.filter(t => t.difficulty === 'advanced')

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
        {/* Progress Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] mb-2">
            Your Learning Journey
          </h1>
          <p className="text-muted-foreground mb-6">
            Complete tasks to build skills for your career path
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold">{stats.totalTasks}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{stats.overallProgress}%</p>
                  </div>
                  <Progress value={stats.overallProgress} className="w-full mt-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Est. Time</p>
                    <p className="text-2xl font-bold">
                      {tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0)}h
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Career Learning Resources */}
        {careerData && careerData.learningResources && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                Recommended Learning Resources
              </CardTitle>
              <CardDescription>
                Curated resources to help you learn {careerData.name || careerData.title} skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {careerData.learningResources.map((resource: any, index: number) => {
                  const Icon = resource.type === 'video' ? Video : 
                               resource.type === 'certificate' ? Award :
                               resource.type === 'course' ? BookOpen : FileText
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{resource.provider}</span>
                            <Badge variant={resource.isFree ? "default" : "secondary"}>
                              {resource.isFree ? "Free" : "Paid"}
                            </Badge>
                            <Badge variant="outline">
                              {resource.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Resource
                        </a>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Tasks by Difficulty */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TaskList 
              tasks={tasks} 
              onTaskComplete={handleTaskComplete}
              onTaskProgress={handleTaskProgress}
              updatingTask={updatingTask}
            />
          </TabsContent>

          <TabsContent value="beginner">
            <TaskList 
              tasks={beginnerTasks} 
              onTaskComplete={handleTaskComplete}
              onTaskProgress={handleTaskProgress}
              updatingTask={updatingTask}
            />
          </TabsContent>

          <TabsContent value="intermediate">
            <TaskList 
              tasks={intermediateTasks} 
              onTaskComplete={handleTaskComplete}
              onTaskProgress={handleTaskProgress}
              updatingTask={updatingTask}
            />
          </TabsContent>

          <TabsContent value="advanced">
            <TaskList 
              tasks={advancedTasks} 
              onTaskComplete={handleTaskComplete}
              onTaskProgress={handleTaskProgress}
              updatingTask={updatingTask}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface TaskListProps {
  tasks: Task[]
  onTaskComplete: (taskId: string) => Promise<void>
  onTaskProgress: (taskId: string, progress: number) => Promise<void>
  updatingTask: string | null
}

function TaskList({ tasks, onTaskComplete, onTaskProgress, updatingTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No tasks in this category yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isCompleted = task.progress?.completed || false
        const progress = task.progress?.progress || 0
        const isUpdating = updatingTask === task.id

        return (
          <Card key={task.id} className={isCompleted ? "opacity-75" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onTaskComplete(task.id)
                    }
                  }}
                  disabled={isUpdating || isCompleted}
                  className="mt-1"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{task.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{task.category}</Badge>
                      <Badge variant={
                        task.difficulty === 'beginner' ? 'default' :
                        task.difficulty === 'intermediate' ? 'secondary' :
                        'destructive'
                      }>
                        {task.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{task.estimatedHours}h</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {task.resourceLink ? (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        onClick={() => {
                          // Track progress when starting
                          if (progress === 0) {
                            onTaskProgress(task.id, 25)
                          }
                        }}
                      >
                        <a href={task.resourceLink} target="_blank" rel="noopener noreferrer">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {progress === 0 ? "Start Learning" : "Continue Learning"}
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTaskProgress(task.id, Math.min(progress + 25, 100))}
                        disabled={isUpdating || isCompleted}
                      >
                        {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {isCompleted ? "Completed" : "Start Learning"}
                      </Button>
                    )}
                    {progress > 0 && progress < 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTaskComplete(task.id)}
                        disabled={isUpdating}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

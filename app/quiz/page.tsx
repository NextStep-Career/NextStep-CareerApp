"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { sanitizeInput } from "@/lib/sanitize"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"

const quizQuestions = [
  {
    id: 1,
    question: "What type of work environment energizes you most?",
    options: [
      { value: "collaborative", label: "Collaborative team settings with lots of interaction" },
      { value: "independent", label: "Independent work with minimal supervision" },
      { value: "structured", label: "Structured environment with clear processes" },
      { value: "dynamic", label: "Fast-paced, ever-changing environment" },
    ],
  },
  {
    id: 2,
    question: "Which activities do you find most engaging?",
    options: [
      { value: "problem-solving", label: "Solving complex problems and puzzles" },
      { value: "creative", label: "Creating and designing new things" },
      { value: "helping", label: "Helping and supporting others" },
      { value: "analyzing", label: "Analyzing data and finding patterns" },
    ],
  },
  {
    id: 3,
    question: "What motivates you most in your work?",
    options: [
      { value: "impact", label: "Making a positive impact on society" },
      { value: "growth", label: "Personal growth and learning opportunities" },
      { value: "recognition", label: "Recognition and achievement" },
      { value: "stability", label: "Job security and stability" },
    ],
  },
  {
    id: 4,
    question: "How do you prefer to communicate ideas?",
    options: [
      { value: "visual", label: "Through visuals, diagrams, and presentations" },
      { value: "written", label: "Through detailed written reports" },
      { value: "verbal", label: "Through face-to-face conversations" },
      { value: "digital", label: "Through digital platforms and tools" },
    ],
  },
  {
    id: 5,
    question: "What type of challenges excite you?",
    options: [
      { value: "technical", label: "Technical and analytical challenges" },
      { value: "interpersonal", label: "Interpersonal and relationship challenges" },
      { value: "strategic", label: "Strategic planning and big-picture thinking" },
      { value: "creative", label: "Creative and artistic challenges" },
    ],
  },
]

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  )
}

function QuizContent() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { refreshUserProfile } = useAuth()

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  const handleAnswer = (value: string) => {
    setShowError(false)
    const sanitizedValue = sanitizeInput(value)
    setAnswers((prev) => ({
      ...prev,
      [quizQuestions[currentQuestion].id]: sanitizedValue,
    }))
  }

  const handleNext = () => {
    const currentAnswerId = quizQuestions[currentQuestion]?.id
    
    // Validate that an answer is selected
    if (!answers[currentAnswerId]) {
      setShowError(true)
      toast({
        title: "Please select an answer",
        description: "You must choose an option before proceeding.",
        variant: "destructive",
      })
      return
    }
    
    setShowError(false)
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleQuizComplete()
    }
  }

  const handleQuizComplete = async () => {
    try {
      setIsSubmitting(true)
      
      // Validate all questions are answered
      const allQuestionsAnswered = quizQuestions.every(q => answers[q.id])
      if (!allQuestionsAnswered) {
        toast({
          title: "Quiz incomplete",
          description: "Please answer all questions before completing the quiz.",
          variant: "destructive",
        })
        return
      }
      
      // Convert answers to string keys for the API
      const formattedAnswers = Object.entries(answers).reduce((acc, [questionId, answer]) => {
        acc[`q${questionId}`] = answer
        return acc
      }, {} as Record<string, string>)
      
      // Submit quiz answers to backend
      const result = await api.quiz.submit(formattedAnswers)
      
      console.log("Quiz submitted successfully:", result)
      
      // Refresh user profile to update onboarding status
      await refreshUserProfile()
      
      setIsComplete(true)
      
      toast({
        title: "Quiz completed!",
        description: "We're analyzing your responses to find your perfect career matches.",
      })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    setShowError(false)
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const canProceed = answers[quizQuestions[currentQuestion]?.id]

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-[family-name:var(--font-space-grotesk)]">Quiz Complete!</CardTitle>
            <CardDescription>
              Thank you for completing the personality assessment. We're analyzing your responses to find the perfect
              career matches.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                Based on your answers, we'll show you personalized career recommendations, connect you with our AI
                career coach, and provide curated learning paths.
              </p>
            </div>
            <Button size="lg" className="w-full" asChild>
              <Link href="/dashboard">
                View Your Career Matches
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
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
          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-[family-name:var(--font-space-grotesk)]">
              {quizQuestions[currentQuestion].question}
            </CardTitle>
            <CardDescription>Choose the option that best describes you</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[quizQuestions[currentQuestion].id] || ""}
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {quizQuestions[currentQuestion].options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer leading-relaxed">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {showError && (
              <Alert className="mt-4 border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select an option before continuing.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestion === 0 || isSubmitting}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {currentQuestion === quizQuestions.length - 1 ? "Complete Quiz" : "Next"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

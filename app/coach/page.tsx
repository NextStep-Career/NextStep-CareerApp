"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Send, MessageCircle, User, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { sanitizeInput, escapeHtml } from "@/lib/sanitize"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { api } from "@/lib/api-client"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

// Use a stable timestamp for initial message to avoid hydration issues
const INITIAL_TIMESTAMP = new Date('2024-01-01T10:00:00')

const initialMessages: Message[] = [
  {
    id: 1,
    content:
      "Hello! I'm your AI Career Coach. I'm here to help you navigate your career journey, answer questions about different career paths, and provide personalized guidance based on your quiz results. How can I assist you today?",
    sender: "ai",
    timestamp: INITIAL_TIMESTAMP,
  },
]

const suggestedQuestions = [
  "What skills should I focus on for software development?",
  "How do I prepare for my first tech interview?",
  "What's the difference between frontend and backend development?",
  "How can I build a strong portfolio?",
  "What are the current trends in UX design?",
]

export default function CoachPage() {
  return (
    <ProtectedRoute>
      <CoachContent />
    </ProtectedRoute>
  )
}

function CoachContent() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSendMessage = async () => {
    // Reset error state
    setInputError(null)
    
    // Validate input
    if (!inputValue.trim()) {
      setInputError("Please enter a message")
      return
    }
    
    if (inputValue.length > 500) {
      setInputError("Message is too long. Please keep it under 500 characters.")
      return
    }
    
    try {
      // Sanitize input
      const sanitizedMessage = sanitizeInput(inputValue)
      
      const userMessage: Message = {
        id: messages.length + 1,
        content: sanitizedMessage,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsLoading(true)

      // Send message to AI coach API
      try {
        const response = await api.coach.sendMessage(sanitizedMessage)
        
        const aiResponse: Message = {
          id: messages.length + 2,
          content: response.response,
          sender: "ai",
          timestamp: new Date(),
        }
        
        setMessages((prev) => [...prev, aiResponse])
      } catch (error: any) {
        console.error('Coach API error:', error)
        
        // Fallback to mock response if API fails
        const fallbackResponse: Message = {
          id: messages.length + 2,
          content: getAIResponse(sanitizedMessage),
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, fallbackResponse])
        
        toast({
          title: "Using offline mode",
          description: "Unable to connect to AI coach. Using basic responses.",
        })
      } finally {
        setIsLoading(false)
      }
    } catch (error) {
      setInputError("Invalid input. Please try again.")
      toast({
        title: "Message error",
        description: "There was an issue with your message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getAIResponse = (question: string): string => {
    const responses = {
      skills:
        "Based on your quiz results showing strong problem-solving abilities, I recommend focusing on these key skills for software development: 1) Master JavaScript fundamentals, 2) Learn React or Vue.js for frontend, 3) Understand databases and APIs, 4) Practice with Git version control, and 5) Build projects to showcase your abilities. Start with JavaScript basics and gradually work your way up!",
      interview:
        "Great question! Here's how to prepare for your first tech interview: 1) Practice coding problems on platforms like LeetCode, 2) Review computer science fundamentals, 3) Prepare to explain your projects clearly, 4) Practice the STAR method for behavioral questions, 5) Research the company and role thoroughly. Remember, they want to see your problem-solving process, not just the right answer!",
      frontend:
        "Frontend development focuses on what users see and interact with - the user interface, user experience, and client-side functionality. Backend development handles server-side logic, databases, and APIs. Based on your creative tendencies from the quiz, frontend might be a great fit! You'd work with HTML, CSS, JavaScript, and frameworks like React.",
      portfolio:
        "A strong portfolio should showcase 3-5 quality projects that demonstrate different skills. Include: 1) A personal website, 2) A full-stack application, 3) A project using APIs, 4) Clean, well-documented code on GitHub, 5) Live demos with clear descriptions of your role and technologies used. Quality over quantity is key!",
      default:
        "That's an excellent question! Based on your personality quiz results, I can see you have strong analytical and creative abilities. For your specific situation, I'd recommend focusing on building practical experience through projects and connecting with others in your field of interest. Would you like me to elaborate on any particular aspect of your career journey?",
    }

    const lowerQuestion = question.toLowerCase()
    if (lowerQuestion.includes("skill")) return responses.skills
    if (lowerQuestion.includes("interview")) return responses.interview
    if (lowerQuestion.includes("frontend") || lowerQuestion.includes("backend")) return responses.frontend
    if (lowerQuestion.includes("portfolio")) return responses.portfolio
    return responses.default
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">NextStep</span>
          </Link>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="font-medium">AI Career Coach</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Sidebar with suggested questions */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)]">
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left justify-start h-auto p-3 text-sm whitespace-normal min-h-[3rem] hover:bg-muted/50"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <span className="block text-wrap">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="font-[family-name:var(--font-space-grotesk)]">AI Career Coach</span>
                    <p className="text-sm text-muted-foreground font-normal">
                      Always here to help with your career questions
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start space-x-2 max-w-[80%] ${
                            message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {message.sender === "user" ? (
                                <User className="w-4 h-4" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg p-3 ${
                              message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            {isClient && (
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              <Sparkles className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="space-y-2 mt-4">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value)
                          setInputError(null)
                        }}
                        placeholder="Ask me anything about your career..."
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        disabled={isLoading}
                        aria-invalid={!!inputError}
                        maxLength={500}
                      />
                      <span className={`absolute right-3 top-3 text-xs ${
                        inputValue.length > 450 ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        {inputValue.length}/500
                      </span>
                    </div>
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={isLoading || !inputValue.trim()}
                      size="icon"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {inputError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {inputError}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

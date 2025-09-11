"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Mail,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, checkEmailVerified } = useAuth()
  const [isVerified, setIsVerified] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Check verification status periodically
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.emailVerified) {
      setIsVerified(true)
      // Redirect to quiz for new users who just verified
      setTimeout(() => {
        router.push('/quiz')
      }, 2000)
      return
    }

    // Check every 5 seconds if email is verified
    const interval = setInterval(async () => {
      if (await checkEmailVerified()) {
        setIsVerified(true)
        clearInterval(interval)
        setTimeout(() => {
          router.push('/quiz')
        }, 2000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user, checkEmailVerified, router])

  const handleResendEmail = async () => {
    if (!user) return
    
    setIsResending(true)
    setError("")
    setResendSuccess(false)
    
    try {
      await sendVerificationEmail()
      setResendSuccess(true)
      // Hide success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (error: any) {
      console.error("Error resending verification email:", error)
      setError("Failed to resend verification email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckNow = async () => {
    setIsChecking(true)
    try {
      if (await checkEmailVerified()) {
        setIsVerified(true)
        setTimeout(() => {
          router.push('/quiz')
        }, 2000)
      } else {
        setError("Email not yet verified. Please check your inbox and click the verification link.")
        setTimeout(() => setError(""), 3000)
      }
    } catch (error: any) {
      console.error("Error checking email verification:", error)
      setError("Failed to check verification status. Please try again.")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsChecking(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
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
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {isVerified ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <Mail className="w-8 h-8 text-primary" />
              )}
            </div>
            <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-2xl">
              {isVerified ? "Email Verified!" : "Verify Your Email"}
            </CardTitle>
            <CardDescription>
              {isVerified 
                ? "Your email has been successfully verified. Redirecting you to continue..."
                : `We sent a verification email to ${user.email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerified ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Email verification successful! You'll be redirected to start your career journey.
                  </AlertDescription>
                </Alert>
                <Button className="w-full" asChild>
                  <Link href="/quiz">
                    Continue to Quiz
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground text-center">
                  Please click the verification link in your email to continue. The link may take a few minutes to arrive.
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {resendSuccess && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Verification email sent successfully! Please check your inbox.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCheckNow}
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    I've Verified - Check Now
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={handleResendEmail}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Resend Verification Email
                  </Button>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Wrong email address?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in with different account
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/help" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

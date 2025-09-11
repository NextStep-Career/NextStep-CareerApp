"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupFormData } from "@/lib/validations"
import { sanitizeName, sanitizeEmail } from "@/lib/sanitize"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/contexts/auth-context"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signUp, signInWithGoogle, user } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
    trigger,
    getValues
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false
    }
  })

  const watchPassword = watch("password")
  const watchAgreeToTerms = watch("agreeToTerms")

  const onSubmit = async (data: SignupFormData) => {
    console.log("Form submission started with data:", data)
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Sanitize inputs
      let sanitizedData
      try {
        sanitizedData = {
          ...data,
          fullName: sanitizeName(data.fullName),
          email: sanitizeEmail(data.email)
        }
      } catch (sanitizeError) {
        console.error("Sanitization error:", sanitizeError)
        throw sanitizeError
      }
      
      console.log("Sanitized data:", sanitizedData)
      
      // Sign up with Firebase
      await signUp(sanitizedData.email, data.password, sanitizedData.fullName)
      
      console.log("Sign up successful")
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to NextStep. Let's discover your career path.",
      })
    } catch (error: any) {
      console.error("Sign up error:", error)
      
      // Firebase error handling
      let errorMessage = "Something went wrong. Please try again."
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please sign in instead."
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password."
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      await signInWithGoogle()
    } catch (error: any) {
      console.error("Google sign in error:", error)
      
      let errorMessage = "Google sign in failed. Please try again."
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign in was cancelled."
      }
      
      setError(errorMessage)
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check password strength
  const getPasswordStrength = () => {
    if (!watchPassword) return { strength: 0, label: "" }
    
    let strength = 0
    if (watchPassword.length >= 8) strength++
    if (/[A-Z]/.test(watchPassword)) strength++
    if (/[a-z]/.test(watchPassword)) strength++
    if (/[0-9]/.test(watchPassword)) strength++
    if (/[^A-Za-z0-9]/.test(watchPassword)) strength++
    
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"]
    return { strength, label: labels[strength] }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Simple Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">NextStep</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Sign Up Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-[family-name:var(--font-space-grotesk)]">Create an account</CardTitle>
              <CardDescription>
                Start your personalized career journey with NextStep
              </CardDescription>
            </CardHeader>
            <form onSubmit={(e) => {
              console.log('Form values before submit:', getValues())
              handleSubmit(onSubmit, (errors) => {
                console.log('Form validation errors:', errors)
                console.log('Current form values:', getValues())
              })(e)
            }}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    {...register("fullName")}
                    aria-invalid={!!errors.fullName}
                    className={touchedFields.fullName && errors.fullName ? "border-red-500" : ""}
                  />
                  {touchedFields.fullName && errors.fullName && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    className={touchedFields.email && errors.email ? "border-red-500" : ""}
                  />
                  {touchedFields.email && errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                      className={touchedFields.password && errors.password ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {!errors.password && (
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  )}
                  {watchPassword && watchPassword.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.strength === 1 ? "bg-red-500 w-1/5" :
                              passwordStrength.strength === 2 ? "bg-orange-500 w-2/5" :
                              passwordStrength.strength === 3 ? "bg-yellow-500 w-3/5" :
                              passwordStrength.strength === 4 ? "bg-green-500 w-4/5" :
                              passwordStrength.strength === 5 ? "bg-green-600 w-full" : "w-0"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                  {touchedFields.password && errors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register("confirmPassword")}
                      aria-invalid={!!errors.confirmPassword}
                      className={touchedFields.confirmPassword && errors.confirmPassword ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {touchedFields.confirmPassword && errors.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={!!watchAgreeToTerms}
                      onCheckedChange={(checked) => {
                        setValue("agreeToTerms", Boolean(checked))
                        // re-validate the field when changed
                        trigger("agreeToTerms")
                      }}
                      aria-invalid={!!errors.agreeToTerms}
                    />
                    <Label 
                      htmlFor="agreeToTerms" 
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {touchedFields.agreeToTerms && errors.agreeToTerms && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.agreeToTerms.message as string}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
          
          {/* Social Sign In */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign up with Google
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

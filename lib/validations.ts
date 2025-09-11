import { z } from "zod"

// Signup validation schema
export const signupSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required", invalid_type_error: "Full name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Email is required" })
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z
    .string({ required_error: "Please confirm your password", invalid_type_error: "Please confirm your password" })
    .min(1, "Please confirm your password"),
  agreeToTerms: z
    .boolean({ required_error: "You must agree to the terms and conditions" })
    .refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
})

// Quiz validation schema
export const quizAnswerSchema = z.object({
  questionId: z.number(),
  answer: z.string().min(1, "Please select an answer"),
})

// Coach message validation
export const coachMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Please enter a message")
    .max(500, "Message must be less than 500 characters"),
})

// Type exports
export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type QuizAnswerData = z.infer<typeof quizAnswerSchema>
export type CoachMessageData = z.infer<typeof coachMessageSchema>

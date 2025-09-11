# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Next.js development server at http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

### Database & Firebase
- `npm run seed` - Seed Firestore database with initial data using `scripts/seed-firestore.ts`
- `firebase deploy --only firestore:rules` - Deploy Firestore security rules
- `firebase deploy --only firestore:indexes` - Deploy Firestore indexes

### Useful Development Commands
- `npx tsx scripts/seed-firestore.ts` - Run seeding script directly
- `npx tsx scripts/cleanup-career-matches.ts` - Clean up career match data
- `firebase emulators:start` - Start Firebase emulators for local development

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict configuration
- **Database**: Firebase Firestore with Firebase Auth
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives with custom components
- **State Management**: React Context (AuthProvider)
- **Forms**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics

### Project Structure

#### App Router Structure (`app/`)
The application uses Next.js App Router with these main routes:
- `/` - Marketing homepage (`page.tsx`)
- `/dashboard` - Main user dashboard with protected route
- `/quiz` - Personality assessment with multi-step form
- `/coach` - AI career coach chat interface
- `/learning` - Learning paths and progress tracking
- `/jobs` - Job search with API integration
- `/profile` - User profile management
- `/login`, `/signup` - Authentication flows
- `/verify-email` - Email verification flow

#### Component Architecture (`components/`)
- `components/ui/` - shadcn/ui component library (Button, Card, Input, etc.)
- `components/auth/` - Authentication-related components (ProtectedRoute)
- `components/mobile-nav.tsx` - Responsive navigation component
- `components/theme-provider.tsx` - Theme context provider

#### Core Libraries (`lib/`)
- `lib/firebase.client.ts` - Firebase client-side configuration
- `lib/firebase.admin.ts` - Firebase Admin SDK for server-side operations
- `lib/contexts/auth-context.tsx` - Authentication context and state management
- `lib/api-client.ts` - API client for backend communication
- `lib/types/firestore.ts` - TypeScript type definitions for Firestore documents
- `lib/utils.ts` - Utility functions including `cn()` for className merging

### Authentication Flow
The app uses Firebase Auth with the following flow:
1. Sign up creates user in Firebase Auth + Firestore user document
2. Email verification required before accessing protected routes
3. ProtectedRoute component guards authenticated pages
4. AuthContext provides user state across the application

### Data Architecture
- **Users Collection**: User profiles with quiz results and onboarding status
- **Career Matches**: Generated from quiz responses, stored in user documents
- **Learning Progress**: Tracks user progress through learning paths
- **Protected Routes**: Pages require authentication via ProtectedRoute wrapper

### Key Architectural Patterns

#### Route Protection
```typescript
// All protected pages wrapped with ProtectedRoute
<ProtectedRoute requireOnboarding>
  <PageContent />
</ProtectedRoute>
```

#### Context-based State Management
- AuthContext manages user authentication state
- User profile data fetched and cached in context
- State persists across page navigation

#### Component Composition
- shadcn/ui provides base components
- Custom components compose these for specific functionality
- Consistent design system with Tailwind CSS custom properties

### Environment Configuration

#### Required Environment Variables
```env
# Firebase Client (NEXT_PUBLIC_ prefix required for client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

#### Configuration Files
- `next.config.mjs` - Next.js configuration with TypeScript/ESLint settings
- `tailwind.config.ts` - Tailwind configuration with design system tokens
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*`)
- `firebase.json` - Firebase project configuration for Firestore

### Development Notes

#### Client vs Server Components
- Pages are client components (`"use client"`) for interactivity
- Server components used where possible for better performance
- Clear separation between client-side Firebase and Admin SDK usage

#### API Integration
- `api-client.ts` handles API communication with error handling
- Fallback responses for offline/development scenarios
- Proper input sanitization for user data

#### Form Handling
- React Hook Form with Zod validation for type safety
- Sanitized inputs prevent XSS attacks
- Toast notifications for user feedback

#### Routing Conventions
- File-based routing with Next.js App Router
- Dynamic routes use brackets (`[id]`)
- Route groups use parentheses `(auth)` for organization
- Loading and error boundaries available per route

### Firebase Security
- Firestore rules enforce user data isolation
- Authentication required for all user data operations
- Admin SDK used for server-side operations only
- Environment variables properly scoped (client vs server)

### Mobile Responsiveness
- Mobile-first Tailwind CSS approach
- MobileNav component handles responsive navigation
- Responsive design patterns throughout UI components

### Performance Considerations
- Next.js Image component for optimized images
- Font optimization with Google Fonts and variable fonts
- Code splitting via Next.js App Router
- Analytics tracking with Vercel Analytics

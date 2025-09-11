'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase.client'
import { UserDoc } from '@/lib/types/firestore'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  userProfile: UserDoc | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshUserProfile: async () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserDoc)
      }
      return userDoc.exists()
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return false
    }
  }

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData?: Partial<UserDoc>) => {
    try {
      const userRef = doc(db, 'users', user.uid)
      const newUserProfile: UserDoc = {
        id: user.uid,
        name: user.displayName || additionalData?.name || '',
        email: user.email!,
        createdAt: new Date(),
        ...additionalData
      }
      
      await setDoc(userRef, {
        ...newUserProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      setUserProfile(newUserProfile)
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name
      await updateProfile(user, { displayName: name })
      
      // Create user profile in Firestore
      await createUserProfile(user, { name: name })
      
      // Redirect to quiz
      router.push('/quiz')
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      
      // Check if user profile exists
      const profileExists = await fetchUserProfile(user.uid)
      
      if (!profileExists) {
        // Create profile if it doesn't exist
        await createUserProfile(user)
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      
      // Check if user profile exists
      const profileExists = await fetchUserProfile(user.uid)
      
      if (!profileExists) {
        // Create profile if it doesn't exist
        await createUserProfile(user)
        router.push('/quiz')
      } else {
        // Redirect to dashboard for existing users
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
      router.push('/')
    } catch (error: any) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid)
    }
  }

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Fetch user profile
        await fetchUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth'
import { auth } from '../firebase'

export interface AuthContextType {
  currentUser: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (emailOrBadge: string, pinOrPassword: string) => Promise<User>
  logout: () => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Helper to normalize badge IDs or raw emails to standard email addresses for Firebase Auth
 */
export const normalizeLoginIdentifier = (identifier: string): string => {
  const trimmed = identifier.trim()
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase()
  }
  // Convert officer badge ID (e.g. DL-SPL-4412 -> dlspl4412@nexus.gov.in)
  const cleanBadge = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${cleanBadge || 'officer'}@nexus.gov.in`
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (emailOrBadge: string, pinOrPassword: string): Promise<User> => {
    setLoading(true)
    const email = normalizeLoginIdentifier(emailOrBadge)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pinOrPassword)
      setCurrentUser(userCredential.user)
      return userCredential.user
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setLoading(true)
    try {
      await firebaseSignOut(auth)
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null
    try {
      return await auth.currentUser.getIdToken()
    } catch {
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        login,
        logout,
        getIdToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

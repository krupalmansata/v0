"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "./firebase"
import { ref, get, set } from "firebase/database"

interface AuthContextType {
  user: User | null
  userData: any | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // User Syncing: check if user exists in Realtime DB
        const userRef = ref(database, `users/${currentUser.uid}`)
        const snapshot = await get(userRef)
        
        if (!snapshot.exists()) {
          // Default data for a new user
          const newUserData = {
            name: currentUser.displayName,
            email: currentUser.email,
            avatar: currentUser.photoURL,
            role: "Owner", // Default role
            status: "active",
            businessId: "biz-001", // Default business ID for this prototype
            createdAt: new Date().toISOString()
          }
          await set(userRef, newUserData)
          setUserData(newUserData)
        } else {
          setUserData(snapshot.val())
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

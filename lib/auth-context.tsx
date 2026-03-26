"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "./firebase"
import { ref, get, set } from "firebase/database"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("Common")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          // User Syncing: check if user exists in Realtime DB
          const userRef = ref(database, `users/${currentUser.uid}`)
          const snapshot = await get(userRef)
          
          if (!snapshot.exists()) {
            // Generate a unique businessId for each new user/business
            const newBusinessId = `biz-${currentUser.uid.substring(0, 8)}-${Date.now()}`
            const newUserData = {
              name: currentUser.displayName,
              email: currentUser.email,
              avatar: currentUser.photoURL,
              role: "Owner",
              status: "active",
              businessId: newBusinessId,
              createdAt: new Date().toISOString()
            }
            await set(userRef, newUserData)
            // Also create the business record
            const businessRef = ref(database, `businesses/${newBusinessId}`)
            await set(businessRef, {
              name: currentUser.displayName ? t("defaultBusinessName", { name: currentUser.displayName }) : t("defaultBusinessFallback"),
              email: currentUser.email || "",
              phone: "",
              primaryColor: "#0f172a",
              slug: newBusinessId,
              invoiceFooter: t("defaultInvoiceFooter"),
              createdAt: new Date().toISOString()
            })
            setUserData(newUserData)
          } else {
            setUserData(snapshot.val())
          }
        } catch (error) {
          console.error("Error syncing user data:", error)
          setUserData(null)
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

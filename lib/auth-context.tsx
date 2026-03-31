"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth, database } from "./firebase"
import { ref, get, set, update } from "firebase/database"
import { useTranslations } from "next-intl"
import { encodeEmailKey } from "./utils"

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
            // Check if this email is already registered as a staff member in some business
            const emailKey = currentUser.email ? encodeEmailKey(currentUser.email) : null
            let staffMatch: { businessId: string; staffId: string } | null = null

            if (emailKey) {
              const indexSnap = await get(ref(database, `staffEmailIndex/${emailKey}`))
              if (indexSnap.exists()) {
                staffMatch = indexSnap.val()
              }
            }

            if (staffMatch) {
              // --- Staff member signing in for the first time ---
              const newUserData = {
                name: currentUser.displayName,
                email: currentUser.email,
                avatar: currentUser.photoURL,
                role: "Staff",
                status: "active",
                businessId: staffMatch.businessId,
                staffRecordId: staffMatch.staffId,
                createdAt: new Date().toISOString(),
              }
              await set(userRef, newUserData)
              // Store reverse link on the staff record so notifications work
              await update(
                ref(database, `staff/${staffMatch.businessId}/${staffMatch.staffId}`),
                { userId: currentUser.uid }
              )
              setUserData(newUserData)
            } else {
              // --- Brand-new business owner ---
              const newBusinessId = `biz-${currentUser.uid.substring(0, 8)}-${Date.now()}`
              const newUserData = {
                name: currentUser.displayName,
                email: currentUser.email,
                avatar: currentUser.photoURL,
                role: "Owner",
                status: "active",
                businessId: newBusinessId,
                createdAt: new Date().toISOString(),
              }
              await set(userRef, newUserData)
              // Also create the business record
              const businessRef = ref(database, `businesses/${newBusinessId}`)
              await set(businessRef, {
                name: currentUser.displayName
                  ? t("defaultBusinessName", { name: currentUser.displayName })
                  : t("defaultBusinessFallback"),
                email: currentUser.email || "",
                phone: "",
                primaryColor: "#0f172a",
                slug: newBusinessId,
                ownerUid: currentUser.uid,
                invoiceFooter: t("defaultInvoiceFooter"),
                createdAt: new Date().toISOString(),
              })
              setUserData(newUserData)
            }
          } else {
            const existing = snapshot.val()
            // Ensure ownerUid is set on the business (backfill for older accounts)
            if (existing.businessId && existing.role === "Owner") {
              const bizRef = ref(database, `businesses/${existing.businessId}/ownerUid`)
              const ownerSnap = await get(bizRef)
              if (!ownerSnap.exists()) {
                await set(bizRef, currentUser.uid)
              }
            }
            // If staffRecordId is not yet resolved, try to find it by email
            if (!existing.staffRecordId && existing.businessId && currentUser.email) {
              const staffSnap = await get(ref(database, `staff/${existing.businessId}`))
              if (staffSnap.exists()) {
                const staffData = staffSnap.val()
                const matchKey = Object.keys(staffData).find(
                  (k) => staffData[k].email?.toLowerCase() === currentUser.email!.toLowerCase()
                )
                if (matchKey) {
                  await update(userRef, { staffRecordId: matchKey })
                  // Also store reverse link so notifications can find this user
                  await update(ref(database, `staff/${existing.businessId}/${matchKey}`), { userId: currentUser.uid })
                  setUserData({ ...existing, staffRecordId: matchKey })
                } else {
                  setUserData(existing)
                }
              } else {
                setUserData(existing)
              }
            } else {
              setUserData(existing)
            }
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

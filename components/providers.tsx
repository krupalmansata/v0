"use client"

import { AuthProvider as FirebaseAuthProvider } from "@/lib/auth-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  )
}

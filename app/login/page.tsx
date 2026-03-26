"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, CheckCircle } from "lucide-react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      // The auth context will handle the redirect via the useEffect
    } catch (err: any) {
      console.error("Google Sign-In Error:", err)
      setError(err.message || "Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ProServe</h1>
              <p className="text-sm text-muted-foreground">Service Business Management</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>
                Use your Google account to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <Button 
                type="button" 
                onClick={handleGoogleLogin} 
                className="w-full flex items-center justify-center gap-2" 
                disabled={isLoading || authLoading}
                variant="outline"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isLoading ? "Signing in..." : "Sign in with Google"}
              </Button>

              <div className="mt-6 p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground text-center">
                  Authentication is powered by Firebase. <br />
                  Log in to sync your Realtime Dashboard data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Product summary */}
      <div className="hidden lg:flex lg:flex-1 bg-muted items-center justify-center p-8">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-6">
            Manage your service business with ease
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Receive booking requests</p>
                <p className="text-sm text-muted-foreground">
                  Accept customer inquiries through your public booking page
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Manage jobs and staff</p>
                <p className="text-sm text-muted-foreground">
                  Create jobs, assign staff, and track progress in real-time
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Collect proof of completion</p>
                <p className="text-sm text-muted-foreground">
                  Staff can upload photos to document completed work
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Generate professional invoices</p>
                <p className="text-sm text-muted-foreground">
                  Create branded invoices ready to share with customers
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login delay
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
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
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@proserve.example"
                    defaultValue="admin@proserve.example"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    defaultValue="demo123"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground text-center">
                  This is a UI prototype for demonstration purposes only.
                  <br />
                  Click sign in to explore the dashboard.
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

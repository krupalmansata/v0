import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"
import ProtectedRoute from "@/components/protected-route"
import { FCMInitializer } from "@/components/fcm-initializer"
import { Toaster } from "@/components/ui/sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {/* Silently initialise FCM — registers SW, requests permission, stores token */}
      <FCMInitializer />
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="lg:pl-64">
          <TopHeader />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
      {/* Toaster renders foreground push notifications as toasts */}
      <Toaster position="top-right" richColors />
    </ProtectedRoute>
  )
}

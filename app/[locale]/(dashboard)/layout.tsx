import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"
import ProtectedRoute from "@/components/protected-route"
import { FCMInitializer } from "@/components/fcm-initializer"
import { Toaster } from "@/components/ui/sonner"
import { useLocale } from "next-intl"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const isRtl = locale === 'ar'

  return (
    <ProtectedRoute>
      {/* Silently initialise FCM — registers SW, requests permission, stores token */}
      <FCMInitializer />
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="lg:ps-64">
          <TopHeader />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
      {/* Toaster renders foreground push notifications as toasts */}
      <Toaster position={isRtl ? "top-left" : "top-right"} richColors />
    </ProtectedRoute>
  )
}

import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="lg:pl-64">
          <TopHeader />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

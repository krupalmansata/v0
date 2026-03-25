import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64">
        <TopHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

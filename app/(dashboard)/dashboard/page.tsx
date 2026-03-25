import Link from "next/link"
import { Briefcase, CalendarCheck, Users, FileText, Plus, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { jobs, bookingRequests, staff, invoices, business } from "@/lib/mock-data"

export default function DashboardPage() {
  const todaysJobs = jobs.filter((job) => job.scheduledDate === "2026-03-19")
  const pendingBookings = bookingRequests.filter((req) => req.status === "new")
  const activeStaff = staff.filter((s) => s.status === "active")
  const recentInvoices = invoices.slice(0, 3)
  const recentBookings = bookingRequests.slice(0, 4)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your business activity"
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/staff">
            <Users className="h-4 w-4 mr-2" />
            Add Staff
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bookings">
            <CalendarCheck className="h-4 w-4 mr-2" />
            View Bookings
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/public/${business.slug}`}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Public Page
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Jobs Today"
          value={todaysJobs.length}
          icon={Briefcase}
          description={`${todaysJobs.filter((j) => j.status === "completed").length} completed`}
        />
        <StatCard
          title="Pending Bookings"
          value={pendingBookings.length}
          icon={CalendarCheck}
          description="Awaiting response"
        />
        <StatCard
          title="Active Staff"
          value={activeStaff.length}
          icon={Users}
          description={`${staff.length} total members`}
        />
        <StatCard
          title="Invoices This Week"
          value={invoices.length}
          icon={FileText}
          description={`${invoices.filter((i) => i.status === "paid").length} paid`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Today&apos;s Jobs</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todaysJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todaysJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{job.customerName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {job.serviceType} - {job.scheduledTime}
                      </p>
                    </div>
                    <StatusBadge status={job.status} className="ml-3 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Booking Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{request.customerName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.serviceType} - {request.preferredDate}
                    </p>
                  </div>
                  <StatusBadge status={request.status} className="ml-3 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/invoice-preview">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {invoice.customerName} - ${invoice.totalAmount}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} className="ml-3 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Staff Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeStaff.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {member.jobsToday} jobs today
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

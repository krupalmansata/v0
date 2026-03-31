"use client"

import { useState, useEffect } from "react"
import { Link } from "@/src/i18n/routing"
import { useTranslations } from "next-intl"
import { Briefcase, CalendarCheck, Users, FileText, Plus, Eye, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatTime } from "@/lib/utils"

export default function DashboardPage() {
  const tDashboard = useTranslations("Dashboard")
  const tCommon = useTranslations("Common")
  const { userData } = useAuth()
  const businessId = userData?.businessId
  
  const [slug, setSlug] = useState("")
  const [jobs, setJobs] = useState<any[]>([])
  const [bookingRequests, setBookingRequests] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return

    const jobsRef = ref(database, `jobs/${businessId}`)
    const bookingsRef = ref(database, `bookings/${businessId}`)
    const invoicesRef = ref(database, `invoices/${businessId}`)
    const businessRef = ref(database, `businesses/${businessId}`)

    const unsubscribeJobs = onValue(jobsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setJobs(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      } else setJobs([])
      setLoading(false)
    })

    const unsubscribeBookings = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setBookingRequests(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      } else setBookingRequests([])
    })

    const unsubscribeStaff = onValue(ref(database, `staff/${businessId}`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setStaff(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      } else setStaff([])
    })

    const unsubscribeInvoices = onValue(invoicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setInvoices(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      } else setInvoices([])
    })

    const unsubscribeBusiness = onValue(businessRef, (snapshot) => {
      if (snapshot.exists()) {
        setSlug(snapshot.val().slug || businessId)
      }
    })

    return () => {
      unsubscribeJobs()
      unsubscribeBookings()
      unsubscribeStaff()
      unsubscribeInvoices()
      unsubscribeBusiness()
    }
  }, [businessId])

  const todayStr = new Date().toISOString().split("T")[0]

  // Start of this week (Monday)
  const thisWeekStart = (() => {
    const d = new Date()
    const day = d.getDay() // 0=Sun
    const diff = d.getDate() - (day === 0 ? 6 : day - 1)
    const monday = new Date(d)
    monday.setDate(diff)
    return monday.toISOString().split("T")[0]
  })()

  const todaysJobs = jobs.filter((job) => job.scheduledDate === todayStr)
  const pendingBookings = bookingRequests.filter((req) => req.status === "new")
  const activeStaff = staff.filter((s) => s.status === "active")
  const invoicesThisWeek = invoices.filter((i) => (i.issueDate || i.createdAt || "").slice(0, 10) >= thisWeekStart)
  const recentInvoices = [...invoices]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 3)
  const recentBookings = [...bookingRequests]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 4)

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={tDashboard("title")} description={tCommon("loading")} />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={tDashboard("title")}
        description={tDashboard("description")}
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4 me-2" />
            {tDashboard("quickActions.newJob")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/staff">
            <Users className="h-4 w-4 me-2" />
            {tDashboard("quickActions.addStaff")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bookings">
            <CalendarCheck className="h-4 w-4 me-2" />
            {tDashboard("quickActions.viewBookings")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/public/${slug}`}>
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
          title={tDashboard("stats.activeStaff")}
          value={activeStaff.length}
          icon={Users}
          description={`${staff.length} total members`}
        />
        <StatCard
          title="Invoices This Week"
          value={invoicesThisWeek.length}
          icon={FileText}
          description={`${invoicesThisWeek.filter((i) => i.status === "paid").length} paid`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Today&apos;s Jobs</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">
                {tDashboard("viewAll")}
                <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
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
                    <StatusBadge status={job.status} className="ms-3 shrink-0" />
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
                {tDashboard("viewAll")}
                <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
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
                  <StatusBadge status={request.status} className="ms-3 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{tDashboard("recentInvoicesCardTitle")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/invoice-preview">
                {tDashboard("viewAll")}
                <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
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
                  <StatusBadge status={invoice.status} className="ms-3 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{tDashboard("staffActivityCardTitle")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff">
                {tDashboard("viewAll")}
                <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
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
                        {(member.name || "?").split(" ").map((n: string) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {tDashboard("jobsAssignedToday", { count: jobs.filter((j) => j.assignedStaffId === member.id && j.scheduledDate === todayStr).length })}
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

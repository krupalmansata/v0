"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"

const statusFilters = ["all", "new", "assigned", "in-progress", "completed"] as const

export default function JobsPage() {
  const { userData } = useAuth()
  const businessId = userData?.businessId

  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>("all")
  
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return

    const jobsRef = ref(database, `jobs/${businessId}`)
    const unsubscribe = onValue(jobsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setJobs(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      } else {
        setJobs([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [businessId])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.customerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.serviceType?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.id?.toLowerCase() || "").includes(searchQuery.toLowerCase())

    const matchesFilter = activeFilter === "all" || job.status === activeFilter

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Jobs" description="Loading..." />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Manage and track all your service jobs">
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Job
          </Link>
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="capitalize"
            >
              {filter === "in-progress" ? "In Progress" : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-muted-foreground">
                          {job.id}
                        </span>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="font-medium mt-1 truncate">{job.customerName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {job.serviceType}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <p className="text-sm">
                        {job.scheduledDate} at {job.scheduledTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.assignedStaffName || "Unassigned"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

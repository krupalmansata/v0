"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Phone,
  MapPin,
  Calendar,
  Clock,
  Camera,
  CheckCircle,
  ArrowLeft,
  Play,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import { jobs } from "@/lib/mock-data"

export default function StaffJobsPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({})
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, number>>({})

  // Filter jobs assigned to staff (simulating logged-in staff member)
  const assignedJobs = jobs.filter(
    (job) => job.assignedStaffId && ["assigned", "in-progress"].includes(job.status)
  )

  const getJobStatus = (jobId: string, originalStatus: string) => {
    return jobStatuses[jobId] || originalStatus
  }

  const handleStartJob = (jobId: string) => {
    setJobStatuses((prev) => ({ ...prev, [jobId]: "in-progress" }))
  }

  const handleCompleteJob = (jobId: string) => {
    setJobStatuses((prev) => ({ ...prev, [jobId]: "completed" }))
    setSelectedJob(null)
  }

  const handleUploadPhoto = (jobId: string) => {
    setUploadedPhotos((prev) => ({
      ...prev,
      [jobId]: (prev[jobId] || 0) + 1,
    }))
  }

  const currentJob = selectedJob ? jobs.find((j) => j.id === selectedJob) : null

  if (currentJob) {
    const currentStatus = getJobStatus(currentJob.id, currentJob.status)
    const photoCount = uploadedPhotos[currentJob.id] || currentJob.proofPhotos.length

    return (
      <div className="min-h-screen bg-muted">
        {/* Header */}
        <header className="sticky top-0 bg-background border-b z-10">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedJob(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">{currentJob.id}</h1>
              <p className="text-sm text-muted-foreground">{currentJob.serviceType}</p>
            </div>
            <StatusBadge status={currentStatus as any} />
          </div>
        </header>

        {/* Job Details */}
        <main className="p-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-lg font-medium">{currentJob.customerName}</p>
                <p className="text-muted-foreground">{currentJob.serviceType}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm">{currentJob.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm">{currentJob.customerPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm">{currentJob.scheduledDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm">{currentJob.scheduledTime}</span>
                </div>
              </div>

              {currentJob.notes && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{currentJob.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proof Photos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Proof Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {photoCount > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: photoCount }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-muted flex items-center justify-center"
                    >
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No photos uploaded yet
                </p>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleUploadPhoto(currentJob.id)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </CardContent>
          </Card>

          {/* Completion Notes */}
          {currentStatus === "in-progress" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Completion Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any notes about the completed work..."
                  rows={3}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4">
            {currentStatus === "assigned" && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleStartJob(currentJob.id)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Job
              </Button>
            )}
            {currentStatus === "in-progress" && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleCompleteJob(currentJob.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            {currentStatus === "completed" && (
              <div className="text-center p-4 rounded-lg bg-green-50">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <p className="font-medium mt-2 text-green-800">Job Completed</p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold">My Jobs</h1>
            <p className="text-sm text-muted-foreground">
              {assignedJobs.length} assigned jobs
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Admin View</Link>
          </Button>
        </div>
      </header>

      {/* Jobs List */}
      <main className="p-4 space-y-3">
        {assignedJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No jobs assigned to you</p>
            </CardContent>
          </Card>
        ) : (
          assignedJobs.map((job) => {
            const currentStatus = getJobStatus(job.id, job.status)
            return (
              <Card
                key={job.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedJob(job.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {job.id}
                        </span>
                        <StatusBadge status={currentStatus as any} />
                      </div>
                      <p className="font-medium mt-1 truncate">{job.customerName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {job.serviceType}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{job.scheduledTime}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.scheduledDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{job.address}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}

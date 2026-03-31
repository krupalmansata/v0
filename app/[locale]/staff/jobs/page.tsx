"use client"
import { useTranslations } from "next-intl"

import { useState, useEffect, useRef } from "react"
import { Link } from "@/src/i18n/routing"
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
import { useAuth } from "@/lib/auth-context"
import { ref, onValue, update } from "firebase/database"
import { database } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { normalizePhotos } from "@/lib/utils"

export default function StaffJobsPage() {
  const t = useTranslations("StaffJobs");
  const tStatus = useTranslations("Status");
  const { userData } = useAuth()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [completionNotes, setCompletionNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedJobRef = useRef<string | null>(null)
  
  useEffect(() => {
    if (!userData?.businessId) {
      setLoading(false)
      return
    }
    const unsub = onValue(ref(database, "jobs/" + userData.businessId), snap => {
      if (snap.exists()) {
        const data = snap.val()
        const jobsList = Object.keys(data).map(key => ({ id: key, ...data[key] }))
        // Bug fix #1 & #2: filter by the logged-in staff member's record ID
        const staffRecordId = userData.staffRecordId
        const active = jobsList.filter((j: any) => {
          const isMyJob = staffRecordId
            ? j.assignedStaffId === staffRecordId
            : j.assignedStaffId // fallback: show all assigned if no mapping yet
          return isMyJob && ["assigned", "in-progress", "completed"].includes(j.status)
        })
        setJobs(active)
      } else {
        setJobs([])
      }
      setLoading(false)
    })
    return () => unsub()
  }, [userData])
  const getJobStatus = (jobId: string) => {
    return jobs.find((j) => j.id === jobId)?.status ?? "assigned"
  }

  const handleStartJob = async (jobId: string) => {
    if (!userData?.businessId) return
    try {
      await update(ref(database, `jobs/${userData.businessId}/${jobId}`), { status: "in-progress" })
    } catch (error) {
      console.error("Failed to start job:", error)
      toast({ title: tStatus("Error"), description: tStatus("Error"), variant: "destructive" })
    }
  }

  const handleCompleteJob = async (jobId: string) => {
    if (!userData?.businessId) return
    const job = jobs.find(j => j.id === jobId)
    // Bug fix #6: require at least one proof photo
    const photos: string[] = normalizePhotos(job?.proofPhotos)
    if (photos.length === 0) {
      toast({ title: "Proof required", description: "Please upload at least one proof photo before marking complete.", variant: "destructive" })
      return
    }
    try {
      await update(ref(database, `jobs/${userData.businessId}/${jobId}`), {
        status: "completed",
        completionNotes: completionNotes.trim(),
      })
      setSelectedJob(null)
      setCompletionNotes("")
    } catch (error) {
      console.error("Failed to complete job:", error)
      toast({ title: tStatus("Error"), description: tStatus("Error"), variant: "destructive" })
    }
  }

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const jobId = selectedJobRef.current
    if (!file || !jobId || !userData?.businessId) return
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const filePath = `job-photos/${userData.businessId}/${jobId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(filePath, file, { contentType: file.type, upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('job-photos')
        .getPublicUrl(filePath)

      const existingPhotos: string[] = normalizePhotos(job.proofPhotos)
      const updatedPhotos = [...existingPhotos, urlData.publicUrl]
      await update(ref(database, `jobs/${userData.businessId}/${jobId}`), { proofPhotos: updatedPhotos })
      toast({ title: t("uploadPhoto"), description: "Photo uploaded successfully" })
    } catch (err: any) {
      console.error('Photo upload error:', err)
      toast({ title: "Upload failed", description: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const currentJob = selectedJob ? jobs.find((j) => j.id === selectedJob) : null
  selectedJobRef.current = selectedJob

  // Reset notes when switching jobs
  useEffect(() => {
    setCompletionNotes("")
  }, [selectedJob])

  if (currentJob) {
    const currentStatus = getJobStatus(currentJob.id)
    const proofPhotos: string[] = normalizePhotos(currentJob.proofPhotos)

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
              <CardTitle className="text-base">{t("proofPhotos")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {proofPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {proofPhotos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Proof photo ${i + 1}`}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No photos uploaded yet
                </p>
              )}

              {/* Hidden native file / camera input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelected}
              />
              {/* Bug fix #5: hide upload button on completed jobs */}
              {currentStatus !== "completed" && (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  onClick={handleUploadPhoto}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : t("uploadPhoto")}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Completion Notes */}
          {currentStatus === "in-progress" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("completionNotes")}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bug fix #4: bind textarea to state so notes are saved */}
                <Textarea
                  placeholder={t("addNotesPlaceholder")}
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
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
                {t("startJob")}
              </Button>
            )}
            {currentStatus === "in-progress" && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleCompleteJob(currentJob.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("markComplete")}
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
            <h1 className="text-lg font-semibold">{t("myJobs")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("assignedJobsCount", { count: jobs.filter(j => j.status !== "completed").length })}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">{t("adminView")}</Link>
          </Button>
        </div>
      </header>

      {/* Jobs List */}
      <main className="p-4 space-y-3">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{t("noJobsAssigned")}</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const currentStatus = getJobStatus(job.id)
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

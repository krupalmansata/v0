"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, MapPin, Calendar, User, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue, update } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

const statusSteps = [
  { key: "new", label: "New" },
  { key: "assigned", label: "Assigned" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
]

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { userData } = useAuth()
  const businessId = userData?.businessId
  const { toast } = useToast()

  const [job, setJob] = useState<any>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [reassignId, setReassignId] = useState("")

  useEffect(() => {
    if (!businessId) return

    const jobRef = ref(database, `jobs/${businessId}/${id}`)
    const unsubscribeJob = onValue(jobRef, (snapshot) => {
      if (snapshot.exists()) {
        setJob({ id: snapshot.key, ...snapshot.val() })
      } else {
        setJob(null)
      }
      setLoading(false)
    })

    const unsubscribeStaff = onValue(ref(database, `staff/${businessId}`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setStaff(Object.keys(data).map(key => ({ id: key, ...data[key] })).filter(s => s.status === "active"))
      } else setStaff([])
    })

    return () => {
      unsubscribeJob()
      unsubscribeStaff()
    }
  }, [businessId, id])

  const updateStatus = async (newStatus: string) => {
    if (!businessId || !job) return
    setUpdating(true)
    try {
      await update(ref(database, `jobs/${businessId}/${id}`), { status: newStatus })
      toast({ title: "Status Updated", description: `Job marked as ${newStatus}.` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    } finally {
      setUpdating(false)
    }
  }

  const handleReassign = async () => {
    if (!businessId || !job || !reassignId) return
    setUpdating(true)
    try {
      const selectedMember = staff.find(s => s.id === reassignId)
      await update(ref(database, `jobs/${businessId}/${id}`), { 
        assignedStaffId: reassignId,
        assignedStaffName: selectedMember?.name || "",
        status: job.status === "new" ? "assigned" : job.status
      })
      toast({ title: "Staff Reassigned", description: "Successfully assigned new staff member." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to reassign staff", variant: "destructive" })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Job Details" description="Loading..." />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title="Job Not Found" />
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">The requested job could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === job.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={`Job ${job.id}`} description={job.serviceType}>
          <StatusBadge status={job.status} />
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Stepper */}
          <Card>
            <CardHeader>
              <CardTitle>Job Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index <= currentStepIndex
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-1 text-center">{step.label}</span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-0.5 w-12 sm:w-16 lg:w-20 mx-2 ${
                          currentStepIndex >= 0 && index < currentStepIndex ? "bg-foreground" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{job.customerName}</p>
                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{job.customerPhone}</p>
                  <p className="text-sm text-muted-foreground">Phone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{job.address}</p>
                  <p className="text-sm text-muted-foreground">Service Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {job.scheduledDate} at {job.scheduledTime}
                  </p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{job.assignedStaffName || "Unassigned"}</p>
                  <p className="text-sm text-muted-foreground">Assigned Staff</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{job.description}</p>
                  <p className="text-sm text-muted-foreground">Description</p>
                </div>
              </div>
              {job.notes && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proof Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Proof of Completion</CardTitle>
            </CardHeader>
            <CardContent>
              {!job.proofPhotos || job.proofPhotos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    No proof photos uploaded yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {job.proofPhotos.map((photo: any, index: number) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg bg-muted flex items-center justify-center"
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === "new" && (
                <Button
                  className="w-full"
                  disabled={updating}
                  onClick={() => updateStatus("assigned")}
                >
                  Mark as Assigned
                </Button>
              )}
              {job.status === "assigned" && (
                <Button
                  className="w-full"
                  disabled={updating}
                  onClick={() => updateStatus("in-progress")}
                >
                  Mark In Progress
                </Button>
              )}
              {job.status === "in-progress" && (
                <Button
                  className="w-full"
                  disabled={updating}
                  onClick={() => updateStatus("completed")}
                >
                  Mark Completed
                </Button>
              )}
              {job.status === "completed" && (
                <Button className="w-full" asChild>
                  <Link href="/invoice-preview">Generate Invoice</Link>
                </Button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Reassign Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reassign Staff</DialogTitle>
                    <DialogDescription>Select a new staff member to assign to this job.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Select onValueChange={setReassignId} value={reassignId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={handleReassign} disabled={!reassignId || updating}>
                      Confirm Reassignment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" className="w-full" asChild>
                <Link href="/jobs">Back to Jobs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${job.estimatedAmount}</p>
              <p className="text-sm text-muted-foreground">Estimated amount</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, MapPin, Calendar, User, FileText, Image as ImageIcon, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue, update, push, set } from "firebase/database"
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
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editData, setEditData] = useState<any>({})

  const serviceTypes = ["AC Servicing", "Plumbing", "Electrical", "Cleaning", "Pest Control", "Other"]

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

  // Sync edit form whenever job data changes
  useEffect(() => {
    if (job) {
      setEditData({
        customerName: job.customerName || "",
        customerPhone: job.customerPhone || "",
        address: job.address || "",
        serviceType: job.serviceType || "",
        description: job.description || "",
        scheduledDate: job.scheduledDate || "",
        scheduledTime: job.scheduledTime || "",
        estimatedAmount: job.estimatedAmount != null ? String(job.estimatedAmount) : "",
        notes: job.notes || "",
      })
    }
  }, [job])
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

  const handleEditSave = async () => {
    if (!businessId || !job) return
    if (!editData.customerName?.trim()) {
      toast({ title: "Validation Error", description: "Customer name is required.", variant: "destructive" })
      return
    }
    setEditLoading(true)
    try {
      const updates: any = {
        customerName: editData.customerName.trim(),
        customerPhone: editData.customerPhone || "",
        address: editData.address || "",
        serviceType: editData.serviceType || "",
        description: editData.description || "",
        scheduledDate: editData.scheduledDate || "",
        scheduledTime: editData.scheduledTime || "",
        estimatedAmount: editData.estimatedAmount ? parseFloat(editData.estimatedAmount) : 0,
        notes: editData.notes || "",
      }
      await update(ref(database, `jobs/${businessId}/${id}`), updates)
      toast({ title: "Job Updated", description: "Job details saved successfully." })
      setEditOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" })
    } finally {
      setEditLoading(false)
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
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
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
                  {job.proofPhotos.map((url: string, index: number) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Proof photo ${index + 1}`}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </a>
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
                <Button
                  className="w-full"
                  disabled={generatingInvoice}
                  onClick={async () => {
                    if (!businessId) return
                    setGeneratingInvoice(true)
                    try {
                      const invoicesRef = ref(database, `invoices/${businessId}`)
                      const newRef = push(invoicesRef)
                      const invoiceData = {
                        invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
                        customerName: job.customerName || "",
                        customerAddress: job.address || "",
                        customerPhone: job.customerPhone || "",
                        status: "draft",
                        issueDate: new Date().toISOString().split("T")[0],
                        jobId: job.id,
                        serviceType: job.serviceType || "",
                        totalAmount: job.estimatedAmount || 0,
                        createdAt: new Date().toISOString(),
                      }
                      await set(newRef, invoiceData)
                      toast({ title: "Invoice Created", description: "Invoice generated successfully." })
                      router.push("/invoice-preview")
                    } catch (error) {
                      toast({ title: "Error", description: "Failed to generate invoice", variant: "destructive" })
                    } finally {
                      setGeneratingInvoice(false)
                    }
                  }}
                >
                  {generatingInvoice ? "Generating..." : "Generate Invoice"}
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

      {/* Edit Job Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update the job details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  value={editData.customerName || ""}
                  onChange={(e) => setEditData((p: any) => ({ ...p, customerName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editData.customerPhone || ""}
                  onChange={(e) => setEditData((p: any) => ({ ...p, customerPhone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editData.address || ""}
                onChange={(e) => setEditData((p: any) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select
                  value={editData.serviceType || ""}
                  onValueChange={(v) => setEditData((p: any) => ({ ...p, serviceType: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Amount ($)</Label>
                <Input
                  type="number"
                  value={editData.estimatedAmount || ""}
                  onChange={(e) => setEditData((p: any) => ({ ...p, estimatedAmount: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input
                  type="date"
                  value={editData.scheduledDate || ""}
                  onChange={(e) => setEditData((p: any) => ({ ...p, scheduledDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Time</Label>
                <Input
                  type="time"
                  value={editData.scheduledTime || ""}
                  onChange={(e) => setEditData((p: any) => ({ ...p, scheduledTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={editData.description || ""}
                onChange={(e) => setEditData((p: any) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={editData.notes || ""}
                onChange={(e) => setEditData((p: any) => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

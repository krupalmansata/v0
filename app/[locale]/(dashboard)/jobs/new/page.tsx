"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Link, useRouter } from "@/src/i18n/routing"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { database } from "@/lib/firebase"
import { ref, push, set, update, onValue } from "firebase/database"

export default function NewJobPage() {
  const { userData } = useAuth()
  const businessId = userData?.businessId
  const { toast } = useToast()

  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<any[]>([])

  const [formData, setFormData] = useState({
    customerName: searchParams.get("customerName") || "",
    customerPhone: searchParams.get("customerPhone") || "",
    address: searchParams.get("address") || "",
    serviceType: searchParams.get("serviceType") || "",
    description: "",
    scheduledDate: searchParams.get("preferredDate") || "",
    scheduledTime: searchParams.get("preferredTime") || "",
    assignedStaffId: "",
    estimatedAmount: "",
    notes: searchParams.get("notes") || "",
  })

  // Basic service types (you may want to move these to DB later)
  const serviceTypes = ["AC Servicing", "Plumbing", "Electrical", "Cleaning", "Pest Control", "Other"]

  useEffect(() => {
    if (!businessId) return
    const staffRef = ref(database, `staff/${businessId}`)
    const unsubscribeStaff = onValue(staffRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setStaff(Object.keys(data).map(key => ({ id: key, ...data[key] })).filter(s => s.status === "active"))
      } else setStaff([])
    })
    return () => unsubscribeStaff()
  }, [businessId])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (isDraft: boolean) => {
    if (!businessId) return

    // Validation — drafts require at least a customer name
    if (!formData.customerName.trim()) {
      toast({ title: "Validation Error", description: "Customer name is required.", variant: "destructive" })
      return
    }
    if (!isDraft) {
      if (!formData.customerPhone.trim()) {
        toast({ title: "Validation Error", description: "Customer phone is required.", variant: "destructive" })
        return
      }
      if (!formData.address.trim()) {
        toast({ title: "Validation Error", description: "Service address is required.", variant: "destructive" })
        return
      }
      if (!formData.serviceType) {
        toast({ title: "Validation Error", description: "Service type is required.", variant: "destructive" })
        return
      }
      if (!formData.scheduledDate) {
        toast({ title: "Validation Error", description: "Scheduled date is required.", variant: "destructive" })
        return
      }
    }

    setLoading(true)
    try {
      const jobsRef = ref(database, `jobs/${businessId}`)
      const newJobRef = push(jobsRef)

      const selectedMember = staff.find((s) => s.id === formData.assignedStaffId)

      const jobData = {
        ...formData,
        assignedStaffName: selectedMember?.name || "",
        estimatedAmount: formData.estimatedAmount ? parseFloat(formData.estimatedAmount) : 0,
        status: isDraft ? "draft" : (formData.assignedStaffId ? "assigned" : "new"),
        createdAt: new Date().toISOString(),
      }
      
      await set(newJobRef, jobData)

      // If converted from a booking, mark the booking as converted and link back
      if (bookingId) {
        await update(ref(database, `bookings/${businessId}/${bookingId}`), {
          status: "converted",
          jobId: newJobRef.key,
        })
      }

      toast({
        title: "Job Created",
        description: `Successfully created a new job.`,
      })
      router.push("/jobs")
    } catch (error) {
      console.error("Failed to create job:", error)
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedStaff = staff.find((s) => s.id === formData.assignedStaffId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Create New Job" description="Add a new service job manually" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    placeholder="(555) 000-0000"
                    value={formData.customerPhone}
                    onChange={(e) => handleChange("customerPhone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter service address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => handleChange("serviceType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedAmount">Estimated Amount ($)</Label>
                  <Input
                    id="estimatedAmount"
                    type="number"
                    placeholder="0.00"
                    value={formData.estimatedAmount}
                    onChange={(e) => handleChange("estimatedAmount", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the job requirements"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleChange("scheduledDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleChange("scheduledTime", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedStaff">Assign Staff</Label>
                <Select
                  value={formData.assignedStaffId}
                  onValueChange={(value) => handleChange("assignedStaffId", value)}
                >
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or instructions"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => handleSubmit(false)} disabled={loading}>
              {loading ? "Creating..." : "Create Job"}
            </Button>
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
              Save Draft
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/jobs">Cancel</Link>
            </Button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Job Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{formData.customerName || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{formData.customerPhone || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{formData.address || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service Type</p>
                <p className="font-medium">{formData.serviceType || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Schedule</p>
                <p className="font-medium">
                  {formData.scheduledDate && formData.scheduledTime
                    ? `${formData.scheduledDate} at ${formData.scheduledTime}`
                    : "Not scheduled"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="font-medium">{selectedStaff?.name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Amount</p>
                <p className="font-medium">
                  {formData.estimatedAmount ? `$${formData.estimatedAmount}` : "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

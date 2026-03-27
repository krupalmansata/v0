"use client"

import { useState, useEffect } from "react"
import { Plus, Phone, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function StaffPage() {
  const { userData } = useAuth()
  const t = useTranslations("Staff")
  const tStatus = useTranslations("Status")
  const businessId = userData?.businessId
  const { toast } = useToast()

  const [showAddForm, setShowAddForm] = useState(false)
  const [staff, setStaff] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "",
    status: "active"
  })

  useEffect(() => {
    if (!businessId) return

    const staffRef = ref(database, `staff/${businessId}`)
    const jobsRef = ref(database, `jobs/${businessId}`)

    const unsubscribeStaff = onValue(staffRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setStaff(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      } else {
        setStaff([])
      }
    })

    const unsubscribeJobs = onValue(jobsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setJobs(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      } else {
        setJobs([])
      }
      setLoading(false)
    })

    return () => {
      unsubscribeStaff()
      unsubscribeJobs()
    }
  }, [businessId])

  const getStaffJobs = (staffId: string) => {
    return jobs.filter((job) => job.assignedStaffId === staffId)
  }

  const handleAddStaff = async () => {
    if (!businessId || !formData.name) return
    setSaving(true)
    try {
      const newStaffRef = push(ref(database, `staff/${businessId}`))
      await set(newStaffRef, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString()
      })
      toast({ title: "Staff Member Added", description: "Successfully added new team member." })
      setShowAddForm(false)
      setFormData({ name: "", phone: "", role: "", status: "active" })
    } catch (error) {
      toast({ title: "Error", description: "Could not add staff member", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Staff" description="Loading..." />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  const todayStr = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Manage your team members">
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Fill in the details below to add a new team member.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter full name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="(555) 000-0000" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData(prev => ({...prev, role: val}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior Technician">Junior Technician</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Senior Technician">Senior Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData(prev => ({...prev, status: val}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleAddStaff} disabled={saving || !formData.name}>
                  {saving ? "Adding..." : "Add Staff Member"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => {
          const memberJobs = getStaffJobs(member.id)
          const activeJobs = memberJobs.filter(
            (j) => j.status === "assigned" || j.status === "in-progress"
          )
          const jobsTodayCount = memberJobs.filter(j => j.scheduledDate === todayStr).length

          return (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {member.name ? member.name.split(" ").map((n: string) => n[0]).join("") : "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={member.status} />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{member.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {jobsTodayCount} jobs today / {activeJobs.length} active
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Jobs
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Jobs for {member.name}</DialogTitle>
                        <DialogDescription>View all jobs assigned to this staff member.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 pt-4 max-h-[400px] overflow-y-auto">
                        {memberJobs.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No jobs assigned
                          </p>
                        ) : (
                          memberJobs.map((job) => (
                            <div
                              key={job.id}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div>
                                <p className="font-medium text-sm">{job.customerName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {job.serviceType} - {job.scheduledDate}
                                </p>
                              </div>
                              <StatusBadge status={job.status} />
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

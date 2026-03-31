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
import { ref, onValue, push, set, update, remove } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { encodeEmailKey } from "@/lib/utils"
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
  const [editStaff, setEditStaff] = useState<any | null>(null)
  const [editFormData, setEditFormData] = useState({ name: "", email: "", phone: "", role: "", status: "active" })
  const [editSaving, setEditSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString()
      })
      // Index email so staff can sign in with Google and be recognised
      if (formData.email) {
        const emailKey = encodeEmailKey(formData.email)
        await set(ref(database, `staffEmailIndex/${emailKey}`), {
          businessId,
          staffId: newStaffRef.key,
        })
      }
      toast({ title: "Staff Member Added", description: "Successfully added new team member." })
      setShowAddForm(false)
      setFormData({ name: "", email: "", phone: "", role: "", status: "active" })
    } catch (error) {
      toast({ title: "Error", description: "Could not add staff member", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleEditStaff = async () => {
    if (!businessId || !editStaff || !editFormData.name) return
    setEditSaving(true)
    try {
      await update(ref(database, `staff/${businessId}/${editStaff.id}`), {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        role: editFormData.role,
        status: editFormData.status,
      })
      // Update email index: remove old, set new
      if (editStaff.email && editStaff.email !== editFormData.email) {
        const oldKey = encodeEmailKey(editStaff.email)
        await remove(ref(database, `staffEmailIndex/${oldKey}`))
      }
      if (editFormData.email) {
        const newKey = encodeEmailKey(editFormData.email)
        await set(ref(database, `staffEmailIndex/${newKey}`), {
          businessId,
          staffId: editStaff.id,
        })
      }
      toast({ title: "Staff Updated", description: "Staff member details updated successfully." })
      setEditStaff(null)
    } catch (error) {
      toast({ title: "Error", description: "Could not update staff member", variant: "destructive" })
    } finally {
      setEditSaving(false)
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
    <>
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
                <Label htmlFor="email">Login Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the email the staff member uses to log in. This links their account to their jobs.
                </p>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditFormData({
                        name: member.name || "",
                        email: member.email || "",
                        phone: member.phone || "",
                        role: member.role || "",
                        status: member.status || "active",
                      })
                      setEditStaff(member)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>

      {/* Edit Staff Dialog */}
      <Dialog open={!!editStaff} onOpenChange={(open) => { if (!open) setEditStaff(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update the details for {editStaff?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Login Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editFormData.role} onValueChange={(val) => setEditFormData(prev => ({ ...prev, role: val }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior Technician">Junior Technician</SelectItem>
                  <SelectItem value="Technician">Technician</SelectItem>
                  <SelectItem value="Senior Technician">Senior Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editFormData.status} onValueChange={(val) => setEditFormData(prev => ({ ...prev, status: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleEditStaff} disabled={editSaving || !editFormData.name}>
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditStaff(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>  
  )
}

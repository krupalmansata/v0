"use client"

import { useState } from "react"
import { Plus, Phone, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { staff, jobs } from "@/lib/mock-data"
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
  const [showAddForm, setShowAddForm] = useState(false)

  const getStaffJobs = (staffId: string) => {
    return jobs.filter((job) => job.assignedStaffId === staffId)
  }

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
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="(555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior Technician</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="senior">Senior Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="active">
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
                <Button className="flex-1" onClick={() => setShowAddForm(false)}>
                  Add Staff Member
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

          return (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {member.name.split(" ").map((n) => n[0]).join("")}
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
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {member.jobsToday} jobs today / {activeJobs.length} active
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

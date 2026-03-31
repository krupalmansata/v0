"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/src/i18n/routing"
import { Phone, MapPin, Calendar, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue, update } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const statusFilters = ["all", "new", "contacted", "converted", "rejected"] as const

export default function BookingsPage() {
  const tBookings = useTranslations("Bookings")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { userData } = useAuth()
  const businessId = userData?.businessId
  const { toast } = useToast()

  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>("all")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [convertTarget, setConvertTarget] = useState<{ id: string; request: any } | null>(null)
  const [converting, setConverting] = useState(false)
  const [statusChangingId, setStatusChangingId] = useState<string | null>(null)

  useEffect(() => {
    if (!businessId) return
    const bookingsRef = ref(database, `bookings/${businessId}`)
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }))
        list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        setRequests(list)
      } else {
        setRequests([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [businessId])

  const filteredRequests = requests.filter(
    (req) => activeFilter === "all" || req.status === activeFilter
  )

  const handleStatusChange = async (id: string, newStatus: string) => {
    setStatusChangingId(id)
    try {
      await update(ref(database, `bookings/${businessId}/${id}`), { status: newStatus })
      toast({ title: tBookings("statusUpdated"), description: tBookings("statusUpdatedDesc", { status: tBookings(`filters.${newStatus}`) }) })
    } catch (error) {
      toast({ title: tCommon("error"), description: tBookings("updateError"), variant: "destructive" })
    } finally {
      setStatusChangingId(null)
    }
  }

  const handleConvertToJob = (id: string, request: any) => {
    // Navigate to job creation with all booking data pre-filled via search params.
    // Booking status is marked "converted" only after the job is actually saved.
    const searchParams = new URLSearchParams({
      bookingId: id,
      customerName: request.customerName || "",
      customerPhone: request.customerPhone || "",
      address: request.address || "",
      serviceType: request.serviceType || "",
      preferredDate: request.preferredDate || "",
      preferredTime: request.preferredTime || "",
      notes: request.notes || "",
    })
    router.push(`/jobs/new?${searchParams.toString()}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={tBookings("title")} description={tCommon("loading")} />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Requests"
        description="Manage incoming customer inquiries"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="capitalize"
          >
            {tBookings(`filters.${filter}`)}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{tBookings("noResults")}</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        {request.id}
                      </span>
                      <StatusBadge status={request.status} />
                      <span className="text-xs text-muted-foreground">
                        via {request.source}
                      </span>
                    </div>

                    <div>
                      <p className="font-medium text-lg">{request.customerName}</p>
                      <p className="text-muted-foreground">{request.serviceType}</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{request.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{request.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{request.preferredDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{request.preferredTime}</span>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{request.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                    {request.status === "new" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setConvertTarget({ id: request.id, request })}
                        >
                              {tBookings("actions.convertToJob")}
                            </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={statusChangingId === request.id}
                          onClick={() => handleStatusChange(request.id, "contacted")}
                        >
                              {tBookings("actions.markContacted")}
                            </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={statusChangingId === request.id}
                          onClick={() => handleStatusChange(request.id, "rejected")}
                        >
                              {tBookings("actions.reject")}
                            </Button>
                      </>
                    )}
                    {request.status === "contacted" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setConvertTarget({ id: request.id, request })}
                        >
                              {tBookings("actions.convertToJob")}
                            </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={statusChangingId === request.id}
                          onClick={() => handleStatusChange(request.id, "rejected")}
                        >
                              {tBookings("actions.reject")}
                            </Button>
                      </>
                    )}
                    {(request.status === "converted" ||
                      request.status === "rejected") && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Details</DialogTitle>
                            <DialogDescription>Complete information about this booking request.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">{tBookings("details.customer")}</p>
                              <p className="font-medium">{request.customerName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{tBookings("details.service")}</p>
                              <p className="font-medium">{request.serviceType}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{tBookings("details.phone")}</p>
                              <p className="font-medium">{request.customerPhone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{tBookings("details.address")}</p>
                              <p className="font-medium">{request.address}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Preferred Schedule
                              </p>
                              <p className="font-medium">
                                {request.preferredDate} - {request.preferredTime}
                              </p>
                            </div>
                            {request.notes && (
                              <div>
                                <p className="text-sm text-muted-foreground">{tBookings("details.notes")}</p>
                                <p className="font-medium">{request.notes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Confirmation dialog for booking → job conversion */}
      <AlertDialog
        open={!!convertTarget}
        onOpenChange={(open) => { if (!open) setConvertTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert Booking to Job?</AlertDialogTitle>
            <AlertDialogDescription>
              The job creation form will open pre-filled with this booking&apos;s details.
              The booking will be marked as <strong>converted</strong> only after the job is saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={converting}
              onClick={() => {
                if (convertTarget) {
                  setConverting(true)
                  handleConvertToJob(convertTarget.id, convertTarget.request)
                  setConvertTarget(null)
                }
              }}
            >
              {converting ? "Converting..." : "Convert to Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

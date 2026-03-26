import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

type JobStatus = "new" | "assigned" | "in-progress" | "completed"
type BookingStatus = "new" | "contacted" | "converted" | "rejected"
type InvoiceStatus = "draft" | "sent" | "paid"
type StaffStatus = "active" | "inactive"

type Status = JobStatus | BookingStatus | InvoiceStatus | StaffStatus

const statusStyles: Record<Status, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-amber-100 text-amber-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  contacted: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const tStatus = useTranslations("Status")
  
  const statusLabels: Record<Status, string> = {
    new: tStatus("new"),
    assigned: tStatus("assigned"),
    "in-progress": tStatus("inProgress"),
    completed: tStatus("completed"),
    contacted: tStatus("contacted"),
    converted: tStatus("converted"),
    rejected: tStatus("rejected"),
    draft: tStatus("draft"),
    sent: tStatus("sent"),
    paid: tStatus("paid"),
    active: tStatus("active"),
    inactive: tStatus("inactive"),
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

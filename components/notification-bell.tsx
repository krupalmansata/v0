"use client"

import { useState, useEffect } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue, update } from "firebase/database"
import { useRouter } from "@/src/i18n/routing"
import { useTranslations } from "next-intl"
import type { NotificationRecord } from "@/lib/notifications"

export function NotificationBell() {
  const { user, userData } = useAuth()
  const router = useRouter()
  const t = useTranslations("Notifications")
  const tStatus = useTranslations("Status")
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [open, setOpen] = useState(false)

  const businessId = userData?.businessId
  const userId = user?.uid

  // Real-time listener for this user's notifications
  useEffect(() => {
    if (!businessId || !userId) return

    const notifsRef = ref(database, `notifications/${businessId}/${userId}`)
    const unsub = onValue(notifsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val()
        const list: NotificationRecord[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }))
        // Newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setNotifications(list)
      } else {
        setNotifications([])
      }
    })

    return () => unsub()
  }, [businessId, userId])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = async (notification: NotificationRecord) => {
    if (!businessId || !userId) return

    // Mark as read
    if (!notification.read) {
      await update(
        ref(database, `notifications/${businessId}/${userId}/${notification.id}`),
        { read: true }
      )
    }
    setOpen(false)
    router.push(`/jobs/${notification.jobId}`)
  }

  const handleMarkAllRead = async () => {
    if (!businessId || !userId) return
    const unread = notifications.filter(n => !n.read)
    if (unread.length === 0) return

    const updates: Record<string, boolean> = {}
    unread.forEach(n => {
      updates[`${n.id}/read`] = true
    })
    await update(ref(database, `notifications/${businessId}/${userId}`), updates)
  }

  // Render notification text based on type (i18n-aware)
  const getTitle = (n: NotificationRecord): string => {
    switch (n.type) {
      case "assignment":
        return t("assignmentTitle", { jobTitle: n.jobTitle })
      case "status_change":
        return t("statusChangeTitle", { jobTitle: n.jobTitle })
      case "photo_upload":
        return t("photoUploadTitle", { jobTitle: n.jobTitle })
      default:
        return t("defaultTitle")
    }
  }

  const getBody = (n: NotificationRecord): string => {
    switch (n.type) {
      case "assignment":
        return t("assignmentBody", { actor: n.actorName, customer: n.customerName })
      case "status_change": {
        // Map status key to translated status
        const statusKey = n.newStatus === "in-progress" ? "inProgress" : (n.newStatus || "new")
        const translatedStatus = tStatus(statusKey)
        return t("statusChangeBody", { actor: n.actorName, status: translatedStatus })
      }
      case "photo_upload":
        return t("photoUploadBody", { actor: n.actorName })
      default:
        return ""
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">{t("title")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">{t("title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 me-1" />
              {t("markAllRead")}
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <div>
              {notifications.slice(0, 50).map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-start px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <div className={!notification.read ? "" : "ms-4"}>
                      <p className="text-sm font-medium leading-tight">
                        {getTitle(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getBody(notification)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function formatTimeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ""
  }
}

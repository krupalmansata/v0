import { ref, push, set, get, update } from "firebase/database"
import { database } from "./firebase"

export type NotificationType = "assignment" | "status_change" | "photo_upload"

export interface NotificationData {
  type: NotificationType
  jobId: string
  jobTitle: string
  customerName: string
  actorName: string
  staffName?: string
  newStatus?: string
  read: boolean
  createdAt: string
}

export interface NotificationRecord extends NotificationData {
  id: string
}

/**
 * Get the business owner's UID (stored on business creation)
 */
export async function getBusinessOwnerUid(businessId: string): Promise<string | null> {
  const snap = await get(ref(database, `businesses/${businessId}/ownerUid`))
  return snap.exists() ? snap.val() : null
}

/**
 * Get a staff member's Firebase Auth UID (stored when they link their account)
 */
export async function getStaffUserId(businessId: string, staffId: string): Promise<string | null> {
  const snap = await get(ref(database, `staff/${businessId}/${staffId}/userId`))
  return snap.exists() ? snap.val() : null
}

/**
 * Collect all UIDs that should be notified for a given job:
 * - the business owner (admin)
 * - the assigned staff member (if linked)
 */
export async function getJobNotificationRecipients(
  businessId: string,
  assignedStaffId?: string
): Promise<string[]> {
  const uids: string[] = []

  const ownerUid = await getBusinessOwnerUid(businessId)
  if (ownerUid) uids.push(ownerUid)

  if (assignedStaffId) {
    const staffUid = await getStaffUserId(businessId, assignedStaffId)
    if (staffUid) uids.push(staffUid)
  }

  return [...new Set(uids)]
}

/**
 * Send a notification to multiple recipients:
 * 1. Writes to Firebase RTDB so the bell icon picks it up in real-time
 * 2. Fires a request to /api/send-notification for FCM push
 *
 * The senderUid is excluded so users don't notify themselves.
 */
export async function sendJobNotification({
  businessId,
  senderUid,
  type,
  jobId,
  jobTitle,
  customerName,
  actorName,
  staffName,
  newStatus,
  recipientUids,
}: {
  businessId: string
  senderUid: string
  type: NotificationType
  jobId: string
  jobTitle: string
  customerName: string
  actorName: string
  staffName?: string
  newStatus?: string
  recipientUids: string[]
}) {
  const recipients = recipientUids.filter(uid => uid && uid !== senderUid)
  if (recipients.length === 0) return

  const notificationData: NotificationData = {
    type,
    jobId,
    jobTitle,
    customerName,
    actorName,
    staffName: staffName || "",
    newStatus: newStatus || "",
    read: false,
    createdAt: new Date().toISOString(),
  }

  // Store in-app notification for each recipient
  const writes = recipients.map(uid => {
    const notifsRef = ref(database, `notifications/${businessId}/${uid}`)
    const newRef = push(notifsRef)
    return set(newRef, notificationData)
  })
  await Promise.all(writes)

  // Fire-and-forget FCM push (non-blocking, best-effort)
  try {
    const fcmTitle = buildFCMTitle(type, jobTitle)
    const fcmBody = buildFCMBody(type, actorName, newStatus)

    fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        recipientUids: recipients,
        title: fcmTitle,
        body: fcmBody,
        data: { jobId, type },
      }),
    }).catch(() => {
      // Silently ignore — in-app notification was already stored
    })
  } catch {
    // Non-critical
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  businessId: string,
  userId: string,
  notificationId: string
) {
  await update(ref(database, `notifications/${businessId}/${userId}/${notificationId}`), {
    read: true,
  })
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(
  businessId: string,
  userId: string,
  notificationIds: string[]
) {
  if (notificationIds.length === 0) return
  const updates: Record<string, boolean> = {}
  notificationIds.forEach(id => {
    updates[`${id}/read`] = true
  })
  await update(ref(database, `notifications/${businessId}/${userId}`), updates)
}

// --- FCM text helpers (English, used for push payload) ---

function buildFCMTitle(type: NotificationType, jobTitle: string): string {
  switch (type) {
    case "assignment":
      return `New Assignment: ${jobTitle}`
    case "status_change":
      return `Job Updated: ${jobTitle}`
    case "photo_upload":
      return `New Photo: ${jobTitle}`
    default:
      return "New Notification"
  }
}

function buildFCMBody(type: NotificationType, actorName: string, newStatus?: string): string {
  switch (type) {
    case "assignment":
      return `${actorName} assigned you to this job`
    case "status_change":
      return `Status changed to ${newStatus || "unknown"} by ${actorName}`
    case "photo_upload":
      return `${actorName} uploaded a proof photo`
    default:
      return ""
  }
}

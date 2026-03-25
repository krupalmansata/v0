"use client"

import { useEffect } from "react"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"
import { ref, update } from "firebase/database"
import { app, database } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

export function useFCM() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    let unsubscribeOnMessage: (() => void) | null = null

    const init = async () => {
      // FCM is only supported in secure browser contexts
      const supported = await isSupported()
      if (!supported) {
        console.warn("[FCM] Not supported in this environment")
        return
      }

      const messaging = getMessaging(app)

      // 1. Register the service worker
      let swReg: ServiceWorkerRegistration | undefined
      try {
        swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        })
        console.log("[FCM] Service worker registered:", swReg)
      } catch (err) {
        console.error("[FCM] Service worker registration failed:", err)
        return
      }

      // 2. Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        console.warn("[FCM] Notification permission denied")
        return
      }

      // 3. Get FCM token and save it to Realtime DB
      try {
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        })
        if (token) {
          console.log("[FCM] Token obtained:", token)
          const tokenRef = ref(database, `users/${user.uid}/fcmTokens/${token}`)
          await update(tokenRef.parent!, { [token]: true })
          console.log("[FCM] Token saved to Realtime Database")
        }
      } catch (err) {
        console.error("[FCM] Error retrieving/saving token:", err)
      }

      // 4. Handle foreground messages (app is open and in focus)
      unsubscribeOnMessage = onMessage(messaging, (payload) => {
        console.log("[FCM] Foreground message received:", payload)
        const title = payload.notification?.title || "New Notification"
        const body = payload.notification?.body || ""

        // Show a toast notification using Sonner (already in the project)
        toast(title, {
          description: body,
          duration: 6000,
        })
      })
    }

    init()

    return () => {
      if (unsubscribeOnMessage) {
        unsubscribeOnMessage()
      }
    }
  }, [user])
}

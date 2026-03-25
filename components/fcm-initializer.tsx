"use client"

import { useFCM } from "@/hooks/use-fcm"

// This component has no UI — it just activates the FCM hook inside the dashboard
export function FCMInitializer() {
  useFCM()
  return null
}

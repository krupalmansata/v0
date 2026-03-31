import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { businessId, recipientUids, title, body, data } = await req.json()

    if (!businessId || !recipientUids?.length || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Dynamic import to avoid loading Admin SDK unless actually called
    const { adminApp } = await import("@/lib/firebase-admin")
    const { getDatabase } = await import("firebase-admin/database")
    const { getMessaging } = await import("firebase-admin/messaging")

    const db = getDatabase(adminApp)

    // Collect FCM tokens for all recipients
    const tokens: string[] = []
    for (const uid of recipientUids) {
      const snap = await db.ref(`users/${uid}/fcmTokens`).once("value")
      if (snap.exists()) {
        tokens.push(...Object.keys(snap.val()))
      }
    }

    if (tokens.length === 0) {
      return NextResponse.json({ sent: 0, reason: "no_tokens" })
    }

    const messaging = getMessaging(adminApp)
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ) : undefined,
      webpush: {
        fcmOptions: {
          link: data?.jobId ? `/jobs/${data.jobId}` : "/dashboard",
        },
      },
    })

    return NextResponse.json({
      sent: response.successCount,
      failed: response.failureCount,
    })
  } catch (error: any) {
    console.error("[send-notification] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to send push notification" }, { status: 500 })
  }
}

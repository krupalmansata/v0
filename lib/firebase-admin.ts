import { initializeApp, getApps, cert, App } from "firebase-admin/app"

let adminApp: App

if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (serviceAccountKey) {
    adminApp = initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  } else {
    // Fallback: use application default credentials (e.g. on GCP/Firebase hosting)
    adminApp = initializeApp({
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  }
} else {
  adminApp = getApps()[0]
}

export { adminApp }

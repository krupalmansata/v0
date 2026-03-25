# Firebase Integration Plan

This guide provides a detailed, step-by-step checklist to replace the existing mock data in your Next.js application with a dynamic Firebase backend. Based on your constraints, we will strictly use **Google Sign-In** for authentication and **Firebase Realtime Database** (which charges based on bandwidth/storage, not per read/write/delete like Firestore).

You can mark tasks as completed by checking off the boxes (`- [x]`) as you progress.

---

## 🏗️ 1. Realtime Database Structure Overview

Unlike SQL or Firestore, Firebase Realtime Database is one giant JSON tree. To keep queries fast and avoid downloading unnecessary data, we will **flatten** the data structure. Data is grouped by `businessId`.

```json
{
  "businesses": {
    "biz-001": {
      "name": "ProServe Solutions",
      "phone": "(555) 123-4567",
      "email": "contact@proserve.example",
      "address": "123 Business Ave...",
      "logo": null,
      "primaryColor": "#0f172a",
      "invoiceFooter": "Thank you...",
      "slug": "proserve"
    }
  },
  "users": {
    "user_uid_1": {
      "businessId": "biz-001",
      "name": "Marcus Johnson",
      "email": "marcus@gmail.com",
      "role": "Senior Technician",
      "status": "active",
      "fcmTokens": {
        "device_token_1": true
      }
    }
  },
  "jobs": {
    "biz-001": {
      "JOB-001": {
        "customerId": "cust-001",
        "customerName": "Robert Miller",
        "serviceType": "AC Servicing",
        "scheduledDate": "2026-03-19",
        "assignedStaffId": "user_uid_1",
        "status": "in-progress"
      }
    }
  },
  "bookings": {
    "biz-001": {
      "booking-001": {
        "customerName": "John Doe",
        "serviceType": "Deep Cleaning",
        "status": "new"
      }
    }
  },
  "invoices": {
    "biz-001": {
      "inv-001": {
        "jobId": "JOB-001",
        "totalAmount": 150,
        "status": "draft"
      }
    }
  }
}
```

---

## 🗺️ Step-by-Step Execution Plan

### Phase 1: Firebase Console Setup & Core Config
*Before writing any code, we need to set up the Firebase infrastructure.*

- [x] **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
- [x] **Register Web App:** Add a web app to the project and copy the configuration keys.
- [x] **Enable Realtime Database:** Navigate to Realtime Database, create a database, and start in test mode (we will update security rules later).
- [x] **Enable Google Authentication:** Go to Authentication -> Sign-in method, select **Google**, and enable it. Disable/Ignore all other providers.
- [x] **Environment Variables:** Create a `.env.local` file in your Next.js project and add the Firebase config keys (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).
- [x] **Initialize Firebase SDK:** Create a `lib/firebase.ts` file in your project to initialize the Firebase Client SDK (Auth, Database, Messaging).

### Phase 2: Authentication (Strictly Google Sign-In)
*Setting up user access directly dictates how we store tokens and permissions.*

- [x] **Build Login UI:** Update `app/login/page.tsx` to include ONLY a "Sign in with Google" button.
- [x] **Implement Auth Logic:** Use `signInWithPopup(auth, googleProvider)` from the Firebase SDK.
- [x] **User Syncing:** Upon successful login, check if the user exists in the Realtime Database (`/users/{uid}`). If not, create a new record.
- [x] **Route Protection:** Use Next.js Middleware or a layout provider to redirect unauthenticated users away from `/(dashboard)` routes back to `/login`.

### Phase 3: Push Notifications (FCM)
*As requested, setting up notifications early in the integration process.*

- [x] **Enable Cloud Messaging:** In the Firebase Console, navigate to Cloud Messaging and generate a Web Push certificate (VAPID key).
- [x] **Service Worker:** Create a `firebase-messaging-sw.js` file in your `public/` directory to handle background notifications.
- [x] **Request Permissions Component:** Create a React hook or component that calls `Notification.requestPermission()`.
- [x] **Token Generation & Storage:** Once permission is granted, use `getToken()` to get the FCM device token and save it to the current user's Realtime DB record (`/users/{uid}/fcmTokens/{token}: true`).
- [x] **Foreground Handling:** Implement `onMessage()` inside the main layout or dashboard to show standard React toast notifications when a notification arrives while the app is actively open.
- [x] **Test Payload:** Send a test notification from the Firebase Console to ensure the device receives it.

### Phase 4: Migrating Data & Replacing Mocks (Realtime Database)
*Replacing `lib/mock-data.ts` with live database subscriptions.*

- [ ] **Database Utility Functions:** Create a `lib/db.ts` file containing generic functions for reading/writing to Firebase (e.g., `getJobs`, `addJob`, `updateBookingStatus`).
- [ ] **Realtime Subscriptions:** For pages that need live updates (like `app/(dashboard)/dashboard/page.tsx` and `app/(dashboard)/jobs/page.tsx`), use the `onValue()` listener from the Firebase SDK to stream data in real-time.
- [ ] **Update Dashboard:** Replace mock stats with aggregated data from the Realtime Database.
- [ ] **Update Jobs Module:** Hook up the "Create Job" form (`app/(dashboard)/jobs/new/page.tsx`) to push data to `/jobs/{businessId}`. Update list and detail views.
- [ ] **Update Bookings & Invoices:** Implement standard `get`/`set`/`update` methods for the generic views.
- [ ] **Update Branding/Settings:** Bind `/businesses/{businessId}` data to the branding page to allow dynamic color and logo updates.

### Phase 5: Security & Finalization
*Securing the app so users can't read/write competitor data.*

- [ ] **Realtime Database Security Rules:** Write `.rules` to ensure a user can only read/write to `businessId` nodes that they belong to. Example:
  ```json
  {
    "rules": {
      "businesses": {
        "$businessId": {
          ".read": "root.child('users').child(auth.uid).child('businessId').val() === $businessId"
        }
      }
    }
  }
  ```
- [ ] **Cleanup Constraints:** Verify that all references to `lib/mock-data.ts` are removed.
- [ ] **Test Google Auth Flow:** Completely log out and log back in, ensuring device tokens sync and specific user dashboard data appears flawlessly.
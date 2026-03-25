// Firebase Cloud Messaging Service Worker
// This file MUST live in /public so the browser can access it at the root scope
// It handles background push notifications when the app is not in focus

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBfNISzS-VYdnxq5Axsxa26HIneCpzjT-Y",
  authDomain: "services-ab4a2.firebaseapp.com",
  projectId: "services-ab4a2",
  storageBucket: "services-ab4a2.firebasestorage.app",
  messagingSenderId: "893942174722",
  appId: "1:893942174722:web:06967ec1059dc6b943c31b",
  databaseURL: "https://services-ab4a2-default-rtdb.firebaseio.com",
});

const messaging = firebase.messaging();

// Handle background messages (app is not in focus / tab is closed)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Handle notification click — opens the app or a deep link
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

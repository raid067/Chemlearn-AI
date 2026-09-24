/* eslint-disable no-undef */
// Service worker for Firebase Cloud Messaging background push notifications
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBcAA7uU-bKuFkBtpqLCFyB4b4PsZWlHzw",
  authDomain: "chemlearn-67.firebaseapp.com",
  projectId: "chemlearn-67",
  storageBucket: "chemlearn-67.firebasestorage.app",
  messagingSenderId: "639221527001",
  appId: "1:639221527001:web:2b8ee1713b0a9606d5e9c8",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification?.title || 'ChemLearn AI';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update from ChemLearn AI.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

'use client';

import { getMessaging, getToken, onMessage, isSupported, type Messaging, type MessagePayload } from 'firebase/messaging';
import { app, auth } from '@/lib/firebase';

let messagingInstance: Messaging | null = null;

/**
 * Initializes and retrieves the Firebase Messaging instance if supported by the client browser.
 */
export async function getFCMInstance(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    console.warn('[FCM] Firebase Cloud Messaging is not supported in this browser environment.');
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }

  return messagingInstance;
}

/**
 * Returns the current Notification permission status.
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Requests browser push notification permission and retrieves the registration FCM token.
 */
export async function requestNotificationPermissionAndToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, error: 'Push notifications are not supported by this device or browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied or dismissed by the user.' };
    }

    const messaging = await getFCMInstance();
    if (!messaging) {
      return { success: false, error: 'Firebase Cloud Messaging failed to initialize.' };
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('[FCM] Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable.');
      return { success: false, error: 'VAPID key not configured on this client.' };
    }

    // Register service worker if available
    let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      return { success: false, error: 'No FCM registration token received.' };
    }

    // Send token to server to persist under user profile
    const idToken = await auth.currentUser?.getIdToken();
    if (idToken) {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      }).catch((err) => console.warn('[FCM] Failed to sync token to backend:', err));
    }

    return { success: true, token };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[FCM] Error requesting notification permission:', message);
    return { success: false, error: message };
  }
}

/**
 * Listens for incoming push notifications while the application is in the foreground.
 */
export async function setupForegroundMessageHandler(
  onPayload: (payload: MessagePayload) => void
): Promise<(() => void) | null> {
  const messaging = await getFCMInstance();
  if (!messaging) return null;

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground notification received:', payload);
    onPayload(payload);
  });

  return unsubscribe;
}

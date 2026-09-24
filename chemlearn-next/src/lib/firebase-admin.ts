import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const adminApp = getApps().length === 0
  ? initializeApp(
      privateKey 
        ? {
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
          }
        : {
            projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
            databaseURL: process.env.FIREBASE_DATABASE_URL,
          }
    )
  : getApps()[0];

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);
const adminMessaging = getMessaging(adminApp);

export { adminApp, adminDb, adminAuth, adminMessaging };

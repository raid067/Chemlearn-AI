/**
 * ChemLearn AI — Administrator Privilege Assignment Script
 * 
 * Sets custom user claims { admin: true, teacher: true } on a Firebase user account.
 * 
 * Usage:
 *   node scripts/set-admin.js <user-email-or-uid>
 * 
 * Example:
 *   node scripts/set-admin.js admin@chemlearn.ai
 */

const path = require('path');
const { loadEnvConfig } = require('@next/env');

// Load environment variables from .env.local
const projectDir = path.resolve(__dirname, '..');
loadEnvConfig(projectDir);

const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('\n❌ Error: Firebase Admin credentials missing from .env.local.');
  console.error('Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
  process.exit(1);
}

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
} catch (err) {
  console.error('\n❌ Error initializing Firebase Admin App:', err.message);
  process.exit(1);
}

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.log('\n🧪 ChemLearn AI Admin Management Tool');
  console.log('------------------------------------');
  console.log('Usage: node scripts/set-admin.js <email-or-uid>\n');
  console.log('Examples:');
  console.log('  node scripts/set-admin.js teacher@school.edu.my');
  console.log('  node scripts/set-admin.js Wc29xY82b7ZlK993ms\n');
  process.exit(1);
}

async function grantAdminPrivileges(identifier) {
  try {
    const auth = admin.auth();
    const db = admin.firestore();

    let userRecord;
    if (identifier.includes('@')) {
      console.log(`\n🔍 Looking up Firebase user by email: ${identifier}...`);
      userRecord = await auth.getUserByEmail(identifier);
    } else {
      console.log(`\n🔍 Looking up Firebase user by UID: ${identifier}...`);
      userRecord = await auth.getUser(identifier);
    }

    const uid = userRecord.uid;
    console.log(`👤 Found user: ${userRecord.email || 'No email'} (UID: ${uid})`);

    // Preserve existing claims if any
    const existingClaims = userRecord.customClaims || {};
    const updatedClaims = {
      ...existingClaims,
      admin: true,
      teacher: true,
    };

    console.log(`🔐 Assigning custom claims:`, updatedClaims);
    await auth.setCustomUserClaims(uid, updatedClaims);

    // Also register in teachers collection in Firestore for database-level authority
    await db.collection('teachers').doc(uid).set(
      {
        email: userRecord.email || '',
        displayName: userRecord.displayName || 'Administrator',
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`\n✅ SUCCESS: Administrator & Teacher privileges granted!`);
    console.log('----------------------------------------------------');
    console.log(`Account Email : ${userRecord.email}`);
    console.log(`Account UID   : ${uid}`);
    console.log(`Claims Granted: { admin: true, teacher: true }`);
    console.log(`Access Routes :`);
    console.log(`  - /admin/red-team         (Red Team & AI Security Evaluation)`);
    console.log(`  - /admin/red-team/history (Audit History & Release Tracking)`);
    console.log(`  - /teacher                (Teacher Portal & Class Analytics)`);
    console.log('\n⚠️  IMPORTANT NOTE:');
    console.log('Firebase ID tokens cache custom claims for up to 1 hour.');
    console.log('The user MUST log out and log back in (or refresh their session) for the changes to take effect in their browser.\n');
  } catch (err) {
    console.error('\n❌ Failed to set administrator privileges:', err.message);
    if (err.code === 'auth/user-not-found') {
      console.log('Tip: Make sure the user has already signed up or logged in via the ChemLearn AI website first.\n');
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

grantAdminPrivileges(targetIdentifier);

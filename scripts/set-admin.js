const admin = require('firebase-admin');

// Ensure you have set GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to your Firebase Admin SDK service account JSON key file before running this script.
// Example:
// export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
    console.error("Please export it pointing to your serviceAccountKey.json file.");
    process.exit(1);
}

// Initialize the Firebase Admin App
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
} catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    process.exit(1);
}

// Get UID from command line arguments
const targetUid = process.argv[2];

if (!targetUid) {
    console.error("ERROR: Target UID not provided.");
    console.error("Usage: node set-admin.js <USER_UID>");
    process.exit(1);
}

async function setAdminClaim(uid) {
    try {
        console.log(`Looking up user with UID: ${uid}`);
        const userRecord = await admin.auth().getUser(uid);
        
        console.log(`Setting { admin: true } claim for user: ${userRecord.email || uid}`);
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        
        console.log("✅ Success! Custom claim set.");
        console.log("NOTE: The user must log out and log back in (or the client must force a token refresh) for the claim to take effect on the client-side.");
    } catch (error) {
        console.error("❌ Failed to set custom claim:", error.message);
    } finally {
        process.exit(0);
    }
}

setAdminClaim(targetUid);

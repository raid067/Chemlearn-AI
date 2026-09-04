const admin = require('firebase-admin');
const path = require('path');

// NOTE: You must have a serviceAccountKey.json file downloaded from your Firebase Project Settings > Service Accounts
// Provide the path to the JSON file here:
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (e) {
    console.error("❌ Error: Could not load serviceAccountKey.json");
    console.error("Please download it from Firebase Console > Project Settings > Service Accounts");
    console.error("and place it in the scratch/ directory as 'serviceAccountKey.json'.");
    process.exit(1);
}

const emailArgs = process.argv.slice(2);

if (emailArgs.length === 0) {
    console.log("Usage: node set-teacher-claim.js <user-email>");
    process.exit(1);
}

const targetEmail = emailArgs[0];

async function setTeacherClaim(email) {
    try {
        console.log(`Looking up user by email: ${email}...`);
        const user = await admin.auth().getUserByEmail(email);
        
        console.log(`Found user: ${user.uid}. Setting 'teacher' custom claim...`);
        await admin.auth().setCustomUserClaims(user.uid, { teacher: true });
        
        console.log(`✅ Success! Custom claim { teacher: true } set for ${email}.`);
        console.log("The user will need to log out and log back in for the claim to take effect on the client.");
    } catch (error) {
        console.error("❌ Failed to set custom claim:", error);
    } finally {
        process.exit(0);
    }
}

setTeacherClaim(targetEmail);

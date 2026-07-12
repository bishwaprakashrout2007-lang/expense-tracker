const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const pathsToCheck = [
  path.join(__dirname, 'serviceAccountKey.json'),                 // server/config/serviceAccountKey.json
  path.join(__dirname, '..', 'serviceAccountKey.json'),            // server/serviceAccountKey.json
  path.join(__dirname, '..', '..', 'serviceAccountKey.json')      // root/serviceAccountKey.json
];

let serviceAccountPath = '';
for (const p of pathsToCheck) {
  if (fs.existsSync(p)) {
    serviceAccountPath = p;
    break;
  }
}

let appInitialized = false;

// Check if Firebase admin app is already initialized
if (admin.apps.length === 0) {
  if (serviceAccountPath) {
    try {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log(`Firebase Connected (Service Account JSON File loaded from: ${path.basename(serviceAccountPath)})`);
      appInitialized = true;
    } catch (error) {
      console.error(`Failed to initialize Firebase with serviceAccountKey.json: ${error.message}`);
    }
  }

  if (!appInitialized) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      try {
        let formattedPrivateKey = privateKey.trim();
        // Remove surrounding double quotes if they were pasted from JSON
        if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
          formattedPrivateKey = formattedPrivateKey.slice(1, -1);
        }
        formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
        
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formattedPrivateKey
          })
        });
        console.log('Firebase Connected (Environment Variables)');
        appInitialized = true;
      } catch (error) {
        console.error(`Failed to initialize Firebase with environment variables: ${error.message}`);
      }
    }
  }

  if (!appInitialized) {
    console.error('\n==================================================================');
    console.error('ERROR: Firebase Credentials Not Found!');
    console.error('Please make sure you have either:');
    console.error('1. Placed your downloaded "serviceAccountKey.json" in your server/ or root/ folder.');
    console.error('2. Set the environment variables:');
    console.error('   - FIREBASE_PROJECT_ID');
    console.error('   - FIREBASE_CLIENT_EMAIL');
    console.error('   - FIREBASE_PRIVATE_KEY');
    console.error('==================================================================\n');
    throw new Error('Firebase credentials missing. Please refer to walkthrough.md for setup instructions.');
  }
} else {
  appInitialized = true;
}

const db = admin.firestore();

// connectDB wrapper to maintain compatibility with server.js startup
const connectDB = async () => {
  if (appInitialized) {
    console.log('Firestore Database Connection established successfully.');
  } else {
    console.warn('WARNING: Firestore database not connected. Please check your credentials configuration.');
  }
};

module.exports = connectDB;
module.exports.db = db;

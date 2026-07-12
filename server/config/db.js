const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let appInitialized = false;

// Check if Firebase admin app is already initialized
if (admin.apps.length === 0) {
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Connected (Service Account JSON File)');
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
        const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
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
    // Attempt default application credentials
    try {
      admin.initializeApp();
      console.log('Firebase Connected (Default Application Credentials)');
      appInitialized = true;
    } catch (error) {
      console.warn('Firebase default credentials not found. Database running in uninitialized mode.');
    }
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

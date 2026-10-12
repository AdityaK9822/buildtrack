const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let firebaseApp;

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check for environment-based service account
    if (process.env.FIREBASE_PRIVATE_KEY) {
      // Handle both escaped and actual newlines in private key
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // If key contains literal \n (backslash-n), convert to actual newlines
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      // Also handle double-escaped newlines from some config tools
      if (privateKey.includes('\\\n')) {
        privateKey = privateKey.replace(/\\\n/g, '\n');
      }

      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        token_uri: 'https://oauth2.googleapis.com/token',
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } 
    // Check for file-based service account (Recommended for production)
    else if (process.env.FIREBASE_KEY_FILE && fs.existsSync(process.env.FIREBASE_KEY_FILE)) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(process.env.FIREBASE_KEY_FILE),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } 
    // Allow empty env for local testing without Firebase
    else {
      console.warn('Firebase not configured - running without Firebase services');
      return null;
    }

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    console.error('Make sure FIREBASE_PRIVATE_KEY or FIREBASE_KEY_FILE is set correctly');
    return null;
  }
};

const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return admin;
};

const getBucket = () => {
  if (!firebaseApp) {
    const initialized = initializeFirebase();
    if (!initialized) return null;
  }
  if (firebaseApp && process.env.FIREBASE_STORAGE_BUCKET) {
    return admin.storage().bucket();
  }
  return null;
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getBucket,
};

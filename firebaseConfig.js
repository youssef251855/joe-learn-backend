/**
 * Firebase Admin SDK Initialization (Simplified Method)
 *
 * This file initializes the Firebase Admin SDK by directly loading credentials 
 * from a `serviceAccountKey.json` file located in the same directory (`/backend`).
 * This approach avoids the complexities of environment variables and single-line JSON formatting.
 */
const admin = require('firebase-admin');

try {
  // Load credentials from the dedicated JSON file.
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('Firebase Admin SDK initialized successfully.');

} catch (error) {
  console.error('❌ FATAL ERROR: Could not initialize Firebase Admin SDK.');
  // Provide specific, helpful error messages based on the new setup method.
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Error Details: The file `backend/serviceAccountKey.json` was not found.');
    console.error('Please create this file and paste your Firebase service account key into it.');
  } else if (error instanceof SyntaxError) {
    console.error('Error Details: The file `backend/serviceAccountKey.json` contains invalid JSON.');
    console.error('Please ensure you have copied the entire, unmodified content from your downloaded Firebase key file.');
  } else {
    console.error('An unexpected error occurred:', error.message);
  }
  console.error('Refer to `backend/README.md` for the simplified setup instructions.');
  process.exit(1); // Exit with a failure code if Firebase initialization fails.
}

const db = admin.firestore();

module.exports = { db };
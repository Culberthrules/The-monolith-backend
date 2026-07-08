import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Use CommonJS require for firebase-admin
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Load service account credentials
// Priority: FIREBASE_SERVICE_ACCOUNT env var (JSON string) > local file
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // On Vercel: parse from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Locally: load from file (support common download filenames)
  const candidatePaths = [
    join(__dirname, '../serviceaccountkey.json'),
    join(__dirname, '../ServiceAccountKey.json'),
    join(__dirname, '../ServiceAccountKey.json.json'),
  ];
  const serviceAccountPath = candidatePaths.find((path) => existsSync(path));

  if (serviceAccountPath) {
    serviceAccount = require(serviceAccountPath);
    console.log('🔑 Loaded Firebase credentials from:', serviceAccountPath.split(/[/\\]/).pop());
  } else {
    throw new Error(
      'Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT env var or place your downloaded key as serviceaccountkey.json in the project root'
    );
  }
}

console.log('🔧 Initializing Firebase with project:', serviceAccount.project_id);

// Initialize Firebase Admin SDK
if (!admin.getApps().length) {
  admin.initializeApp({
    credential: admin.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

// Get Firestore and Auth instances
export const db = getFirestore();
export const auth = getAuth();

// Async initialization function
const connectDB = async () => {
  try {
    // Test the connection
    await db.listCollections().then(() => {
      console.log('✅ Firebase Firestore connected successfully');
    });
    return { db, auth };
  } catch (error) {
    console.error('❌ Firebase Firestore error:', error.message);
    console.error('⚠️  Troubleshooting:');
    console.error('   1. Ensure Firestore is enabled in Firebase Console');
    console.error('   2. Check your Firebase project permissions');
    console.error('   3. Verify serviceaccountkey.json is valid');
    throw error;
  }
};

export default connectDB;

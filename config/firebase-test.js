/**
 * Firebase Configuration Test
 * Run with: node config/firebase-test.js
 */

require('dotenv').config();
const { initializeFirebase, getFirebaseAdmin } = require('../src/config/firebase');

console.log('\n=== Firebase Configuration Test ===\n');

// Test 1: Initialize Firebase
console.log('1. Initializing Firebase...');
const app = initializeFirebase();

if (!app) {
  console.log('   ❌ FAILED: Firebase not initialized');
  process.exit(1);
}
console.log('   ✅ SUCCESS: Firebase Admin SDK initialized');

// Test 2: Get Firebase Admin
console.log('\n2. Getting Firebase Admin...');
const admin = getFirebaseAdmin();
if (admin) {
  console.log('   ✅ SUCCESS: Firebase Admin available');
} else {
  console.log('   ❌ FAILED: Could not get Firebase Admin');
}

// Test 3: Check project configuration
console.log('\n3. Project Configuration:');
console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID || 'Not set'}`);
console.log(`   Storage Bucket: ${process.env.FIREBASE_STORAGE_BUCKET || 'Not set'}`);
console.log(`   Key File: ${process.env.FIREBASE_KEY_FILE || 'Not set'}`);

// Test 4: Check if messaging is available
console.log('\n4. Testing Cloud Messaging...');
try {
  if (admin.messaging) {
    console.log('   ✅ Cloud Messaging API available');
  } else {
    console.log('   ⚠️  Cloud Messaging API not available');
  }
} catch (error) {
  console.log('   ❌ Error checking messaging:', error.message);
}

console.log('\n=== All tests completed ===\n');

#!/usr/bin/env node

/**
 * Environment Variable Exporter for BuildTrack Deployment
 * 
 * This script reads your local .env file and formats it for easy
 * copying into Render/Vercel dashboard environment variable fields.
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const clientEnvPath = path.join(__dirname, 'client', '.env');

console.log('='.repeat(60));
console.log('BUILDTRACK DEPLOYMENT ENVIRONMENT VARIABLES');
console.log('='.repeat(60));
console.log();

// Read server .env
console.log('📝 BACKEND ENVIRONMENT VARIABLES (Render)');
console.log('-'.repeat(60));
console.log('Format: KEY=VALUE (one per line)');
console.log();

const serverEnv = fs.readFileSync(envPath, 'utf-8');
const serverLines = serverEnv.split('\n').filter(line => {
  line = line.trim();
  return line && !line.startsWith('#') && line.includes('=');
});

serverLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  console.log(`${key}=${value}`);
});

console.log();
console.log('📝 FRONTEND ENVIRONMENT VARIABLES (Vercel)');
console.log('-'.repeat(60));
console.log('Format: KEY=VALUE (one per line)');
console.log();

// Read client .env
const clientEnv = fs.readFileSync(clientEnvPath, 'utf-8');
const clientLines = clientEnv.split('\n').filter(line => {
  line = line.trim();
  return line && !line.startsWith('#') && line.includes('=');
});

clientLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  console.log(`${key}=${value}`);
});

console.log();
console.log('='.repeat(60));
console.log('IMPORTANT NOTES:');
console.log('='.repeat(60));
console.log('1. Update MONGODB_URI to your MongoDB Atlas connection string');
console.log('2. Update JWT_SECRET with a secure random string (32+ chars)');
console.log('3. Add your Firebase credentials in the backend env');
console.log('4. For Vercel frontend, add VITE_API_BASE_URL pointing to your backend URL');
console.log('5. GitHub repo: https://github.com/AdityaK9822/buildtrack');
console.log('   - Backend: Root directory (.)');
console.log('   - Frontend: client directory');
console.log('='.repeat(60));

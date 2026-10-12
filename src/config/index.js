// Validate JWT secret strength
const isJwtSecretStrong = (secret) => {
  if (!secret || secret.length < 32) {
    console.warn('WARNING: JWT_SECRET is weak or missing. Use at least 32 characters.');
    console.warn('   Generate a strong secret with: node -e "console.log(require(\"crypto\").randomBytes(64).toString(\"hex\"))"');
    return false;
  }
  return true;
};

// Validate Firebase configuration
const isFirebaseConfigured = () => {
  const hasEnvKey = !!process.env.FIREBASE_PRIVATE_KEY;
  const hasKeyFile = !!process.env.FIREBASE_KEY_FILE && require('fs').existsSync(process.env.FIREBASE_KEY_FILE);
  
  if (!hasEnvKey && !hasKeyFile) {
    console.warn('WARNING: Firebase not configured. Some features will not work.');
    console.warn('   Set FIREBASE_PRIVATE_KEY or FIREBASE_KEY_FILE in your .env file.');
    return false;
  }
  return true;
};

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  clientUrl: process.env.CLIENT_URL,
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  weatherApi: {
    key: process.env.WEATHER_API_KEY,
    url: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
  },
};

// Validate configuration on load
if (config.nodeEnv === 'production') {
  if (!isJwtSecretStrong(config.jwt.secret)) {
    console.error('Production requires a strong JWT secret (minimum 32 characters)');
    process.exit(1);
  }
  
  if (!config.mongodbUri) {
    console.error('MONGODB_URI must be set in production');
    process.exit(1);
  }
}

module.exports = config;
